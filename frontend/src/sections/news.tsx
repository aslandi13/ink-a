import { motion, useScroll, useTransform } from 'framer-motion'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { getNews, getNewsItem, type NewsDetail, type NewsListItem } from '../api/content'
import ErrorMessage from '../components/ErrorMessage'
import Reveal from '../components/Reveal'
import { StaggerItem, StaggerList } from '../components/StaggerReveal'
import { t } from '../lib/i18n'
import type { Locale } from '../lib/locale'
import { useRefresh } from '../lib/refresh'
import { sanitise } from '../lib/sanitise'
import { prefetchNews } from '../lib/prefetch'
import { fillFields } from './fields'

type Settings = Record<string, string>

const NEWS_COLS: Record<string, string> = {
  '2': 'min-[1194px]:grid-cols-2',
  '3': 'min-[1194px]:grid-cols-3',
  '4': 'min-[1194px]:grid-cols-4',
}
const NEWS_RATIO: Record<string, string> = { wide: '1.74793', cinema: '21/9', square: '1/1', tall: '3/4' }
const NEWS_TITLE: Record<string, string> = { s: '0.85rem', m: '1rem', l: '1.4rem', xl: '1.9rem' }
const NEWS_GAP: Record<string, string> = { none: '0', s: '10px', l: '1.25rem' }

export const NEWS_LIST_SETTINGS = [
  { name: 'cols', label: 'Колонок', options: [['3', '3'], ['4', '4'], ['2', '2']] },
  { name: 'ratio', label: 'Форма картинок', options: [['wide', 'Широкие'], ['cinema', 'Очень широкие 21:9'], ['square', 'Квадрат'], ['tall', 'Вертикальные 3:4']] },
  { name: 'gap', label: 'Отступ между', options: [['s', 'Обычный'], ['none', 'Без отступа'], ['l', 'Большой']] },
  { name: 'title', label: 'Размер заголовка', options: [['m', 'Средний'], ['s', 'Маленький'], ['l', 'Большой'], ['xl', 'Очень большой']] },
  { name: 'date', label: 'Дата', options: [['show', 'Показывать'], ['hide', 'Скрыть']] },
]

