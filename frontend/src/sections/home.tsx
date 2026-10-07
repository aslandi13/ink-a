import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { getPageContent, getProjects, type ProjectListItem } from '../api/content'
import FadeIn from '../components/FadeIn'
import HeroBannerSlider from '../components/HeroBannerSlider'
import Reveal from '../components/Reveal'
import { StaggerItem, StaggerList } from '../components/StaggerReveal'
import { t } from '../lib/i18n'
import type { Locale } from '../lib/locale'
import { prefetchProject } from '../lib/prefetch'
import { projectPath } from '../lib/projectPath'

export interface HeroData {
  seo_title?: string
  seo_description?: string
  og_image?: string
  title?: string
  subtitle?: string
  description?: string
  video?: string
  poster?: string
  slides?: { image: string; title?: string; slug?: string; category?: string }[]
  stats?: { number: string; label: string }[]
  featured_project_id?: number
}

export interface AboutBlockData {
  image?: string
  heading?: string
  intro?: string
  quote?: string
  quote_author?: string
  principles_image?: string
  principles?: { heading: string; text: string }[]
}

export interface OfficesData {
  heading?: string
  description?: string
  video_label?: string
  map_video?: string
  map_poster?: string
}

export interface VideoBannerData {
  video?: string
  video_url?: string
  poster?: string
  featured_projects?: { image: string; name: string }[]
}

export interface KeyProjectsData {
  heading?: string
  statement?: string
  description?: string
}

export interface HomeData {
  hero: HeroData
  about: AboutBlockData
  offices: OfficesData
  videoBanner: VideoBannerData
  keyProjects: KeyProjectsData
  projects: ProjectListItem[]
}

export function loadHomeData(locale: Locale): Promise<HomeData> {
  return Promise.all([
    getPageContent<HeroData>(locale, 'home/hero'),
    getPageContent<AboutBlockData>(locale, 'home/about'),
    getPageContent<OfficesData>(locale, 'home/offices'),
    getPageContent<VideoBannerData>(locale, 'home/video-banner'),
    getPageContent<KeyProjectsData>(locale, 'home/key-projects'),
    getProjects(locale, { page: 1, per_page: 30 }),
  ]).then(([hero, about, offices, videoBanner, keyProjects, projects]) => ({
    hero,
    about,
    offices,
    videoBanner,
    keyProjects,
    projects: projects.data,
  }))
}

interface SectionProps {
  data: HomeData
  locale: Locale
  settings?: Record<string, string>
}

const SHOW_HIDE = [['show', 'Показывать'], ['hide', 'Скрыть']]
const HERO_MIN_HEIGHT: Record<string, string> = { large: 'calc(80vh + 6rem)', medium: 'calc(60vh + 6rem)' }
const KP_COLS: Record<string, string> = { '2': 'md:grid-cols-2', '3': 'md:grid-cols-3', '4': 'md:grid-cols-4' }
const KP_RATIO: Record<string, string> = { '4/3': '4/3', '16/9': '16/9', '1/1': '1/1', '3/4': '3/4' }

