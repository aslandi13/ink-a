import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getPageContent, getProjects, type ProjectListItem } from '../api/content'
import ErrorMessage from '../components/ErrorMessage'
import { t } from '../lib/i18n'
import type { Locale } from '../lib/locale'
import { prefetchProject } from '../lib/prefetch'
import { categoryFromSlug, categorySlug, DEFAULT_PROJECT_CATEGORY, PROJECTS_PER_PAGE } from '../lib/projectCategories'
import { formatCoordinates } from '../lib/coordinates'
import { projectPath } from '../lib/projectPath'
import { preloadImage, rememberProjects } from '../lib/projectPreview'
import { useRefresh } from '../lib/refresh'

type Settings = Record<string, string>

type ProjectsIntro = Record<string, { image?: string | null; enabled?: boolean; color?: string | null }>

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
]

export function ProjectsGridSkeleton({
  cols = 'md:grid-cols-4',
  ratio = '1.95/1',
  gap = '0.5rem',
  featured = true,
  count = 13,
}: {
  cols?: string
  ratio?: string
  gap?: string
  featured?: boolean
  count?: number
}) {
  return (
    <div className={`mt-2 sm:mt-6 grid grid-flow-dense grid-cols-2 ${cols}`} style={{ gap }}>
      {Array.from({ length: count }).map((_, i) => {
        const isFeatured = featured && i === 0
        return (
          <div
            key={i}
            className={isFeatured ? 'col-span-2 aspect-[1.36] md:row-span-2 md:aspect-[var(--tile)]' : 'aspect-[2/3] md:aspect-[var(--tile)]'}
            style={{ '--tile': ratio } as CSSProperties}
          >
            <div className="relative h-full w-full overflow-hidden bg-ink-900 border border-white/[0.03]">
              <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4">
                <div className="h-4 w-3/4 max-w-[200px] rounded bg-white/10 mb-2" />
                <div className="h-3 w-1/3 max-w-[100px] rounded bg-white/5" />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function CardLocation({ project }: { project: ProjectListItem }) {
  const mode = project.card_location ?? 'both'
  const coords = formatCoordinates(project.latitude, project.longitude)
  const city = mode === 'city' || (mode === 'both' && coords) ? project.location : null
  const coordinates = mode === 'both' || mode === 'coords' ? coords : null
  if (!city && !coordinates) return null
  return (
    <div className="absolute right-0 top-0 p-4 text-right text-[0.8rem] leading-snug text-white/90 [text-shadow:0_1px_6px_rgb(0_0_0/0.5)]">
      {city && <p>— {city}</p>}
      {coordinates && <p>{coordinates}</p>}
    </div>
  )
}

function ProjectCard({
  project,
  index,
  offset,
  featured,
  ratio,
  titleSize,
  locale,
}: {
  project: ProjectListItem
  index: number
  offset: number
  featured: boolean
  ratio: string
  titleSize: string
  locale: Locale
}) {
  const i = index + offset
  const isFeatured = featured && i % 13 === 0
  const [imageLoaded, setImageLoaded] = useState(false)
  const imgRef = useRef<HTMLImageElement | null>(null)

  useEffect(() => {
    if (imgRef.current?.complete && imgRef.current.naturalWidth > 0) {
      setImageLoaded(true)
    }
  }, [])

  const src = project.cover_thumb ?? project.cover_image

  return (
    <motion.div
      className={isFeatured ? 'col-span-2 aspect-[1.36] md:row-span-2 md:aspect-[var(--tile)]' : 'aspect-[2/3] md:aspect-[var(--tile)]'}
      style={{ '--tile': ratio } as CSSProperties}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '80px' }}
      transition={{ duration: 0.45, delay: index < 8 ? Math.min(index * 0.04, 0.25) : 0, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <Link
        to={projectPath(locale, project)}
        onMouseEnter={() => {
          prefetchProject(locale, project)
          preloadImage(project.cover_image)
        }}
        onTouchStart={() => prefetchProject(locale, project)}
        className="group relative block h-full w-full overflow-hidden bg-ink-900 border border-white/[0.03]"
      >
        {/* Shimmer Placeholder while image is loading */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-ink-900 overflow-hidden">
            <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />
          </div>
        )}

        {src && (
          <img
            ref={imgRef}
            src={src}
            alt={project.title}
            loading={index < 8 ? 'eager' : 'lazy'}
            fetchPriority={index < 4 ? 'high' : 'auto'}
            decoding="async"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageLoaded(true)}
            className={`h-full w-full object-cover transition-all duration-700 ease-out group-hover:scale-110 ${
              imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-[1.03]'
            }`}
          />
        )}

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-ink-950/0 transition-colors duration-700 group-hover:bg-ink-950/25" />
        <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/70 to-transparent" />

        <CardLocation project={project} />

        <div className="absolute inset-x-0 bottom-0 p-4">
          <p className="font-serif leading-[1.1] text-white" style={{ fontSize: titleSize }}>
            {project.title}
          </p>
        </div>
      </Link>
    </motion.div>
  )
}

export function ProjectsListSection({ locale, settings = {} }: { data: unknown; locale: Locale; settings?: Settings }) {
  const tr = t(locale)
  const cols = COLS[settings.cols ?? ''] ?? COLS['4']
  const ratio = RATIO[settings.ratio ?? ''] ?? RATIO.classic
  const featured = settings.featured !== 'off'
  const titleSize = TITLE[settings.title ?? ''] ?? TITLE.m
  const gap = GAP[settings.gap ?? ''] ?? GAP.s

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
    if (value === category) return
    setCategory(value)
    if (routeCategory) navigate(`/${locale}/projects/${categorySlug(value)}`)
  }

  const [projects, setProjects] = useState<ProjectListItem[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [loadingInitial, setLoadingInitial] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState(false)
  const [intro, setIntro] = useState<ProjectsIntro>({})

  const refresh = useRefresh()
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    getPageContent<ProjectsIntro>(locale, 'projects-intro')
      .then((data) => setIntro(data ?? {}))
      .catch(() => setIntro({}))
  }, [locale, refresh.key])

  const introCard = intro[category]?.enabled && intro[category]?.image ? intro[category]!.image! : null
  const offset = introCard ? 1 : 0

  // Initial load or category change
  useEffect(() => {
    setLoadingInitial(true)
    setError(false)
    setPage(1)

    getProjects(locale, { category, page: 1, per_page: PROJECTS_PER_PAGE })
      .then((res) => {
        rememberProjects(res.data)
        setProjects(res.data)
        setHasMore(res.meta.current_page < res.meta.last_page)
      })
      .catch(() => setError(true))
      .finally(() => setLoadingInitial(false))
  }, [locale, category, refresh.key])

  // Load next page
  const loadMore = useCallback(() => {
    if (loadingMore || !hasMore || loadingInitial) return

    setLoadingMore(true)
    const nextPage = page + 1

    getProjects(locale, { category, page: nextPage, per_page: PROJECTS_PER_PAGE })
      .then((res) => {
        rememberProjects(res.data)
        setProjects((prev) => [...prev, ...res.data])
        setPage(nextPage)
        setHasMore(res.meta.current_page < res.meta.last_page)
      })
      .catch((err) => {
        console.error('Failed to load more projects:', err)
      })
      .finally(() => {
        setLoadingMore(false)
      })
  }, [category, hasMore, loadingInitial, loadingMore, locale, page])

  // Infinite scroll observer
  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore()
        }
      },
      { rootMargin: '600px' }
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [loadMore])

  return (
    <section className="mx-auto max-w-[84rem] px-6 pt-24 pb-24">
      {/* Category Tabs */}
      <div className="flex flex-col items-start gap-y-2 pb-1 text-lg sm:flex-row sm:flex-wrap sm:gap-x-8 sm:gap-y-3 sm:pb-6 sm:text-sm">
        {CATEGORIES.map((c) => (
          <button
            key={c.value}
            data-interactive
            onClick={() => selectCategory(c.value)}
            className={
              c.value === category
                ? 'border-b border-white pb-1 text-left text-white'
                : 'pb-1 text-left text-white/50 transition-colors hover:text-white'
            }
          >
            {c.label}
          </button>
        ))}
      </div>

      {loadingInitial ? (
        <ProjectsGridSkeleton cols={cols} ratio={ratio} gap={gap} featured={featured} count={13} />
      ) : error ? (
        <ErrorMessage>{tr.ui.error}</ErrorMessage>
      ) : projects.length === 0 && !introCard ? (
        <p className="mt-16 text-white/40">{tr.projects.empty}</p>
      ) : (
        <>
          <div className={`mt-2 sm:mt-6 grid grid-flow-dense grid-cols-2 ${cols}`} style={{ gap }}>
            {introCard && (
              <div
                className={featured ? 'col-span-2 aspect-[1.36] md:row-span-2 md:aspect-[var(--tile)]' : 'aspect-[2/3] md:aspect-[var(--tile)]'}
                style={{ '--tile': ratio } as CSSProperties}
              >
                <Link
                  to={`/${locale}/approach/${categorySlug(category)}`}
                  className="group relative block h-full w-full overflow-hidden bg-ink-800"
                  style={{ backgroundColor: intro[category]?.color ?? undefined }}
                >
                  <img
                    src={introCard}
                    alt={CATEGORIES.find((c) => c.value === category)?.label ?? ''}
                    className="relative h-full w-full object-contain transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                </Link>
              </div>
            )}
            {projects.map((project, index) => (
              <ProjectCard
                key={`${project.id}-${index}`}
                project={project}
                index={index}
                offset={offset}
                featured={featured}
                ratio={ratio}
                titleSize={titleSize}
                locale={locale}
              />
            ))}
          </div>

          {/* Infinite Scroll Sentinel */}
          {hasMore && (
            <div ref={sentinelRef} className="mt-8 flex justify-center py-6">
              {loadingMore && (
                <div className="flex items-center gap-3 text-white/50 text-sm">
                  <div className="h-4 w-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                  <span>{locale === 'ru' ? 'Загрузка проектов...' : 'Loading projects...'}</span>
                </div>
              )}
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

