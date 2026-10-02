import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState, type ReactNode } from 'react'
import { getPageContent } from '../api/content'
import FadeIn from '../components/FadeIn'
import Reveal from '../components/Reveal'
import { t } from '../lib/i18n'
import type { Locale } from '../lib/locale'

export interface GalleryCell {
  image?: string
  overlay_text?: string
}

export interface HistoryData {
  gallery?: GalleryCell[]
  intro?: string
  stats?: { number: string; label: string }[]
  highlights?: { heading: string; text: string }[]
  seo_title?: string
  seo_description?: string
  og_image?: string
}

export interface TeamMember {
  photo?: string
  name: string
  position?: string
  credentials?: string
}

export interface FounderData {
  photo?: string
  name?: string
  position?: string
  achievements?: string[]
  bio?: string
  credential_highlights?: { icon?: string; text: string }[]
  seo_title?: string
  seo_description?: string
  og_image?: string
}

export interface TeamData {
  members?: TeamMember[]
  seo_title?: string
  seo_description?: string
  og_image?: string
}

export interface AboutPageData {
  history: HistoryData
  team: TeamData
  founder: FounderData
}

interface SectionProps {
  data: AboutPageData
  locale: Locale
  settings?: Record<string, string>
}

type AboutTab = 'history' | 'team' | 'founder'
const TEAM_COLS: Record<string, string> = { '2': 'md:grid-cols-2', '3': 'md:grid-cols-3', '4': 'md:grid-cols-4', '5': 'md:grid-cols-5' }
const TEAM_RATIO: Record<string, string> = { square: '1/1', portrait: '3/4', tall: '2/3' }

const EASE: [number, number, number, number] = [0.76, 0, 0.24, 1]

export function loadAboutData(locale: Locale): Promise<AboutPageData> {
  return Promise.all([
    getPageContent<HistoryData>(locale, 'about/history'),
    getPageContent<TeamData>(locale, 'about/team'),
    getPageContent<FounderData>(locale, 'about/founder'),
  ]).then(([history, team, founder]) => ({ history, team, founder }))
}