export function HeroSection({ data, locale, settings = {} }: SectionProps) {
  const { hero, projects } = data
  const autoplay = settings.autoplay !== 'off'
  const minHeight = HERO_MIN_HEIGHT[settings.height ?? '']
  const [slideIndex, setSlideIndex] = useState(0)
  const videoRef = useRef<HTMLVideoElement>(null)

  const slides = [
    ...(hero?.video ? [{ type: 'video' as const, src: hero.video, title: undefined as string | undefined, slug: undefined as string | undefined, category: undefined as string | undefined }] : []),
    ...(hero?.slides ?? []).map((s) => ({ type: 'photo' as const, src: s.image, title: s.title, slug: s.slug, category: s.category })),
  ]
  const slidesLen = slides.length

  useEffect(() => {
    if (slidesLen <= 1 || !autoplay) return
    const isVideo = slides[slideIndex]?.type === 'video'
    const timer = setTimeout(() => {
      setSlideIndex((i) => (i + 1) % slidesLen)
    }, isVideo ? 8000 : 5000)
    return () => clearTimeout(timer)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slideIndex, slidesLen, autoplay])

  const featuredProject = projects.find((p) => p.id === hero?.featured_project_id)
  const currentSlide = slides[slideIndex]
  const badgeFromSlide = currentSlide?.type === 'photo' && !!currentSlide.slug
  const badgeSlug = badgeFromSlide ? currentSlide.slug : featuredProject?.slug
  const badgeCategory = badgeFromSlide ? currentSlide.category : featuredProject?.category
  const badgeTitle = currentSlide?.type === 'photo' && currentSlide.title ? currentSlide.title : featuredProject?.title

  return (
    <section
      className="relative flex min-h-[calc(100vh_+_6rem)] flex-col justify-end overflow-hidden px-6 pb-20"
      style={minHeight ? { minHeight } : undefined}
    >
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

      <div className="absolute inset-0 bg-gradient-to-t from-ink-950/75 via-ink-950/25 to-ink-950/5" />
      <div className="absolute inset-x-0 bottom-0 h-50 bg-gradient-to-t from-ink-950 to-transparent" />

      <div className="relative mx-auto grid w-full max-w-[84rem] gap-8 md:grid-cols-2 md:gap-12">
        <div>
          <FadeIn>
            <h1 data-edit="home.hero:title" className="whitespace-pre-line text-5xl leading-[0.9] text-white sm:text-6xl md:text-7xl lg:text-8xl">
              {hero?.title}
            </h1>
          </FadeIn>

          {settings.stats !== 'hide' && !!hero?.stats?.length && (
            <FadeIn delay={0.2}>
              <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3">
                {hero.stats.map((stat, i) => (
                  <div key={i}>
                    <dt data-edit={`home.hero:stats.${i}.number`} className="font-serif text-xl text-white md:text-2xl lg:text-3xl">{stat.number}</dt>
                    <dd data-edit={`home.hero:stats.${i}.label`} className="mt-0.5 max-w-[22ch] text-xs leading-snug text-white/50 md:text-sm">{stat.label}</dd>
                  </div>
                ))}
              </dl>
            </FadeIn>
          )}

          {settings.badge !== 'hide' && badgeSlug && badgeTitle && (
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
                  to={projectPath(locale, { slug: badgeSlug, category: badgeCategory })}
                  className="text-sm text-white/50 transition-colors hover:text-white/80"
                >
                  {badgeTitle}
                </Link>
              </motion.div>
            </AnimatePresence>
          )}
        </div>

        <div className="flex flex-col justify-end gap-5">
          {hero?.subtitle && (
            <FadeIn delay={0.15}>
              <p data-edit="home.hero:subtitle" className="whitespace-pre-line font-serif text-2xl leading-tight text-white md:text-3xl lg:text-4xl">
                {hero.subtitle}
              </p>
            </FadeIn>
          )}
          {settings.description !== 'hide' && hero?.description && (
            <FadeIn delay={0.25}>
              <p data-edit="home.hero:description" className="hidden max-w-lg text-white/70 sm:block">{hero.description}</p>
            </FadeIn>
          )}
        </div>
      </div>
    </section>
  )
}

