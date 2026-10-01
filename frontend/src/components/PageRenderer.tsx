import { useMemo, type ReactNode } from 'react'
import type { Locale } from '../lib/locale'
import { sanitiseLayout } from '../lib/sanitise'

interface Segment {
  key: string
  block?: string
  id?: string
  html?: string
}

function parseSegments(html: string): Segment[] {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  const segments: Segment[] = []
  let buffer = ''

  const flush = () => {
    if (buffer.trim()) segments.push({ key: `html-${segments.length}`, html: buffer })
    buffer = ''
  }

  doc.body.childNodes.forEach((node) => {
    if (node instanceof HTMLElement && node.dataset.block) {
      flush()
      segments.push({ key: `block-${segments.length}`, block: node.dataset.block, id: node.id || undefined })
    } else if (node instanceof HTMLElement) {
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
  blocks: { id: string; render: (props: { data: T; locale: Locale }) => ReactNode }[]
  bleedBlock?: string
  offsetClass?: string
}

export function usesBlocks(html: string): boolean {
  return /data-block=/.test(html)
}

export default function PageRenderer<T>({ html, css, data, locale, blocks, bleedBlock, offsetClass }: Props<T>) {
  const segments = useMemo(() => parseSegments(html), [html])
  const bleeds = !!bleedBlock && segments[0]?.block === bleedBlock

  return (
    <div className={bleeds ? '-mt-24' : offsetClass}>
      {css && <style>{css}</style>}
      {segments.map((segment) => {
        if (segment.block) {
          const block = blocks.find((b) => b.id === segment.block)
          if (!block) return null
          return (
            <div key={segment.key} id={segment.id}>
              {block.render({ data, locale })}
            </div>
          )
        }
        return <div key={segment.key} dangerouslySetInnerHTML={{ __html: sanitiseLayout(segment.html) }} />
      })}
    </div>
  )
}
