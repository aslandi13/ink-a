import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useSearchParams } from 'react-router-dom'
import { getDraftPage, getEditorToken, getPublishedPage, type PageLayout } from '../api/pages'
import ErrorMessage from '../components/ErrorMessage'
import PageRenderer from '../components/PageRenderer'
import { t } from '../lib/i18n'
import { useLocale } from '../lib/useLocale'
import { DEFAULT_HOME_LAYOUT, HOME_BLOCKS, loadHomeData, type HomeData } from '../sections/home'

export default function Home() {
  const locale = useLocale()
  const tr = t(locale)
  const [searchParams] = useSearchParams()
  const preview = searchParams.has('preview') && !!getEditorToken()
  const [data, setData] = useState<HomeData | null>(null)
  const [layout, setLayout] = useState<PageLayout | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    setLoading(true)
    setError(false)
    const layoutRequest = preview
      ? getDraftPage('home').then((res) => res.draft)
      : getPublishedPage('home')
    Promise.all([loadHomeData(locale), layoutRequest.catch(() => null)])
      .then(([homeData, pageLayout]) => {
        setData(homeData)
        setLayout(pageLayout)
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [locale, preview])

  if (loading) {
    return (
      <section className="flex min-h-[60vh] items-center justify-center text-white/40">
        {tr.ui.loading}
      </section>
    )
  }

  if (error || !data) {
    return <ErrorMessage>{tr.ui.error}</ErrorMessage>
  }

  return (
    <>
      <Helmet>
        <title>INK Architects</title>
        <meta name="description" content={data.hero?.description ?? 'INK Architects — архитектурное бюро'} />
      </Helmet>

      {preview && (
        <div className="fixed bottom-4 left-4 z-50 rounded-full bg-accent px-4 py-2 text-xs font-medium text-ink-950">
          Предпросмотр черновика
        </div>
      )}

      <PageRenderer
        html={layout?.html || DEFAULT_HOME_LAYOUT}
        css={layout?.css ?? ''}
        data={data}
        locale={locale}
        blocks={HOME_BLOCKS}
        bleedBlock="hero"
      />
    </>
  )
}
