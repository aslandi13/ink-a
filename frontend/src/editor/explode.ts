import { t } from '../lib/i18n'
import type { Locale } from '../lib/locale'
import { projectPath } from '../lib/projectPath'
import type { ContactsData } from '../sections/contacts'
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
      ${featured ? `<div class="mt-8"><a href="${esc(projectPath(locale, featured))}" class="text-sm text-white/50 transition-colors hover:text-white/80">${esc(featured.title)}</a></div>` : ''}
    </div>
    <div data-gjs-name="Правая колонка" class="flex flex-col justify-end gap-5">
      ${hero?.subtitle ? `<p class="whitespace-pre-line font-serif text-2xl leading-tight text-white md:text-3xl lg:text-4xl">${esc(hero.subtitle)}</p>` : ''}
      ${hero?.description ? `<p class="hidden max-w-lg text-white/70 sm:block">${esc(hero.description)}</p>` : ''}
    </div>
  </div>
</section>`
}

function explodeAbout(data: HomeData, locale: Locale): string {
  const { about } = data
  const label = t(locale).home.about
  const quote = about?.quote
    ? `<blockquote class="border-l border-accent/60 pl-4 text-sm italic text-white/80 lg:border-0 lg:pl-0 lg:text-[1.08cqw] lg:leading-snug">«${esc(about.quote)}»${about.quote_author ? `<footer class="mt-2 text-xs text-white/40 not-italic lg:mt-[0.9cqw] lg:text-[0.93cqw] lg:text-white/60">${esc(about.quote_author)}</footer>` : ''}</blockquote>`
    : ''
  const intro = about?.intro
    ? `<p class="whitespace-pre-line text-sm text-white/70 lg:text-[1.08cqw] lg:leading-snug lg:text-white/80">${esc(about.intro)}</p>`
    : ''

  const main = about?.image
    ? `<div data-gjs-name="Фото с текстом" class="@container relative mt-4 lg:mt-3 lg:aspect-[3.06] lg:overflow-hidden lg:bg-ink-800">
      <div class="lg:absolute lg:inset-x-0 lg:top-0 lg:z-10 lg:px-[3cqw] lg:pt-[3cqw]">
        <h2 class="max-w-2xl whitespace-pre-line font-serif text-2xl leading-tight text-white lg:max-w-[55cqw] lg:text-[3.6cqw]">${esc(about.heading)}</h2>
      </div>
      <div data-gjs-name="Фото" class="relative mt-6 aspect-[4/3] w-full overflow-hidden bg-ink-800 lg:absolute lg:inset-0 lg:mt-0 lg:aspect-auto">
        <img class="absolute inset-0 h-full w-full object-cover" src="${esc(about.image)}" alt="">
        <div ${DECOR} class="pointer-events-none absolute inset-x-0 top-0 hidden h-2/5 bg-gradient-to-b from-ink-950/80 to-transparent lg:block"></div>
        <div ${DECOR} class="pointer-events-none absolute inset-x-0 bottom-0 hidden h-2/5 bg-gradient-to-t from-ink-950 to-transparent lg:block"></div>
      </div>
      <div data-gjs-name="Тексты" class="mt-6 flex flex-col gap-6 lg:absolute lg:inset-x-0 lg:bottom-0 lg:z-10 lg:mt-0 lg:grid lg:grid-cols-[45%_40%] lg:gap-[6cqw] lg:px-[3cqw] lg:pb-[3.5cqw]">${intro}${quote}</div>
    </div>`
    : `<h2 class="mt-4 max-w-2xl whitespace-pre-line font-serif text-3xl leading-tight text-white md:text-5xl">${esc(about?.heading)}</h2>
    <div class="mt-10 grid gap-10 md:grid-cols-[30%_37%]">${intro}${quote}</div>`

  const principles = about?.principles?.length
    ? `<div data-gjs-name="Принципы" class="mt-4 border-t border-line pt-4 sm:mt-12 sm:pt-12">
      <div class="grid gap-10 md:grid-cols-[38%_1fr] md:gap-20">
        ${about.principles_image ? `<div class="aspect-[185/100] w-full overflow-hidden bg-ink-800"><img class="h-full w-full object-cover" src="${esc(about.principles_image)}" alt=""></div>` : ''}
        <div class="flex flex-col justify-center gap-8">${about.principles
          .map((p) => `<div><h3 class="font-sans text-sm font-semibold text-white">${esc(p.heading)}</h3><p class="mt-2 text-sm leading-relaxed text-white/60">${esc(p.text)}</p></div>`)
          .join('')}</div>
      </div>
    </div>`
    : ''

  return `<section data-gjs-name="О нас" class="mx-auto max-w-[84rem] px-6 pt-8 pb-4 sm:pt-24 sm:pb-24">
    <p class="text-xs uppercase tracking-widest text-white/40">${esc(label)}</p>
    ${main}
    ${principles}
  </section>`
}

function explodeOffices(data: HomeData): string {
  const { offices } = data
  const media = offices?.map_video
    ? `<video class="h-full w-full object-cover" src="${esc(offices.map_video)}"${offices.map_poster ? ` poster="${esc(offices.map_poster)}"` : ''} autoplay muted loop playsinline></video>`
    : offices?.map_poster
      ? `<img class="h-full w-full object-cover" src="${esc(offices.map_poster)}" alt="">`
      : ''

  return `<section data-gjs-name="География" class="mx-auto max-w-[84rem] px-6 pt-2 pb-4 sm:pt-20 sm:pb-16">
    <div class="grid gap-8 md:grid-cols-2 md:gap-16">
      <div>
        <h2 class="font-serif text-[2.5rem] leading-[1.1] text-white">${esc(offices?.heading)}</h2>
        ${offices?.video_label ? `<div class="mt-6 flex items-center gap-2 text-sm text-white/70"><span class="h-[10px] w-[10px] rounded-full bg-gold"></span>${esc(offices.video_label)}</div>` : ''}
      </div>
      ${offices?.description ? `<p class="whitespace-pre-line text-sm leading-relaxed text-white/60 md:pt-2">${esc(offices.description)}</p>` : ''}
    </div>
    ${media ? `<div data-gjs-name="Карта" class="mt-10 aspect-[2.3107] w-full overflow-hidden bg-ink-950">${media}</div>` : ''}
  </section>`
}

function explodeVideo(data: HomeData): string {
  const { videoBanner } = data
  const src = videoBanner?.video || videoBanner?.video_url
  if (!src) return '<div class="mx-auto max-w-[84rem] px-6"></div>'

  return `<div data-gjs-name="Видео-баннер" class="mx-auto max-w-[84rem] px-6">
    <video class="aspect-video w-full bg-black object-cover" src="${esc(src)}"${videoBanner?.poster ? ` poster="${esc(videoBanner.poster)}"` : ''} controls muted playsinline></video>
  </div>`
}

function explodeProjects(data: HomeData, locale: Locale): string {
  const { keyProjects, projects } = data
  const tr = t(locale)
  const cards = projects
    .slice(0, 30)
    .map((project, i) => {
      const span = `${i === 0 ? 'col-span-2' : ''} ${i % 13 === 0 ? 'md:col-span-2 md:row-span-2' : ''}`.trim()
      return `<a href="${esc(projectPath(locale, project))}" class="group relative block aspect-[4/3] overflow-hidden bg-ink-800 ${span}">
        ${project.cover_image ? `<img class="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110" src="${esc(project.cover_image)}" alt="${esc(project.title)}">` : ''}
        <div ${DECOR} class="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/70 to-transparent"></div>
        <p class="absolute bottom-4 left-4 font-serif text-[1.3rem] leading-[1.1] text-white">${esc(project.title)}</p>
      </a>`
    })
    .join('')

  return `<section data-gjs-name="Ключевые проекты" class="mx-auto max-w-[84rem] px-6 pt-4 pb-28 sm:pt-20">
    <p class="text-sm text-white/60">${esc(keyProjects?.heading || tr.home.keyProjects)}</p>
    ${keyProjects?.statement ? `<h2 class="mt-3 max-w-4xl whitespace-pre-line font-serif text-[1.9rem] leading-[1.1] text-white sm:text-[2.5rem]">${esc(keyProjects.statement)}</h2>` : ''}
    ${keyProjects?.description ? `<p class="mt-4 max-w-2xl text-sm leading-relaxed text-white/60">${esc(keyProjects.description)}</p>` : ''}
    ${cards ? `<div data-gjs-name="Сетка проектов" class="mt-10 grid grid-flow-dense grid-cols-2 gap-1 md:grid-cols-4">${cards}</div>` : ''}
    <div class="mt-10 flex justify-center">
      <a href="/${locale}/projects" class="inline-flex items-center rounded-[20px] bg-[rgb(57,64,75)] px-8 py-3 font-sans text-base font-medium text-white transition-opacity hover:opacity-80">${esc(tr.ui.more)}</a>
    </div>
  </section>`
}

export const EXPLODERS: Record<string, (data: HomeData, locale: Locale) => string> = {
  hero: explodeHero,
  about: explodeAbout,
  offices: explodeOffices,
  video: explodeVideo,
  projects: explodeProjects,
}

function explodeContacts(data: ContactsData): string {
  const socials = [
    data.email && { label: 'Email', value: data.email, href: `mailto:${data.email}` },
    data.facebook_handle && { label: 'Facebook', value: data.facebook_handle, href: data.facebook_url },
    data.instagram_handle && { label: 'Instagram', value: data.instagram_handle, href: data.instagram_url },
    data.linkedin_handle && { label: 'LinkedIn', value: data.linkedin_handle, href: data.linkedin_url },
  ].filter(Boolean) as { label: string; value: string; href?: string }[]

  const socialLinks = socials
    .map(
      (item) =>
        `<a data-gjs-name="${esc(item.label)}" href="${esc(item.href)}" class="group block"><span class="block text-white transition-colors group-hover:text-accent">${esc(item.value)}</span><span class="mt-1 block text-xs text-white/40">${esc(item.label)}</span></a>`,
    )
    .join('')

  const career = data.career_heading
    ? `<div data-gjs-name="Карьера" class="mt-5 max-w-xl border-t border-line pt-5 sm:pt-8">
      ${data.career_label ? `<p class="text-xs uppercase tracking-[0.2em] text-white/40">${esc(data.career_label)}</p>` : ''}
      <h1 class="mt-3 whitespace-pre-line font-serif text-4xl text-white md:text-5xl">${esc(data.career_heading)}</h1>
      ${data.career_text ? `<p class="mt-1 text-white/60">${esc(data.career_text)}</p>` : ''}
      ${data.career_cta_label ? `<a href="${esc(data.career_cta_url ?? `mailto:${data.email ?? ''}`)}" target="_blank" rel="noopener noreferrer" class="mt-5 inline-flex items-center gap-2 border border-white/30 px-6 py-3 text-sm text-white transition-colors hover:border-white hover:bg-white hover:text-ink-950">${esc(data.career_cta_label)} →</a>` : ''}
    </div>`
    : ''

  const info = [data.address, data.phone, data.whatsapp ? `WhatsApp: ${data.whatsapp}` : null]
    .filter(Boolean)
    .map((line) => `<p>${esc(line)}</p>`)
    .join('')

  return `<section data-gjs-name="Контакты" class="relative flex min-h-[90vh] flex-col justify-center overflow-hidden">
    ${data.background_video ? `<video ${LOCKED} data-gjs-name="Фон: видео" class="absolute inset-0 h-full w-full object-cover" src="${esc(data.background_video)}"${data.background_poster ? ` poster="${esc(data.background_poster)}"` : ''} autoplay muted loop playsinline></video>` : ''}
    <div ${DECOR} class="pointer-events-none absolute inset-0 bg-ink-950/50"></div>
    <div data-gjs-name="Содержимое" class="relative mx-auto flex w-full max-w-[84rem] flex-1 flex-col justify-center px-6 pt-42 pb-12">
      <p class="text-xs uppercase tracking-[0.2em] text-white/40">Социальные сети</p>
      <div data-gjs-name="Соцсети" class="mt-6 flex flex-wrap gap-x-12 gap-y-6">${socialLinks}</div>
      ${career}
    </div>
    ${info ? `<div data-gjs-name="Адрес и телефон" class="relative border-t border-line bg-ink-950 px-6 py-8 text-sm text-white/50"><div class="mx-auto flex max-w-[84rem] flex-wrap gap-x-10 gap-y-2">${info}</div></div>` : ''}
  </section>`
}

function explodeLegalTitle(data: { title?: string }, locale: Locale): string {
  return `<div data-gjs-name="Заголовок" class="mx-auto max-w-4xl px-6 pt-24"><h1 class="text-3xl font-medium tracking-tight text-white">${esc(data.title || t(locale).legal.title)}</h1></div>`
}

export const CONTACTS_EXPLODERS: Record<string, (data: ContactsData, locale: Locale) => string> = {
  'contacts-main': explodeContacts,
}

export const LEGAL_EXPLODERS: Record<string, (data: { title?: string }, locale: Locale) => string> = {
  'legal-title': explodeLegalTitle,
}
