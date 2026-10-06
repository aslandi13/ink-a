import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

interface Props {
  images: string[]
  index: number | null
  onClose: () => void
}

const ARROW = {
  width: 40,
  height: 40,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 0.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

export default function Lightbox({ images, index, onClose }: Props) {
  const [current, setCurrent] = useState(index ?? 0)
  const [direction, setDirection] = useState(1)
  const touchX = useRef<number | null>(null)
  const open = index !== null && images.length > 0
  const [mounted, setMounted] = useState(open)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    if (index !== null) setCurrent(index)
  }, [index])

  useEffect(() => {
    if (open) {
      setMounted(true)
      const timer = setTimeout(() => setShown(true), 20)
      return () => clearTimeout(timer)
    }
    setShown(false)
    const timer = setTimeout(() => setMounted(false), 300)
    return () => clearTimeout(timer)
  }, [open])

  const go = (step: number) => {
    setDirection(step)
    setCurrent((i) => (i + step + images.length) % images.length)
  }

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') go(1)
      if (e.key === 'ArrowLeft') go(-1)
    }
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = overflow
      window.removeEventListener('keydown', onKey)
    }
  }, [open, images.length])

  const counter = (n: number) => String(n).padStart(2, '0')

  return createPortal(
    mounted && (
        <div
          className={`fixed inset-0 z-[100] flex items-center justify-center bg-ink-950/80 backdrop-blur-xl transition-opacity duration-300 ${
            shown && open ? 'opacity-100' : 'pointer-events-none opacity-0'
          }`}
          onClick={onClose}
          onTouchStart={(e) => {
            touchX.current = e.touches[0].clientX
          }}
          onTouchEnd={(e) => {
            if (touchX.current === null) return
            const dx = e.changedTouches[0].clientX - touchX.current
            touchX.current = null
            if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1)
          }}
        >
          <button
            onClick={onClose}
            aria-label="Закрыть"
            className="absolute right-5 top-5 z-10 text-white/70 transition-colors hover:text-white sm:right-6 sm:top-4"
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round">
              <line x1="5" y1="5" x2="19" y2="19" />
              <line x1="19" y1="5" x2="5" y2="19" />
            </svg>
          </button>

          <div className="relative flex h-full w-full items-center justify-center overflow-hidden px-4 py-16 sm:px-16 sm:py-14">
            <AnimatePresence initial={false} custom={direction} mode="popLayout">
              <motion.img
                key={current}
                src={images[current]}
                alt=""
                custom={direction}
                initial={{ opacity: 0, x: direction * 60 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction * -60 }}
                transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                className="h-full w-full object-contain"
                onClick={(e) => e.stopPropagation()}
              />
            </AnimatePresence>
          </div>

          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  go(-1)
                }}
                aria-label="Предыдущее фото"
                className="absolute left-2 top-1/2 hidden -translate-y-1/2 p-2 text-white/70 transition-colors hover:text-white sm:left-6 sm:block"
              >
                <svg {...ARROW}>
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  go(1)
                }}
                aria-label="Следующее фото"
                className="absolute right-2 top-1/2 hidden -translate-y-1/2 p-2 text-white/70 transition-colors hover:text-white sm:right-6 sm:block"
              >
                <svg {...ARROW}>
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
              <p className="absolute bottom-5 left-1/2 -translate-x-1/2 text-sm tracking-widest text-white/60 sm:bottom-4">
                {counter(current + 1)} / {counter(images.length)}
              </p>
            </>
          )}
        </div>
      ),
    document.body,
  )
}
