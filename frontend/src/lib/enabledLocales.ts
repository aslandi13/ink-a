import { useSyncExternalStore } from 'react'
import { getPageContent } from '../api/content'
import { DEFAULT_LOCALE, isLocale, LOCALES, type Locale } from './locale'

let enabled: readonly Locale[] | null = null
const listeners = new Set<() => void>()

function load() {
  getPageContent<{ enabled_locales?: string[] }>(DEFAULT_LOCALE, 'settings')
    .then((data) => {
      const list = (data.enabled_locales ?? []).filter(isLocale)
      enabled = list.length ? LOCALES.filter((code) => code === DEFAULT_LOCALE || list.includes(code)) : LOCALES
    })
    .catch(() => {
      enabled = LOCALES
    })
    .finally(() => listeners.forEach((listener) => listener()))
}

load()

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useEnabledLocales(): readonly Locale[] | null {
  return useSyncExternalStore(subscribe, () => enabled)
}
