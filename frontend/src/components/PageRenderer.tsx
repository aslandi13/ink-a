import { useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import type { Locale } from '../lib/locale'
import { fillSources, type ContentSources } from '../lib/contentSources'
import { sanitiseLayout } from '../lib/sanitise'

interface Segment {
  key: string
  block?: string
  id?: string
  html?: string
  bleed?: boolean
  settings?: Record<string, string>
}

function parseSegments(html: string, translations?: Record<string, string>, sources?: ContentSources, prepare?: (body: HTMLElement) => void): Segment[] {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  if (translations) {
    doc.body.querySelectorAll<HTMLElement>('[data-t]').forEach((el) => {
      const value = translations[el.dataset.t ?? '']
      if (typeof value === 'string' && value.trim() !== '') el.innerHTML = value
    })
  }
  prepare?.(doc.body)
  if (sources) fillSources(doc.body, sources)
  const segments: Segment[] = []
  let buffer = ''
  let bufferBleeds = false

  const flush = () => {
    if (buffer.trim()) segments.push({ key: `html-${segments.length}`, html: buffer, bleed: bufferBleeds })
    buffer = ''
    bufferBleeds = false
  }

  doc.body.childNodes.forEach((node) => {
    if (node instanceof HTMLElement && node.dataset.block) {
      flush()
      const settings: Record<string, string> = {}
      for (const attr of Array.from(node.attributes)) {
        if (attr.name.startsWith('data-s-')) settings[attr.name.slice(7)] = attr.value
      }
      segments.push({ key: `block-${segments.length}`, block: node.dataset.block, id: node.id || undefined, settings })
    } else if (node instanceof HTMLElement) {
      if (!buffer.trim()) bufferBleeds = node.hasAttribute('data-bleed')
      buffer += node.outerHTML
    } else if (node.textContent?.trim()) {
      buffer += node.textContent
    }
  })
  flush()

  return segments
}

interface Props<T> {
  html: string
  css: string
  data: T
  locale: Locale
  blocks: { id: string; render: (props: { data: T; locale: Locale; settings?: Record<string, string> }) => ReactNode }[]
  bleedBlock?: string
  offsetClass?: string
  transformHtml?: (html: string) => string
  translations?: Record<string, string>
  portals?: HtmlPortal[]
  sources?: ContentSources
  prepare?: (body: HTMLElement) => void
}

const REVEAL_SELECTOR = ['h1', 'h2', 'h3', 'p', 'dl', 'blockquote'].map((tag) => `[data-exploded] ${tag}`).join(', ')

export interface HtmlPortal {
  selector: string
  render: () => ReactNode
}

function HtmlSegment({ html, portals }: { html: string; portals?: HtmlPortal[] }) {
  const ref = useRef<HTMLDivElement>(null)
  const [targets, setTargets] = useState<{ el: HTMLElement; render: () => ReactNode }[]>([])

  useLayoutEffect(() => {
    const root = ref.current
    if (!root || !portals?.length) return
    const found: { el: HTMLElement; render: () => ReactNode }[] = []
    portals.forEach((portal, index) => {
      root.querySelectorAll<HTMLElement>(`${portal.selector}, [data-portal="${index}"]`).forEach((target) => {
        let container = target
        if (target.dataset.portal !== String(index)) {
          container = document.createElement('div')
          container.className = 'absolute inset-0'
          container.dataset.portal = String(index)
          target.replaceWith(container)
        }
        found.push({ el: container, render: portal.render })
      })
    })
    setTargets(found)
  }, [html, portals])

  useLayoutEffect(() => {
    const root = ref.current
    if (!root) return
    const items = Array.from(root.querySelectorAll<HTMLElement>(REVEAL_SELECTOR))
    if (!items.length) return
    if (typeof IntersectionObserver === 'undefined') return
    items.forEach((el) => el.classList.add('reveal'))
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          entry.target.classList.add('is-visible')
          observer.unobserve(entry.target)
        }),
      { rootMargin: '0px 0px -10% 0px' },
    )
    items.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [html])

  return (
    <>
      <div ref={ref} dangerouslySetInnerHTML={{ __html: html }} />
      {targets.map((target, i) => createPortal(target.render(), target.el, String(i)))}
    </>
  )
}

export function usesBlocks(html: string): boolean {
  return /data-block=/.test(html)
}

export default function PageRenderer<T>({
  html,
  css,
  data,
  locale,
  blocks,
  bleedBlock,
  offsetClass,
  transformHtml,
  translations,
  portals,
  sources,
  prepare,
}: Props<T>) {
  const segments = useMemo(() => parseSegments(html, translations, sources, prepare), [html, translations, sources, prepare])
  const bleeds = (!!bleedBlock && segments[0]?.block === bleedBlock) || !!segments[0]?.bleed

  return (
    <div className={`page-fade ${bleeds ? '-mt-24' : offsetClass ?? ''}`}>
      {css && <style>{css}</style>}
      {segments.map((segment) => {
        if (segment.block) {
          const block = blocks.find((b) => b.id === segment.block)
          if (!block) return null
          return (
            <div key={segment.key} id={segment.id}>
              {block.render({ data, locale, settings: segment.settings })}
            </div>
          )
        }
        return <HtmlSegment key={segment.key} html={sanitiseLayout(transformHtml ? transformHtml(segment.html ?? '') : segment.html)} portals={portals} />
      })}
    </div>
  )
}
