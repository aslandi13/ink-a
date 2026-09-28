import { useCallback, useEffect, useRef, useState } from 'react'

export interface ProjectSlide {
  image: string
  name: string
}

interface Props {
  videoSrc?: string
  videoPoster?: string
  projects?: ProjectSlide[]
}

function fmt(s: number) {
  const m = Math.floor(s / 60)
  const ss = Math.floor(s % 60)
  return `${m}:${ss.toString().padStart(2, '0')}`
}

// Build slide list: [video?, ...photos]
type Slide =
  | { type: 'video' }
  | { type: 'photo'; image: string; name: string }

const PHOTO_DURATION = 6000 // ms per photo slide

export default function HeroBannerSlider({ videoSrc, videoPoster, projects = [] }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)

  const slides: Slide[] = [
    ...(videoSrc ? [{ type: 'video' as const }] : []),
    ...projects.map((p) => ({ type: 'photo' as const, ...p })),
  ]

  const [idx, setIdx] = useState(0)
  const [fade, setFade] = useState(true) // true = visible
  const [muted, setMuted] = useState(true)
  const [current, setCurrent] = useState(0)
  const [duration, setDuration] = useState(0)
  const photoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const currentSlide = slides[idx] ?? null
  const isVideo = currentSlide?.type === 'video'
  const isPhoto = currentSlide?.type === 'photo'

  // Crossfade to next slide
  const advanceSlide = useCallback(() => {
    setFade(false)
    setTimeout(() => {
      setIdx((prev) => (prev + 1) % Math.max(slides.length, 1))
      setFade(true)
    }, 400)
  }, [slides.length])

  // When slide changes
  useEffect(() => {
    if (photoTimerRef.current) clearTimeout(photoTimerRef.current)

    if (isVideo) {
      // Video plays on its own; advance when it ends (handled in onEnded)
      videoRef.current?.play().catch(() => {})
    } else if (isPhoto) {
      photoTimerRef.current = setTimeout(advanceSlide, PHOTO_DURATION)
    }

    return () => {
      if (photoTimerRef.current) clearTimeout(photoTimerRef.current)
    }
  }, [idx, isVideo, isPhoto, advanceSlide])

  const toggleMute = useCallback(() => {
    const v = videoRef.current
    if (!v) return
    v.muted = !v.muted
    setMuted(v.muted)
  }, [])

  const onTimeUpdate = useCallback(() => {
    const v = videoRef.current
    if (!v) return
    setCurrent(v.currentTime)
  }, [])

  const onLoadedMetadata = useCallback(() => {
    const v = videoRef.current
    if (!v) return
    setDuration(v.duration)
  }, [])

  const seek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v = videoRef.current
    if (!v) return
    v.currentTime = Number(e.target.value)
    setCurrent(v.currentTime)
  }, [])

  const onVideoEnded = useCallback(() => {
    if (slides.length > 1) advanceSlide()
    else videoRef.current?.play().catch(() => {})
  }, [slides.length, advanceSlide])

  if (!slides.length) return null

  const photoSlide = isPhoto ? (currentSlide as { type: 'photo'; image: string; name: string }) : null

  return (
    <section className="py-0">
      <div className="relative mx-auto aspect-video w-full max-w-[84rem] overflow-hidden bg-black px-0">

        {/* ── Video layer (always mounted, hidden when not on video slide) ── */}
        {videoSrc && (
          <video
            ref={videoRef}
            className="absolute inset-0 h-full w-full object-cover"
            style={{
              opacity: isVideo && fade ? 1 : 0,
              transition: 'opacity 0.4s ease',
              zIndex: isVideo ? 1 : 0,
            }}
            src={videoSrc}
            poster={videoPoster}
            muted
            playsInline
            onTimeUpdate={onTimeUpdate}
            onLoadedMetadata={onLoadedMetadata}
            onEnded={onVideoEnded}
          />
        )}

        {/* ── Photo layer ── */}
        {isPhoto && photoSlide && (
          <img
            key={photoSlide.image}
            src={photoSlide.image}
            alt={photoSlide.name}
            className="absolute inset-0 h-full w-full object-cover"
            style={{
              opacity: fade ? 1 : 0,
              transition: 'opacity 0.4s ease',
              zIndex: 1,
            }}
          />
        )}

        {/* ── Gradient overlay ── */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{ zIndex: 2, background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 60%)' }}
        />

        {/* ── Bottom bar ── */}
        <div
          className="absolute inset-x-0 bottom-0 flex items-center gap-4 px-6 pb-4 pt-10"
          style={{ zIndex: 3 }}
        >
          {/* Project name (photo slides) */}
          {isPhoto && photoSlide && (
            <span
              className="mr-auto font-serif text-[1.1rem] text-white/80"
              style={{ transition: 'opacity 0.4s ease', opacity: fade ? 1 : 0 }}
            >
              {photoSlide.name}
            </span>
          )}

          {/* Slide dots */}
          {slides.length > 1 && (
            <div className="flex gap-1.5 ml-auto">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    if (i === idx) return
                    setFade(false)
                    setTimeout(() => { setIdx(i); setFade(true) }, 400)
                  }}
                  className="h-1 rounded-full transition-all"
                  style={{
                    width: i === idx ? '24px' : '8px',
                    backgroundColor: i === idx ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.35)',
                  }}
                  aria-label={`Слайд ${i + 1}`}
                />
              ))}
            </div>
          )}

          {/* Video controls (only on video slide) */}
          {isVideo && (
            <>
              <button
                onClick={toggleMute}
                className="ml-0 flex h-9 w-9 shrink-0 items-center justify-center text-white/80 transition hover:text-white"
                aria-label={muted ? 'Включить звук' : 'Выключить звук'}
              >
                {muted ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                    <line x1="23" y1="9" x2="17" y2="15"/>
                    <line x1="17" y1="9" x2="23" y2="15"/>
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
                  </svg>
                )}
              </button>

              <div className="relative flex h-[5px] flex-1 items-center">
                <div className="absolute inset-y-0 w-full rounded-full bg-white/20" />
                <div
                  className="pointer-events-none absolute left-0 top-1/2 h-[5px] -translate-y-1/2 rounded-full bg-white/50"
                  style={{ width: duration ? `${(current / duration) * 100}%` : '0%' }}
                />
                <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  step={0.01}
                  value={current}
                  onChange={seek}
                  className="relative w-full cursor-pointer appearance-none bg-transparent [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-white"
                  aria-label="Прогресс видео"
                />
              </div>

              <span className="shrink-0 font-sans text-sm tabular-nums text-white/80">
                {fmt(current)} / {fmt(duration)}
              </span>
            </>
          )}
        </div>
      </div>
    </section>
  )
}
