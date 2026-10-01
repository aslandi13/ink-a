import type { HomeData } from '../sections/home'

export interface ContentChange {
  key: string
  field: string
  value: string | null
}

const KEY_TO_PROP: Record<string, keyof HomeData> = {
  'home.hero': 'hero',
  'home.about': 'about',
  'home.offices': 'offices',
  'home.key_projects': 'keyProjects',
}

function setPath(data: HomeData, key: string, field: string, value: string | null): HomeData {
  const prop = KEY_TO_PROP[key]
  if (!prop) return data
  const next = structuredClone(data)
  const segments = field.split('.')
  let cursor = next[prop] as Record<string, unknown>
  for (const segment of segments.slice(0, -1)) {
    if (cursor[segment] == null || typeof cursor[segment] !== 'object') cursor[segment] = {}
    cursor = cursor[segment] as Record<string, unknown>
  }
  cursor[segments[segments.length - 1]] = value
  return next
}

export interface ContentSnapshot {
  data: HomeData
  version: number
}

export function createContentStore(initial: HomeData) {
  let snapshot: ContentSnapshot = { data: initial, version: 0 }
  const listeners = new Set<() => void>()
  const pending = new Map<string, ContentChange>()

  const emit = () => listeners.forEach((listener) => listener())

  return {
    getSnapshot: () => snapshot,
    subscribe(listener: () => void) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    edit(key: string, field: string, value: string | null) {
      snapshot = { data: setPath(snapshot.data, key, field, value), version: snapshot.version + 1 }
      pending.set(`${key}:${field}`, { key, field, value })
      emit()
    },
    takePending(): ContentChange[] {
      const changes = [...pending.values()]
      pending.clear()
      return changes
    },
    restorePending(changes: ContentChange[]) {
      for (const change of changes) {
        const id = `${change.key}:${change.field}`
        if (!pending.has(id)) pending.set(id, change)
      }
    },
    hasPending: () => pending.size > 0,
  }
}

export type ContentStore = ReturnType<typeof createContentStore>
