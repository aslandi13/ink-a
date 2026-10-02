export function fillFields(html: string, has: (field: string) => boolean, apply: (el: HTMLElement) => void): string {
  if (!html.includes('data-field')) return html
  const doc = new DOMParser().parseFromString(html, 'text/html')
  doc.body.querySelectorAll<HTMLElement>('[data-field]').forEach((el) => {
    if (!has(el.dataset.field ?? '')) {
      ;(el.closest<HTMLElement>('[data-field-group]') ?? el).remove()
      return
    }
    apply(el)
  })
  return doc.body.innerHTML
}

export function escapeAttr(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;')
}
