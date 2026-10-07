import { describe, expect, it } from 'vitest'
import { metaText } from './metaText'
import { projectPath } from './projectPath'
import { sanitise } from './sanitise'

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
