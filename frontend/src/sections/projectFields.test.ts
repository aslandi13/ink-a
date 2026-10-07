import { describe, expect, it } from 'vitest'
import type { ProjectPageData } from './project'
import { escapeAttr } from './fields'
import { fillProjectFields } from './projectFields'

const data = {
  project: {
    title: 'Дом',
    category: 'architecture',
    status: 'in_progress',
    location: 'Алматы',
    total_area: '',
    gallery: ['/a.webp', '/b.webp'],
    gallery_thumbs: ['/a-thumb.webp', '/b-thumb.webp'],
  },
} as unknown as ProjectPageData

describe('fillProjectFields', () => {
  it('fills text fields', () => {
    const html = fillProjectFields('<h1 data-field="title"></h1><p data-field="location"></p>', data, 'ru')
    expect(html).toBe('<h1 data-field="title">Дом</h1><p data-field="location">Алматы</p>')
  })

  it('translates status', () => {
    const html = fillProjectFields('<p data-field="status"></p>', data, 'ru')
    expect(html).toContain('Строительство')
  })

  it('removes the whole group when value is empty', () => {
    const html = fillProjectFields('<div data-field-group><p>Площадь</p><p data-field="total_area"></p></div><p data-field="title"></p>', data, 'ru')
    expect(html).toBe('<p data-field="title">Дом</p>')
  })

  it('renders gallery with thumbs and full images', () => {
    const html = fillProjectFields('<div data-field="gallery"></div>', data, 'ru')
    expect(html).toContain('src="/a-thumb.webp"')
    expect(html).toContain('data-full="/a.webp"')
    expect(html.match(/<img/g)).toHaveLength(2)
  })
})

describe('escapeAttr', () => {
  it('escapes quotes and ampersands', () => {
    expect(escapeAttr('a"b&c')).toBe('a&quot;b&amp;c')
  })
})
