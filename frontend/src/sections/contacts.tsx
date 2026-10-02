import type { ReactNode } from 'react'
import { FaFacebook, FaInstagram, FaLinkedin } from 'react-icons/fa'
import { MdEmail } from 'react-icons/md'
import { getPageContent } from '../api/content'
import FadeIn from '../components/FadeIn'
import type { Locale } from '../lib/locale'

export interface ContactsData {
  background_video?: string
  email?: string
  facebook_handle?: string
  facebook_url?: string
  instagram_handle?: string
  instagram_url?: string
  linkedin_handle?: string
  linkedin_url?: string
  career_label?: string
  career_heading?: string
  career_text?: string
  career_cta_label?: string
  career_cta_url?: string
  address?: string
  phone?: string
  whatsapp?: string
  seo_title?: string
  seo_description?: string
  og_image?: string
}

interface SectionProps {
  data: ContactsData
  locale: Locale
  settings?: Record<string, string>
}

const OVERLAY: Record<string, string> = { light: 'rgb(5 10 18 / 0.2)', normal: 'rgb(5 10 18 / 0.5)', dark: 'rgb(5 10 18 / 0.8)' }
const CONTACTS_SHOW_HIDE = [['show', 'Показывать'], ['hide', 'Скрыть']]

export function loadContactsData(locale: Locale): Promise<ContactsData> {
  return getPageContent<ContactsData>(locale, 'contacts')
}

export function ContactsSection({ data, settings = {} }: SectionProps) {
  const ICONS: Record<string, ReactNode> = {
    Email: <MdEmail size={22} />,
    Facebook: <FaFacebook size={20} />,
    Instagram: <FaInstagram size={20} />,
    LinkedIn: <FaLinkedin size={20} />,
  }

  const socials = [
    data?.email && { label: 'Email', field: 'email', value: data.email, href: `mailto:${data.email}` },
    data?.facebook_handle && { label: 'Facebook', field: 'facebook_handle', value: data.facebook_handle, href: data.facebook_url },
    data?.instagram_handle && { label: 'Instagram', field: 'instagram_handle', value: data.instagram_handle, href: data.instagram_url },
    data?.linkedin_handle && { label: 'LinkedIn', field: 'linkedin_handle', value: data.linkedin_handle, href: data.linkedin_url },
  ].filter(Boolean) as { label: string; field: string; value: string; href?: string }[]

  return (
    <section className="relative min-h-[90vh] overflow-hidden flex flex-col justify-center">

      {settings.video !== 'hide' && data?.background_video && (
        <video
          className="absolute inset-0 h-full w-full object-cover"
          src={data.background_video}
          autoPlay
          muted
          loop
          playsInline
        />
      )}
      <div className="absolute inset-0" style={{ backgroundColor: OVERLAY[settings.overlay ?? ''] ?? OVERLAY.normal }} />

      <div className="relative mx-auto flex w-full max-w-[84rem] flex-1 flex-col justify-center px-6 pt-42 pb-12">
        {settings.socials !== 'hide' && (
          <>
        <FadeIn>
          <p className="text-xs uppercase tracking-[0.2em] text-white/40">Социальные сети</p>
        </FadeIn>
        <div className="mt-6 flex flex-wrap gap-x-12 gap-y-6">
          {socials.map((s, i) => (
            <FadeIn key={s.label} delay={0.1 + i * 0.08}>
              <a href={s.href} className="group flex items-start gap-3">
                <span className="mt-0.5 text-white/50 transition-colors group-hover:text-accent">
                  {ICONS[s.label]}
                </span>
                <span className="block">
                  <span data-edit={`contacts:${s.field}`} className="block text-white transition-colors group-hover:text-accent">{s.value}</span>
                  <span className="mt-1 block text-xs text-white/40">{s.label}</span>
                </span>
              </a>
            </FadeIn>
          ))}
        </div>
          </>
        )}

        {settings.career !== 'hide' && data?.career_heading && (
          <div className="mt-5 max-w-xl border-t border-line pt-5 sm:mt-5 sm:pt-8">
            {data.career_label && (
              <FadeIn delay={0.1}>
                <p data-edit="contacts:career_label" className="text-xs uppercase tracking-[0.2em] text-white/40">{data.career_label}</p>
              </FadeIn>
            )}
            <FadeIn delay={0.18}>
              <h1 data-edit="contacts:career_heading" className="mt-3 whitespace-pre-line font-serif text-4xl text-white md:text-5xl">
                {data.career_heading}
              </h1>
            </FadeIn>
            {data.career_text && (
              <FadeIn delay={0.26}>
                <p data-edit="contacts:career_text" className="mt-1 text-white/60">{data.career_text}</p>
              </FadeIn>
            )}
            {data.career_cta_label && (
              <FadeIn delay={0.34}>
                <a
                  href={data.career_cta_url ?? `mailto:${data.email}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex items-center gap-2 border border-white/30 px-6 py-3 text-sm text-white transition-colors hover:border-white hover:bg-white hover:text-ink-950"
                >
                  <span data-edit="contacts:career_cta_label">{data.career_cta_label}</span> <span aria-hidden>→</span>
                </a>
              </FadeIn>
            )}
          </div>
        )}
      </div>

      {settings.info !== 'hide' && (data?.address || data?.phone) && (
        <div className="relative border-t border-line bg-ink-950 px-6 py-8 text-sm text-white/50">
          <div className="mx-auto flex max-w-[84rem] flex-wrap gap-x-10 gap-y-2">
            {data?.address && <p data-edit="contacts:address">{data.address}</p>}
            {data?.phone && <p data-edit="contacts:phone">{data.phone}</p>}
            {data?.whatsapp && <p>WhatsApp: <span data-edit="contacts:whatsapp">{data.whatsapp}</span></p>}
          </div>
        </div>
      )}
    </section>
  )
}

export interface ContactsBlock {
  id: string
  label: string
  settings?: { name: string; label: string; options: string[][] }[]
  render: (props: SectionProps) => ReactNode
}

export const CONTACTS_BLOCKS: ContactsBlock[] = [
  {
    id: 'contacts-main',
    label: 'Контакты',
    settings: [
      { name: 'video', label: 'Фоновое видео', options: CONTACTS_SHOW_HIDE },
      { name: 'overlay', label: 'Затемнение', options: [['normal', 'Среднее'], ['light', 'Светлое'], ['dark', 'Тёмное']] },
      { name: 'socials', label: 'Соцсети', options: CONTACTS_SHOW_HIDE },
      { name: 'career', label: 'Блок «Карьера»', options: CONTACTS_SHOW_HIDE },
      { name: 'info', label: 'Адрес и телефон', options: CONTACTS_SHOW_HIDE },
    ],
    render: (p) => <ContactsSection {...p} />,
  },
]

export const DEFAULT_CONTACTS_LAYOUT = CONTACTS_BLOCKS.map((b) => `<section data-block="${b.id}"></section>`).join('')
