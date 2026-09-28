import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { FaFacebook, FaInstagram, FaLinkedin } from 'react-icons/fa'
import { MdEmail } from 'react-icons/md'
import { getPageContent } from '../api/content'
import ErrorMessage from '../components/ErrorMessage'
import FadeIn from '../components/FadeIn'
import { t } from '../lib/i18n'
import { useLocale } from '../lib/useLocale'

interface ContactsData {
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

export default function Contacts() {
  const locale = useLocale()
  const tr = t(locale)
  const [data, setData] = useState<ContactsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    setLoading(true)
    setError(false)
    getPageContent<ContactsData>(locale, 'contacts')
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

  const ICONS: Record<string, React.ReactNode> = {
    Email: <MdEmail size={22} />,
    Facebook: <FaFacebook size={20} />,
    Instagram: <FaInstagram size={20} />,
    LinkedIn: <FaLinkedin size={20} />,
  }

  const socials = [
    data?.email && { label: 'Email', value: data.email, href: `mailto:${data.email}` },
    data?.facebook_handle && { label: 'Facebook', value: data.facebook_handle, href: data.facebook_url },
    data?.instagram_handle && { label: 'Instagram', value: data.instagram_handle, href: data.instagram_url },
    data?.linkedin_handle && { label: 'LinkedIn', value: data.linkedin_handle, href: data.linkedin_url },
  ].filter(Boolean) as { label: string; value: string; href?: string }[]

  return (
    <section className="relative min-h-[90vh] overflow-hidden flex flex-col justify-center">
      <Helmet>
        <title>{data?.seo_title || `${tr.nav.contacts} — INK Architects`}</title>
        {data?.seo_description && <meta name="description" content={data.seo_description} />}
        {data?.og_image && <meta property="og:image" content={data.og_image} />}
      </Helmet>

      {data?.background_video && (
        <video
          className="absolute inset-0 h-full w-full object-cover"
          src={data.background_video}
          autoPlay
          muted
          loop
          playsInline
        />
      )}
      <div className="absolute inset-0 bg-ink-950/50" />

      <div className="relative mx-auto flex w-full max-w-[84rem] flex-1 flex-col justify-center px-6 pt-32 pb-12">
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
                  <span className="block text-white transition-colors group-hover:text-accent">{s.value}</span>
                  <span className="mt-1 block text-xs text-white/40">{s.label}</span>
                </span>
              </a>
            </FadeIn>
          ))}
        </div>

        {data?.career_heading && (
          <div className="mt-10 max-w-xl border-t border-line pt-8">
            {data.career_label && (
              <FadeIn delay={0.1}>
                <p className="text-xs uppercase tracking-[0.2em] text-white/40">{data.career_label}</p>
              </FadeIn>
            )}
            <FadeIn delay={0.18}>
              <h1 className="mt-3 whitespace-pre-line font-serif text-4xl text-white md:text-5xl">
                {data.career_heading}
              </h1>
            </FadeIn>
            {data.career_text && (
              <FadeIn delay={0.26}>
                <p className="mt-5 text-white/60">{data.career_text}</p>
              </FadeIn>
            )}
            {data.career_cta_label && (
              <FadeIn delay={0.34}>
                <a
                  href={data.career_cta_url ?? `mailto:${data.email}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-8 inline-flex items-center gap-2 border border-white/30 px-6 py-3 text-sm text-white transition-colors hover:border-white hover:bg-white hover:text-ink-950"
                >
                  {data.career_cta_label} <span aria-hidden>→</span>
                </a>
              </FadeIn>
            )}
          </div>
        )}
      </div>

      {(data?.address || data?.phone) && (
        <div className="relative border-t border-line bg-ink-950 px-6 py-8 text-sm text-white/50">
          <div className="mx-auto flex max-w-[84rem] flex-wrap gap-x-10 gap-y-2">
            {data?.address && <p>{data.address}</p>}
            {data?.phone && <p>{data.phone}</p>}
            {data?.whatsapp && <p>WhatsApp: {data.whatsapp}</p>}
          </div>
        </div>
      )}
    </section>
  )
}