export function AboutSection({ data, locale, settings = {} }: SectionProps) {
  const { about } = data
  const tr = t(locale)

  return (
    <section className="mx-auto max-w-[84rem] px-6 pt-8 pb-4 sm:pt-24 sm:pb-10">
      {settings.label !== 'hide' && (
        <Reveal>
          <p className="text-xs uppercase tracking-widest text-white/40">{tr.home.about}</p>
        </Reveal>
      )}

      {about?.image ? (
        <>
          <div className="lg:hidden">
            <Reveal delay={0.05}>
              <h2 data-edit="home.about:heading" className="mt-4 max-w-2xl whitespace-pre-line font-serif text-2xl leading-tight text-white">
                {about.heading}
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="relative mt-6 aspect-[4/3] w-full overflow-hidden bg-ink-800">
                <img data-edit-image="home.about:image" src={about.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
              </div>
            </Reveal>
            <div className="mt-6 flex flex-col gap-6">
              {about.intro && (
                <Reveal delay={0.15}>
                  <p data-edit="home.about:intro" className="whitespace-pre-line text-sm text-white/70">{about.intro}</p>
                </Reveal>
              )}
              {settings.quote !== 'hide' && about.quote && (
                <Reveal delay={0.2}>
                  <blockquote className="border-l border-accent/60 pl-4 text-sm italic text-white/80">
                    «<span data-edit="home.about:quote">{about.quote}</span>»
                    {about.quote_author && (
                      <footer className="mt-2 text-xs text-white/40 not-italic"><span data-edit="home.about:quote_author">{about.quote_author}</span></footer>
                    )}
                  </blockquote>
                </Reveal>
              )}
            </div>
          </div>

          <div className="@container relative mt-3 hidden aspect-[3.06] w-full overflow-hidden bg-ink-800 lg:block">
            <img data-edit-image="home.about:image" src={about.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-x-0 top-0 h-2/5 bg-gradient-to-b from-ink-950/80 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-ink-950 to-transparent" />

            <div className="absolute inset-x-0 top-0 px-[3cqw] pt-[3cqw]">
              <Reveal delay={0.05}>
                <h2 data-edit="home.about:heading" className="max-w-[55cqw] whitespace-pre-line font-serif text-[3.6cqw] leading-tight text-white">
                  {about.heading}
                </h2>
              </Reveal>
            </div>

            <div className="absolute inset-x-0 bottom-0 grid grid-cols-[45%_40%] gap-[6cqw] px-[3cqw] pb-[3.5cqw]">
              {about.intro && (
                <Reveal delay={0.1}>
                  <p data-edit="home.about:intro" className="whitespace-pre-line text-[1.08cqw] leading-snug text-white/80">
                    {about.intro}
                  </p>
                </Reveal>
              )}
              {settings.quote !== 'hide' && about.quote && (
                <Reveal delay={0.15}>
                  <blockquote className="text-[1.08cqw] italic leading-snug text-white/80">
                    «<span data-edit="home.about:quote">{about.quote}</span>»
                    {about.quote_author && (
                      <footer className="mt-[0.9cqw] text-[0.93cqw] text-white/60 not-italic">
                        <span data-edit="home.about:quote_author">{about.quote_author}</span>
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
            <h2 data-edit="home.about:heading" className="mt-4 max-w-2xl whitespace-pre-line font-serif text-3xl leading-tight text-white md:text-5xl">
              {about?.heading}
            </h2>
          </Reveal>
          <div className="mt-10 grid gap-10 md:grid-cols-[30%_37%]">
            {about?.intro && (
              <Reveal delay={0.15}>
                <p data-edit="home.about:intro" className="whitespace-pre-line text-white/70">{about.intro}</p>
              </Reveal>
            )}
            {settings.quote !== 'hide' && about?.quote && (
              <Reveal delay={0.2}>
                <blockquote className="border-l border-accent/60 pl-6 italic text-white/80">
                  «<span data-edit="home.about:quote">{about.quote}</span>»
                  {about.quote_author && (
                    <footer className="mt-3 text-sm text-white/40 not-italic"><span data-edit="home.about:quote_author">{about.quote_author}</span></footer>
                  )}
                </blockquote>
              </Reveal>
            )}
          </div>
        </>
      )}
      {settings.principles !== 'hide' && !!about?.principles?.length && (
        <div className="mt-4 border-t border-line pt-4 sm:mt-12 sm:pt-12">
          <div className="grid gap-10 md:grid-cols-[38%_1fr] md:gap-20">
            {about.principles_image && (
              <Reveal>
                <div className="aspect-[185/100] w-full overflow-hidden bg-ink-800">
                  <img data-edit-image="home.about:principles_image" src={about.principles_image} alt="" className="h-full w-full object-cover" />
                </div>
              </Reveal>
            )}
            <div className="flex flex-col justify-center gap-8">
              {about.principles.map((p, i) => (
                <Reveal key={i} delay={i * 0.1}>
                  <h3 data-edit={`home.about:principles.${i}.heading`} className="font-sans text-sm font-semibold text-white">{p.heading}</h3>
                  <p data-edit={`home.about:principles.${i}.text`} className="mt-2 text-sm leading-relaxed text-white/60">{p.text}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export function OfficesSection({ data, settings = {} }: SectionProps) {
  const { offices } = data
  if (!offices?.heading && !offices?.map_video) return null

  return (
    <section className="mx-auto max-w-[84rem] px-6 pt-2 pb-4 sm:pt-10 sm:pb-16">
      <div className="grid gap-8 md:grid-cols-2 md:gap-16">
        <div>
          <Reveal>
            <h2 data-edit="home.offices:heading" className="font-serif text-[2.5rem] leading-[1.1] text-white">{offices.heading}</h2>
          </Reveal>
          {offices.video_label && (
            <Reveal delay={0.15}>
              <div className="mt-6 flex items-center gap-2 text-sm text-white/70">
                <span className="h-[10px] w-[10px] rounded-full bg-gold" />
                <span data-edit="home.offices:video_label">{offices.video_label}</span>
              </div>
            </Reveal>
          )}
        </div>
        {settings.description !== 'hide' && offices.description && (
          <Reveal delay={0.1}>
            <p data-edit="home.offices:description" className="whitespace-pre-line text-sm leading-relaxed text-white/60 md:pt-2">
              {offices.description}
            </p>
          </Reveal>
        )}
      </div>
      {settings.map !== 'hide' && (offices.map_video || offices.map_poster) && (
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
              <img data-edit-image="home.offices:map_poster" src={offices.map_poster} alt="Geography map" className="h-full w-full object-cover" />
            )}
          </div>
        </Reveal>
      )}
    </section>
  )
}

export function VideoBannerSection({ data, settings = {} }: SectionProps) {
  const { videoBanner } = data
  if (!videoBanner?.video && !videoBanner?.video_url && !(videoBanner?.featured_projects?.length ?? 0)) return null

  return (
    <div className={settings.width === 'full' ? '' : 'mx-auto max-w-[84rem] px-6'}>
      <HeroBannerSlider
        videoSrc={videoBanner?.video || videoBanner?.video_url}
        videoPoster={videoBanner?.poster}
        projects={videoBanner?.featured_projects ?? []}
      />
    </div>
  )
}

export function KeyProjectsSection({ data, locale, settings = {} }: SectionProps) {
  const { keyProjects, projects } = data
  const tr = t(locale)
  const count = Number(settings.count) || 30
  const cols = KP_COLS[settings.cols ?? ''] ?? KP_COLS['4']
  const ratio = KP_RATIO[settings.ratio ?? ''] ?? KP_RATIO['4/3']
  const featured = settings.featured !== 'off'

  return (
    <section className="mx-auto max-w-[84rem] px-6 pt-4 pb-28 sm:pt-20">
      <Reveal>
        <p data-edit="home.key_projects:heading" className="text-sm text-white/60">{keyProjects?.heading || tr.home.keyProjects}</p>
      </Reveal>

      {keyProjects?.statement && (
        <Reveal delay={0.1}>
          <h2 data-edit="home.key_projects:statement" className="mt-3 max-w-4xl whitespace-pre-line font-serif text-[1.9rem] leading-[1.1] text-white sm:text-[2.5rem]">
            {keyProjects.statement}
          </h2>
        </Reveal>
      )}

      {keyProjects?.description && (
        <Reveal delay={0.15}>
          <p data-edit="home.key_projects:description" className="mt-4 max-w-2xl text-sm leading-relaxed text-white/60">{keyProjects.description}</p>
        </Reveal>
      )}

      {projects.length > 0 && (
        <StaggerList className={`mt-10 grid grid-flow-dense grid-cols-2 gap-1 ${cols}`}>
          {projects.slice(0, count).map((project, i) => {
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

      {settings.button !== 'hide' && (
      <div className="mt-10 flex justify-center">
        <Link
          to={`/${locale}/projects`}
          className="inline-flex items-center rounded-[20px] px-8 py-3 font-sans text-base font-medium text-white transition-opacity hover:opacity-80"
          style={{ backgroundColor: 'rgb(57, 64, 75)' }}
        >
          {tr.ui.more}
        </Link>
      </div>
      )}
    </section>
  )
}

export interface HomeBlock {
  id: string
  label: string
  settings?: { name: string; label: string; options: string[][] }[]
  render: (props: SectionProps) => ReactNode
}

export const HOME_BLOCKS: HomeBlock[] = [
  {
    id: 'hero',
    label: 'Герой',
    settings: [
      { name: 'height', label: 'Высота', options: [['', 'На весь экран'], ['large', 'Большая'], ['medium', 'Средняя']] },
      { name: 'autoplay', label: 'Автопрокрутка фона', options: [['on', 'Включена'], ['off', 'Выключена']] },
      { name: 'stats', label: 'Цифры', options: SHOW_HIDE },
      { name: 'badge', label: 'Ссылка на проект', options: SHOW_HIDE },
      { name: 'description', label: 'Описание', options: SHOW_HIDE },
    ],
    render: (p) => <HeroSection {...p} />,
  },
  {
    id: 'about',
    label: 'О нас',
    settings: [
      { name: 'label', label: 'Подпись «О нас»', options: SHOW_HIDE },
      { name: 'quote', label: 'Цитата', options: SHOW_HIDE },
      { name: 'principles', label: 'Принципы', options: SHOW_HIDE },
    ],
    render: (p) => <AboutSection {...p} />,
  },
  {
    id: 'offices',
    label: 'География',
    settings: [
      { name: 'description', label: 'Описание', options: SHOW_HIDE },
      { name: 'map', label: 'Карта', options: SHOW_HIDE },
    ],
    render: (p) => <OfficesSection {...p} />,
  },
  {
    id: 'video',
    label: 'Видео-баннер',
    settings: [{ name: 'width', label: 'Ширина', options: [['container', 'По сетке сайта'], ['full', 'Во всю ширину экрана']] }],
    render: (p) => <VideoBannerSection {...p} />,
  },
  {
    id: 'projects',
    label: 'Ключевые проекты',
    settings: [
      { name: 'count', label: 'Сколько показать', options: [['30', '30'], ['16', '16'], ['12', '12'], ['8', '8'], ['4', '4']] },
      { name: 'cols', label: 'Колонок', options: [['4', '4'], ['3', '3'], ['2', '2']] },
      { name: 'ratio', label: 'Форма картинок', options: [['4/3', '4:3'], ['16/9', '16:9'], ['1/1', 'Квадрат'], ['3/4', 'Вертикальные 3:4']] },
      { name: 'featured', label: 'Большие карточки', options: [['on', 'Показывать'], ['off', 'Все одинаковые']] },
      { name: 'button', label: 'Кнопка «Далее»', options: SHOW_HIDE },
    ],
    render: (p) => <KeyProjectsSection {...p} />,
  },
]

export const DEFAULT_HOME_LAYOUT = HOME_BLOCKS.map((b) => `<section data-block="${b.id}"></section>`).join('')
