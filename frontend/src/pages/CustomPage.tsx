import { useEffect, useRef, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useParams, useSearchParams } from 'react-router-dom'
import { getDraftPage, getEditorToken, getLocalizedPage, type LocalizedPage } from '../api/pages'
import ErrorMessage from '../components/ErrorMessage'
import PageRenderer, { usesBlocks } from '../components/PageRenderer'
import { t } from '../lib/i18n'
import { useRefresh } from '../lib/refresh'
import { useLocale } from '../lib/useLocale'
import { HOME_BLOCKS, loadHomeData, type HomeData } from '../sections/home'
import NotFound from './NotFound'

type State =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'missing' }
  | { status: 'ready'; page: LocalizedPage; data: HomeData | null }

export default function CustomPage() {
  const locale = useLocale()
  const tr = t(locale)
  const slug = useParams()['*'] ?? ''
  const [searchParams] = useSearchParams()
  const preview = searchParams.has('preview') && !!getEditorToken()
  const [state, setState] = useState<State>({ status: 'loading' })

  const refresh = useRefresh()
  const loadedSlug = useRef<string | undefined>(undefined)
  useEffect(() => {
    if (!/^[a-z0-9-]+$/.test(slug)) {
      setState({ status: 'missing' })
      return
    }
    const sameSlug = loadedSlug.current === slug
    loadedSlug.current = slug
    if (!refresh.silent() && !(sameSlug && state.status === 'ready')) setState({ status: 'loading' })

    const pageRequest: Promise<LocalizedPage | null> = preview
      ? Promise.all([getDraftPage(slug, locale), getLocalizedPage(locale, slug)]).then(([res, published]) =>
          res.draft
            ? {
                html: res.draft.html,
                css: res.draft.css,
                title: published?.title ?? res.title,
                seo_title: published?.seo_title ?? null,
                seo_description: published?.seo_description ?? null,
              }
            : null,
        )
      : getLocalizedPage(locale, slug)

    pageRequest
      .then(async (page) => {
        if (!page) return setState({ status: 'missing' })
        const data = usesBlocks(page.html) ? await loadHomeData(locale) : null
        setState({ status: 'ready', page, data })
      })
      .catch(() => setState({ status: 'error' }))
  }, [locale, slug, preview, refresh.key])

  if (state.status === 'missing') return <NotFound />
  if (state.status === 'error') return <ErrorMessage>{tr.ui.error}</ErrorMessage>
  if (state.status === 'loading') {
    return <section className="min-h-screen" />
  }

  const { page, data } = state

  return (
    <>
      <Helmet>
        <title>{`${page.seo_title || page.title || 'INK Architects'} — INK Architects`}</title>
        {page.seo_description && <meta name="description" content={page.seo_description} />}
      </Helmet>

      {preview && (
        <div className="fixed bottom-4 left-4 z-50 rounded-full bg-accent px-4 py-2 text-xs font-medium text-ink-950">
          Предпросмотр черновика
        </div>
      )}

      <PageRenderer
        html={page.html}
        css={page.css}
        translations={page.translations}
        data={data as HomeData}
        locale={locale}
        blocks={HOME_BLOCKS}
        bleedBlock="hero"
        offsetClass="pt-24"
      />
    </>
  )
}