export function AboutTabsSection({ data, locale, settings = {} }: SectionProps) {
  const tr = t(locale)
  const TABS = [
    { value: 'history' as const, label: tr.about.tabs.history },
    { value: 'team' as const, label: tr.about.tabs.team },
    { value: 'founder' as const, label: tr.about.tabs.founder },
  ]
  const initialTab = (['history', 'team', 'founder'].includes(settings.tab ?? '') ? settings.tab : 'history') as AboutTab
  const [tab, setTab] = useState<AboutTab>(initialTab)
  useEffect(() => setTab(initialTab), [initialTab])
  const teamCols = TEAM_COLS[settings.teamcols ?? ''] ?? TEAM_COLS['4']
  const teamRatio = TEAM_RATIO[settings.teamratio ?? ''] ?? TEAM_RATIO.square
  const { history, founder } = data
  const team = data.team.members ?? []

  return (
    <section className="pt-24">

      <div className="mx-auto flex max-w-[84rem] gap-8 px-6 py-5 text-sm">
        {TABS.map(({ value, label }) => (
          <button
            key={value}
            data-interactive
            onClick={() => setTab(value)}
            className="relative pb-2 font-sans font-medium transition-colors duration-300"
            style={{ color: value === tab ? '#fff' : 'rgba(255,255,255,0.4)' }}
          >
            {label}
            {value === tab && (
              <motion.span
                layoutId="about-tab-indicator"
                className="absolute inset-x-0 bottom-0 h-px bg-white"
                transition={{ duration: 0.35, ease: EASE }}
              />
            )}
          </button>
        ))}
      </div>

      {(
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.4, ease: EASE }}
          >
          {tab === 'history' && (
            <div>
              {!!history?.gallery?.length && (
                <div className="grid grid-cols-12 gap-2.5 px-6 lg:gap-1.5 lg:px-0 lg:[grid-template-columns:38%_20%_1fr_1fr] lg:[grid-template-rows:1fr_1fr] lg:h-[calc(100vw*0.32)]">
                  {([
                    'col-span-6 aspect-[5/6] lg:aspect-auto lg:[grid-column:1] lg:[grid-row:1/3]',
                    'col-span-6 aspect-[5/6] lg:aspect-auto lg:[grid-column:2] lg:[grid-row:1/3]',
                    'col-span-12 aspect-[1.85] lg:aspect-auto lg:[grid-column:3/5] lg:[grid-row:1]',
                    'col-span-7 lg:[grid-column:3] lg:[grid-row:2]',
                    'col-span-5 aspect-[4/3] lg:aspect-auto lg:[grid-column:4] lg:[grid-row:2]',
                  ] as const).map((placement, i) => {
                    const cell = history.gallery![i]
                    if (!cell) return null
                    return (
                      <motion.div
                        key={i}
                        className={`relative overflow-hidden ${placement} ${i === 3 ? 'bg-ink-950' : 'bg-ink-800'}`}
                        initial={{ opacity: 0, scale: 1.04 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.55, delay: i * 0.07, ease: EASE }}
                      >
                        {cell.image && i !== 3 && (
                          <img
                            data-edit-image={`about.history:gallery.${i}.image`}
                            src={cell.image}
                            alt=""
                            className={`h-full w-full object-cover lg:object-center ${i === 0 ? 'object-[28%_50%]' : i === 1 ? 'object-bottom' : ''}`}
                          />
                        )}
                        {i === 3 && cell.image && !cell.overlay_text && <img data-edit-image={`about.history:gallery.${i}.image`} src={cell.image} alt="" className="h-full w-full object-cover" />}
                        {i === 3 && cell.overlay_text ? (
                          <div className="flex h-full flex-col justify-center lg:justify-end lg:p-5">
                            <p data-edit={`about.history:gallery.${i}.overlay_text`} className="font-serif text-[2.2rem] leading-[1.05] text-white lg:text-[3rem]">{cell.overlay_text}</p>
                          </div>
                        ) : cell.overlay_text ? (
                          <p data-edit={`about.history:gallery.${i}.overlay_text`} className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4 font-sans text-[0.75rem] text-white/80">
                            {cell.overlay_text}
                          </p>
                        ) : null}
                      </motion.div>
                    )
                  })}
                </div>
              )}


              {history?.intro && (
                <Reveal delay={0.1}>
                  <p
                    data-edit="about.history:intro"
                    className="mx-auto max-w-[84rem] px-6 pt-6 text-[0.8rem] leading-tight text-white sm:pt-10 sm:text-[0.9rem] sm:leading-relaxed"
                    style={{ letterSpacing: '0.5px' }}
                  >
                    {history.intro}
                  </p>
                </Reveal>
              )}

              <div className="mx-auto flex max-w-[84rem] flex-col gap-6 px-6 pt-8 pb-16 sm:flex-row sm:items-start sm:justify-between sm:gap-0 sm:pt-10">
                {!!history?.stats?.length && (
                  <Reveal className="sm:w-[40%]">
                    <dl className="grid grid-cols-2 gap-x-6 gap-y-5 sm:gap-10 sm:pt-3">
                      {history.stats.map((s, i) => (
                        <div key={i}>
                          <dt data-edit={`about.history:stats.${i}.number`} className="font-sans text-[2rem] font-semibold leading-none text-white">
                            {s.number}
                          </dt>
                          <dd data-edit={`about.history:stats.${i}.label`} className="mt-1 text-[0.8rem] leading-tight text-white sm:mt-2 sm:text-[0.9rem] sm:leading-snug">{s.label}</dd>
                        </div>
                      ))}
                    </dl>
                  </Reveal>
                )}

                <div className="space-y-8 sm:w-[56%] sm:space-y-6">
                  {history?.highlights?.map((h, i) => (
                    <Reveal key={i} delay={i * 0.1}>
                      <h3 data-edit={`about.history:highlights.${i}.heading`} className="font-sans text-[1.2rem] font-medium text-white">
                        {h.heading}
                      </h3>
                      <p
                        data-edit={`about.history:highlights.${i}.text`}
                        className="mt-2 text-[0.8rem] leading-tight text-white sm:text-[0.9rem] sm:leading-relaxed"
                        style={{ letterSpacing: '0.5px' }}
                      >
                        {h.text}
                      </p>
                    </Reveal>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === 'team' && (
            <div className="mx-auto max-w-[84rem] px-6 pt-2 pb-24 sm:pt-10">
              <div className={`grid gap-[10px] grid-cols-2 ${teamCols}`}>
                {team.map((m, i) => (
                  <Reveal key={i} delay={(i % 4) * 0.08}>
                    <div className="overflow-hidden bg-ink-800" style={{ aspectRatio: teamRatio }}>
                      {m.photo && (
                        <img data-edit-image={`about.team:members.${i}.photo`} src={m.photo} alt={m.name} className="h-full w-full object-cover object-top" />
                      )}
                    </div>
                    <p data-edit={`about.team:members.${i}.name`} className="mt-3 font-sans text-[0.95rem] font-medium text-white">{m.name}</p>
                    {m.position && (
                      <p data-edit={`about.team:members.${i}.position`} className="mt-1 text-[0.8rem] leading-snug text-white/70">{m.position}</p>
                    )}
                    {m.credentials && (
                      <p data-edit={`about.team:members.${i}.credentials`} className="mt-1 text-[0.75rem] text-white/40">{m.credentials}</p>
                    )}
                  </Reveal>
                ))}
              </div>
            </div>
          )}

          {tab === 'founder' && founder && (
            <div className="mx-auto max-w-[84rem] px-6 pt-2 pb-24 sm:pt-10">
              <div className="grid gap-4 md:grid-cols-[30%_1fr] md:gap-12">
                <FadeIn>
                  <div className="overflow-hidden bg-ink-800" style={{ aspectRatio: '3/4' }}>
                    {founder.photo && (
                      <img
                        data-edit-image="about.founder:photo"
                        src={founder.photo}
                        alt={founder.name}
                        className="h-full w-full object-cover object-top"
                      />
                    )}
                  </div>
                </FadeIn>

                <FadeIn delay={0.15}>
                  <h1 data-edit="about.founder:name" className="whitespace-nowrap font-serif text-[2.3rem] leading-tight text-white md:whitespace-normal md:text-[3.5rem]">{founder.name}</h1>
                  {founder.position && (
                    <p data-edit="about.founder:position" className="mt-3 text-[0.95rem] text-white/70">{founder.position}</p>
                  )}

                  {!!founder.achievements?.length && (
                    <ul className="mt-8 space-y-2 text-[0.9rem] text-white/85">
                      {founder.achievements.map((a, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="shrink-0 text-white/60">•</span>
                          <span data-edit={`about.founder:achievements.${i}`}>{a}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {founder.bio && (
                    <p data-edit="about.founder:bio" className="mt-8 text-[0.9rem] leading-relaxed text-white/80">{founder.bio}</p>
                  )}
                </FadeIn>
              </div>

              {!!founder.credential_highlights?.length && (
                <div className="mt-16 grid gap-10 sm:grid-cols-3">
                  {founder.credential_highlights.map((c, i) => (
                    <FadeIn key={i} delay={i * 0.1}>
                      {c.icon && <img data-edit-image={`about.founder:credential_highlights.${i}.icon`} src={c.icon} alt="" className="h-10 opacity-80" />}
                      <p data-edit={`about.founder:credential_highlights.${i}.text`} className="mt-4 text-[0.85rem] leading-relaxed text-white/75">{c.text}</p>
                    </FadeIn>
                  ))}
                </div>
              )}
            </div>
          )}

          </motion.div>
        </AnimatePresence>
      )}

    </section>
  )
}

export interface AboutBlock {
  id: string
  label: string
  settings?: { name: string; label: string; options: string[][] }[]
  render: (props: SectionProps) => ReactNode
}

export const ABOUT_BLOCKS: AboutBlock[] = [
  {
    id: 'about-tabs',
    label: 'О нас: вкладки',
    settings: [
      { name: 'tab', label: 'Открытая вкладка', options: [['history', 'История'], ['team', 'Команда'], ['founder', 'Об основателе']] },
      { name: 'teamcols', label: 'Команда: колонок', options: [['4', '4'], ['3', '3'], ['5', '5'], ['2', '2']] },
      { name: 'teamratio', label: 'Команда: форма фото', options: [['square', 'Квадрат'], ['portrait', '3:4'], ['tall', '2:3']] },
    ],
    render: (p) => <AboutTabsSection {...p} />,
  },
]

export const DEFAULT_ABOUT_LAYOUT = ABOUT_BLOCKS.map((b) => `<section data-block="${b.id}"></section>`).join('')
