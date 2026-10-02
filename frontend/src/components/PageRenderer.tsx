import { useMemo, type ReactNode } from 'react'
import type { Locale } from '../lib/locale'
import { sanitiseLayout } from '../lib/sanitise'

interface Segment {
  key: string
  block?: string
  id?: string
  html?: string
  bleed?: boolean
  settings?: Record<string, string>
}

function parseSegments(html: string): Segment[] {
  const doc = new DOMParser().parseFromString(html, 'text/html')
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
}

export function usesBlocks(html: string): boolean {
  return /data-block=/.test(html)
}

export default function PageRenderer<T>({ html, css, data, locale, blocks, bleedBlock, offsetClass, transformHtml }: Props<T>) {
  const segments = useMemo(() => parseSegments(html), [html])
  const bleeds = (!!bleedBlock && segments[0]?.block === bleedBlock) || !!segments[0]?.bleed

  return (
    <div className={bleeds ? '-mt-24' : offsetClass}>
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
        return <div key={segment.key} dangerouslySetInnerHTML={{ __html: sanitiseLayout(transformHtml ? transformHtml(segment.html ?? '') : segment.html) }} />
      })}
    </div>
  )
}
