import { useEffect, useMemo, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useSearchParams } from 'react-router-dom'
import { getDraftPage, getEditorToken, getLocalizedPage, type PageLayout } from '../api/pages'
import ErrorMessage from '../components/ErrorMessage'
import PageRenderer from '../components/PageRenderer'
import { EXPLODERS } from '../editor/explode'
import { contentSources } from '../lib/contentSources'
import { upgradeExploded, type Exploders } from '../lib/upgradeExploded'
import { t } from '../lib/i18n'
import { metaText } from '../lib/metaText'
import { useLocale } from '../lib/useLocale'
import { DEFAULT_HOME_LAYOUT, HeroBackground, HOME_BLOCKS, loadHomeData, type HomeData } from '../sections/home'

export default function Home() {
  const locale = useLocale()
  const tr = t(locale)
  const [searchParams] = useSearchParams()
  const preview = searchParams.has('preview') && !!getEditorToken()
  const [data, setData] = useState<HomeData | null>(null)
  const [layout, setLayout] = useState<PageLayout | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const portals = useMemo(
    () => [
      {
        selector: '[data-exploded="hero"] > video:first-child, [data-exploded="hero"] > img:first-child',
        render: () => <HeroBackground hero={data?.hero} />,
      },
    ],
    [data],
  )

  useEffect(() => {
    setLoading(true)
    setError(false)
    const layoutRequest = preview
      ? getDraftPage('home', locale).then((res) => res.draft)
      : getLocalizedPage(locale, 'home')
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
      <section className="min-h-[60vh]" />
    )
  }

  if (error || !data) {
    return <ErrorMessage>{tr.ui.error}</ErrorMessage>
  }

  return (
    <>
      <Helmet>
        {data.hero?.seo_title && <title>{data.hero.seo_title}</title>}
        {metaText(data.hero?.seo_description, data.hero?.description) && (
          <meta name="description" content={metaText(data.hero?.seo_description, data.hero?.description)} />
        )}
        {data.hero?.og_image && <meta property="og:image" content={data.hero.og_image} />}
      </Helmet>

      {preview && (
        <div className="fixed bottom-4 left-4 z-50 rounded-full bg-accent px-4 py-2 text-xs font-medium text-ink-950">
          Предпросмотр черновика
        </div>
      )}

      <PageRenderer
        html={layout?.html || DEFAULT_HOME_LAYOUT}
        css={layout?.css ?? ''}
        translations={layout?.translations}
        data={data}
        sources={contentSources('home', data)}
        prepare={(body) => upgradeExploded(body, EXPLODERS as Exploders, data, locale)}
        locale={locale}
        blocks={HOME_BLOCKS}
        bleedBlock="hero"
        portals={portals}
      />
    </>
  )
}
