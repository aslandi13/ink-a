import type { Component, Editor, ToolbarButtonProps } from 'grapesjs'
import { Fragment, useSyncExternalStore, type ReactNode } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import type { Locale } from '../lib/locale'
import { BASIC_BLOCKS } from './basicBlocks'
import type { ContentStore } from './contentStore'

const CANVAS_CSS = `
  body { background-color: #050a12 !important; color: rgb(255 255 255 / 0.92); }
  [data-block] > * { pointer-events: none; }
  [data-block] [style*="opacity: 0"] { opacity: 1 !important; transform: none !important; }
  [data-block]:empty { min-height: 120px; }
  [data-block] [data-edit], [data-block] [data-edit-image], [data-block] [data-interactive] { pointer-events: auto; }
  [data-block] [data-edit]:hover { outline: 1px dashed rgba(158, 158, 255, 0.8); outline-offset: 4px; cursor: text; }
  [data-block] [data-edit-image]:hover { outline: 2px dashed rgba(158, 158, 255, 0.9); outline-offset: -2px; cursor: pointer; }
  [data-block] [contenteditable] { outline: 2px solid #9e9eff !important; outline-offset: 4px; cursor: text; }
`

export interface InkBlock {
  id: string
  label: string
  settings?: { name: string; label: string; options: string[][] }[]
  render: (props: { data: never; locale: Locale; settings?: Record<string, string> }) => ReactNode
}

function readSettings(attributes: Record<string, string>): Record<string, string> {
  const settings: Record<string, string> = {}
  for (const [name, value] of Object.entries(attributes)) {
    if (name.startsWith('data-s-') && value) settings[name.slice(7)] = value
  }
  return settings
}

function BlockPreview({
  id,
  store,
  locale,
  blocks,
  settings,
}: {
  id: string
  store: ContentStore
  locale: Locale
  blocks: InkBlock[]
  settings: Record<string, string>
}) {
  const { data, version } = useSyncExternalStore(store.subscribe, store.getSnapshot)
  const block = blocks.find((b) => b.id === id)
  if (!block) return <div style={{ padding: 24, color: '#fff' }}>Неизвестный блок: {id}</div>
  return <Fragment key={version}>{block.render({ data: data as never, locale, settings })}</Fragment>
}

function parseTarget(value: string): [string, string] {
  const index = value.indexOf(':')
  return [value.slice(0, index), value.slice(index + 1)]
}

export interface InkFields {
  apply: (el: HTMLElement, data: never, locale: Locale) => void
  options: { id: string; label: string }[]
  blocks: { id: string; label: string; content: string }[]
  category: string
}

interface Options {
  store: ContentStore
  locale: Locale
  blocks: InkBlock[]
  exploders?: Record<string, (data: never, locale: Locale) => string>
  fields?: InkFields
  onContentChange: () => void
}

