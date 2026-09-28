import { useParams } from 'react-router-dom'
import { DEFAULT_LOCALE, isLocale, type Locale } from './locale'

export function useLocale(): Locale {
  const { locale } = useParams()
  return isLocale(locale) ? locale : DEFAULT_LOCALE
}
