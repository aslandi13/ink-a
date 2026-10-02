import type { ReactNode } from 'react'
import { getPageContent } from '../api/content'
import { t } from '../lib/i18n'
import type { Locale } from '../lib/locale'
import { sanitise } from '../lib/sanitise'

export interface LegalData {
  body?: string
}

interface SectionProps {
  data: LegalData
  locale: Locale
}

export function loadLegalData(locale: Locale): Promise<LegalData> {
  return getPageContent<LegalData>(locale, 'legal')
}

export function LegalTitleSection({ locale }: SectionProps) {
  return (
    <div className="mx-auto max-w-4xl px-6 pt-24">
      <h1 className="text-3xl font-medium tracking-tight text-white">{t(locale).legal.title}</h1>
    </div>
  )
}

export function LegalBodySection({ data }: SectionProps) {
  return (
    <div className="mx-auto max-w-4xl px-6 pb-24">
      <div className="prose prose-invert mt-10 max-w-none text-white/70" dangerouslySetInnerHTML={{ __html: sanitise(data.body ?? '') }} />
    </div>
  )
}

export const LEGAL_BLOCKS: { id: string; label: string; render: (props: SectionProps) => ReactNode }[] = [
  { id: 'legal-title', label: 'Заголовок', render: (p) => <LegalTitleSection {...p} /> },
  { id: 'legal-body', label: 'Текст документа', render: (p) => <LegalBodySection {...p} /> },
]

export const DEFAULT_LEGAL_LAYOUT = LEGAL_BLOCKS.map((b) => `<section data-block="${b.id}"></section>`).join('')
