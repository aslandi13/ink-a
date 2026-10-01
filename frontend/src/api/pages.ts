import axios from 'axios'
import type { ProjectData } from 'grapesjs'
import { api } from './client'

export interface PageLayout {
  html: string
  css: string
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

export function getPublishedPage(slug: string): Promise<PageLayout | null> {
  return api
    .get(`/api/pages/${slug}`)
    .then((res) => res.data.data as PageLayout)
    .catch((err) => {
      if (axios.isAxiosError(err) && err.response?.status === 404) return null
      throw err
    })
}

export function editorLogin(email: string, password: string): Promise<string> {
  return api.post('/api/editor/login', { email, password }).then((res) => {
    setEditorToken(res.data.token)
    return res.data.token as string
  })
}

export function getDraftPage(slug: string): Promise<{ draft: PageDraft | null; published_at: string | null }> {
  return api.get(`/api/editor/pages/${slug}`, { headers: authHeaders() }).then((res) => res.data.data)
}

export function saveDraftPage(slug: string, draft: PageDraft): Promise<void> {
  return api.put(`/api/editor/pages/${slug}`, draft, { headers: authHeaders() }).then(() => undefined)
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
