
export interface ContentChange {
  key: string
  field: string
  value: string | null
}

const KEY_TO_PROP: Record<string, string> = {
  'home.hero': 'hero',
  'home.about': 'about',
  'home.offices': 'offices',
  'home.key_projects': 'keyProjects',
  approach: '',
  'about.history': 'history',
  'about.team': 'team',
  'about.founder': 'founder',
  contacts: '',
  legal: '',
}

function setPath<T>(data: T, key: string, field: string, value: string | null): T {
  const prop = KEY_TO_PROP[key]
  if (prop === undefined) return data
  const next = structuredClone(data) as Record<string, unknown>
  const segments = field.split('.')
  let cursor = (prop ? next[prop] : next) as Record<string, unknown>
  for (const segment of segments.slice(0, -1)) {
    if (cursor[segment] == null || typeof cursor[segment] !== 'object') cursor[segment] = {}
    cursor = cursor[segment] as Record<string, unknown>
  }
  cursor[segments[segments.length - 1]] = value
  return next as T
}

export interface ContentSnapshot<T = unknown> {
  data: T
  version: number
}

export function createContentStore<T>(initial: T) {
  let snapshot: ContentSnapshot<T> = { data: initial, version: 0 }
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

export type ContentStore<T = unknown> = ReturnType<typeof createContentStore<T>>
