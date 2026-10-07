import type { ReactNode } from 'react'
import { getPageContent } from '../api/content'
import { t } from '../lib/i18n'
import type { Locale } from '../lib/locale'
import { sanitise } from '../lib/sanitise'

export interface LegalData {
  title?: string
  body?: string
}

interface SectionProps {
  data: LegalData
  locale: Locale
  settings?: Record<string, string>
}

const LEGAL_TITLE: Record<string, string> = { s: 'text-2xl', m: 'text-3xl', l: 'text-4xl md:text-5xl' }
const LEGAL_WIDTH: Record<string, string> = { narrow: 'max-w-3xl', normal: 'max-w-4xl', wide: 'max-w-[84rem]' }
const LEGAL_PROSE: Record<string, string> = { s: 'prose-sm', m: '', l: 'prose-lg' }
const LEGAL_WIDTH_OPTIONS = [['normal', 'Обычная'], ['narrow', 'Узкая'], ['wide', 'Во всю ширину']]

export function loadLegalData(locale: Locale): Promise<LegalData> {
  return getPageContent<LegalData>(locale, 'legal')
}

export function LegalTitleSection({ data, locale, settings = {} }: SectionProps) {
  return (
    <div className={`mx-auto px-6 pt-24 ${LEGAL_WIDTH[settings.width ?? ''] ?? LEGAL_WIDTH.normal}`}>
      <h1 data-edit="legal:title" className={`font-medium tracking-tight text-white ${LEGAL_TITLE[settings.size ?? ''] ?? LEGAL_TITLE.m}`}>
        {data.title || t(locale).legal.title}
      </h1>
    </div>
  )
}

export function LegalBodySection({ data, settings = {} }: SectionProps) {
  return (
    <div className={`mx-auto px-6 pb-24 ${LEGAL_WIDTH[settings.width ?? ''] ?? LEGAL_WIDTH.normal}`}>
      <div
        className={`prose prose-invert mt-10 max-w-none text-white/70 ${LEGAL_PROSE[settings.text ?? ''] ?? ''}`}
        dangerouslySetInnerHTML={{ __html: sanitise(data.body ?? '') }}
      />
    </div>
  )
}

export const LEGAL_BLOCKS: {
  id: string
  label: string
  settings?: { name: string; label: string; options: string[][] }[]
  render: (props: SectionProps) => ReactNode
}[] = [
  {
    id: 'legal-title',
    label: 'Заголовок',
    settings: [
      { name: 'size', label: 'Размер', options: [['m', 'Средний'], ['s', 'Маленький'], ['l', 'Большой']] },
      { name: 'width', label: 'Ширина', options: LEGAL_WIDTH_OPTIONS },
    ],
    render: (p) => <LegalTitleSection {...p} />,
  },
  {
    id: 'legal-body',
    label: 'Текст документа',
    settings: [
      { name: 'width', label: 'Ширина', options: LEGAL_WIDTH_OPTIONS },
      { name: 'text', label: 'Размер текста', options: [['m', 'Средний'], ['s', 'Маленький'], ['l', 'Большой']] },
    ],
    render: (p) => <LegalBodySection {...p} />,
  },
]

export const DEFAULT_LEGAL_LAYOUT = LEGAL_BLOCKS.map((b) => `<section data-block="${b.id}"></section>`).join('')
