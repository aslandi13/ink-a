import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useSearchParams } from 'react-router-dom'
import { getNews } from '../api/content'
import { getDraftPage, getEditorToken, getLocalizedPage, type PageLayout } from '../api/pages'
import PageRenderer from '../components/PageRenderer'
import { t } from '../lib/i18n'
import { useLocale } from '../lib/useLocale'
import { DEFAULT_NEWS_LIST_LAYOUT, NEWS_LIST_BLOCKS } from '../sections/news'

export default function NewsList() {
  const locale = useLocale()
  const tr = t(locale)
  const [searchParams] = useSearchParams()
  const preview = searchParams.has('preview') && !!getEditorToken()
  const [layout, setLayout] = useState<PageLayout | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    getNews(locale, { page: 1 }).catch(() => undefined)
    setReady(false)
    const request = preview ? getDraftPage('news', locale).then((res) => res.draft) : getLocalizedPage(locale, 'news')
    request
      .catch(() => null)
      .then(setLayout)
      .finally(() => setReady(true))
  }, [locale, preview])

  return (
    <>
      <Helmet>
        <title>{`${tr.news.title} — INK Architects`}</title>
      </Helmet>

      {preview && (
        <div className="fixed bottom-4 left-4 z-50 rounded-full bg-accent px-4 py-2 text-xs font-medium text-ink-950">
          Предпросмотр черновика
        </div>
      )}

      {ready ? (
        <PageRenderer
          html={layout?.html || DEFAULT_NEWS_LIST_LAYOUT}
          css={layout?.css ?? ''}
          translations={layout?.translations}
          data={null}
          locale={locale}
          blocks={NEWS_LIST_BLOCKS}
        />
      ) : (
        <section className="min-h-[60vh]" />
      )}
    </>
  )
}
