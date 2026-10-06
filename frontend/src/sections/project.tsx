import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { getProject, getProjects, type ProjectDetail, type ProjectListItem } from '../api/content'
import Lightbox from '../components/Lightbox'
import Reveal from '../components/Reveal'
import type { Locale } from '../lib/locale'
import { sanitise } from '../lib/sanitise'

export interface ProjectPageData {
  project: ProjectDetail
  others: ProjectListItem[]
}

type Settings = Record<string, string>

interface SectionProps {
  data: ProjectPageData
  locale: Locale
  settings?: Settings
}

const HERO_HEIGHT: Record<string, string> = { large: 'calc(80vh + 6rem)', medium: 'calc(60vh + 6rem)', small: 'calc(45vh + 6rem)' }
const HERO_TITLE: Record<string, string> = {
  s: 'text-3xl md:text-4xl',
  m: 'text-4xl md:text-5xl lg:text-6xl',
  l: 'text-5xl md:text-6xl lg:text-7xl',
  xl: 'text-5xl md:text-7xl lg:text-8xl',
}
const GRID_COLS: Record<string, string> = { '2': 'md:grid-cols-2', '3': 'md:grid-cols-3', '4': 'md:grid-cols-4' }
const RATIO: Record<string, string> = { '2/1': '2/1', '16/9': '16/9', '4/3': '4/3', '1/1': '1/1', '3/4': '3/4', '1.75/1': '1.75/1' }
const GAP: Record<string, string> = { none: '0', s: '0.375rem', l: '1rem' }
const PROSE: Record<string, string> = { s: 'prose-sm', m: '', l: 'prose-lg' }

const SHOW_HIDE = [['show', 'Показывать'], ['hide', 'Скрыть']]
const COLS_OPTIONS = (first: string) => [first, ...['4', '3', '2'].filter((c) => c !== first)].map((c) => [c, c])
const GAP_OPTIONS = [['s', 'Обычный'], ['none', 'Без отступа'], ['l', 'Большой']]

export const PROJECT_CATEGORIES: { id: string; label: string }[] = [
  { id: 'architecture', label: 'Архитектура' },
  { id: 'engineering', label: 'Рабочее проектирование' },
  { id: 'urbanism', label: 'Урбанистика и мастерпланирование' },
  { id: 'interior', label: 'Дизайн интерьера' },
]

export const PROJECT_TEMPLATE = 'project-template'

export function isProjectTemplate(slug: string): boolean {
  return slug === PROJECT_TEMPLATE || PROJECT_CATEGORIES.some((c) => slug === `${PROJECT_TEMPLATE}-${c.id}`)
}

export function templateCategory(slug: string): string | undefined {
  return slug.startsWith(`${PROJECT_TEMPLATE}-`) ? slug.slice(PROJECT_TEMPLATE.length + 1) : undefined
}

export function loadOtherProjects(locale: Locale, slug: string): Promise<ProjectListItem[]> {
  return getProjects(locale, { per_page: 12 })
    .then((res) => res.data.filter((p) => p.slug !== slug).slice(0, 8))
    .catch(() => [])
}

export async function loadSampleProject(locale: Locale, category?: string): Promise<ProjectPageData> {
  let list = category ? (await getProjects(locale, { category, per_page: 1 })).data : []
  if (!list.length) list = (await getProjects(locale, { per_page: 1 })).data
  if (!list.length) throw new Error('no projects')
  const [project, others] = await Promise.all([getProject(locale, list[0].slug), loadOtherProjects(locale, list[0].slug)])
  return { project, others }
}

const FOCUS_CLASS = {
  center: 'object-center',
  left: 'object-left',
  right: 'object-right',
  top: 'object-top',
  bottom: 'object-bottom',
} as const

