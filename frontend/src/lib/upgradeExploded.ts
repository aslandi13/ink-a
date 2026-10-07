import type { Locale } from './locale'

export type Exploders = Record<string, (data: never, locale: Locale) => string>

function signature(el: Element): string {
  return `${el.tagName}|${el.getAttribute('class') ?? ''}`
}

export function matchSources(section: Element, freshHtml: string): [Element, string][] {
  const template = document.createElement('template')
  template.innerHTML = freshHtml
  const fresh = Array.from(template.content.querySelectorAll('[data-src]'))
  const old = Array.from(section.querySelectorAll('*')).filter((el) => !el.hasAttribute('data-src'))
  const used = new Set<Element>()
  const matches: [Element, string][] = []
  const unmatched: Element[] = []

  for (const el of fresh) {
    const found = old.find((candidate) => !used.has(candidate) && signature(candidate) === signature(el))
    if (found) {
      used.add(found)
      matches.push([found, el.getAttribute('data-src')!])
    } else {
      unmatched.push(el)
    }
  }

  const byTag = new Map<string, Element[]>()
  for (const el of unmatched) byTag.set(el.tagName, [...(byTag.get(el.tagName) ?? []), el])
  for (const [tag, list] of byTag) {
    const candidates = old.filter((candidate) => !used.has(candidate) && candidate.tagName === tag)
    if (candidates.length !== list.length) continue
    list.forEach((el, i) => matches.push([candidates[i], el.getAttribute('data-src')!]))
  }

  return matches
}

export function explodedMatches(root: ParentNode, exploders: Exploders, data: unknown, locale: Locale): [Element, string][] {
  const matches: [Element, string][] = []
  root.querySelectorAll('[data-exploded]').forEach((section) => {
    const exploder = exploders[section.getAttribute('data-exploded') ?? '']
    if (!exploder || section.querySelector('[data-src]')) return
    matches.push(...matchSources(section, exploder(data as never, locale)))
  })
  return matches
}

export function upgradeExploded(root: ParentNode, exploders: Exploders, data: unknown, locale: Locale) {
  for (const [el, target] of explodedMatches(root, exploders, data, locale)) el.setAttribute('data-src', target)
}
