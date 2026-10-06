import axios from 'axios'
import type { ProjectData } from 'grapesjs'
import { api } from './client'

export interface PageLayout {
  html: string
  css: string
  translations?: Record<string, string>
}

export interface LocalizedPage extends PageLayout {
  title: string | null
  seo_title: string | null
  seo_description: string | null
}

export interface MenuPage {
  slug: string
  title: string
}

export interface PageDraft extends PageLayout {
  project: ProjectData
}

const TOKEN_KEY = 'ink-editor-token'

export function getEditorToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function setEditorToken(token: string | null) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token)
    else localStorage.removeItem(TOKEN_KEY)
  } catch {
    return
  }
}

function authHeaders(): Record<string, string> {
  const token = getEditorToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

const publicCache = new Map<string, Promise<unknown>>()

function cached<T>(key: string, load: () => Promise<T>): Promise<T> {
  const hit = publicCache.get(key)
  if (hit) return hit as Promise<T>
  const request = load().catch((err) => {
    publicCache.delete(key)
    throw err
  })
  publicCache.set(key, request)
  return request
}

export function getLocalizedPage(locale: string, slug: string): Promise<LocalizedPage | null> {
  return cached(`page:${locale}:${slug}`, () =>
    api
      .get(`/api/${locale}/pages/${slug}`)
      .then((res) => res.data.data as LocalizedPage)
      .catch((err) => {
        if (axios.isAxiosError(err) && err.response?.status === 404) return null
        throw err
      }),
  )
}

export function getMenuPages(locale: string): Promise<MenuPage[]> {
  return api
    .get(`/api/${locale}/menu-pages`)
    .then((res) => res.data.data as MenuPage[])
    .catch(() => [])
}

export function editorLogin(email: string, password: string): Promise<string> {
  return api.post('/api/editor/login', { email, password }).then((res) => {
    setEditorToken(res.data.token)
    return res.data.token as string
  })
}

export interface DraftResponse {
  draft: PageDraft | null
  title: string
  published_at: string | null
  has_unpublished: boolean
}

export function getDraftPage(slug: string, locale = 'ru'): Promise<DraftResponse> {
  return api.get(`/api/editor/pages/${slug}`, { params: { locale }, headers: authHeaders() }).then((res) => res.data.data)
}

export function saveDraftPage(slug: string, locale: string, draft: PageDraft): Promise<void> {
  return api.put(`/api/editor/pages/${slug}`, draft, { params: { locale }, headers: authHeaders() }).then(() => undefined)
}

export function saveSectionContent(locale: string, changes: { key: string; field: string; value: string | null }[]): Promise<void> {
  return api.patch('/api/editor/content', { locale, changes }, { headers: authHeaders() }).then(() => undefined)
}

export function publishPage(slug: string): Promise<string> {
  return api.post(`/api/editor/pages/${slug}/publish`, {}, { headers: authHeaders() }).then((res) => res.data.data.published_at)
}

export function editorUploadUrl(): string {
  return `${api.defaults.baseURL ?? ''}/api/editor/assets`
}

export function editorAuthHeaders(): Record<string, string> {
  return authHeaders()
}

export function getProjectTemplate(locale: string, category: string): Promise<PageLayout | null> {
  return cached(`project-template:${locale}:${category}`, () =>
    api
      .get(`/api/${locale}/project-template`, { params: { category } })
      .then((res) => res.data.data as PageLayout)
      .catch(() => null),
  )
}

export function getNewsTemplate(locale: string): Promise<PageLayout | null> {
  return cached(`news-template:${locale}`, () =>
    api
      .get(`/api/${locale}/news-template`)
      .then((res) => res.data.data as PageLayout)
      .catch(() => null),
  )
}
