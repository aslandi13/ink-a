import { getNews, getNewsItem, getProject, getProjects } from '../api/content'
import { getLocalizedPage, getNewsTemplate, getProjectTemplate } from '../api/pages'
import { loadAboutData } from '../sections/about'
import { loadApproachData } from '../sections/approach'
import { loadContactsData } from '../sections/contacts'
import { loadHomeData } from '../sections/home'
import { loadLegalData } from '../sections/legal'
import type { Locale } from './locale'

const LOADERS: Record<string, (locale: Locale) => Promise<unknown>[]> = {
  '': (locale) => [loadHomeData(locale), getLocalizedPage(locale, 'home')],
  projects: (locale) => [getProjects(locale, { page: 1 }), getLocalizedPage(locale, 'projects')],
  approach: (locale) => [loadApproachData(locale), getLocalizedPage(locale, 'approach')],
  about: (locale) => [loadAboutData(locale), getLocalizedPage(locale, 'about')],
  news: (locale) => [getNews(locale, { page: 1 }), getLocalizedPage(locale, 'news')],
  contacts: (locale) => [loadContactsData(locale), getLocalizedPage(locale, 'contacts')],
  legal: (locale) => [loadLegalData(locale), getLocalizedPage(locale, 'legal')],
}

function quietly(requests: Promise<unknown>[]) {
  requests.forEach((request) => request.catch(() => undefined))
}

export function prefetchPage(locale: Locale, page: string) {
  const loader = LOADERS[page]
  quietly(loader ? loader(locale) : [getLocalizedPage(locale, page)])
}

export function prefetchProject(locale: Locale, project: { slug: string; category?: string | null }) {
  quietly([getProject(locale, project.slug, project.category ?? undefined), getProjectTemplate(locale, project.category ?? '')])
}

export function prefetchNews(locale: Locale, slug: string) {
  quietly([getNewsItem(locale, slug), getNewsTemplate(locale)])
}

export function prefetchAll(locale: Locale) {
  const pages = Object.keys(LOADERS)
  const run = () => pages.forEach((page) => prefetchPage(locale, page))
  const idle = (window as Window & { requestIdleCallback?: (cb: () => void) => void }).requestIdleCallback
  if (idle) idle(run)
  else setTimeout(run, 1500)
}
