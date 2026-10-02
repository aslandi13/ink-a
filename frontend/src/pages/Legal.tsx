import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useSearchParams } from 'react-router-dom'
import { getDraftPage, getEditorToken, getLocalizedPage, type PageLayout } from '../api/pages'
import ErrorMessage from '../components/ErrorMessage'
import PageRenderer from '../components/PageRenderer'
import { t } from '../lib/i18n'
import { useLocale } from '../lib/useLocale'
import { DEFAULT_LEGAL_LAYOUT, LEGAL_BLOCKS, loadLegalData, type LegalData } from '../sections/legal'

export default function Legal() {
  const locale = useLocale()
  const tr = t(locale)
  const [searchParams] = useSearchParams()
  const preview = searchParams.has('preview') && !!getEditorToken()
  const [data, setData] = useState<LegalData | null>(null)
  const [layout, setLayout] = useState<PageLayout | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    setLoading(true)
    setError(false)
    const layoutRequest = preview
      ? getDraftPage('legal', locale).then((res) => res.draft)
      : getLocalizedPage(locale, 'legal')
    Promise.all([loadLegalData(locale), layoutRequest.catch(() => null)])
      .then(([legal, pageLayout]) => {
        setData(legal)
        setLayout(pageLayout)
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [locale, preview])

  if (loading) {
    return <section className="flex min-h-[60vh] items-center justify-center text-white/40">{tr.ui.loading}</section>
  }

  if (error || !data) {
    return <ErrorMessage>{tr.ui.error}</ErrorMessage>
  }

  return (
    <>
      <Helmet>
        <title>{tr.legal.title} — INK Architects</title>
        <meta
          name="description"
          content={
            locale === 'ru'
              ? 'Юридическая информация, политика конфиденциальности и условия использования INK Architects.'
              : 'Legal information, privacy policy and terms of use for INK Architects.'
          }
        />
      </Helmet>

      {preview && (
        <div className="fixed bottom-4 left-4 z-50 rounded-full bg-accent px-4 py-2 text-xs font-medium text-ink-950">
          Предпросмотр черновика
        </div>
      )}

      <PageRenderer
        html={layout?.html || DEFAULT_LEGAL_LAYOUT}
        css={layout?.css ?? ''}
        translations={layout?.translations}
        data={data}
        locale={locale}
        blocks={LEGAL_BLOCKS}
      />
    </>
  )
}
