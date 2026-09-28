import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { getPageContent } from '../api/content'
import ErrorMessage from '../components/ErrorMessage'
import FadeIn from '../components/FadeIn'
import Reveal from '../components/Reveal'
import { t } from '../lib/i18n'
import { useLocale } from '../lib/useLocale'

interface GalleryCell {
  image?: string
  overlay_text?: string
}

interface HistoryData {
  gallery?: GalleryCell[]
  intro?: string
  stats?: { number: string; label: string }[]
  highlights?: { heading: string; text: string }[]
  seo_title?: string
  seo_description?: string
  og_image?: string
}

interface TeamMember {
  photo?: string
  name: string
  position?: string
  credentials?: string
}

interface FounderData {
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

interface TeamData {
  members?: TeamMember[]
  seo_title?: string
  seo_description?: string
  og_image?: string
}

const EASE: [number, number, number, number] = [0.76, 0, 0.24, 1]

export default function About() {
  const locale = useLocale()
  const tr = t(locale)

  const TABS = [
    { value: 'history' as const, label: tr.about.tabs.history },
    { value: 'team' as const,    label: tr.about.tabs.team },
    { value: 'founder' as const, label: tr.about.tabs.founder },
  ]

  const [tab, setTab]         = useState<'history' | 'team' | 'founder'>('history')
  const [history, setHistory] = useState<HistoryData | null>(null)
  const [team, setTeam]       = useState<TeamMember[]>([])
  const [teamSeo, setTeamSeo] = useState<Pick<TeamData, 'seo_title'|'seo_description'|'og_image'>>({})
  const [founder, setFounder] = useState<FounderData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(false)

  useEffect(() => {
    setLoading(true)
    setError(false)
    Promise.all([
      getPageContent<HistoryData>(locale, 'about/history'),
      getPageContent<TeamData>(locale, 'about/team'),
      getPageContent<FounderData>(locale, 'about/founder'),
    ])
      .then(([historyData, teamData, founderData]) => {
        setHistory(historyData)
        setTeam(teamData.members ?? [])
        setTeamSeo({ seo_title: teamData.seo_title, seo_description: teamData.seo_description, og_image: teamData.og_image })
        setFounder(founderData)
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [locale])

  return (
    <section className="pt-24">
      <Helmet>
        {tab === 'history' && <title>{history?.seo_title || `${tr.nav.about} — INK Architects`}</title>}
        {tab === 'team'    && <title>{teamSeo.seo_title  || `${tr.nav.about} — INK Architects`}</title>}
        {tab === 'founder' && <title>{founder?.seo_title || `${tr.nav.about} — INK Architects`}</title>}
        {tab === 'history' && history?.seo_description  && <meta name="description" content={history.seo_description} />}
        {tab === 'team'    && teamSeo.seo_description   && <meta name="description" content={teamSeo.seo_description} />}
        {tab === 'founder' && founder?.seo_description  && <meta name="description" content={founder.seo_description} />}
      </Helmet>

      {/* Tab bar */}
      <div className="mx-auto flex max-w-[84rem] gap-8 px-6 py-5 text-sm">
        {TABS.map(({ value, label }) => (
          <button
            key={value}
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

      {loading ? (
        <p className="mx-auto max-w-[84rem] px-6 py-24 text-white/40">{tr.ui.loading}</p>
      ) : error ? (
        <ErrorMessage>{tr.ui.error}</ErrorMessage>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.4, ease: EASE }}
          >
          {/* ───── ИСТОРИЯ ───── */}
          {tab === 'history' && (
            <div>
              {/* Mosaic gallery — 4 cols, explicit placement */}
              {!!history?.gallery?.length && (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '38% 20% 1fr 1fr',
                    gridTemplateRows: '1fr 1fr',
                    height: 'calc(100vw * 0.32)',
                    gap: '6px',
                  }}
                >
                  {([
                    { col: '1',   row: '1 / 3' },
                    { col: '2',   row: '1 / 3' },
                    { col: '3 / 5', row: '1'  },
                    { col: '3',   row: '2'     },
                    { col: '4',   row: '2'     },
                  ] as const).map(({ col, row }, i) => {
                    const cell = history.gallery![i]
                    if (!cell) return null
                    return (
                      <motion.div
                        key={i}
                        className={`relative overflow-hidden ${i === 3 ? 'bg-ink-950' : 'bg-ink-800'}`}
                        style={{ gridColumn: col, gridRow: row }}
                        initial={{ opacity: 0, scale: 1.04 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.55, delay: i * 0.07, ease: EASE }}
                      >
                        {cell.image && i !== 3 && <img src={cell.image} alt="" className="h-full w-full object-cover" />}
                        {i === 3 && cell.image && !cell.overlay_text && <img src={cell.image} alt="" className="h-full w-full object-cover" />}
                        {i === 3 && cell.overlay_text ? (
                          <div className="flex h-full flex-col justify-end p-5">
                            <p className="font-serif text-[3rem] leading-[1.05] text-white">{cell.overlay_text}</p>
                          </div>
                        ) : cell.overlay_text ? (
                          <p className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4 font-sans text-[0.75rem] text-white/80">
                            {cell.overlay_text}
                          </p>
                        ) : null}
                      </motion.div>
                    )
                  })}
                </div>
              )}


              {/* Intro text — full width, 0.9rem, bright */}
              {history?.intro && (
                <Reveal delay={0.1}>
                  <p
                    className="mx-auto max-w-[84rem] px-6 pt-10 text-[0.9rem] leading-relaxed text-white"
                    style={{ letterSpacing: '0.5px' }}
                  >
                    {history.intro}
                  </p>
                </Reveal>
              )}

              {/* Stats + highlights — stats 40%, highlights 56% (space-between) — из Framer CSS */}
              <div className="mx-auto flex max-w-[84rem] flex-row items-start justify-between px-6 pt-10 pb-16">
                {/* Stats 2×2 — width: 40%, gap: 40px — из Framer */}
                {!!history?.stats?.length && (
                  <Reveal className="w-[40%]">
                    <dl className="grid grid-cols-2 gap-10 pt-3">
                      {history.stats.map((s, i) => (
                        <div key={i}>
                          <dt className="font-sans text-[2rem] font-semibold leading-none text-white">
                            {s.number}
                          </dt>
                          <dd className="mt-2 text-[0.9rem] leading-snug text-white">{s.label}</dd>
                        </div>
                      ))}
                    </dl>
                  </Reveal>
                )}

                {/* Highlights — width: 56% — из Framer */}
                <div className="w-[56%] space-y-6">
                  {history?.highlights?.map((h, i) => (
                    <Reveal key={i} delay={i * 0.1}>
                      <h3 className="font-sans text-[1.2rem] font-medium text-white">
                        {h.heading}
                      </h3>
                      <p
                        className="mt-2 text-[0.9rem] leading-relaxed text-white"
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

          {/* ───── КОМАНДА ───── */}
          {tab === 'team' && (
            <div className="mx-auto max-w-[84rem] px-6 pt-10 pb-24">
              {/* Team grid: gap: 10px — из Framer CSS */}
              <div className="grid gap-[10px] grid-cols-2 md:grid-cols-4">
                {team.map((m, i) => (
                  <Reveal key={i} delay={(i % 4) * 0.08}>
                    {/* Квадратное фото как в оригинале, object-top — голова не обрезается */}
                    <div className="aspect-square overflow-hidden bg-ink-800">
                      {m.photo && (
                        <img src={m.photo} alt={m.name} className="h-full w-full object-cover object-top" />
                      )}
                    </div>
                    <p className="mt-3 font-sans text-[0.95rem] font-medium text-white">{m.name}</p>
                    {m.position && (
                      <p className="mt-1 text-[0.8rem] leading-snug text-white/70">{m.position}</p>
                    )}
                    {m.credentials && (
                      <p className="mt-1 text-[0.75rem] text-white/40">{m.credentials}</p>
                    )}
                  </Reveal>
                ))}
              </div>
            </div>
          )}

          {/* ───── ОБ ОСНОВАТЕЛЕ ───── */}
          {tab === 'founder' && founder && (
            <div className="mx-auto max-w-[84rem] px-6 pt-10 pb-24">
              {/* 2-column: photo + content */}
              <div className="grid gap-12 md:grid-cols-[30%_1fr]">
                <FadeIn>
                  <div className="overflow-hidden bg-ink-800" style={{ aspectRatio: '3/4' }}>
                    {founder.photo && (
                      <img
                        src={founder.photo}
                        alt={founder.name}
                        className="h-full w-full object-cover object-top"
                      />
                    )}
                  </div>
                </FadeIn>

                <FadeIn delay={0.15}>
                  <h1 className="font-serif text-[3.5rem] leading-tight text-white">{founder.name}</h1>
                  {founder.position && (
                    <p className="mt-3 text-[0.95rem] text-white/70">{founder.position}</p>
                  )}

                  {!!founder.achievements?.length && (
                    <ul className="mt-8 space-y-2 text-[0.9rem] text-white/85">
                      {founder.achievements.map((a, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="shrink-0 text-white/60">•</span>
                          {a}
                        </li>
                      ))}
                    </ul>
                  )}

                  {founder.bio && (
                    <p className="mt-8 text-[0.9rem] leading-relaxed text-white/80">{founder.bio}</p>
                  )}
                </FadeIn>
              </div>

              {/* Full-width credentials row — под обеими колонками */}
              {!!founder.credential_highlights?.length && (
                <div className="mt-16 grid gap-10 sm:grid-cols-3">
                  {founder.credential_highlights.map((c, i) => (
                    <FadeIn key={i} delay={i * 0.1}>
                      {c.icon && <img src={c.icon} alt="" className="h-10 opacity-80" />}
                      <p className="mt-4 text-[0.85rem] leading-relaxed text-white/75">{c.text}</p>
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
