import type { Component, Editor } from 'grapesjs'

const TEXT_TYPES = new Set(['text', 'link'])

function isText(component: Component): boolean {
  return TEXT_TYPES.has(component.get('type') ?? '')
}

function insideText(component: Component): boolean {
  let parent = component.parent()
  while (parent) {
    if (isText(parent)) return true
    parent = parent.parent()
  }
  return false
}

function textComponents(editor: Editor): Component[] {
  return (editor.getWrapper()?.find('*') ?? []).filter((c) => isText(c) && !insideText(c))
}

function keyOf(component: Component): string {
  return component.getAttributes()['data-t'] ?? ''
}

export function ensureTextKeys(editor: Editor) {
  for (const component of textComponents(editor)) {
    if (!keyOf(component)) component.addAttributes({ 'data-t': `t${Math.random().toString(36).slice(2, 10)}` })
  }
}

export function applyTranslations(editor: Editor, translations: Record<string, string>): Map<string, string> {
  const originals = new Map<string, string>()
  for (const component of textComponents(editor)) {
    const key = keyOf(component)
    if (!key) continue
    originals.set(key, component.getInnerHTML())
    const value = translations[key]
    if (typeof value === 'string' && value.trim() !== '') component.components(value)
  }
  return originals
}

export function withBaseTexts<T>(editor: Editor, originals: Map<string, string>, read: () => T): { result: T; translations: Record<string, string> } {
  const translations: Record<string, string> = {}
  const restore: [Component, string][] = []
  for (const component of textComponents(editor)) {
    const key = keyOf(component)
    if (!key) continue
    const current = component.getInnerHTML()
    const original = originals.get(key)
    if (original === undefined || current === original) continue
    translations[key] = current
    restore.push([component, current])
    component.components(original)
  }
  const result = read()
  for (const [component, html] of restore) component.components(html)
  return { result, translations }
}
