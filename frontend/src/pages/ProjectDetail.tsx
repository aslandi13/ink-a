import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Navigate, useLocation, useParams, useSearchParams } from 'react-router-dom'
import { getProject } from '../api/content'
import { getDraftPage, getEditorToken, getProjectTemplate, type PageLayout } from '../api/pages'
import ErrorMessage from '../components/ErrorMessage'
import Lightbox from '../components/Lightbox'
import PageRenderer from '../components/PageRenderer'
import { t } from '../lib/i18n'
import { projectPath } from '../lib/projectPath'
import type { Locale } from '../lib/locale'
import { metaText } from '../lib/metaText'
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
  const { slug, category } = useParams()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const preview = searchParams.has('preview') && !!getEditorToken()
  const forcedTemplate = searchParams.get('template')
  const [data, setData] = useState<ProjectPageData | null>(null)
  const [layout, setLayout] = useState<PageLayout | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [lightbox, setLightbox] = useState<{ images: string[]; index: number } | null>(null)

  useEffect(() => {
    if (!slug) return
    setLoading(true)
    setError(false)
    setData(null)
    Promise.all([getProject(locale, slug, category), loadOtherProjects(locale, slug, category)])
      .then(async ([project, others]) => {
        const template = preview
          ? await loadDraftTemplate(locale, project.category, forcedTemplate)
          : await getProjectTemplate(locale, project.category)
        setLayout(template)
        setData({ project, others })
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [locale, slug, category, preview, forcedTemplate])

  if (loading) {
    return <section className="min-h-[60vh]" />
  }

  if (error) {
    return <ErrorMessage>{tr.ui.error}</ErrorMessage>
  }

  if (!data) {
    return <section className="mx-auto max-w-[84rem] px-6 py-24 text-white">{tr.ui.projectNotFound}</section>
  }

  if (!category && data.project.category) {
    return <Navigate to={`${projectPath(locale, data.project)}${location.search}`} replace />
  }

  return (
    <article
      onClick={(e) => {
        const img = (e.target as HTMLElement).closest<HTMLImageElement>('[data-field="gallery"] img')
        const container = img?.closest('[data-field="gallery"]')
        if (!img || !container) return
        const items = Array.from(container.querySelectorAll('img'))
        const images = items.map((el) => el.dataset.full || el.getAttribute('src') || '')
        setLightbox({ images, index: items.indexOf(img) })
      }}
    >
      <Lightbox images={lightbox?.images ?? []} index={lightbox?.index ?? null} onClose={() => setLightbox(null)} />
      <Helmet>
        <title>{`${data.project.title} — INK Architects`}</title>
        {metaText(data.project.excerpt, data.project.body) && <meta name="description" content={metaText(data.project.excerpt, data.project.body)} />}
        {data.project.cover_image && <meta property="og:image" content={data.project.cover_image} />}
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
