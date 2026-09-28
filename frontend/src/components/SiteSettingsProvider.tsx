import { useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { getPageContent } from '../api/content'
import { DEFAULT_LOCALE } from '../lib/locale'
import { useState } from 'react'

interface SiteSettings {
  favicon?: string
  seo_title?: string
  seo_description?: string
  og_image?: string
}

export default function SiteSettingsProvider() {
  const [settings, setSettings] = useState<SiteSettings | null>(null)

  useEffect(() => {
    getPageContent<SiteSettings>(DEFAULT_LOCALE, 'settings')
      .then((data) => {
        setSettings(data)
        // Set favicon directly in DOM (more reliable than Helmet for icons)
        if (data.favicon) {
          let link = document.querySelector<HTMLLinkElement>('link[rel~="icon"]')
          if (!link) {
            link = document.createElement('link')
            link.rel = 'icon'
            document.head.appendChild(link)
          }
          link.href = data.favicon
        }
      })
      .catch(() => {})
  }, [])

  if (!settings) return null

  return (
    <Helmet>
      {settings.seo_title && <title>{settings.seo_title}</title>}
      {settings.seo_description && <meta name="description" content={settings.seo_description} />}
      {settings.og_image && <meta property="og:image" content={settings.og_image} />}
      {settings.seo_title && <meta property="og:title" content={settings.seo_title} />}
      {settings.seo_description && <meta property="og:description" content={settings.seo_description} />}
    </Helmet>
  )
}
