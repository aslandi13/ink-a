import type { Locale } from '../lib/locale'
import type { HomeData } from '../sections/home'

function esc(value: string | null | undefined): string {
  return (value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

const LOCKED = 'data-gjs-draggable="false" data-gjs-copyable="false"'
const DECOR = 'data-gjs-selectable="false" data-gjs-hoverable="false" data-gjs-layerable="false"'

function explodeHero(data: HomeData, locale: Locale): string {
  const { hero, projects } = data
  const featured = projects.find((p) => p.id === hero?.featured_project_id)
  const firstSlide = hero?.slides?.[0]

  const background = hero?.video
    ? `<video ${LOCKED} data-gjs-name="Фон: видео" class="absolute inset-0 h-full w-full object-cover" src="${esc(hero.video)}"${hero.poster ? ` poster="${esc(hero.poster)}"` : ''} autoplay muted loop playsinline></video>`
    : firstSlide
      ? `<img ${LOCKED} data-gjs-name="Фон: фото" class="absolute inset-0 h-full w-full object-cover" src="${esc(firstSlide.image)}" alt="">`
      : ''

  const stats = (hero?.stats ?? [])
    .map(
      (stat) =>
        `<div data-gjs-name="Цифра"><dt class="font-serif text-xl text-white md:text-2xl lg:text-3xl">${esc(stat.number)}</dt><dd class="mt-0.5 max-w-[22ch] text-xs leading-snug text-white/50 md:text-sm">${esc(stat.label)}</dd></div>`,
    )
    .join('')

  return `<section data-bleed="1" data-gjs-name="Герой" class="relative flex min-h-[calc(100vh_+_6rem)] flex-col justify-end overflow-hidden px-6 pb-20">
  ${background}
  <div ${DECOR} class="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-950/75 via-ink-950/25 to-ink-950/5"></div>
  <div ${DECOR} class="pointer-events-none absolute inset-x-0 bottom-0 h-50 bg-gradient-to-t from-ink-950 to-transparent"></div>
  <div data-gjs-name="Сетка" class="relative mx-auto grid w-full max-w-[84rem] gap-8 md:grid-cols-2 md:gap-12">
    <div data-gjs-name="Левая колонка">
      <h1 class="whitespace-pre-line text-5xl leading-[0.9] text-white sm:text-6xl md:text-7xl lg:text-8xl">${esc(hero?.title)}</h1>
      ${stats ? `<dl data-gjs-name="Цифры" class="mt-8 grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3">${stats}</dl>` : ''}
      ${featured ? `<div class="mt-8"><a href="/${locale}/projects/${esc(featured.slug)}" class="text-sm text-white/50 transition-colors hover:text-white/80">${esc(featured.title)}</a></div>` : ''}
    </div>
    <div data-gjs-name="Правая колонка" class="flex flex-col justify-end gap-5">
      ${hero?.subtitle ? `<p class="whitespace-pre-line font-serif text-2xl leading-tight text-white md:text-3xl lg:text-4xl">${esc(hero.subtitle)}</p>` : ''}
      ${hero?.description ? `<p class="hidden max-w-lg text-white/70 sm:block">${esc(hero.description)}</p>` : ''}
    </div>
  </div>
</section>`
}

export const EXPLODERS: Record<string, (data: HomeData, locale: Locale) => string> = {
  hero: explodeHero,
}
