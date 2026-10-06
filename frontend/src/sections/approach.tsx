import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState, type ReactNode } from 'react'
import { getPageContent } from '../api/content'
import { t } from '../lib/i18n'
import { useReportActiveTab } from '../lib/activeTab'
import type { Locale } from '../lib/locale'

export interface ApproachStep {
  title: string
  text: string
  image?: string
  image_caption?: string
}

export interface ApproachCategory {
  default_image?: string
  default_image_caption?: string
  expertise_intro?: string
  steps?: ApproachStep[]
  seo_title?: string
  seo_description?: string
  og_image?: string
}

export type ApproachData = Record<string, ApproachCategory>

interface SectionProps {
  data: ApproachData
  locale: Locale
  settings?: Record<string, string>
}

const EASE: [number, number, number, number] = [0.76, 0, 0.24, 1]

export function loadApproachData(locale: Locale): Promise<ApproachData> {
  return getPageContent<ApproachData>(locale, 'approach')
}

export function ApproachSection({ data, locale, settings = {} }: SectionProps) {
  const tr = t(locale)
  const CATEGORIES: [string, string][] = [
    ['architecture', tr.approach.categories.architecture],
    ['engineering', tr.approach.categories.engineering],
    ['urbanism', tr.approach.categories.urbanism],
    ['interior', tr.approach.categories.interior],
  ]
  const initialCategory = CATEGORIES.some(([value]) => value === settings.category) ? settings.category! : CATEGORIES[0][0]
  const [category, setCategory] = useState(initialCategory)
  useReportActiveTab(category)
  useEffect(() => setCategory(initialCategory), [initialCategory])
  const imageLeft = settings.image === 'left'
  const [activeStep, setActiveStep] = useState<number | null>(null)

  const current = data?.[category]
  const step = activeStep !== null ? current?.steps?.[activeStep] : null
  const image = step?.image ?? current?.default_image
  const caption = step?.image_caption ?? current?.default_image_caption
  const imageTarget = step?.image ? `approach:${category}.steps.${activeStep}.image` : `approach:${category}.default_image`
  const captionTarget = step?.image_caption
    ? `approach:${category}.steps.${activeStep}.image_caption`
    : `approach:${category}.default_image_caption`

  return (
    <section className="pt-20 sm:pt-24">
      <div className="mx-auto flex max-w-[84rem] flex-wrap gap-x-8 gap-y-3 px-6 py-5 text-sm">
        {CATEGORIES.map(([value, label]) => (
          <button
            key={value}
            data-interactive
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

      <div
        className={`mx-auto grid max-w-[84rem] gap-4 px-6 pt-2 pb-24 md:gap-16 md:pt-12 ${imageLeft ? 'md:grid-cols-[1fr_45%]' : 'md:grid-cols-[45%_1fr]'}`}
      >

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
                data-edit={`approach:${category}.expertise_intro`}
                className="mt-3 text-[0.9rem] leading-relaxed text-white/90"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1, ease: EASE }}
              >
                {current.expertise_intro}
              </motion.p>
            )}

            <div className="mt-4 sm:mt-10">
              {current?.steps?.map((s, i) => (
                <motion.div
                  key={i}
                  style={{ borderBottom: '0.5px solid rgba(255,255,255,0.5)' }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: 0.12 + i * 0.06, ease: EASE }}
                >
                  <button
                    data-interactive
                    onClick={() => setActiveStep(i === activeStep ? null : i)}
                    className={`flex w-full items-baseline gap-4 px-3 py-5 text-left transition-colors ${
                      i === activeStep ? 'bg-white/[0.06]' : 'hover:bg-white/[0.03]'
                    }`}
                  >
                    <span className="shrink-0 font-sans text-base text-white/30">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="shrink-0 text-white/30">·</span>
                    <span data-edit={`approach:${category}.steps.${i}.title`} className={`font-sans text-base font-medium transition-colors ${
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
                        <p data-edit={`approach:${category}.steps.${i}.text`} className="pb-5 pl-[52px] pr-3 text-[0.9rem] leading-relaxed text-white/60">
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

        <div
          className={`relative order-first overflow-hidden bg-ink-800 md:sticky md:top-24 md:h-fit ${imageLeft ? 'md:order-first' : 'md:order-none'}`}
        >
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
                  data-edit-image={imageTarget}
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
              <p data-edit={captionTarget} className="font-serif text-[1.3rem] leading-[1.1] text-white">
                {caption}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export interface ApproachBlock {
  id: string
  label: string
  settings?: { name: string; label: string; options: string[][] }[]
  render: (props: SectionProps) => ReactNode
}

export const APPROACH_BLOCKS: ApproachBlock[] = [
  {
    id: 'approach-main',
    label: 'Подход: вкладки и этапы',
    settings: [
      {
        name: 'category',
        label: 'Открытая вкладка',
        options: [['architecture', 'Архитектура'], ['engineering', 'Рабочее проектирование'], ['urbanism', 'Урбанистика'], ['interior', 'Дизайн интерьера']],
      },
      { name: 'image', label: 'Фото', options: [['right', 'Справа'], ['left', 'Слева']] },
    ],
    render: (p) => <ApproachSection {...p} />,
  },
]

export const DEFAULT_APPROACH_LAYOUT = APPROACH_BLOCKS.map((b) => `<section data-block="${b.id}"></section>`).join('')
