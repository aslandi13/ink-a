import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getPageContent, getProjects, type ProjectListItem } from '../api/content'
import ErrorMessage from '../components/ErrorMessage'
import { StaggerItem, StaggerList } from '../components/StaggerReveal'
import { t } from '../lib/i18n'
import type { Locale } from '../lib/locale'
import { prefetchProject } from '../lib/prefetch'
import { categoryFromSlug, categorySlug, DEFAULT_PROJECT_CATEGORY, PROJECTS_PER_PAGE } from '../lib/projectCategories'
import { projectPath } from '../lib/projectPath'
import { useRefresh } from '../lib/refresh'

type Settings = Record<string, string>

type ProjectsIntro = Record<string, { image?: string | null; enabled?: boolean }>

const COLS: Record<string, string> = { '2': 'md:grid-cols-2', '3': 'md:grid-cols-3', '4': 'md:grid-cols-4' }
const RATIO: Record<string, string> = { classic: '1.95/1', wide: '16/9', cinema: '21/9', square: '1/1', tall: '3/4' }
const TITLE: Record<string, string> = { s: '1rem', m: '1.3rem', l: '1.8rem', xl: '2.4rem' }
const GAP: Record<string, string> = { none: '0', s: '0.5rem', l: '1rem' }

export const PROJECTS_LIST_SETTINGS = [
  { name: 'cols', label: 'Колонок', options: [['4', '4'], ['3', '3'], ['2', '2']] },
  { name: 'ratio', label: 'Форма картинок', options: [['classic', 'Как на ink-a.com'], ['wide', 'Широкие 16:9'], ['cinema', 'Очень широкие 21:9'], ['square', 'Квадрат'], ['tall', 'Вертикальные 3:4']] },
  { name: 'featured', label: 'Большие карточки', options: [['on', 'Показывать'], ['off', 'Все одинаковые']] },
  { name: 'gap', label: 'Отступ между', options: [['s', 'Обычный'], ['none', 'Без отступа'], ['l', 'Большой']] },
  { name: 'title', label: 'Размер названия', options: [['m', 'Средний'], ['s', 'Маленький'], ['l', 'Большой'], ['xl', 'Очень большой']] },
  { name: 'location', label: 'Город', options: [['show', 'Показывать'], ['hide', 'Скрыть']] },
]

export function ProjectsListSection({ locale, settings = {} }: { data: unknown; locale: Locale; settings?: Settings }) {
  const tr = t(locale)
  const cols = COLS[settings.cols ?? ''] ?? COLS['4']
  const ratio = RATIO[settings.ratio ?? ''] ?? RATIO.classic
  const featured = settings.featured !== 'off'
  const titleSize = TITLE[settings.title ?? ''] ?? TITLE.m
  const gap = GAP[settings.gap ?? ''] ?? GAP.s
  const showLocation = settings.location !== 'hide'

  const CATEGORIES = [
    { value: 'architecture', label: tr.projects.categories.architecture },
    { value: 'engineering', label: tr.projects.categories.engineering },
    { value: 'urbanism', label: tr.projects.categories.urbanism },
    { value: 'interior', label: tr.projects.categories.interior },
  ]

  const params = useParams()
  const navigate = useNavigate()
  const routeCategory = categoryFromSlug(params.slug)
  const [category, setCategory] = useState<string>(routeCategory ?? DEFAULT_PROJECT_CATEGORY)
  useEffect(() => {
    if (routeCategory) setCategory(routeCategory)
  }, [routeCategory])
  const selectCategory = (value: string) => {
    setCategory(value)
    if (routeCategory) navigate(`/${locale}/projects/${categorySlug(value)}`)
  }
  const [projects, setProjects] = useState<ProjectListItem[]>([])
  const [page, setPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState(false)
  const [intro, setIntro] = useState<ProjectsIntro>({})
  const refresh = useRefresh()

  useEffect(() => {
    getPageContent<ProjectsIntro>(locale, 'projects-intro')
      .then((data) => setIntro(data ?? {}))
      .catch(() => setIntro({}))
  }, [locale, refresh.key])

  const introCard = intro[category]?.enabled && intro[category]?.image ? intro[category]!.image! : null
  const offset = introCard ? 1 : 0

  useEffect(() => {
    if (!refresh.silent()) {
      setProjects([])
      setPage(1)
      setLastPage(1)
      setLoading(true)
    }
    setError(false)

    getProjects(locale, { category, page: 1, per_page: PROJECTS_PER_PAGE })
      .then((res) => {
        setProjects(res.data)
        setLastPage(res.meta.last_page)
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [locale, category, refresh.key])

  function loadMore() {
    const nextPage = page + 1
    setLoadingMore(true)
    getProjects(locale, { category, page: nextPage, per_page: PROJECTS_PER_PAGE })
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
            onClick={() => selectCategory(c.value)}
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
        <div className="min-h-[60vh]" />
      ) : error ? (
        <ErrorMessage>{tr.ui.error}</ErrorMessage>
      ) : projects.length === 0 && !introCard ? (
        <p className="mt-16 text-white/40">{tr.projects.empty}</p>
      ) : (
        <>
        <StaggerList className={`mt-2 sm:mt-6 grid grid-flow-dense grid-cols-2 ${cols}`} style={{ gap }}>
            {introCard && (
              <StaggerItem className={featured ? 'col-span-2 md:row-span-2' : ''} style={{ aspectRatio: ratio }}>
                <Link
                  to={`/${locale}/approach/${categorySlug(category)}`}
                  className="group relative block h-full w-full overflow-hidden bg-ink-800"
                >
                  <img
                    src={introCard}
                    alt={CATEGORIES.find((c) => c.value === category)?.label ?? ''}
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                </Link>
              </StaggerItem>
            )}
            {projects.map((project, index) => {
              const i = index + offset
              const isFeatured = featured && i % 13 === 0
              return (
                <StaggerItem
                  key={project.id}
                  className={`${featured && i === 0 ? 'col-span-2' : ''} ${isFeatured ? 'md:col-span-2 md:row-span-2' : ''}`}
                  style={{ aspectRatio: ratio }}
                >
                  <Link
                    to={projectPath(locale, project)}
                    onMouseEnter={() => prefetchProject(locale, project)}
                    className="group relative block h-full w-full overflow-hidden bg-ink-800"
                  >
                    {project.cover_image && (
                      <img
                        src={project.cover_image}
                        alt={project.title}
                        className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                      />
                    )}
                    <div className="absolute inset-0 bg-ink-950/0 transition-colors duration-700 group-hover:bg-ink-950/25" />
                    <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/70 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-4">
                      <p className="font-serif leading-[1.1] text-white" style={{ fontSize: titleSize }}>
                        {project.title}
                      </p>
                      {showLocation && project.location && (
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
  {
    id: 'projects-list',
    label: 'Список проектов',
    settings: PROJECTS_LIST_SETTINGS,
    render: (p: { data: unknown; locale: Locale; settings?: Settings }) => <ProjectsListSection {...p} />,
  },
]

export const DEFAULT_PROJECTS_LIST_LAYOUT = PROJECTS_LIST_BLOCKS.map((b) => `<section data-block="${b.id}"></section>`).join('')
