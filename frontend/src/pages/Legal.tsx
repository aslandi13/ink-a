import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { getPageContent } from '../api/content'
import ErrorMessage from '../components/ErrorMessage'
import { t } from '../lib/i18n'
import { sanitise } from '../lib/sanitise'
import { useLocale } from '../lib/useLocale'

export default function Legal() {
  const locale = useLocale()
  const tr = t(locale)
  const [body, setBody] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    setLoading(true)
    setError(false)
    getPageContent<{ body?: string }>(locale, 'legal')
      .then((data) => setBody(data.body ?? ''))
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [locale])

  return (
    <section className="mx-auto max-w-4xl px-6 py-24">
      <Helmet>
        <title>{tr.legal.title} — INK Architects</title>
        <meta name="description" content={locale === 'ru' ? 'Юридическая информация, политика конфиденциальности и условия использования INK Architects.' : 'Legal information, privacy policy and terms of use for INK Architects.'} />
      </Helmet>

      <h1 className="text-3xl font-medium tracking-tight text-white">{tr.legal.title}</h1>

      {loading ? (
        <p className="mt-8 text-white/50">{tr.ui.loading}</p>
      ) : error ? (
        <ErrorMessage>{tr.ui.error}</ErrorMessage>
      ) : (
        <div
          className="prose prose-invert mt-10 max-w-none text-white/70"
          dangerouslySetInnerHTML={{ __html: sanitise(body) }}
        />
      )}
    </section>
  )
}
