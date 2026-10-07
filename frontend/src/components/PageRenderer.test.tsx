import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { describe, expect, it } from 'vitest'
import PageRenderer from './PageRenderer'

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true })

describe('PageRenderer portals', () => {
  it('replaces matched element with rendered component', async () => {
    const host = document.createElement('div')
    const root = createRoot(host)
    const html = '<section data-exploded="hero"><video src="/old.mp4"></video><h1>Title</h1></section>'
    const portals = [{ selector: '[data-exploded="hero"] > video:first-child', render: () => <p className="live">slider</p> }]

    await act(async () => {
      root.render(<PageRenderer html={html} css="" data={{}} locale="ru" blocks={[]} portals={portals} />)
    })

    expect(host.querySelector('video')).toBeNull()
    expect(host.querySelector('.live')?.textContent).toBe('slider')
    expect(host.querySelector('h1')?.textContent).toBe('Title')

    await act(async () => {
      root.render(<PageRenderer html={html} css="" data={{ x: 1 }} locale="ru" blocks={[]} portals={[...portals]} />)
    })

    expect(host.querySelectorAll('.live')).toHaveLength(1)
    root.unmount()
  })
})
