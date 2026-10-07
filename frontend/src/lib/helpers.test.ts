import { describe, expect, it } from 'vitest'
import { fillSources, readSource } from './contentSources'
import { metaText } from './metaText'
import { categoryFromSlug, categorySlug } from './projectCategories'
import { projectPath } from './projectPath'
import { sanitise } from './sanitise'
import { upgradeExploded } from './upgradeExploded'

describe('projectPath', () => {
  it('includes category', () => {
    expect(projectPath('ru', { slug: 'house', category: 'architecture' })).toBe('/ru/projects/architecture/house')
  })

  it('works without category', () => {
    expect(projectPath('en', { slug: 'house' })).toBe('/en/projects/house')
  })
})

describe('metaText', () => {
  it('strips html and collapses spaces', () => {
    expect(metaText('<p>Hello</p>\n<p>world</p>')).toBe('Hello world')
  })

  it('skips empty candidates', () => {
    expect(metaText(null, '', '<p> </p>', 'Fallback')).toBe('Fallback')
  })

  it('cuts long text to 160 chars on a word boundary', () => {
    const text = metaText('word '.repeat(100))
    expect(text.length).toBeLessThanOrEqual(160)
    expect(text.endsWith('…')).toBe(true)
    expect(text).not.toMatch(/wor…$/)
  })
})

describe('sanitise', () => {
  it('removes scripts and event handlers', () => {
    const html = sanitise('<p onclick="alert(1)">Hi</p><script>alert(1)</script>')
    expect(html).toBe('<p>Hi</p>')
  })
})

describe('category slugs', () => {
  it('uses readable slugs in project urls', () => {
    expect(projectPath('ru', { slug: 'park', category: 'urbanism' })).toBe('/ru/projects/urban-planning/park')
    expect(projectPath('ru', { slug: 'flat', category: 'interior' })).toBe('/ru/projects/public-interior/flat')
  })

  it('maps slugs and old ids back to categories', () => {
    expect(categoryFromSlug('urban-planning')).toBe('urbanism')
    expect(categoryFromSlug('public-interior')).toBe('interior')
    expect(categoryFromSlug('urbanism')).toBe('urbanism')
    expect(categoryFromSlug('house')).toBeNull()
    expect(categorySlug('engineering')).toBe('engineering')
  })
})

describe('content sources', () => {
  const sources = { 'home.hero': { title: 'Vision.', stats: [{ number: '850+', label: '' }] } }

  it('reads nested values', () => {
    expect(readSource(sources, 'home.hero:title')).toBe('Vision.')
    expect(readSource(sources, 'home.hero:stats.0.number')).toBe('850+')
    expect(readSource(sources, 'home.hero:stats.0.label')).toBeNull()
    expect(readSource(sources, 'home.about:heading')).toBeNull()
  })

  it('fills marked elements and keeps others', () => {
    const root = document.createElement('div')
    root.innerHTML = '<h1 data-src="home.hero:title">Смысл.</h1><p data-src="home.hero:stats.0.label">кеп</p><p>static</p>'
    fillSources(root, sources)
    expect(root.innerHTML).toBe('<h1 data-src="home.hero:title">Vision.</h1><p data-src="home.hero:stats.0.label">кеп</p><p>static</p>')
  })
})

describe('upgradeExploded', () => {
  it('marks texts of old exploded sections by matching fresh markup', () => {
    const root = document.createElement('div')
    root.innerHTML = '<section data-exploded="hero"><h1 class="big">Старый</h1><p class="sub">Подзаголовок</p></section>'
    const exploders = { hero: () => '<section><h1 data-src="home.hero:title" class="big"></h1><p data-src="home.hero:subtitle" class="sub-new"></p></section>' }
    upgradeExploded(root, exploders, {}, 'ru')
    expect(root.querySelector('h1')?.getAttribute('data-src')).toBe('home.hero:title')
    expect(root.querySelector('p')?.getAttribute('data-src')).toBe('home.hero:subtitle')
  })
})