const ARROW_PROPS = {
  width: 36,
  height: 36,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 0.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

function HeroSlider({
  cover,
  focus = 'center',
  gallery,
  title,
  settings,
}: {
  cover: string
  focus?: keyof typeof FOCUS_CLASS
  gallery: string[]
  title: string
  settings: Settings
}) {
  const autoplay = settings.autoplay !== 'off'
  const height = HERO_HEIGHT[settings.height ?? '']
  const titleClass = HERO_TITLE[settings.title ?? ''] ?? HERO_TITLE.m
  const slides = [cover, ...gallery]
  const [index, setIndex] = useState(0)
  const [direction, setDirection] = useState(1)
  const rootRef = useRef<HTMLDivElement>(null)

  const prev = () => {
    setDirection(-1)
    setIndex((i) => (i - 1 + slides.length) % slides.length)
  }
  const next = () => {
    setDirection(1)
    setIndex((i) => (i + 1) % slides.length)
  }

  const scrollDown = () => {
    const el = rootRef.current
    if (!el) return
    const win = el.ownerDocument.defaultView ?? window
    win.scrollTo({ top: el.getBoundingClientRect().bottom + win.scrollY, behavior: 'smooth' })
  }

  useEffect(() => {
    if (slides.length <= 1 || !autoplay) return
    const timer = setTimeout(() => {
      setDirection(1)
      setIndex((i) => (i + 1) % slides.length)
    }, 5000)
    return () => clearTimeout(timer)
  }, [index, slides.length, autoplay])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') next()
      if (e.key === 'ArrowLeft') prev()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? '-100%' : '100%', opacity: 0 }),
  }

  return (
    <div ref={rootRef} className="relative h-[calc(65vh_+_6rem)] overflow-hidden sm:h-[calc(100vh_+_6rem)]" style={height ? { height } : undefined}>
      <AnimatePresence custom={direction} mode="sync">
        <motion.img
          key={slides[index]}
          src={slides[index]}
          alt=""
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
          className={`absolute inset-0 h-full w-full object-cover sm:object-center ${index === 0 ? FOCUS_CLASS[focus] : 'object-center'}`}
        />
      </AnimatePresence>

      <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-ink-950 via-ink-950/60 to-transparent" />

      <div className="absolute inset-x-0 bottom-20 mx-auto max-w-[84rem] px-6 pb-4">
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className={`font-serif text-white ${titleClass}`}
        >
          {title}
        </motion.h1>
      </div>

      {slides.length > 1 && settings.arrows !== 'hide' && (
        <>
          <button onClick={prev} aria-label="Предыдущее фото" className="absolute left-12 top-1/2 -translate-y-1/2 text-white/60 transition-colors hover:text-white">
            <svg {...ARROW_PROPS}>
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button onClick={next} aria-label="Следующее фото" className="absolute right-12 top-1/2 -translate-y-1/2 text-white/60 transition-colors hover:text-white">
            <svg {...ARROW_PROPS}>
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </>
      )}

      {settings.scroll !== 'hide' && (
      <button
        onClick={scrollDown}
        aria-label="Прокрутить вниз"
        className="absolute bottom-6 left-1/2 flex -translate-x-1/2 flex-col items-center gap-0 text-white/40 transition-colors hover:text-white/70"
      >
        <motion.div animate={{ y: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }} className="flex flex-col items-center">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className="-mt-4">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </motion.div>
      </button>
      )}
    </div>
  )
}

export function ProjectHeroSection({ data, settings = {} }: SectionProps) {
  const { project } = data
  if (!project.cover_image) {
    return (
      <div className="relative flex h-screen items-end bg-ink-900">
        <div className="mx-auto w-full max-w-[84rem] px-6 pb-20">
          <h1 className="font-serif text-4xl text-white md:text-5xl">{project.title}</h1>
        </div>
      </div>
    )
  }
  return (
    <HeroSlider cover={project.cover_image} focus={project.cover_focus} gallery={project.gallery ?? []} title={project.title} settings={settings} />
  )
}