export function NewsListSection({ locale, settings = {} }: { data: unknown; locale: Locale; settings?: Settings }) {
  const tr = t(locale)
  const cols = NEWS_COLS[settings.cols ?? ''] ?? NEWS_COLS['3']
  const ratio = NEWS_RATIO[settings.ratio ?? ''] ?? NEWS_RATIO.wide
  const titleSize = NEWS_TITLE[settings.title ?? ''] ?? NEWS_TITLE.m
  const gap = NEWS_GAP[settings.gap ?? ''] ?? NEWS_GAP.s
  const showDate = settings.date !== 'hide'
  const [news, setNews] = useState<NewsListItem[]>([])
  const [page, setPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState(false)

  const refresh = useRefresh()

  useEffect(() => {
    if (!refresh.silent()) {
      setNews([])
      setPage(1)
      setLastPage(1)
      setLoading(true)
    }
    setError(false)
    getNews(locale, { page: 1 })
      .then((res) => {
        setNews(res.data)
        setLastPage(res.meta.last_page)
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [locale, refresh.key])

  function loadMore() {
    const nextPage = page + 1
    setLoadingMore(true)
    getNews(locale, { page: nextPage })
      .then((res) => {
        setNews((prev) => [...prev, ...res.data])
        setPage(nextPage)
        setLastPage(res.meta.last_page)
      })
      .catch(() => setError(true))
      .finally(() => setLoadingMore(false))
  }

  return (
    <section className="flex flex-col items-center gap-[10px] pb-24 pt-[110px]">
      {loading ? (
        <div className="min-h-[60vh]" />
      ) : error ? (
        <ErrorMessage>{tr.ui.error}</ErrorMessage>
      ) : (
        <>
          <StaggerList className={`w-[90%] grid grid-cols-1 min-[810px]:grid-cols-2 min-[1194px]:w-[85%] ${cols}`} style={{ gap }}>
            {news.map((item) => (
              <StaggerItem key={item.id}>
                <Link
                  to={`/${locale}/news/${item.slug}`}
                  onMouseEnter={() => prefetchNews(locale, item.slug)}
                  className="group block"
                  style={{ textDecoration: 'none' }}
                >
                  <div
                    className="relative w-full overflow-hidden bg-ink-900"
                    style={{ aspectRatio: ratio }}
                  >
                    {item.cover_image && (
                      <img
                        src={item.cover_image}
                        alt={item.title}
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                      />
                    )}

                    <div
                      className="absolute inset-0"
                      style={{
                        background: 'linear-gradient(#54545400 35%, #000 100%)',
                      }}
                    />

                    <div
                      className="absolute flex flex-col gap-[5px] px-[10px] py-[10px]"
                      style={{
                        width: '95%',
                        bottom: '14px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                      }}
                    >
                      <p
                        className="font-sans text-white"
                        style={{
                          fontFamily: '"Manrope", sans-serif',
                          fontSize: titleSize,
                          lineHeight: '1em',
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                        }}
                      >
                        {item.title}
                      </p>

                      {showDate && item.published_at && (
                        <p
                          style={{
                            fontFamily: '"SF Pro Display Regular", sans-serif',
                            fontSize: '0.7rem',
                            lineHeight: '100%',
                            color: 'rgb(255, 255, 255)',
                            letterSpacing: '0px',
                          }}
                        >
                          <time dateTime={item.published_at}>
                            {new Date(item.published_at).toLocaleDateString(
                              locale === 'ru' ? 'ru-RU' : 'en-GB',
                              { day: 'numeric', month: 'short', year: 'numeric' }
                            )}
                          </time>
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              </StaggerItem>
            ))}
          </StaggerList>

          {page < lastPage && (
            <div className="flex justify-center">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="border border-white/20 px-8 py-3 text-sm text-white/70 transition-colors hover:border-white hover:text-white disabled:opacity-40"
              >
                {loadingMore ? tr.ui.loading : tr.news.loadMore}
              </button>
            </div>
          )}
        </>
      )}
    </section>
  )
}

export const NEWS_LIST_BLOCKS = [
  {
    id: 'news-list',
    label: 'Список новостей',
    settings: NEWS_LIST_SETTINGS,
    render: (p: { data: unknown; locale: Locale; settings?: Settings }) => <NewsListSection {...p} />,
  },
]

export const DEFAULT_NEWS_LIST_LAYOUT = NEWS_LIST_BLOCKS.map((b) => `<section data-block="${b.id}"></section>`).join('')

export const NEWS_TEMPLATE = 'news-template'

export interface NewsPageData {
  item: NewsDetail
  others: NewsListItem[]
}

interface SectionProps {
  data: NewsPageData
  locale: Locale
  settings?: Settings
}

const N_HEIGHT: Record<string, string> = { '40': '40vh', '60': '60vh', '80': '80vh', '100': '100vh' }
const N_TITLE: Record<string, string> = {
  s: 'text-2xl md:text-3xl',
  m: 'text-3xl md:text-4xl',
  l: 'text-4xl md:text-5xl',
  xl: 'text-4xl md:text-6xl',
}
const N_WIDTH: Record<string, string> = { narrow: 'max-w-3xl', normal: 'max-w-4xl', medium: 'max-w-5xl', wide: 'max-w-[84rem]' }
const N_PROSE: Record<string, string> = { s: 'prose-sm', m: '', l: 'prose-lg' }
const N_SHOW_HIDE = [['show', 'Показывать'], ['hide', 'Скрыть']]

export function loadOtherNews(locale: Locale, slug: string): Promise<NewsListItem[]> {
  return getNews(locale, { per_page: 9 })
    .then((res) => res.data.filter((n) => n.slug !== slug).slice(0, 6))
    .catch(() => [])
}

export async function loadSampleNews(locale: Locale): Promise<NewsPageData> {
  const list = (await getNews(locale, { per_page: 1 })).data
  if (!list.length) throw new Error('no news')
  const [item, others] = await Promise.all([getNewsItem(locale, list[0].slug), loadOtherNews(locale, list[0].slug)])
  return { item, others }
}

function formatDate(value: string, locale: Locale): string {
  return new Date(value).toLocaleDateString(locale)
}

function ParallaxHero({
  src,
  alt,
  height,
  parallax,
  children,
}: {
  src: string
  alt: string
  height: string
  parallax: boolean
  children: ReactNode
}) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['0%', parallax ? '30%' : '0%'])

  return (
    <div ref={ref} className="relative overflow-hidden" style={{ height }}>
      <motion.div style={{ y }} className={`absolute inset-0 will-change-transform ${parallax ? 'scale-110' : ''}`}>
        <img src={src} alt={alt} className="h-full w-full object-cover" />
      </motion.div>
      {children}
    </div>
  )
}

export function NewsHeroSection({ data, locale, settings = {} }: SectionProps) {
  const { item } = data
  const titleClass = N_TITLE[settings.title ?? ''] ?? N_TITLE.m
  const width = N_WIDTH[settings.width ?? ''] ?? N_WIDTH.normal
  const showDate = settings.date !== 'hide' && !!item.published_at
  if (!item.cover_image) {
    return (
      <div className={`mx-auto px-6 pt-32 ${width}`}>
        {showDate && <p className="text-sm text-white/50">{formatDate(item.published_at!, locale)}</p>}
        <h1 className={`mt-2 font-serif text-white ${titleClass}`}>{item.title}</h1>
      </div>
    )
  }
  return (
    <ParallaxHero
      src={item.cover_image}
      alt={item.title}
      height={N_HEIGHT[settings.height ?? ''] ?? N_HEIGHT['60']}
      parallax={settings.parallax !== 'off'}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-ink-950/30 via-ink-950/0 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-ink-950 to-transparent" />
      <div className={`absolute inset-x-0 bottom-0 mx-auto px-6 pb-10 ${width}`}>
        {showDate && <p className="text-sm text-white/50">{formatDate(item.published_at!, locale)}</p>}
        <h1 className={`mt-2 font-serif text-white ${titleClass}`}>{item.title}</h1>
      </div>
    </ParallaxHero>
  )
}

export function NewsBodySection({ data, settings = {} }: SectionProps) {
  if (!data.item.body) return null
  const width = N_WIDTH[settings.width ?? ''] ?? N_WIDTH.medium
  return (
    <div className={`mx-auto px-6 pt-16 pb-4 sm:pb-16 ${width}`}>
      <Reveal>
        <div
          className={`prose prose-invert max-w-none text-white/70 ${N_PROSE[settings.text ?? ''] ?? ''}`}
          dangerouslySetInnerHTML={{ __html: sanitise(data.item.body) }}
        />
      </Reveal>
    </div>
  )
}

export function OtherNewsSection({ data, locale, settings = {} }: SectionProps) {
  const tr = t(locale)
  const others = data.others.slice(0, settings.count === '3' ? 3 : settings.count === '4' ? 4 : 6)
  const cols = NEWS_COLS[settings.cols ?? ''] ?? NEWS_COLS['3']
  const ratio = NEWS_RATIO[settings.ratio ?? ''] ?? NEWS_RATIO.wide
  const showDate = settings.date !== 'hide'
  if (!others.length) return null
  return (
    <section className="mx-auto w-[90%] min-[1194px]:w-[85%] pb-24 pt-4">
      {settings.heading !== 'hide' && (
      <h2
        className="mb-8 font-serif text-3xl text-white md:text-4xl"
        style={{ fontFamily: '"Times New Roman", Times, serif' }}
      >
        {tr.news.otherNews}
      </h2>
      )}

      <div className={`grid grid-cols-1 gap-[10px] min-[810px]:grid-cols-2 ${cols}`}>
        {others.map((other) => (
          <Link
            key={other.id}
            to={`/${locale}/news/${other.slug}`}
            onMouseEnter={() => prefetchNews(locale, other.slug)}
            className="group block"
            style={{ textDecoration: 'none' }}
          >
            <div
              className="relative w-full overflow-hidden bg-ink-900"
              style={{ aspectRatio: ratio }}
            >
              {other.cover_image && (
                <img
                  src={other.cover_image}
                  alt={other.title}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                />
              )}

              <div
                className="absolute inset-0"
                style={{
                  background: 'linear-gradient(#54545400 35%, #000 100%)',
                }}
              />

              <div
                className="absolute flex flex-col gap-[5px] px-[10px] py-[10px]"
                style={{
                  width: '95%',
                  bottom: '14px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                }}
              >
                <p
                  className="line-clamp-3 font-sans text-white"
                  style={{
                    fontFamily: '"Manrope", sans-serif',
                    fontSize: '1rem',
                    lineHeight: '1.25em',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}
                >
                  {other.title}
                </p>

                {showDate && other.published_at && (
                  <p
                    style={{
                      fontFamily: '"SF Pro Display Regular", sans-serif',
                      fontSize: '0.7rem',
                      lineHeight: '100%',
                      color: 'rgb(255, 255, 255)',
                      letterSpacing: '0px',
                    }}
                  >
                    <time dateTime={other.published_at}>
                      {new Date(other.published_at).toLocaleDateString(
                        locale === 'ru' ? 'ru-RU' : locale === 'kz' ? 'kk-KZ' : 'en-GB',
                        { day: 'numeric', month: 'short', year: 'numeric' },
                      )}
                    </time>
                  </p>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

export const NEWS_BLOCKS = [
  {
    id: 'news-hero',
    label: 'Обложка, дата и заголовок',
    settings: [
      { name: 'height', label: 'Высота', options: [['60', 'Средняя'], ['40', 'Маленькая'], ['80', 'Большая'], ['100', 'На весь экран']] },
      { name: 'parallax', label: 'Параллакс', options: [['on', 'Включён'], ['off', 'Выключен']] },
      { name: 'title', label: 'Размер заголовка', options: [['m', 'Средний'], ['s', 'Маленький'], ['l', 'Большой'], ['xl', 'Очень большой']] },
      { name: 'date', label: 'Дата', options: N_SHOW_HIDE },
      { name: 'width', label: 'Ширина текста', options: [['normal', 'Обычная'], ['narrow', 'Узкая'], ['medium', 'Шире'], ['wide', 'Во всю ширину']] },
    ],
    render: (p: SectionProps) => <NewsHeroSection {...p} />,
  },
  {
    id: 'news-body',
    label: 'Текст новости',
    settings: [
      { name: 'width', label: 'Ширина', options: [['medium', 'Обычная'], ['narrow', 'Узкая'], ['normal', 'Средняя'], ['wide', 'Во всю ширину']] },
      { name: 'text', label: 'Размер текста', options: [['m', 'Средний'], ['s', 'Маленький'], ['l', 'Большой']] },
    ],
    render: (p: SectionProps) => <NewsBodySection {...p} />,
  },
  {
    id: 'news-others',
    label: 'Другие новости',
    settings: [
      { name: 'cols', label: 'Колонок', options: [['3', '3'], ['4', '4'], ['2', '2']] },
      { name: 'count', label: 'Сколько показать', options: [['6', '6'], ['4', '4'], ['3', '3']] },
      { name: 'ratio', label: 'Форма картинок', options: [['wide', 'Широкие'], ['cinema', 'Очень широкие 21:9'], ['square', 'Квадрат'], ['tall', 'Вертикальные 3:4']] },
      { name: 'date', label: 'Дата', options: N_SHOW_HIDE },
      { name: 'heading', label: 'Заголовок', options: N_SHOW_HIDE },
    ],
    render: (p: SectionProps) => <OtherNewsSection {...p} />,
  },
]

export const DEFAULT_NEWS_LAYOUT = NEWS_BLOCKS.map((b) => `<section data-block="${b.id}"></section>`).join('')

export const NEWS_FIELDS: { id: string; label: string }[] = [
  { id: 'title', label: 'Заголовок' },
  { id: 'date', label: 'Дата' },
  { id: 'excerpt', label: 'Краткое описание' },
  { id: 'body', label: 'Текст' },
  { id: 'cover', label: 'Обложка' },
]

function hasNewsField(field: string, data: NewsPageData): boolean {
  const { item } = data
  if (field === 'cover') return !!item.cover_image
  if (field === 'date') return !!item.published_at
  if (field === 'body') return !!item.body
  if (field === 'title') return !!item.title
  if (field === 'excerpt') return !!item.excerpt
  return false
}

export function applyNewsField(el: HTMLElement, data: NewsPageData, locale: Locale) {
  const { item } = data
  const field = el.dataset.field
  if (field === 'cover') {
    if (item.cover_image) el.setAttribute('src', item.cover_image)
  } else if (field === 'body') {
    el.innerHTML = sanitise(item.body)
  } else if (field === 'date') {
    el.textContent = item.published_at ? formatDate(item.published_at, locale) : ''
  } else if (field === 'title' || field === 'excerpt') {
    el.textContent = item[field] ?? ''
  }
}

export function fillNewsFields(html: string, data: NewsPageData, locale: Locale): string {
  return fillFields(html, (field) => hasNewsField(field, data), (el) => applyNewsField(el, data, locale))
}

export const NEWS_FIELD_BLOCKS: { id: string; label: string; content: string }[] = [
  { id: 'news-field-title', label: 'Заголовок', content: '<h1 data-field="title" class="font-serif text-3xl text-white md:text-4xl"></h1>' },
  { id: 'news-field-date', label: 'Дата', content: '<p data-field="date" class="text-sm text-white/50"></p>' },
  { id: 'news-field-excerpt', label: 'Краткое описание', content: '<p data-field="excerpt" class="max-w-2xl text-base leading-relaxed text-white/70"></p>' },
  { id: 'news-field-body', label: 'Текст', content: '<div data-field="body" class="prose prose-invert max-w-none text-white/70"></div>' },
  { id: 'news-field-cover', label: 'Обложка', content: '<img data-field="cover" class="aspect-video w-full object-cover" alt="">' },
  {
    id: 'news-field-hero',
    label: 'Обложка с заголовком',
    content: `<section data-gjs-name="Обложка с заголовком" class="relative flex h-[60vh] items-end overflow-hidden">
      <img data-field="cover" class="absolute inset-0 h-full w-full object-cover" alt="">
      <div data-gjs-selectable="false" data-gjs-hoverable="false" data-gjs-layerable="false" class="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-950/60 via-ink-950/0 to-transparent"></div>
      <div data-gjs-selectable="false" data-gjs-hoverable="false" data-gjs-layerable="false" class="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-ink-950 to-transparent"></div>
      <div class="relative mx-auto w-full max-w-4xl px-6 pb-10"><p data-field="date" class="text-sm text-white/50"></p><h1 data-field="title" class="mt-2 font-serif text-3xl text-white md:text-4xl"></h1></div>
    </section>`,
  },
]
