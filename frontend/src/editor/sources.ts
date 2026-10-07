import type { Component, Editor } from 'grapesjs'
import { readSource, type ContentSources } from '../lib/contentSources'

function sourceComponents(editor: Editor): Component[] {
  return editor.getWrapper()?.find('[data-src]') ?? []
}

function targetOf(component: Component): string {
  return component.getAttributes()['data-src'] ?? ''
}

function escapeText(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

export function fillEditorSources(editor: Editor, sources: ContentSources) {
  for (const component of sourceComponents(editor)) {
    const value = readSource(sources, targetOf(component))
    if (value !== null && component.getEl()?.textContent !== value) component.components(escapeText(value))
  }
}

export function collectSourceChanges(editor: Editor, sources: ContentSources): { key: string; field: string; value: string }[] {
  const changes: { key: string; field: string; value: string }[] = []
  for (const component of sourceComponents(editor)) {
    const target = targetOf(component)
    const [key, field] = target.split(':')
    if (!key || !field) continue
    const text = component.getEl()?.textContent ?? ''
    if (text.trim() === (readSource(sources, target) ?? '').trim()) continue
    changes.push({ key, field, value: text })
  }
  return changes
}

export function applySourceChanges(sources: ContentSources, changes: { key: string; field: string; value: string }[]) {
  for (const change of changes) setSource(sources, `${change.key}:${change.field}`, change.value)
}

function setSource(sources: ContentSources, target: string, value: string) {
  const [key, path = ''] = target.split(':')
  const parts = path.split('.').filter(Boolean)
  let node = sources[key] as Record<string, unknown> | undefined
  if (!node) return
  for (const part of parts.slice(0, -1)) {
    if (node[part] == null || typeof node[part] !== 'object') return
    node = node[part] as Record<string, unknown>
  }
  node[parts[parts.length - 1]] = value
}
