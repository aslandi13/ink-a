import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { getPageContent } from '../api/content'
import ErrorMessage from '../components/ErrorMessage'
import { t } from '../lib/i18n'
import { useLocale } from '../lib/useLocale'

interface Step {
  title: string
  text: string
  image?: string
  image_caption?: string
}

interface CategoryData {
  default_image?: string
  default_image_caption?: string
  expertise_intro?: string
  steps?: Step[]
  seo_title?: string
  seo_description?: string
  og_image?: string
}

type ApproachData = Record<string, CategoryData>

const EASE: [number, number, number, number] = [0.76, 0, 0.24, 1]

export default function Approach() {
  const locale = useLocale()
  const tr = t(locale)

  const CATEGORIES: [string, string][] = [
    ['architecture', tr.approach.categories.architecture],
    ['engineering', tr.approach.categories.engineering],
    ['urbanism', tr.approach.categories.urbanism],
    ['interior', tr.approach.categories.interior],
  ]

  const [data, setData] = useState<ApproachData | null>(null)
  const [category, setCategory] = useState(CATEGORIES[0][0])
  const [activeStep, setActiveStep] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    setLoading(true)
    setError(false)
    getPageContent<ApproachData>(locale, 'approach')
      .then(setData)
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [locale])

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

  const current = data?.[category]
  const step = activeStep !== null ? current?.steps?.[activeStep] : null
  const image = step?.image ?? current?.default_image
  const caption = step?.image_caption ?? current?.default_image_caption

  return (
    <section className="pt-24">
      <Helmet>
        <title>{current?.seo_title || `${tr.nav.approach} — INK Architects`}</title>
        {(current?.seo_description) && <meta name="description" content={current.seo_description} />}
        {current?.og_image && <meta property="og:image" content={current.og_image} />}
      </Helmet>

      {/* Category tabs */}
      <div className="mx-auto flex max-w-[84rem] flex-wrap gap-x-8 gap-y-3 px-6 py-5 text-sm">
        {CATEGORIES.map(([value, label]) => (
          <button
            key={value}
            onClick={() => { setCategory(value); setActiveStep(null) }}
            className="relative pb-2 text-left transition-colors duration-300"
            style={{ color: value === category ? '#fff' : 'rgba(255,255,255,0.4)' }}
          >
            {label}
            {value === category && (
              <motion.span
                layoutId="tab-indicator"
                className="absolute inset-x-0 bottom-0 h-px bg-white"
                transition={{ duration: 0.35, ease: EASE }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Main 2-col layout */}
      <div className="mx-auto grid max-w-[84rem] gap-16 px-6 pt-12 pb-24 md:grid-cols-[45%_1fr]">

        {/* Left: expertise + steps */}
        <AnimatePresence mode="wait">
          <motion.div
            key={category}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: EASE }}
          >
            <motion.h2
              className="font-sans text-base font-medium text-white"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05, ease: EASE }}
            >
              {tr.approach.expertise}
            </motion.h2>

            {current?.expertise_intro && (
              <motion.p
                className="mt-3 text-[0.9rem] leading-relaxed text-white/90"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1, ease: EASE }}
              >
                {current.expertise_intro}
              </motion.p>
            )}

            {/* Steps list */}
            <div className="mt-10">
              {current?.steps?.map((s, i) => (
                <motion.div
                  key={i}
                  style={{ borderBottom: '0.5px solid rgba(255,255,255,0.5)' }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: 0.12 + i * 0.06, ease: EASE }}
                >
                  <button
                    onClick={() => setActiveStep(i === activeStep ? null : i)}
                    className={`flex w-full items-baseline gap-4 px-3 py-5 text-left transition-colors ${
                      i === activeStep ? 'bg-white/[0.06]' : 'hover:bg-white/[0.03]'
                    }`}
                  >
                    <span className="shrink-0 font-sans text-base text-white/30">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="shrink-0 text-white/30">·</span>
                    <span className={`font-sans text-base font-medium transition-colors ${
                      i === activeStep ? 'text-white' : 'text-white/70 hover:text-white'
                    }`}>
                      {s.title}
                    </span>
                  </button>

                  <AnimatePresence initial={false}>
                    {i === activeStep && s.text && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.32, ease: 'easeInOut' }}
                        className="overflow-hidden bg-white/[0.06]"
                      >
                        <p className="pb-5 pl-[52px] pr-3 text-[0.9rem] leading-relaxed text-white/60">
                          {s.text}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Right: sticky image */}
        <div className="relative overflow-hidden bg-ink-800 md:sticky md:top-24 md:h-fit">
          <AnimatePresence mode="wait">
            <motion.div
              key={image}
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.5, ease: EASE }}
              className="relative aspect-[4/3]"
            >
              {image && (
                <img
                  src={image}
                  alt={caption ?? ''}
                  className="h-full w-full object-cover"
                />
              )}
            </motion.div>
          </AnimatePresence>

          {caption && (
            <div
              className="absolute inset-x-0 bottom-0 px-6 pb-5 pt-16"
              style={{ background: 'linear-gradient(0deg, rgba(5,10,18,0.7) 0%, rgba(171,171,171,0) 100%)' }}
            >
              <p className="font-serif text-[1.3rem] leading-[1.1] text-white">
                {caption}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
