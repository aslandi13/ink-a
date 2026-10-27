const LOADED = 'data-loaded'

function mark(image: HTMLImageElement) {
  image.setAttribute(LOADED, '')
}

function check(root: ParentNode) {
  root.querySelectorAll<HTMLImageElement>(`img:not([${LOADED}])`).forEach((image) => {
    if (image.complete) mark(image)
  })
}

export function startImageFade() {
  const onDone = (event: Event) => {
    if (event.target instanceof HTMLImageElement) mark(event.target)
  }
  document.addEventListener('load', onDone, true)
  document.addEventListener('error', onDone, true)

  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'attributes' && mutation.target instanceof HTMLImageElement) {
        mutation.target.removeAttribute(LOADED)
        if (mutation.target.complete) mark(mutation.target)
        continue
      }
      mutation.addedNodes.forEach((node) => {
        if (node instanceof HTMLImageElement) {
          if (node.complete) mark(node)
        } else if (node instanceof Element) {
          check(node)
        }
      })
    }
  }).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['src'] })

  check(document)
}
