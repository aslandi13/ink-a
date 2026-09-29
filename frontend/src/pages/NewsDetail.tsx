import { useEffect, useRef, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link, useParams } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import { getNews, getNewsItem, type NewsListItem, type NewsDetail as NewsDetailType } from '../api/content'
import ErrorMessage from '../components/ErrorMessage'
import Reveal from '../components/Reveal'
import { t } from '../lib/i18n'
import { sanitise } from '../lib/sanitise'
import { useLocale } from '../lib/useLocale'

/** Параллакс-герой: фото движется медленнее при скролле */
function ParallaxHero({ src, alt, children }: { src: string; alt: string; children: React.ReactNode }) {
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

export default function NewsDetail() {
  const locale = useLocale()
  const tr = t(locale)
  const { slug } = useParams()
  const [item, setItem] = useState<NewsDetailType | null>(null)
  const [otherNews, setOtherNews] = useState<NewsListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!slug) return
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
    setLoading(true)
    setError(false)

    Promise.all([
      getNewsItem(locale, slug),
      getNews(locale, { per_page: 9 }).catch(() => null),
    ])
      .then(([itemData, listData]) => {
        setItem(itemData)
        if (listData?.data) {
          setOtherNews(listData.data.filter((n) => n.slug !== slug).slice(0, 6))
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [locale, slug])

  if (loading) {
    return (
      <section className="flex min-h-[60vh] items-center justify-center text-white/40">
        {tr.ui.loading}
      </section>
    )
  }

  if (error) {
    return <ErrorMessage>{tr.ui.error}</ErrorMessage>
  }

  if (!item) {
    return (
      <section className="mx-auto max-w-[84rem] px-6 py-24 text-white">
        {tr.ui.newsNotFound}
      </section>
    )
  }

  return (
    <article>
      <Helmet>
        <title>{item.title} — INK Architects</title>
        {item.excerpt && <meta name="description" content={item.excerpt} />}
      </Helmet>

      {item.cover_image && (
        <ParallaxHero src={item.cover_image} alt={item.title}>
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/20 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 mx-auto max-w-4xl px-6 pb-10">
            {item.published_at && (
              <p className="text-sm text-white/50">{new Date(item.published_at).toLocaleDateString(locale)}</p>
            )}
            <h1 className="mt-2 font-serif text-3xl text-white md:text-4xl">{item.title}</h1>
          </div>
        </ParallaxHero>
      )}

      <div className="mx-auto max-w-5xl px-6 pt-16 pb-4 sm:pb-16">
        {item.body && (
          <Reveal>
            <div
              className="prose prose-invert max-w-none text-white/70"
              dangerouslySetInnerHTML={{ __html: sanitise(item.body) }}
            />
          </Reveal>
        )}
      </div>

      {/* Другие новости */}
      {otherNews.length > 0 && (
        <section className="mx-auto w-[90%] min-[1194px]:w-[85%] pb-24 pt-4">
          <h2
            className="mb-8 font-serif text-3xl text-white md:text-4xl"
            style={{ fontFamily: '"Times New Roman", Times, serif' }}
          >
            {tr.news.otherNews}
          </h2>

          <div className="grid grid-cols-1 gap-[10px] min-[810px]:grid-cols-2 min-[1194px]:grid-cols-3">
            {otherNews.map((other) => (
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
                  {/* Фото с zoom на hover */}
                  {other.cover_image && (
                    <img
                      src={other.cover_image}
                      alt={other.title}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                    />
                  )}

                  {/* Тёмный градиент снизу */}
                  <div
                    className="absolute inset-0"
                    style={{
                      background: 'linear-gradient(#54545400 35%, #000 100%)',
                    }}
                  />

                  {/* Текстовый блок внизу */}
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
      )}
    </article>
  )
}
