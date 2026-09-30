import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link, useParams } from 'react-router-dom'
import { getProject, getProjects, type ProjectDetail as ProjectDetailType, type ProjectListItem } from '../api/content'
import ErrorMessage from '../components/ErrorMessage'
import Reveal from '../components/Reveal'
import { t } from '../lib/i18n'
import { sanitise } from '../lib/sanitise'
import { useLocale } from '../lib/useLocale'

/** Полноэкранный слайдер: обложка + галерея */
const FOCUS_CLASS = {
  center: 'object-center',
  left: 'object-left',
  right: 'object-right',
  top: 'object-top',
  bottom: 'object-bottom',
} as const

function HeroSlider({
  cover,
  focus = 'center',
  gallery,
  title,
  contentRef,
}: {
  cover: string
  focus?: keyof typeof FOCUS_CLASS
  gallery: string[]
  title: string
  contentRef: React.RefObject<HTMLDivElement>
}) {
  const slides = [cover, ...gallery]
  const [index, setIndex] = useState(0)
  const [direction, setDirection] = useState(1) // 1 = вперёд, -1 = назад

  const prev = () => {
    setDirection(-1)
    setIndex((i) => (i - 1 + slides.length) % slides.length)
  }
  const next = () => {
    setDirection(1)
    setIndex((i) => (i + 1) % slides.length)
  }

  const scrollDown = () => {
    contentRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Автоплей — каждые 5 секунд
  useEffect(() => {
    if (slides.length <= 1) return
    const timer = setTimeout(() => {
      setDirection(1)
      setIndex((i) => (i + 1) % slides.length)
    }, 5000)
    return () => clearTimeout(timer)
  }, [index, slides.length])

  // Keyboard arrows
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
    <div className="relative -mt-24 h-[calc(65vh_+_6rem)] overflow-hidden sm:h-[calc(100vh_+_6rem)]">
      {/* Слайды */}
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

      {/* Затемнение только снизу */}
      <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-ink-950 via-ink-950/60 to-transparent" />

      {/* Заголовок */}
      <div className="absolute inset-x-0 bottom-20 mx-auto max-w-[84rem] px-6 pb-4">
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="font-serif text-4xl text-white md:text-5xl lg:text-6xl"
        >
          {title}
        </motion.h1>
      </div>

      {/* Стрелки навигации */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prev}
            aria-label="Предыдущее фото"
            className="absolute left-12 top-1/2 -translate-y-1/2 text-white/60 transition-colors hover:text-white"
          >
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            onClick={next}
            aria-label="Следующее фото"
            className="absolute right-12 top-1/2 -translate-y-1/2 text-white/60 transition-colors hover:text-white"
          >
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </>
      )}

      {/* Стрелка вниз */}
      <button
        onClick={scrollDown}
        aria-label="Прокрутить вниз"
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-0 text-white/40 hover:text-white/70 transition-colors"
      >
        <motion.div
          animate={{ y: [0, 5, 0] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
          className="flex flex-col items-center"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className="-mt-4">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </motion.div>
      </button>
    </div>
  )
}

export default function ProjectDetail() {
  const locale = useLocale()
  const tr = t(locale)
  const { slug } = useParams()
  const [project, setProject] = useState<ProjectDetailType | null>(null)
  const [otherProjects, setOtherProjects] = useState<ProjectListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!slug) return
    setLoading(true)
    setError(false)
    getProject(locale, slug)
      .then(setProject)
      .catch(() => setError(true))
      .finally(() => setLoading(false))

    getProjects(locale, { per_page: 12 })
      .then((res) => {
        setOtherProjects(res.data.filter((p) => p.slug !== slug).slice(0, 8))
      })
      .catch(() => {})
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

  if (!project) {
    return (
      <section className="mx-auto max-w-[84rem] px-6 py-24 text-white">
        {tr.ui.projectNotFound}
      </section>
    )
  }

  const meta = [
    ['Местоположение', project.location],
    ['Год', project.year],
    ['Площадь участка', project.site_area],
    ['Общая площадь', project.total_area],
    ['Статус', project.status],
  ].filter(([, value]) => value)

  const gallery = project.gallery ?? []

  return (
    <article>
      <Helmet>
        <title>{project.title} — INK Architects</title>
        {project.excerpt && <meta name="description" content={project.excerpt} />}
      </Helmet>

      {/* Hero слайдшоу */}
      {project.cover_image ? (
        <HeroSlider
          cover={project.cover_image}
          focus={project.cover_focus}
          gallery={gallery}
          title={project.title}
          contentRef={contentRef as React.RefObject<HTMLDivElement>}
        />
      ) : (
        <div className="relative -mt-24 h-screen bg-ink-900 flex items-end">
          <div className="mx-auto max-w-[84rem] w-full px-6 pb-20">
            <h1 className="font-serif text-4xl text-white md:text-5xl">{project.title}</h1>
          </div>
        </div>
      )}

      {/* Контент */}
      <div ref={contentRef} className="mx-auto max-w-[84rem] px-6 pt-2 pb-16 sm:pt-16">
        <div className="mt-0 grid gap-12 sm:mt-10 md:grid-cols-[260px_1fr]">
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

          {project.body && (
            <Reveal delay={0.2}>
              <div
                className="prose prose-invert max-w-none text-white/70"
                dangerouslySetInnerHTML={{ __html: sanitise(project.body) }}
              />
            </Reveal>
          )}
        </div>
      </div>

      {/* Галерея */}
      {!!gallery.length && (
        <div className="mx-auto max-w-[84rem] px-6 pb-16">
          <div className="mt-4 grid grid-cols-2 gap-1.5 sm:mt-12 md:grid-cols-4">
            {gallery.map((src, i) => (
              <Reveal key={i} delay={(i % 4) * 0.06}>
                <img
                  src={src}
                  alt=""
                  className="aspect-[2/1] w-full object-cover"
                />
              </Reveal>
            ))}
          </div>
        </div>
      )}

      {/* Другие проекты */}
      {otherProjects.length > 0 && (
        <div className="mx-auto max-w-[84rem] px-6 pb-24">
          <Reveal>
            <h2 className="font-serif text-3xl text-white md:text-4xl">
              {locale === 'ru'
                ? 'Другие проекты'
                : locale === 'kz'
                  ? 'Басқа жобалар'
                  : 'Other projects'}
            </h2>
          </Reveal>
          <div className="mt-8 grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-2.5 md:grid-cols-4">
            {otherProjects.map((item, i) => (
              <Reveal key={item.id} delay={(i % 4) * 0.05}>
                <Link
                  to={`/${locale}/projects/${item.slug}`}
                  className="group relative block aspect-[1.75/1] overflow-hidden bg-ink-800"
                >
                  {item.cover_image && (
                    <img
                      src={item.cover_image}
                      alt={item.title}
                      className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                  )}
                  <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-2 sm:p-3 md:p-4">
                    <p className="font-serif text-[1.4rem] leading-tight text-white sm:text-base md:text-lg">
                      {item.title}
                    </p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      )}
    </article>
  )
}
