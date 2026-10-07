import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getPageContent } from '../api/content'
import { t } from '../lib/i18n'
import { useLocale } from '../lib/useLocale'

interface SettingsData {
  instagram?: string
  facebook?: string
  linkedin?: string
  nav_home?: string
  nav_projects?: string
  nav_approach?: string
  nav_about?: string
  nav_news?: string
  nav_contacts?: string
}

interface ContactsData {
  email?: string
}

const IgIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <circle cx="12" cy="12" r="4"/>
    <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none"/>
  </svg>
)

const FbIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
)

const LiIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
    <rect x="2" y="9" width="4" height="12"/>
    <circle cx="4" cy="4" r="2"/>
  </svg>
)

const SOCIAL_ICONS: Record<string, React.FC> = {
  Instagram: IgIcon,
  Facebook: FbIcon,
  LinkedIn: LiIcon,
}

export default function Footer() {
  const locale = useLocale()
  const tr = t(locale)
  const [settings, setSettings] = useState<SettingsData>({})
  const [contacts, setContacts] = useState<ContactsData>({})

  useEffect(() => {
    getPageContent<SettingsData>(locale, 'settings').then(setSettings).catch(() => {})
    getPageContent<ContactsData>(locale, 'contacts').then(setContacts).catch(() => {})
  }, [locale])

  const nav = {
    home:     settings.nav_home     || tr.nav.home,
    projects: settings.nav_projects || tr.nav.projects,
    approach: settings.nav_approach || tr.nav.approach,
    about:    settings.nav_about    || tr.nav.about,
    news:     settings.nav_news     || tr.nav.news,
    contacts: settings.nav_contacts || tr.nav.contacts,
  }

  const columns = [
    [
      { to: '',         label: nav.home },
      { to: 'projects', label: nav.projects },
      { to: 'approach', label: nav.approach },
    ],
    [
      { to: 'about',    label: nav.about },
      { to: 'news',     label: nav.news },
      { to: 'contacts', label: nav.contacts },
    ],
  ]

  const socials = [
    settings.instagram && { label: 'Instagram', href: settings.instagram },
    settings.facebook  && { label: 'Facebook',  href: settings.facebook },
    settings.linkedin  && { label: 'LinkedIn',   href: settings.linkedin },
  ].filter(Boolean) as { label: string; href: string }[]

  return (
    <footer className="border-t border-line">
      {/* Main footer row */}
      <div className="mx-auto grid max-w-[84rem] grid-cols-[1fr_1fr_auto] gap-10 px-6 py-16 text-sm text-white/60">
        {/* Nav columns */}
        {columns.map((col, i) => (
          <ul key={i} className="space-y-3">
            {col.map(({ to, label }) => (
              <li key={to}>
                <Link to={`/${locale}/${to}`} className="transition-colors hover:text-white">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        ))}

        {/* Right: email + socials */}
        <div className="space-y-4">
          {contacts.email && (
            <p>
              {tr.footer.email}:{' '}
              <a href={`mailto:${contacts.email}`} className="transition-colors hover:text-white">
                {contacts.email}
              </a>
            </p>
          )}
          {!!socials.length && (
            <div>
              <p className="mb-3 text-sm text-white/60">{tr.footer.socials}</p>
              <div className="flex gap-3">
                {socials.map((s) => {
                  const Icon = SOCIAL_ICONS[s.label]
                  return (
                    <a
                      key={s.label}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={s.label}
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-white/30 text-white/70 transition-colors hover:border-white hover:text-white"
                    >
                      {Icon ? <Icon /> : s.label[0]}
                    </a>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom bar — NO language switcher */}
      <div className="border-t border-line px-6 py-5">
        <div className="mx-auto flex max-w-[84rem] flex-wrap items-center gap-2 text-xs text-white/40">
          <span>© {new Date().getFullYear()} INK Architects. {tr.footer.rights}</span>
          <span className="text-white/20">|</span>
          <Link to={`/${locale}/legal`} className="underline underline-offset-2 transition-colors hover:text-white/70">
            {tr.legal.title}
          </Link>
        </div>
      </div>
    </footer>
  )
}
