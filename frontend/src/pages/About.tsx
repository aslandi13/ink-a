import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useSearchParams } from 'react-router-dom'
import { getDraftPage, getEditorToken, getLocalizedPage, type PageLayout } from '../api/pages'
import ErrorMessage from '../components/ErrorMessage'
import PageRenderer from '../components/PageRenderer'
import { t } from '../lib/i18n'
import { useLocale } from '../lib/useLocale'
import { ABOUT_BLOCKS, DEFAULT_ABOUT_LAYOUT, loadAboutData, type AboutPageData } from '../sections/about'

export default function About() {
  const locale = useLocale()
  const tr = t(locale)
  const [searchParams] = useSearchParams()
  const preview = searchParams.has('preview') && !!getEditorToken()
  const [data, setData] = useState<AboutPageData | null>(null)
  const [layout, setLayout] = useState<PageLayout | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    setLoading(true)
    setError(false)
    const layoutRequest = preview
      ? getDraftPage('about', locale).then((res) => res.draft)
      : getLocalizedPage(locale, 'about')
    Promise.all([loadAboutData(locale), layoutRequest.catch(() => null)])
      .then(([about, pageLayout]) => {
        setData(about)
        setLayout(pageLayout)
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [locale, preview])

  if (loading) {
    return <section className="flex min-h-[60vh] items-center justify-center text-white/40">{tr.ui.loading}</section>
  }

  if (error || !data) {
    return <ErrorMessage>{tr.ui.error}</ErrorMessage>
  }

  const seo = data.history

  return (
    <>
      <Helmet>
        <title>{seo?.seo_title || `${tr.nav.about} — INK Architects`}</title>
        {seo?.seo_description && <meta name="description" content={seo.seo_description} />}
        {seo?.og_image && <meta property="og:image" content={seo.og_image} />}
      </Helmet>

      {preview && (
        <div className="fixed bottom-4 left-4 z-50 rounded-full bg-accent px-4 py-2 text-xs font-medium text-ink-950">
          Предпросмотр черновика
        </div>
      )}

      <PageRenderer
        html={layout?.html || DEFAULT_ABOUT_LAYOUT}
        css={layout?.css ?? ''}
        data={data}
        locale={locale}
        blocks={ABOUT_BLOCKS}
      />
    </>
  )
}
