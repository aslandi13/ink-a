import { motion, useScroll, useTransform } from 'framer-motion'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { getNews, getNewsItem, type NewsDetail, type NewsListItem } from '../api/content'
import ErrorMessage from '../components/ErrorMessage'
import Reveal from '../components/Reveal'
import { StaggerItem, StaggerList } from '../components/StaggerReveal'
import { t } from '../lib/i18n'
import type { Locale } from '../lib/locale'
import { sanitise } from '../lib/sanitise'
import { fillFields } from './fields'

export function NewsListSection({ locale }: { data: unknown; locale: Locale }) {
  const tr = t(locale)
  const [news, setNews] = useState<NewsListItem[]>([])
  const [page, setPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    setNews([])
    setPage(1)
    setLastPage(1)
    setLoading(true)
    setError(false)
    getNews(locale, { page: 1 })
      .then((res) => {
        setNews(res.data)
        setLastPage(res.meta.last_page)
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [locale])

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
        <p className="text-white/40">{tr.ui.loading}</p>
      ) : error ? (
        <ErrorMessage>{tr.ui.error}</ErrorMessage>
      ) : (
        <>
          <StaggerList className="w-[90%] grid grid-cols-1 gap-[10px] min-[810px]:grid-cols-2 min-[1194px]:w-[85%] min-[1194px]:grid-cols-3">
            {news.map((item) => (
              <StaggerItem key={item.id}>
                <Link
                  to={`/${locale}/news/${item.slug}`}
                  className="group block"
                  style={{ textDecoration: 'none' }}
                >
                  <div
                    className="relative w-full overflow-hidden bg-ink-900"
                    style={{ aspectRatio: '1.74793' }}
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
                          fontSize: '1rem',
                          lineHeight: '1em',
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                        }}
                      >
                        {item.title}
                      </p>

                      {item.published_at && (
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
  { id: 'news-list', label: 'Список новостей', render: (p: { data: unknown; locale: Locale }) => <NewsListSection {...p} /> },
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
}

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

function ParallaxHero({ src, alt, children }: { src: string; alt: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '30%'])

  return (
    <div ref={ref} className="relative h-[60vh] overflow-hidden">
      <motion.div style={{ y }} className="absolute inset-0 scale-110 will-change-transform">
        <img src={src} alt={alt} className="h-full w-full object-cover" />
      </motion.div>
      {children}
    </div>
  )
}

export function NewsHeroSection({ data, locale }: SectionProps) {
  const { item } = data
  if (!item.cover_image) {
    return (
      <div className="mx-auto max-w-4xl px-6 pt-32">
        {item.published_at && <p className="text-sm text-white/50">{formatDate(item.published_at, locale)}</p>}
        <h1 className="mt-2 font-serif text-3xl text-white md:text-4xl">{item.title}</h1>
      </div>
    )
  }
  return (
    <ParallaxHero src={item.cover_image} alt={item.title}>
      <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/20 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 mx-auto max-w-4xl px-6 pb-10">
        {item.published_at && <p className="text-sm text-white/50">{formatDate(item.published_at, locale)}</p>}
        <h1 className="mt-2 font-serif text-3xl text-white md:text-4xl">{item.title}</h1>
      </div>
    </ParallaxHero>
  )
}

export function NewsBodySection({ data }: SectionProps) {
  if (!data.item.body) return null
  return (
    <div className="mx-auto max-w-5xl px-6 pt-16 pb-4 sm:pb-16">
      <Reveal>
        <div className="prose prose-invert max-w-none text-white/70" dangerouslySetInnerHTML={{ __html: sanitise(data.item.body) }} />
      </Reveal>
    </div>
  )
}

export function OtherNewsSection({ data, locale }: SectionProps) {
  const tr = t(locale)
  const { others } = data
  if (!others.length) return null
  return (
    <section className="mx-auto w-[90%] min-[1194px]:w-[85%] pb-24 pt-4">
      <h2
        className="mb-8 font-serif text-3xl text-white md:text-4xl"
        style={{ fontFamily: '"Times New Roman", Times, serif' }}
      >
        {tr.news.otherNews}
      </h2>

      <div className="grid grid-cols-1 gap-[10px] min-[810px]:grid-cols-2 min-[1194px]:grid-cols-3">
        {others.map((other) => (
          <Link
            key={other.id}
            to={`/${locale}/news/${other.slug}`}
            className="group block"
            style={{ textDecoration: 'none' }}
          >
            <div
              className="relative w-full overflow-hidden bg-ink-900"
              style={{ aspectRatio: '1.74793' }}
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

                {other.published_at && (
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
  { id: 'news-hero', label: 'Обложка, дата и заголовок', render: (p: SectionProps) => <NewsHeroSection {...p} /> },
  { id: 'news-body', label: 'Текст новости', render: (p: SectionProps) => <NewsBodySection {...p} /> },
  { id: 'news-others', label: 'Другие новости', render: (p: SectionProps) => <OtherNewsSection {...p} /> },
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
      <div data-gjs-selectable="false" data-gjs-hoverable="false" data-gjs-layerable="false" class="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/20 to-transparent"></div>
      <div class="relative mx-auto w-full max-w-4xl px-6 pb-10"><p data-field="date" class="text-sm text-white/50"></p><h1 data-field="title" class="mt-2 font-serif text-3xl text-white md:text-4xl"></h1></div>
    </section>`,
  },
]