export function ProjectInfoSection({ data, settings = {} }: SectionProps) {
  const showFacts = settings.facts !== 'hide'
  const stacked = settings.layout === 'stacked' || !showFacts
  const { project } = data
  const meta = [
    ['Местоположение', project.location],
    ['Год', project.year],
    ['Площадь участка', project.site_area],
    ['Общая площадь', project.total_area],
    ['Статус', project.status],
  ].filter(([, value]) => value)

  return (
    <div className="mx-auto max-w-[84rem] px-6 pt-2 pb-16 sm:pt-16">
      <div className={`mt-0 grid gap-12 sm:mt-10 ${stacked ? '' : 'md:grid-cols-[260px_1fr]'}`}>
        {showFacts && (
        <Reveal delay={0.1}>
          <dl className="space-y-4 text-sm">
            {meta.map(([label, value]) => (
              <div key={label as string} className="border-b border-line pb-3">
                <dt className="text-white/40">{label}</dt>
                <dd className="mt-1 text-white/90">{value}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
        )}

        {project.body && (
          <Reveal delay={0.2}>
            <div
              className={`prose prose-invert max-w-none text-white/70 ${PROSE[settings.text ?? ''] ?? ''}`}
              dangerouslySetInnerHTML={{ __html: sanitise(project.body) }}
            />
          </Reveal>
        )}
      </div>
    </div>
  )
}

export function ProjectGallerySection({ data, settings = {} }: SectionProps) {
  const cols = GRID_COLS[settings.cols ?? ''] ?? GRID_COLS['4']
  const ratio = RATIO[settings.ratio ?? ''] ?? RATIO['2/1']
  const gap = GAP[settings.gap ?? ''] ?? GAP.s
  const gallery = data.project.gallery ?? []
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  if (!gallery.length) return null
  return (
    <div className="mx-auto max-w-[84rem] px-6 pb-16">
      <Lightbox images={gallery} index={openIndex} onClose={() => setOpenIndex(null)} />
      <div className={`mt-4 grid grid-cols-2 sm:mt-12 ${cols}`} style={{ gap }}>
        {gallery.map((src, i) => (
          <Reveal key={i} delay={(i % 4) * 0.06}>
            <button type="button" onClick={() => setOpenIndex(i)} className="block w-full cursor-zoom-in overflow-hidden">
              <img
                src={src}
                alt=""
                className="w-full object-cover transition-transform duration-700 ease-out hover:scale-105"
                style={{ aspectRatio: ratio }}
              />
            </button>
          </Reveal>
        ))}
      </div>
    </div>
  )
}

export function OtherProjectsSection({ data, locale, settings = {} }: SectionProps) {
  const others = data.others.slice(0, settings.count === '4' ? 4 : settings.count === '6' ? 6 : 8)
  const cols = GRID_COLS[settings.cols ?? ''] ?? GRID_COLS['4']
  const ratio = RATIO[settings.ratio ?? ''] ?? RATIO['1.75/1']
  if (!others.length) return null
  return (
    <div className="mx-auto max-w-[84rem] px-6 pb-24">
      {settings.heading !== 'hide' && (
      <Reveal>
        <h2 className="font-serif text-3xl text-white md:text-4xl">
          {locale === 'ru' ? 'Другие проекты' : locale === 'kz' ? 'Басқа жобалар' : 'Other projects'}
        </h2>
      </Reveal>
      )}
      <div className={`mt-8 grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-2.5 ${cols}`}>
        {others.map((item, i) => (
          <Reveal key={item.id} delay={(i % 4) * 0.05}>
            <Link
              to={`/${locale}/projects/${item.slug}`}
              className="group relative block overflow-hidden bg-ink-800"
              style={{ aspectRatio: ratio }}
            >
              {item.cover_image && (
                <img src={item.cover_image} alt={item.title} className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" />
              )}
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-2 sm:p-3 md:p-4">
                <p className="font-serif text-[1.4rem] leading-tight text-white sm:text-base md:text-lg">{item.title}</p>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </div>
  )
}

export interface ProjectBlock {
  id: string
  label: string
  settings?: { name: string; label: string; options: string[][] }[]
  render: (props: SectionProps) => ReactNode
}

export const PROJECT_BLOCKS: ProjectBlock[] = [
  {
    id: 'project-hero',
    label: 'Обложка и название',
    settings: [
      { name: 'height', label: 'Высота', options: [['', 'На весь экран'], ['large', 'Большая'], ['medium', 'Средняя'], ['small', 'Маленькая']] },
      { name: 'title', label: 'Размер названия', options: [['m', 'Средний'], ['s', 'Маленький'], ['l', 'Большой'], ['xl', 'Очень большой']] },
      { name: 'arrows', label: 'Стрелки', options: SHOW_HIDE },
      { name: 'autoplay', label: 'Автопрокрутка', options: [['on', 'Включена'], ['off', 'Выключена']] },
      { name: 'scroll', label: 'Стрелка вниз', options: SHOW_HIDE },
    ],
    render: (p) => <ProjectHeroSection {...p} />,
  },
  {
    id: 'project-info',
    label: 'Характеристики и описание',
    settings: [
      { name: 'layout', label: 'Расположение', options: [['side', 'Рядом'], ['stacked', 'Друг под другом']] },
      { name: 'facts', label: 'Характеристики', options: SHOW_HIDE },
      { name: 'text', label: 'Размер текста', options: [['m', 'Средний'], ['s', 'Маленький'], ['l', 'Большой']] },
    ],
    render: (p) => <ProjectInfoSection {...p} />,
  },
  {
    id: 'project-gallery',
    label: 'Галерея',
    settings: [
      { name: 'cols', label: 'Колонок', options: COLS_OPTIONS('4') },
      { name: 'ratio', label: 'Форма фото', options: [['2/1', 'Широкие 2:1'], ['16/9', '16:9'], ['4/3', '4:3'], ['1/1', 'Квадрат'], ['3/4', 'Вертикальные 3:4']] },
      { name: 'gap', label: 'Отступ между', options: GAP_OPTIONS },
    ],
    render: (p) => <ProjectGallerySection {...p} />,
  },
  {
    id: 'project-others',
    label: 'Другие проекты',
    settings: [
      { name: 'cols', label: 'Колонок', options: COLS_OPTIONS('4') },
      { name: 'count', label: 'Сколько показать', options: [['8', '8'], ['6', '6'], ['4', '4']] },
      { name: 'ratio', label: 'Форма картинок', options: [['1.75/1', 'Широкие'], ['16/9', '16:9'], ['1/1', 'Квадрат'], ['3/4', 'Вертикальные 3:4']] },
      { name: 'heading', label: 'Заголовок', options: SHOW_HIDE },
    ],
    render: (p) => <OtherProjectsSection {...p} />,
  },
]

export const DEFAULT_PROJECT_LAYOUT = PROJECT_BLOCKS.map((b) => `<section data-block="${b.id}"></section>`).join('')
