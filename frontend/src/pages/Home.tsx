import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { getPageContent, getProjects, type ProjectListItem } from '../api/content'
import ErrorMessage from '../components/ErrorMessage'
import FadeIn from '../components/FadeIn'
import Reveal from '../components/Reveal'
import { StaggerItem, StaggerList } from '../components/StaggerReveal'
import { t } from '../lib/i18n'
import { useLocale } from '../lib/useLocale'
import HeroBannerSlider from '../components/HeroBannerSlider'

interface HeroData {
  title?: string
  subtitle?: string
  description?: string
  video?: string
  poster?: string
  slides?: { image: string; title?: string; slug?: string }[]
  stats?: { number: string; label: string }[]
  featured_project_id?: number
}

interface AboutBlockData {
  image?: string
  heading?: string
  intro?: string
  quote?: string
  quote_author?: string
  principles_image?: string
  principles?: { heading: string; text: string }[]
}

interface OfficesData {
  heading?: string
  description?: string
  video_label?: string
  map_video?: string
  map_poster?: string
}

interface VideoBannerData {
  video?: string
  video_url?: string
  poster?: string
  featured_projects?: { image: string; name: string }[]
}

interface KeyProjectsData {
  heading?: string
  statement?: string
  description?: string
}

export default function Home() {
  const locale = useLocale()
  const tr = t(locale)
  const [hero, setHero] = useState<HeroData | null>(null)
  const [about, setAbout] = useState<AboutBlockData | null>(null)
  const [offices, setOffices] = useState<OfficesData | null>(null)
  const [videoBanner, setVideoBanner] = useState<VideoBannerData | null>(null)
  const [keyProjects, setKeyProjects] = useState<KeyProjectsData | null>(null)
  const [projects, setProjects] = useState<ProjectListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  // Слайдер героя
  const [slideIndex, setSlideIndex] = useState(0)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    setLoading(true)
    setError(false)
    Promise.all([
      getPageContent<HeroData>(locale, 'home/hero'),
      getPageContent<AboutBlockData>(locale, 'home/about'),
      getPageContent<OfficesData>(locale, 'home/offices'),
      getPageContent<VideoBannerData>(locale, 'home/video-banner'),
      getPageContent<KeyProjectsData>(locale, 'home/key-projects'),
      getProjects(locale, { page: 1, per_page: 30 }),
    ])
      .then(([heroData, aboutData, officesData, videoBannerData, keyProjectsData, projectsData]) => {
        setHero(heroData)
        setAbout(aboutData)
        setOffices(officesData)
        setVideoBanner(videoBannerData)
        setKeyProjects(keyProjectsData)
        setProjects(projectsData.data)
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [locale])

  // Слайды — ВСЕГДА ДО early returns (Правила хуков)
  const slides = [
    ...(hero?.video ? [{ type: 'video' as const, src: hero.video, title: undefined as string | undefined, slug: undefined as string | undefined }] : []),
    ...(hero?.slides ?? []).map((s) => ({ type: 'photo' as const, src: s.image, title: s.title, slug: s.slug })),
  ]
  const slidesLen = slides.length

  // Автопереключение: видео — 8с, фото — 5с
  useEffect(() => {
    if (slidesLen <= 1) return
    const isVideo = slides[slideIndex]?.type === 'video'
    const duration = isVideo ? 8000 : 5000
    const timer = setTimeout(() => {
      setSlideIndex((i) => (i + 1) % slidesLen)
    }, duration)
    return () => clearTimeout(timer)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slideIndex, slidesLen])

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

  const featuredProject = projects.find((p) => p.id === hero?.featured_project_id)

  return (
    <>
      <Helmet>
        <title>INK Architects</title>
        <meta name="description" content={hero?.description ?? 'INK Architects — архитектурное бюро'} />
      </Helmet>

      <div className="-mt-24">
        <section className="relative flex h-[calc(100vh+6rem)] flex-col justify-end overflow-hidden px-6 pb-20">

          {/* Слайдер: видео + фото с Ken Burns */}
          <AnimatePresence mode="sync">
            {slides.map((slide, i) =>
              i !== slideIndex ? null : slide.type === 'video' ? (
                <motion.video
                  key="video"
                  ref={videoRef}
                  className="absolute inset-0 h-full w-full object-cover"
                  src={slide.src}
                  poster={hero?.poster}
                  autoPlay
                  muted
                  playsInline
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.2 }}
                />
              ) : (
                <motion.div
                  key={slide.src}
                  className="absolute inset-0 overflow-hidden"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.2 }}
                >
                  <motion.img
                    src={slide.src}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover"
                    initial={{ scale: 1, x: 0, y: 0 }}
                    animate={{ scale: 1.08, x: '-1%', y: '-1%' }}
                    transition={{ duration: 8, ease: 'linear' }}
                  />
                </motion.div>
              )
            )}
          </AnimatePresence>

          {/* Основной оверлей */}
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950/75 via-ink-950/25 to-ink-950/5" />
          {/* Сильное затемнение снизу — плавный переход в следующий блок */}
          <div className="absolute inset-x-0 bottom-0 h-50 bg-gradient-to-t from-ink-950 to-transparent" />

          <div className="relative mx-auto grid w-full max-w-[84rem] gap-8 md:grid-cols-2 md:gap-12">
            <div>
              <FadeIn>
                <h1 className="whitespace-pre-line text-5xl leading-[0.9] text-white sm:text-6xl md:text-7xl lg:text-8xl">
                  {hero?.title}
                </h1>
              </FadeIn>

              {!!hero?.stats?.length && (
                <FadeIn delay={0.2}>
                  <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3">
                    {hero.stats.map((stat, i) => (
                      <div key={i}>
                        <dt className="font-serif text-xl text-white md:text-2xl lg:text-3xl">{stat.number}</dt>
                        <dd className="mt-0.5 max-w-[22ch] text-xs leading-snug text-white/50 md:text-sm">{stat.label}</dd>
                      </div>
                    ))}
                  </dl>
                </FadeIn>
              )}

              {/* Бейдж: анимированная смена при переходе слайдов */}
              {(() => {
                const currentSlide = slides[slideIndex]
                const badgeSlug = currentSlide?.type === 'photo' && currentSlide.slug
                  ? currentSlide.slug
                  : featuredProject?.slug
                const badgeTitle = currentSlide?.type === 'photo' && currentSlide.title
                  ? currentSlide.title
                  : featuredProject?.title
                if (!badgeSlug || !badgeTitle) return null
                return (
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={badgeSlug}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.4 }}
                      className="mt-8"
                    >
                      <Link
                        to={`/${locale}/projects/${badgeSlug}`}
                        className="text-sm text-white/50 transition-colors hover:text-white/80"
                      >
                        {badgeTitle}
                      </Link>
                    </motion.div>
                  </AnimatePresence>
                )
              })()}
            </div>

            <div className="flex flex-col justify-end gap-5">
              {hero?.subtitle && (
                <FadeIn delay={0.15}>
                  <p className="whitespace-pre-line font-serif text-2xl leading-tight text-white md:text-3xl lg:text-4xl">
                    {hero.subtitle}
                  </p>
                </FadeIn>
              )}
              {hero?.description && (
                <FadeIn delay={0.25}>
                  <p className="max-w-lg text-white/70">{hero.description}</p>
                </FadeIn>
              )}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[84rem] px-6 pt-24 pb-24">
          <Reveal>
            <p className="text-xs uppercase tracking-widest text-white/40">{tr.home.about}</p>
          </Reveal>

          {about?.image ? (
            <>
              {/* Mobile: safe stacked layout, no overlay (avoids collision on narrow screens) */}
              <div className="sm:hidden">
                <Reveal delay={0.05}>
                  <h2 className="mt-4 max-w-2xl whitespace-pre-line font-serif text-2xl leading-tight text-white">
                    {about.heading}
                  </h2>
                </Reveal>
                <Reveal delay={0.1}>
                  <div className="relative mt-6 aspect-[4/3] w-full overflow-hidden bg-ink-800">
                    <img src={about.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
                  </div>
                </Reveal>
                <div className="mt-6 flex flex-col gap-6">
                  {about.intro && (
                    <Reveal delay={0.15}>
                      <p className="whitespace-pre-line text-sm text-white/70">{about.intro}</p>
                    </Reveal>
                  )}
                  {about.quote && (
                    <Reveal delay={0.2}>
                      <blockquote className="border-l border-accent/60 pl-4 text-sm italic text-white/80">
                        «{about.quote}»
                        {about.quote_author && (
                          <footer className="mt-2 text-xs text-white/40 not-italic">{about.quote_author}</footer>
                        )}
                      </blockquote>
                    </Reveal>
                  )}
                </div>
              </div>

              {/* Tablet/desktop: overlay on photo, exact site aspect-ratio 3.06 */}
              <div className="relative mt-3 hidden aspect-[3.06] w-full overflow-hidden bg-ink-800 sm:block">
                <img src={about.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
                <div className="absolute inset-x-0 top-0 h-2/5 bg-gradient-to-b from-ink-950/80 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-ink-950 to-transparent" />

                <div className="absolute inset-x-0 top-0 px-6 pt-5 md:px-10 md:pt-10">
                  <Reveal delay={0.05}>
                    <h2 className="max-w-2xl whitespace-pre-line font-serif text-xl leading-tight text-white md:text-4xl lg:text-5xl">
                      {about.heading}
                    </h2>
                  </Reveal>
                </div>

                <div className="absolute inset-x-0 bottom-0 grid gap-4 px-6 pb-6 md:grid-cols-[32%_38%] md:gap-12 md:px-10 md:pb-12">
                  {about.intro && (
                    <Reveal delay={0.1}>
                      <p className="whitespace-pre-line text-[10px] leading-snug text-white/70 md:text-sm">
                        {about.intro}
                      </p>
                    </Reveal>
                  )}
                  {about.quote && (
                    <Reveal delay={0.15}>
                      <blockquote className="text-[10px] italic leading-snug text-white/75 md:text-sm">
                        «{about.quote}»
                        {about.quote_author && (
                          <footer className="mt-1 text-[9px] text-white/40 not-italic md:mt-3 md:text-xs">
                            {about.quote_author}
                          </footer>
                        )}
                      </blockquote>
                    </Reveal>
                  )}
                </div>
              </div>
            </>
          ) : (
            <>
              <Reveal delay={0.05}>
                <h2 className="mt-4 max-w-2xl whitespace-pre-line font-serif text-3xl leading-tight text-white md:text-5xl">
                  {about?.heading}
                </h2>
              </Reveal>
              <div className="mt-10 grid gap-10 md:grid-cols-[30%_37%]">
                {about?.intro && (
                  <Reveal delay={0.15}>
                    <p className="whitespace-pre-line text-white/70">{about.intro}</p>
                  </Reveal>
                )}
                {about?.quote && (
                  <Reveal delay={0.2}>
                    <blockquote className="border-l border-accent/60 pl-6 italic text-white/80">
                      «{about.quote}»
                      {about.quote_author && (
                        <footer className="mt-3 text-sm text-white/40 not-italic">{about.quote_author}</footer>
                      )}
                    </blockquote>
                  </Reveal>
                )}
              </div>
            </>
          )}
          {!!about?.principles?.length && (
            <div className="mt-12 border-t border-line pt-12">
              <div className="grid gap-10 md:grid-cols-[38%_1fr] md:gap-20">
                {about.principles_image && (
                  <Reveal>
                    <div className="aspect-[185/100] w-full overflow-hidden bg-ink-800">
                      <img src={about.principles_image} alt="" className="h-full w-full object-cover" />
                    </div>
                  </Reveal>
                )}
                  <div className="flex flex-col justify-center gap-8">
                  {about.principles.map((p, i) => (
                    <Reveal key={i} delay={i * 0.1}>
                      <h3 className="font-sans text-sm font-semibold text-white">{p.heading}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-white/60">{p.text}</p>
                    </Reveal>
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>

        {(offices?.heading || offices?.map_video) && (
          <section className="mx-auto max-w-[84rem] px-6 pt-20 pb-16">
            {/* 2-column: heading + label left, description right — matches original */}
            <div className="grid gap-8 md:grid-cols-2 md:gap-16">
              <div>
                <Reveal>
                  <h2 className="font-serif text-[2.5rem] leading-[1.1] text-white">{offices.heading}</h2>
                </Reveal>
                {offices.video_label && (
                  <Reveal delay={0.15}>
                    <div className="mt-6 flex items-center gap-2 text-sm text-white/70">
                      <span className="h-[10px] w-[10px] rounded-full bg-gold" />
                      {offices.video_label}
                    </div>
                  </Reveal>
                )}
              </div>
              {offices.description && (
                <Reveal delay={0.1}>
                  <p className="whitespace-pre-line text-sm leading-relaxed text-white/60 md:pt-2">
                    {offices.description}
                  </p>
                </Reveal>
              )}
            </div>
            {(offices.map_video || offices.map_poster) && (
              <Reveal delay={0.2}>
                <div className="mt-10 aspect-[2.3107] w-full overflow-hidden bg-ink-950">
                  {offices.map_video ? (
                    <video
                      className="h-full w-full object-cover"
                      src={offices.map_video}
                      poster={offices.map_poster}
                      autoPlay
                      muted
                      loop
                      playsInline
                    />
                  ) : (
                    <img
                      src={offices.map_poster}
                      alt="Geography map"
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
              </Reveal>
            )}
          </section>
        )}


        {(videoBanner?.video || videoBanner?.video_url || (videoBanner?.featured_projects?.length ?? 0) > 0) && (
          <div className="mx-auto max-w-[84rem] px-6">
            <HeroBannerSlider
              videoSrc={videoBanner?.video || videoBanner?.video_url}
              videoPoster={videoBanner?.poster}
              projects={videoBanner?.featured_projects ?? []}
            />
          </div>
        )}


        <section className="mx-auto max-w-[84rem] px-6 pt-20 pb-28">
          {/* Section label */}
          <Reveal>
            <p className="text-sm text-white/60">{keyProjects?.heading || tr.home.keyProjects}</p>
          </Reveal>

          {/* Statement heading */}
          {keyProjects?.statement && (
            <Reveal delay={0.1}>
              <h2 className="mt-3 max-w-4xl whitespace-pre-line font-serif text-[2.5rem] leading-[1.1] text-white">
                {keyProjects.statement}
              </h2>
            </Reveal>
          )}

          {/* Description */}
          {keyProjects?.description && (
            <Reveal delay={0.15}>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/60">
                {keyProjects.description}
              </p>
            </Reveal>
          )}

          {/* Grid: 4 cols, featured (col-span-2 row-span-2) every 13th, max 30 */}
          {projects.length > 0 && (
            <StaggerList className="mt-10 grid grid-flow-dense grid-cols-4 gap-1">
              {projects.slice(0, 30).map((project, i) => {
                const isFeatured = i % 13 === 0
                return (
                  <StaggerItem
                    key={project.id}
                    className={isFeatured ? 'col-span-2 row-span-2' : undefined}
                    style={{ aspectRatio: '4/3' }}
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
                      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/70 to-transparent" />
                      <p className="absolute bottom-4 left-4 font-serif text-[1.3rem] leading-[1.1] text-white">
                        {project.title}
                      </p>
                    </Link>
                  </StaggerItem>
                )
              })}
            </StaggerList>
          )}

          {/* «Далее» button */}
          <div className="mt-10 flex justify-center">
            <Link
              to={`/${locale}/projects`}
              className="inline-flex items-center rounded-[20px] px-8 py-3 font-sans text-base font-medium text-white transition-opacity hover:opacity-80"
              style={{ backgroundColor: 'rgb(57, 64, 75)' }}
            >
              {tr.ui.more}
            </Link>
          </div>

        </section>
      </div>
    </>
  )
}
