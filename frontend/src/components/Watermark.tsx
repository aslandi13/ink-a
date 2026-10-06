import { useEffect, useState } from 'react'
import { getPageContent } from '../api/content'
import { DEFAULT_LOCALE } from '../lib/locale'

interface WatermarkSettings {
  watermark_enabled?: boolean | null
  watermark?: string | null
  watermark_size?: string | null
}

const WIDTH: Record<string, string> = { small: '8%', medium: '11%', large: '15%' }

let cached: WatermarkSettings | null = null

export function useWatermark(): { src: string; width: string } | null {
  const [settings, setSettings] = useState<WatermarkSettings | null>(cached)

  useEffect(() => {
    if (cached) return
    getPageContent<WatermarkSettings>(DEFAULT_LOCALE, 'settings')
      .then((data) => {
        cached = data
        setSettings(data)
      })
      .catch(() => undefined)
  }, [])

  if (!settings || settings.watermark_enabled === false) return null
  return { src: settings.watermark || '/watermark.svg', width: WIDTH[settings.watermark_size ?? ''] ?? WIDTH.medium }
}

export default function Watermark() {
  const watermark = useWatermark()
  if (!watermark) return null
  return (
    <img
      src={watermark.src}
      alt=""
      aria-hidden
      draggable={false}
      className="pointer-events-none absolute bottom-[3%] right-[2.5%] h-auto min-w-[48px] select-none opacity-90"
      style={{ width: watermark.width }}
    />
  )
}
