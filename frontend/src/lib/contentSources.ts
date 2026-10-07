export type ContentSources = Record<string, unknown>

export function contentSources(page: string, data: unknown): ContentSources {
  const d = (data ?? {}) as Record<string, unknown>
  if (page === 'home') {
    return { 'home.hero': d.hero, 'home.about': d.about, 'home.offices': d.offices, 'home.key_projects': d.keyProjects }
  }
  if (page === 'contacts') return { contacts: d }
  if (page === 'legal') return { legal: d }
  return {}
}

export function readSource(sources: ContentSources, target: string): string | null {
  const [key, path = ''] = target.split(':')
  let value: unknown = sources[key]
  for (const part of path.split('.').filter(Boolean)) {
    if (value == null || typeof value !== 'object') return null
    value = (value as Record<string, unknown>)[part]
  }
  if (typeof value === 'number') return String(value)
  return typeof value === 'string' && value.trim() !== '' ? value : null
}

export function fillSources(root: ParentNode, sources: ContentSources) {
  root.querySelectorAll<HTMLElement>('[data-src]').forEach((el) => {
    const value = readSource(sources, el.dataset.src ?? '')
    if (value !== null) el.textContent = value
  })
}
