import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useSearchParams } from 'react-router-dom'
import { getProjects } from '../api/content'
import { getDraftPage, getEditorToken, getLocalizedPage, type PageLayout } from '../api/pages'
import PageRenderer from '../components/PageRenderer'
import { t } from '../lib/i18n'
import { useLocale } from '../lib/useLocale'
import { DEFAULT_PROJECTS_LIST_LAYOUT, PROJECTS_LIST_BLOCKS } from '../sections/projectsList'

export default function Projects() {
  const locale = useLocale()
  const tr = t(locale)
  const [searchParams] = useSearchParams()
  const preview = searchParams.has('preview') && !!getEditorToken()
  const [layout, setLayout] = useState<PageLayout | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    getProjects(locale, { page: 1 }).catch(() => undefined)
    setReady(false)
    const request = preview ? getDraftPage('projects', locale).then((res) => res.draft) : getLocalizedPage(locale, 'projects')
    request
      .catch(() => null)
      .then(setLayout)
      .finally(() => setReady(true))
  }, [locale, preview])

  return (
    <>
      <Helmet>
        <title>{`${tr.projects.title} — INK Architects`}</title>
        <meta name="description" content={locale === 'ru' ? 'Портфолио INK Architects — архитектурные проекты, жилые комплексы, общественные пространства и урбанистические проекты в Казахстане.' : 'INK Architects portfolio — residential complexes, public spaces and urban planning projects in Kazakhstan.'} />
      </Helmet>

      {preview && (
        <div className="fixed bottom-4 left-4 z-50 rounded-full bg-accent px-4 py-2 text-xs font-medium text-ink-950">
          Предпросмотр черновика
        </div>
      )}

      {ready ? (
        <PageRenderer
          html={layout?.html || DEFAULT_PROJECTS_LIST_LAYOUT}
          css={layout?.css ?? ''}
          translations={layout?.translations}
          data={null}
          locale={locale}
          blocks={PROJECTS_LIST_BLOCKS}
        />
      ) : (
        <section className="min-h-[60vh]" />
      )}
    </>
  )
}
