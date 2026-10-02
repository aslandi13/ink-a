import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getProjects, type ProjectListItem } from '../api/content'
import ErrorMessage from '../components/ErrorMessage'
import { StaggerItem, StaggerList } from '../components/StaggerReveal'
import { t } from '../lib/i18n'
import type { Locale } from '../lib/locale'

export function ProjectsListSection({ locale }: { data: unknown; locale: Locale }) {
  const tr = t(locale)

  const CATEGORIES = [
    { value: '', label: tr.projects.categories.all },
    { value: 'architecture', label: tr.projects.categories.architecture },
    { value: 'engineering', label: tr.projects.categories.engineering },
    { value: 'urbanism', label: tr.projects.categories.urbanism },
    { value: 'interior', label: tr.projects.categories.interior },
  ]

  const [category, setCategory] = useState('')
  const [projects, setProjects] = useState<ProjectListItem[]>([])
  const [page, setPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    setProjects([])
    setPage(1)
    setLastPage(1)
    setLoading(true)
    setError(false)

    getProjects(locale, category ? { category, page: 1 } : { page: 1 })
      .then((res) => {
        setProjects(res.data)
        setLastPage(res.meta.last_page)
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [locale, category])

  function loadMore() {
    const nextPage = page + 1
    setLoadingMore(true)
    getProjects(locale, category ? { category, page: nextPage } : { page: nextPage })
      .then((res) => {
        setProjects((prev) => [...prev, ...res.data])
        setPage(nextPage)
        setLastPage(res.meta.last_page)
      })
      .catch(() => setError(true))
      .finally(() => setLoadingMore(false))
  }

  return (
    <section className="mx-auto max-w-[84rem] px-6 pt-24 pb-24">


      <div className="flex flex-wrap gap-x-8 gap-y-3 pb-1 text-sm sm:pb-6">
        {CATEGORIES.map((c) => (
          <button
            key={c.value}
            data-interactive
            onClick={() => setCategory(c.value)}
            className={
              c.value === category
                ? 'border-b border-white pb-1 text-white'
                : 'pb-1 text-white/50 transition-colors hover:text-white'
            }
          >
            {c.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="mt-16 text-white/40">{tr.ui.loading}</p>
      ) : error ? (
        <ErrorMessage>{tr.ui.error}</ErrorMessage>
      ) : projects.length === 0 ? (
        <p className="mt-16 text-white/40">{tr.projects.empty}</p>
      ) : (
        <>
        <StaggerList className="mt-2 sm:mt-6 grid grid-flow-dense grid-cols-2 gap-2 md:grid-cols-4">
            {projects.map((project, i) => {
              const isFeatured = i % 13 === 0
              return (
                <StaggerItem
                  key={project.id}
                  className={`${i === 0 ? 'col-span-2' : ''} ${isFeatured ? 'md:col-span-2 md:row-span-2' : ''}`}
                  style={{ aspectRatio: '16/9' }}
                >
                  <Link
                    to={`/${locale}/projects/${project.slug}`}
                    className="group relative block h-full w-full overflow-hidden bg-ink-800"
                  >
                    {project.cover_image && (
                      <img
                        src={project.cover_image}
                        alt={project.title}
                        className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                      />
                    )}
                    {/* Overlay при hover */}
                    <div className="absolute inset-0 bg-ink-950/0 transition-colors duration-700 group-hover:bg-ink-950/25" />
                    <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/70 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-4">
                      <p className="font-serif text-[1.3rem] leading-[1.1] text-white">
                        {project.title}
                      </p>
                      {project.location && (
                        <p className="mt-1 text-[0.9rem] text-white/60">{project.location}</p>
                      )}
                    </div>
                  </Link>
                </StaggerItem>
              )
            })}
          </StaggerList>

          {page < lastPage && (
            <div className="mt-12 flex justify-center">
              <button
                data-interactive
                onClick={loadMore}
                disabled={loadingMore}
                className="border border-white/20 px-8 py-3 text-sm text-white/70 transition-colors hover:border-white hover:text-white disabled:opacity-40"
              >
                {loadingMore ? tr.ui.loading : tr.projects.loadMore}
              </button>
            </div>
          )}
        </>
      )}
    </section>
  )
}

export const PROJECTS_LIST_BLOCKS = [
  { id: 'projects-list', label: 'Список проектов', render: (p: { data: unknown; locale: Locale }) => <ProjectsListSection {...p} /> },
]

export const DEFAULT_PROJECTS_LIST_LAYOUT = PROJECTS_LIST_BLOCKS.map((b) => `<section data-block="${b.id}"></section>`).join('')
