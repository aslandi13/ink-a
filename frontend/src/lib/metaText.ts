export function metaText(...candidates: (string | null | undefined)[]): string {
  for (const candidate of candidates) {
    if (!candidate) continue
    const text = new DOMParser().parseFromString(candidate.replace(/<[^>]+>/g, ' '), 'text/html').body.textContent?.replace(/\s+/g, ' ').trim() ?? ''
    if (text) return text.length > 160 ? `${text.slice(0, 157).replace(/\s+\S*$/, '')}…` : text
  }
  return ''
}