export function inkPlugin({ store, locale, blocks, exploders = {}, fields, onContentChange }: Options) {
  return (editor: Editor) => {
    const roots = new WeakMap<HTMLElement, Root>()

    const mount = (el: HTMLElement, id: string, settings: Record<string, string>) => {
      let root = roots.get(el)
      if (!root) {
        root = createRoot(el)
        roots.set(el, root)
      }
      root.render(
        <MemoryRouter initialEntries={[`/${locale}`]}>
          <Routes>
            <Route path=":locale/*" element={<BlockPreview id={id} store={store} locale={locale} blocks={blocks} settings={settings} />} />
          </Routes>
        </MemoryRouter>,
      )
    }

    editor.DomComponents.addType('ink-block', {
      isComponent: (el) =>
        el instanceof HTMLElement && el.tagName === 'SECTION' && el.dataset.block ? { type: 'ink-block' } : undefined,
      model: {
        defaults: {
          tagName: 'section',
          droppable: false,
          editable: false,
          components: [],
          traits: [],
        },
        init(this: Component) {
          const id = this.getAttributes()['data-block']
          const block = blocks.find((b) => b.id === id)
          this.set('name', `Секция: ${block?.label ?? id}`)
          if (block?.settings?.length) {
            this.setTraits(
              block.settings.map((setting) => ({
                type: 'select',
                name: `data-s-${setting.name}`,
                label: setting.label,
                default: setting.options[0][0],
                options: setting.options.map(([value, label]) => ({ id: value, label })),
              })),
            )
          }
          this.on('change:attributes', () => {
            const el = this.getEl()
            if (el) mount(el, id, readSettings(this.getAttributes()))
          })
        },
      },
      view: {
        onRender({ el, model }) {
          const attributes = model.getAttributes()
          mount(el as HTMLElement, attributes['data-block'], readSettings(attributes))
        },
      },
    })

    if (fields) {
      editor.DomComponents.addType('ink-field', {
        isComponent: (el) => (el?.getAttribute?.('data-field') ? { type: 'ink-field' } : undefined),
        model: {
          defaults: {
            droppable: false,
            editable: false,
            components: [],
            traits: [{ type: 'select', name: 'data-field', label: 'Поле', options: fields.options.map((o) => ({ id: o.id, label: o.label })) }],
          },
          init(this: Component) {
            const label = fields.options.find((o) => o.id === this.getAttributes()['data-field'])?.label
            if (label && !this.get('name')) this.set('name', `Поле: ${label}`)
            this.on('change:attributes:data-field', () => this.view?.render())
          },
        },
        view: {
          onRender({ el }) {
            const node = el as HTMLElement
            fields.apply(node, store.getSnapshot().data as never, locale)
            if (node.tagName !== 'IMG' && !node.textContent?.trim() && !node.children.length) {
              node.textContent = '— пусто в этом проекте —'
              node.style.opacity = '0.4'
            }
          },
        },
      })
      fields.blocks.forEach((block) => {
        editor.Blocks.add(block.id, { label: block.label, category: fields.category, content: block.content })
      })
    }

    editor.on('component:remove', (component: Component) => {
      const el = component.getEl()
      const root = el ? roots.get(el) : undefined
      if (root) setTimeout(() => root.unmount())
    })

    const EXPLODE_ICON =
      '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>'

    editor.Commands.add('ink-explode', {
      run(ed: Editor) {
        const component = ed.getSelected()
        if (!component || component.get('type') !== 'ink-block') return
        const id = component.getAttributes()['data-block']
        const exploder = exploders[id]
        if (!exploder) return
        if (
          !window.confirm(
            'Разобрать секцию на отдельные элементы?\n\nЕё тексты и фото на этом языке будут редактироваться только здесь, в редакторе, без связи с формой в админке. Слайдеры заменятся одним видео или фото, настройки секции сбросятся.',
          )
        )
          return
        const result = component.replaceWith(exploder(store.getSnapshot().data as never, locale))
        const created = Array.isArray(result) ? result[0] : result
        if (created) ed.select(created)
        onContentChange()
      },
    })

    editor.on('component:selected', (component: Component) => {
      if (component.get('type') !== 'ink-block' || !exploders[component.getAttributes()['data-block']]) return
      const toolbar = (component.get('toolbar') ?? []) as ToolbarButtonProps[]
      if (toolbar.some((item) => item.command === 'ink-explode')) return
      component.set('toolbar', [
        { label: EXPLODE_ICON, command: 'ink-explode', attributes: { title: 'Разобрать секцию на элементы' } },
        ...toolbar,
      ])
    })

    blocks.forEach((block) => {
      editor.Blocks.add(`section-${block.id}`, {
        label: block.label,
        category: 'Секции сайта',
        content: { type: 'ink-block', attributes: { 'data-block': block.id } },
      })
    })

    BASIC_BLOCKS.forEach((block) => {
      editor.Blocks.add(block.id, { label: block.label, category: 'Элементы', content: block.content })
    })

    let commitActiveEdit: (() => void) | null = null
    editor.Commands.add('ink-commit-edit', { run: () => commitActiveEdit?.() })

    const startTextEdit = (el: HTMLElement) => {
      if (el.isContentEditable) return
      commitActiveEdit?.()
      const doc = el.ownerDocument
      const [key, field] = parseTarget(el.dataset.edit ?? '')
      const original = el.textContent ?? ''
      let done = false
      el.setAttribute('contenteditable', 'plaintext-only')
      el.focus()
      const selection = doc.getSelection()
      selection?.selectAllChildren(el)
      selection?.collapseToEnd()

      const stop = (e: Event) => e.stopPropagation()
      const onKeyDown = (e: KeyboardEvent) => {
        e.stopPropagation()
        if (e.key === 'Escape') {
          el.textContent = original
          finish()
        } else if (e.key === 'Enter') {
          e.preventDefault()
          const range = doc.getSelection()?.getRangeAt(0)
          if (!range) return
          range.deleteContents()
          const br = doc.createTextNode('\n')
          range.insertNode(br)
          range.setStartAfter(br)
          range.collapse(true)
          const sel = doc.getSelection()
          sel?.removeAllRanges()
          sel?.addRange(range)
        }
      }
      const onOutside = (e: MouseEvent) => {
        if (!el.contains(e.target as Node)) finish()
      }
      const finish = () => {
        if (done) return
        done = true
        commitActiveEdit = null
        el.removeEventListener('keydown', onKeyDown)
        el.removeEventListener('keyup', stop)
        el.removeEventListener('keypress', stop)
        el.removeEventListener('paste', stop)
        el.removeEventListener('blur', finish)
        doc.removeEventListener('mousedown', onOutside, true)
        el.removeAttribute('contenteditable')
        const value = (el.textContent ?? '').replace(/\u00a0/g, ' ').replace(/\s+$/, '')
        if (value !== original.replace(/\s+$/, '')) {
          store.edit(key, field, value)
          onContentChange()
        }
      }

      commitActiveEdit = finish
      el.addEventListener('keydown', onKeyDown)
      el.addEventListener('keyup', stop)
      el.addEventListener('keypress', stop)
      el.addEventListener('paste', stop)
      el.addEventListener('blur', finish)
      doc.addEventListener('mousedown', onOutside, true)
    }

    const startImageEdit = (el: HTMLElement) => {
      const [key, field] = parseTarget(el.dataset.editImage ?? '')
      editor.AssetManager.open({
        types: ['image'],
        select(asset, complete) {
          store.edit(key, field, asset.getSrc())
          onContentChange()
          if (complete !== false) editor.AssetManager.close()
        },
      })
    }

    const bindInlineEditing = (doc: Document) => {
      if (doc.body.dataset.inkInline) return
      doc.body.dataset.inkInline = '1'
      doc.addEventListener(
        'dblclick',
        (e) => {
          const target = (e.target as HTMLElement | null)?.closest?.<HTMLElement>('[data-edit], [data-edit-image]')
          if (!target || !target.closest('[data-block]')) return
          e.preventDefault()
          e.stopPropagation()
          if (target.dataset.editImage) startImageEdit(target)
          else startTextEdit(target)
        },
        true,
      )
    }

    const injectStyles = (doc: Document) => {
      if (doc.head.querySelector('[data-ink-styles]')) return
      document.querySelectorAll('style, link[rel="stylesheet"]').forEach((node) => {
        const source = node instanceof HTMLLinkElement ? node.href : node.getAttribute('data-vite-dev-id') ?? ''
        if (/grapes|EditorPage|editor\.css/i.test(source)) return
        doc.head.appendChild(node.cloneNode(true))
      })
      const style = doc.createElement('style')
      style.setAttribute('data-ink-styles', '')
      style.textContent = CANVAS_CSS
      doc.head.appendChild(style)
    }

    const prepareCanvas = (doc: Document | null | undefined) => {
      if (!doc) return
      injectStyles(doc)
      bindInlineEditing(doc)
    }

    editor.on('load', () => prepareCanvas(editor.Canvas.getDocument()))
    editor.on('canvas:frame:load', ({ window: frameWindow }: { window: Window }) => prepareCanvas(frameWindow.document))
  }
}
