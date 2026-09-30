import axios from 'axios'
import type { Locale } from '../lib/locale'
import { api } from './client'

// In-memory cache to avoid duplicate requests from StrictMode / re-renders
const pageCache = new Map<string, Promise<unknown>>()

export function getPageContent<T = Record<string, unknown>>(
  locale: Locale,
  key: string,
): Promise<T> {
  const cacheKey = `${locale}:${key}`
  if (pageCache.has(cacheKey)) {
    return pageCache.get(cacheKey) as Promise<T>
  }
  const req = api
    .get(`/api/${locale}/${key}`)
    .then((res) => res.data.data as T)
    .catch((err) => {
      pageCache.delete(cacheKey) // evict on error so retry is possible
      if (axios.isAxiosError(err) && err.response?.status === 404) {
        return {} as T
      }
      throw err
    })
  pageCache.set(cacheKey, req)
  return req
}

export interface Paginated<T> {
  data: T[]
  meta: { current_page: number; last_page: number; total: number }
}

export interface ProjectListItem {
  id: number
  title: string
  slug: string
  category: string
  excerpt: string | null
  location: string | null
  year: number | null
  cover_image: string | null
}

export interface ProjectDetail extends ProjectListItem {
  body: string | null
  cover_focus?: 'center' | 'left' | 'right' | 'top' | 'bottom'
  site_area: string | null
  total_area: string | null
  status: string | null
  gallery: string[]
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const projectsCache = new Map<string, Promise<Paginated<ProjectListItem>>>()
const projectCache = new Map<string, Promise<ProjectDetail>>()

export function getProjects(
  locale: Locale,
  params: { category?: string; page?: number; per_page?: number } = {},
): Promise<Paginated<ProjectListItem>> {
  const key = `${locale}:${JSON.stringify(params)}`
  if (projectsCache.has(key)) return projectsCache.get(key)!
  const req = api
    .get(`/api/${locale}/projects`, { params })
    .then((r) => r.data)
    .catch((e) => { projectsCache.delete(key); throw e })
  projectsCache.set(key, req)
  return req
}

export function getProject(locale: Locale, slug: string): Promise<ProjectDetail> {
  const key = `${locale}:${slug}`
  if (projectCache.has(key)) return projectCache.get(key)!
  const req = api
    .get(`/api/${locale}/projects/${slug}`)
    .then((r) => r.data.data)
    .catch((e) => { projectCache.delete(key); throw e })
  projectCache.set(key, req)
  return req
}

export interface NewsListItem {
  id: number
  title: string
  slug: string
  excerpt: string | null
  cover_image: string | null
  published_at: string | null
}

export interface NewsDetail extends NewsListItem {
  body: string | null
}

const newsCache = new Map<string, Promise<Paginated<NewsListItem>>>()
const newsItemCache = new Map<string, Promise<NewsDetail>>()

export function getNews(
  locale: Locale,
  params: { page?: number; per_page?: number } = {},
): Promise<Paginated<NewsListItem>> {
  const key = `${locale}:${JSON.stringify(params)}`
  if (newsCache.has(key)) return newsCache.get(key)!
  const req = api
    .get(`/api/${locale}/news`, { params })
    .then((r) => r.data)
    .catch((e) => { newsCache.delete(key); throw e })
  newsCache.set(key, req)
  return req
}

export function getNewsItem(locale: Locale, slug: string): Promise<NewsDetail> {
  const key = `${locale}:${slug}`
  if (newsItemCache.has(key)) return newsItemCache.get(key)!
  const req = api
    .get(`/api/${locale}/news/${slug}`)
    .then((r) => r.data.data)
    .catch((e) => { newsItemCache.delete(key); throw e })
  newsItemCache.set(key, req)
  return req
}
