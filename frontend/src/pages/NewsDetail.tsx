import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useParams, useSearchParams } from 'react-router-dom'
import { getNewsItem } from '../api/content'
import { getDraftPage, getEditorToken, getNewsTemplate, type PageLayout } from '../api/pages'
import ErrorMessage from '../components/ErrorMessage'
import PageRenderer from '../components/PageRenderer'
import { t } from '../lib/i18n'
import { metaText } from '../lib/metaText'
import { useLocale } from '../lib/useLocale'
import { DEFAULT_NEWS_LAYOUT, fillNewsFields, loadOtherNews, NEWS_BLOCKS, NEWS_TEMPLATE, type NewsPageData } from '../sections/news'

export default function NewsDetail() {
  const locale = useLocale()
  const tr = t(locale)
  const { slug } = useParams()
  const [searchParams] = useSearchParams()
  const preview = searchParams.has('preview') && !!getEditorToken()
  const [data, setData] = useState<NewsPageData | null>(null)
  const [layout, setLayout] = useState<PageLayout | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!slug) return
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
    setLoading(true)
    setError(false)
    setData(null)
    const template = preview
      ? getDraftPage(NEWS_TEMPLATE, locale).then((res) => res.draft).catch(() => null)
      : getNewsTemplate(locale)
    Promise.all([getNewsItem(locale, slug), loadOtherNews(locale, slug), template])
      .then(([item, others, templateLayout]) => {
        setLayout(templateLayout)
        setData({ item, others })
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [locale, slug, preview])

  if (loading) {
    return <section className="min-h-[60vh]" />
  }

  if (error) {
    return <ErrorMessage>{tr.ui.error}</ErrorMessage>
  }

  if (!data) {
    return <section className="mx-auto max-w-[84rem] px-6 py-24 text-white">{tr.ui.newsNotFound}</section>
  }

  return (
    <article>
      <Helmet>
        <title>{`${data.item.title} — INK Architects`}</title>
        {metaText(data.item.excerpt, data.item.body) && <meta name="description" content={metaText(data.item.excerpt, data.item.body)} />}
        {data.item.cover_image && <meta property="og:image" content={data.item.cover_image} />}
      </Helmet>

      {preview && (
        <div className="fixed bottom-4 left-4 z-50 rounded-full bg-accent px-4 py-2 text-xs font-medium text-ink-950">
          Предпросмотр черновика
        </div>
      )}

      <PageRenderer
        html={layout?.html || DEFAULT_NEWS_LAYOUT}
        css={layout?.css ?? ''}
        translations={layout?.translations}
        data={data}
        locale={locale}
        blocks={NEWS_BLOCKS}
        transformHtml={(html) => fillNewsFields(html, data, locale)}
      />
    </article>
  )
}
