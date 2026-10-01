import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { getPageContent } from '../api/content'
import { t } from '../lib/i18n'
import { LOCALES } from '../lib/locale'
import { useLocale } from '../lib/useLocale'

interface SettingsData {
  logo?: string
  nav_home?: string
  nav_projects?: string
  nav_approach?: string
  nav_about?: string
  nav_news?: string
  nav_contacts?: string
}

export default function Header() {
  const locale = useLocale()
  const tr = t(locale)
  const location = useLocation()
  const navigate = useNavigate()
  const [settings, setSettings] = useState<SettingsData>({})
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  const isNewsDetail = /\/news\/[^/]+/.test(location.pathname)

  const nav = {
    home:     settings.nav_home     || tr.nav.home,
    projects: settings.nav_projects || tr.nav.projects,
    approach: settings.nav_approach || tr.nav.approach,
    about:    settings.nav_about    || tr.nav.about,
    news:     settings.nav_news     || tr.nav.news,
    contacts: settings.nav_contacts || tr.nav.contacts,
  }

  const links = [
    { to: '', label: nav.home },
    { to: 'projects', label: nav.projects },
    { to: 'approach', label: nav.approach },
    { to: 'about', label: nav.about },
    { to: 'news', label: nav.news },
    { to: 'contacts', label: nav.contacts },
  ]

  // Close menu on route change
  useEffect(() => { setOpen(false) }, [location.pathname])

  // Lock body scroll when menu open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  useEffect(() => {
    getPageContent<SettingsData>(locale, 'settings')
      .then(setSettings)
      .catch(() => {})
  }, [locale])

  useEffect(() => {
    function onScroll() {
      const threshold = isNewsDetail ? window.innerHeight * 0.5 : 20
      setScrolled(window.scrollY > threshold)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [isNewsDetail])

  const Logo = () => settings.logo ? (
    <img src={settings.logo} alt="INK Architects" className="h-10 w-auto aspect-[2.8] object-contain sm:h-12 md:h-14" />
  ) : (
    <span className="font-serif text-xl tracking-tight text-white">INK Architects</span>
  )

  return (
    <>
      <header className={`fixed inset-x-0 top-0 z-40 transition-all duration-500 ${scrolled && !open ? 'bg-ink-950' : 'bg-transparent'}`}>
        <div className="mx-auto flex max-w-[84rem] items-center justify-between px-6 py-5">
          <NavLink to={`/${locale}`} className="flex items-center">
            <Logo />
          </NavLink>

          {/* Desktop nav */}
          <nav className="hidden lg:flex">
            <ul className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-white/70 md:text-base">
              {links.map((link) => (
                <li key={link.to}>
                  <NavLink
                    to={`/${locale}/${link.to}`}
                    end={link.to === ''}
                    className={({ isActive }) =>
                      `border-b pb-1 transition-colors ${isActive ? 'border-white text-white' : 'border-transparent hover:text-white'}`
                    }
                  >
                    {link.label}
                  </NavLink>
                </li>
              ))}
              <li className="flex gap-3 border-l border-line pl-6 text-xs text-white/50 md:text-sm">
                {LOCALES.map((code) => (
                  <NavLink
                    key={code}
                    to={`/${code}`}
                    className={({ isActive }) =>
                      `uppercase transition-colors ${isActive || code === locale ? 'text-white' : 'hover:text-white'}`
                    }
                  >
                    {code}
                  </NavLink>
                ))}
              </li>
            </ul>
          </nav>

          <div className="flex items-center gap-5 lg:hidden">
            <button
              onClick={() => {
                const next = LOCALES[(LOCALES.indexOf(locale) + 1) % LOCALES.length]
                navigate(location.pathname.replace(new RegExp(`^/${locale}(?=/|$)`), `/${next}`) + location.search)
              }}
              className="relative z-50 text-base text-white transition-opacity hover:opacity-70"
              aria-label="Сменить язык"
            >
              {locale.charAt(0).toUpperCase() + locale.slice(1)}
            </button>
            <button
              onClick={() => setOpen((v) => !v)}
              className="relative z-50 flex h-8 w-8 flex-col items-center justify-center gap-1.5"
              aria-label={open ? 'Закрыть меню' : 'Открыть меню'}
            >
              <motion.span
                animate={open ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
                transition={{ duration: 0.3 }}
                className="block h-px w-6 bg-white origin-center"
              />
              <motion.span
                animate={open ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
                transition={{ duration: 0.2 }}
                className="block h-px w-6 bg-white origin-center"
              />
              <motion.span
                animate={open ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
                transition={{ duration: 0.3 }}
                className="block h-px w-6 bg-white origin-center"
              />
            </button>
          </div>
        </div>
      </header>

      {/* Fullscreen mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-30 flex flex-col bg-ink-950 px-8 pb-12 pt-28 lg:hidden"
          >
            <nav className="flex flex-1 flex-col justify-start">
              <ul className="space-y-2">
                {links.map((link, i) => (
                  <motion.li
                    key={link.to}
                    initial={{ opacity: 0, x: -24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.35, delay: i * 0.06 }}
                  >
                    <NavLink
                      to={`/${locale}/${link.to}`}
                      end={link.to === ''}
                      className={({ isActive }) =>
                        `block py-3 font-serif text-3xl tracking-tight transition-colors ${isActive ? 'text-white' : 'text-white/50 hover:text-white'}`
                      }
                    >
                      {link.label}
                    </NavLink>
                  </motion.li>
                ))}
              </ul>

              <div className="mt-10 flex gap-4 text-sm text-white/40">
                {LOCALES.map((code) => (
                  <NavLink
                    key={code}
                    to={`/${code}`}
                    className={`uppercase transition-colors ${code === locale ? 'text-white' : 'hover:text-white'}`}
                  >
                    {code}
                  </NavLink>
                ))}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
