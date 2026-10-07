import { useRef, useSyncExternalStore } from 'react'

const MIN_INTERVAL = 5000

let version = 0
let lastRun = Date.now()
const listeners = new Set<() => void>()
const clears = new Set<() => void>()

export function onRefresh(clear: () => void) {
  clears.add(clear)
}

function trigger() {
  if (document.visibilityState !== 'visible' || Date.now() - lastRun < MIN_INTERVAL) return
  lastRun = Date.now()
  clears.forEach((clear) => clear())
  version += 1
  listeners.forEach((listener) => listener())
}

if (typeof window !== 'undefined') {
  window.addEventListener('focus', trigger)
  document.addEventListener('visibilitychange', trigger)
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useRefresh() {
  const key = useSyncExternalStore(subscribe, () => version)
  const seen = useRef(key)
  return {
    key,
    silent: () => {
      const silent = seen.current !== key
      seen.current = key
      return silent
    },
  }
}
