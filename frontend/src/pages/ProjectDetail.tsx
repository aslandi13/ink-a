import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useParams, useSearchParams } from 'react-router-dom'
import { getProject } from '../api/content'
import { getDraftPage, getEditorToken, getProjectTemplate, type PageLayout } from '../api/pages'
import ErrorMessage from '../components/ErrorMessage'
import PageRenderer from '../components/PageRenderer'
import { t } from '../lib/i18n'
import type { Locale } from '../lib/locale'
import { useLocale } from '../lib/useLocale'
import {
  DEFAULT_PROJECT_LAYOUT,
  isProjectTemplate,
  loadOtherProjects,
  PROJECT_BLOCKS,
  PROJECT_TEMPLATE,
  type ProjectPageData,
} from '../sections/project'
import { fillProjectFields } from '../sections/projectFields'

async function loadDraftTemplate(locale: Locale, category: string, forced: string | null): Promise<PageLayout | null> {
  const slugs = forced && isProjectTemplate(forced) ? [forced] : [`${PROJECT_TEMPLATE}-${category}`, PROJECT_TEMPLATE]
  for (const slug of slugs) {
    const draft = await getDraftPage(slug, locale)
      .then((res) => res.draft)
      .catch(() => null)
    if (draft) return draft
  }
  return null
}

export default function ProjectDetail() {
  const locale = useLocale()
  const tr = t(locale)
  const { slug } = useParams()
  const [searchParams] = useSearchParams()
  const preview = searchParams.has('preview') && !!getEditorToken()
  const forcedTemplate = searchParams.get('template')
  const [data, setData] = useState<ProjectPageData | null>(null)
  const [layout, setLayout] = useState<PageLayout | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!slug) return
    setLoading(true)
    setError(false)
    setData(null)
    Promise.all([getProject(locale, slug), loadOtherProjects(locale, slug)])
      .then(async ([project, others]) => {
        const template = preview
          ? await loadDraftTemplate(locale, project.category, forcedTemplate)
          : await getProjectTemplate(locale, project.category)
        setLayout(template)
        setData({ project, others })
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [locale, slug, preview, forcedTemplate])

  if (loading) {
    return <section className="flex min-h-[60vh] items-center justify-center text-white/40">{tr.ui.loading}</section>
  }

  if (error) {
    return <ErrorMessage>{tr.ui.error}</ErrorMessage>
  }

  if (!data) {
    return <section className="mx-auto max-w-[84rem] px-6 py-24 text-white">{tr.ui.projectNotFound}</section>
  }

  return (
    <article>
      <Helmet>
        <title>{data.project.title} — INK Architects</title>
        {data.project.excerpt && <meta name="description" content={data.project.excerpt} />}
      </Helmet>

      {preview && (
        <div className="fixed bottom-4 left-4 z-50 rounded-full bg-accent px-4 py-2 text-xs font-medium text-ink-950">
          Предпросмотр черновика
        </div>
      )}

      <PageRenderer
        html={layout?.html || DEFAULT_PROJECT_LAYOUT}
        css={layout?.css ?? ''}
        translations={layout?.translations}
        data={data}
        locale={locale}
        blocks={PROJECT_BLOCKS}
        bleedBlock="project-hero"
        transformHtml={(html) => fillProjectFields(html, data, locale)}
      />
    </article>
  )
}
