import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { getNews, type NewsListItem } from '../api/content'
import ErrorMessage from '../components/ErrorMessage'
import { StaggerItem, StaggerList } from '../components/StaggerReveal'
import { t } from '../lib/i18n'
import { useLocale } from '../lib/useLocale'

export default function NewsList() {
  const locale = useLocale()
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
    /* Страница: padding-top 100px как в Framer, выравнивание по центру */
    <section className="flex flex-col items-center gap-[10px] pb-24 pt-[110px]">
      <Helmet>
        <title>{tr.news.title} — INK Architects</title>
      </Helmet>

      {loading ? (
        <p className="text-white/40">{tr.ui.loading}</p>
      ) : error ? (
        <ErrorMessage>{tr.ui.error}</ErrorMessage>
      ) : (
        <>
          {/*
            Сетка: адаптивная как в Framer CSS:
            Mobile  (<810px):  1 колонка, width 90%
            Tablet  (810px+):  2 колонки, width 90%
            Desktop (1194px+): 3 колонки, width 85%
          */}
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
                    {/* Фото с zoom на hover */}
                    {item.cover_image && (
                      <img
                        src={item.cover_image}
                        alt={item.title}
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                      />
                    )}

                    {/* Тёмный градиент снизу: transparent 35% → black 100% */}
                    <div
                      className="absolute inset-0"
                      style={{
                        background: 'linear-gradient(#54545400 35%, #000 100%)',
                      }}
                    />

                    {/*
                      Текстовый блок внизу:
                      Framer: position absolute, bottom 14px, left 50%, transform translateX(-50%)
                      width 95%, padding 10px, gap 5px (flex column)
                      aspect-ratio: 10.898 — очень широкий тонкий блок
                    */}
                    <div
                      className="absolute flex flex-col gap-[5px] px-[10px] py-[10px]"
                      style={{
                        width: '95%',
                        bottom: '14px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                      }}
                    >
                      {/* Заголовок статьи */}
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

                      {/* Дата */}
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

          {/* Кнопка "Загрузить ещё" */}
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
