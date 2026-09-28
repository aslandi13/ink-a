let el: HTMLElement | null = null

export function registerCurtain(element: HTMLElement) {
  el = element
}

export function curtainClose(): Promise<void> {
  return new Promise((resolve) => {
    if (!el) return resolve()
    // slide DOWN from top (covers screen)
    el.style.transformOrigin = 'top'
    el.style.transition = 'transform 0.4s cubic-bezier(0.76,0,0.24,1)'
    el.style.transform = 'scaleY(1)'
    setTimeout(resolve, 420)
  })
}

export function curtainOpen() {
  if (!el) return
  // slide UP toward top (reveals screen)
  el.style.transformOrigin = 'bottom'
  el.style.transition = 'transform 0.5s cubic-bezier(0.76,0,0.24,1)'
  el.style.transform = 'scaleY(0)'
}
