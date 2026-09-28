import { useCallback, useEffect, useRef, useState } from 'react'

interface Props {
  src: string
  poster?: string
}

function fmt(s: number) {
  const m = Math.floor(s / 60)
  const ss = Math.floor(s % 60)
  return `${m}:${ss.toString().padStart(2, '0')}`
}

export default function VideoBannerPlayer({ src, poster }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [muted, setMuted] = useState(true)
  const [current, setCurrent] = useState(0)
  const [duration, setDuration] = useState(0)

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

  useEffect(() => {
    videoRef.current?.play().catch(() => {})
  }, [])

  return (
    <section className="py-0">
      <div className="relative left-1/2 aspect-video w-screen -translate-x-1/2 overflow-hidden bg-black">
        <video
          ref={videoRef}
          className="h-full w-full object-cover"
          src={src}
          poster={poster}
          muted
          loop
          playsInline
          onTimeUpdate={onTimeUpdate}
          onLoadedMetadata={onLoadedMetadata}
        />

        {/* Controls overlay */}
        <div className="absolute inset-x-0 bottom-0 flex items-center gap-4 px-6 pb-4 pt-10 bg-gradient-to-t from-black/60 to-transparent">
          {/* Mute button */}
          <button
            onClick={toggleMute}
            className="flex h-9 w-9 shrink-0 items-center justify-center text-white/80 transition hover:text-white"
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

          {/* Progress bar */}
          <div className="relative flex-1 h-[5px] flex items-center">
            <div
              className="absolute left-0 top-1/2 h-[5px] -translate-y-1/2 rounded-full bg-white/50 pointer-events-none"
              style={{ width: duration ? `${(current / duration) * 100}%` : '0%' }}
            />
            <div className="absolute inset-y-0 w-full rounded-full bg-white/20" />
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

          {/* Timer */}
          <span className="shrink-0 font-sans text-sm tabular-nums text-white/80">
            {fmt(current)} / {fmt(duration)}
          </span>
        </div>
      </div>
    </section>
  )
}
