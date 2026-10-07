import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useSearchParams } from 'react-router-dom'
import { getDraftPage, getEditorToken, getLocalizedPage, type PageLayout } from '../api/pages'
import ErrorMessage from '../components/ErrorMessage'
import PageRenderer from '../components/PageRenderer'
import { CONTACTS_EXPLODERS } from '../editor/explode'
import { contentSources } from '../lib/contentSources'
import { upgradeExploded, type Exploders } from '../lib/upgradeExploded'
import { t } from '../lib/i18n'
import { useRefresh } from '../lib/refresh'
import { useLocale } from '../lib/useLocale'
import { CONTACTS_BLOCKS, DEFAULT_CONTACTS_LAYOUT, loadContactsData, type ContactsData } from '../sections/contacts'

export default function Contacts() {
  const locale = useLocale()
  const tr = t(locale)
  const [searchParams] = useSearchParams()
  const preview = searchParams.has('preview') && !!getEditorToken()
  const [data, setData] = useState<ContactsData | null>(null)
  const [layout, setLayout] = useState<PageLayout | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const refresh = useRefresh()
  useEffect(() => {
    if (!refresh.silent()) setLoading(true)
    setError(false)
    const layoutRequest = preview
      ? getDraftPage('contacts', locale).then((res) => res.draft)
      : getLocalizedPage(locale, 'contacts')
    Promise.all([loadContactsData(locale), layoutRequest.catch(() => null)])
      .then(([contacts, pageLayout]) => {
        setData(contacts)
        setLayout(pageLayout)
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [locale, preview, refresh.key])

  if (loading) {
    return <section className="min-h-[60vh]" />
  }

  if (error || !data) {
    return <ErrorMessage>{tr.ui.error}</ErrorMessage>
  }

  const seo = data

  return (
    <>
      <Helmet>
        <title>{seo?.seo_title || `${tr.nav.contacts} — INK Architects`}</title>
        {seo?.seo_description && <meta name="description" content={seo.seo_description} />}
        {seo?.og_image && <meta property="og:image" content={seo.og_image} />}
      </Helmet>

      {preview && (
        <div className="fixed bottom-4 left-4 z-50 rounded-full bg-accent px-4 py-2 text-xs font-medium text-ink-950">
          Предпросмотр черновика
        </div>
      )}

      <PageRenderer
        html={layout?.html || DEFAULT_CONTACTS_LAYOUT}
        css={layout?.css ?? ''}
        translations={layout?.translations}
        data={data}
        sources={contentSources('contacts', data)}
        prepare={(body) => upgradeExploded(body, CONTACTS_EXPLODERS as Exploders, data, locale)}
        locale={locale}
        blocks={CONTACTS_BLOCKS}
      />
    </>
  )
}
