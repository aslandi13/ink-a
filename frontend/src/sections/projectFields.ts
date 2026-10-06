import { t } from '../lib/i18n'
import type { Locale } from '../lib/locale'
import { sanitise } from '../lib/sanitise'
import { escapeAttr, fillFields } from './fields'
import { statusLabel, type ProjectPageData } from './project'

type Category = keyof ReturnType<typeof t>['projects']['categories']

export const PROJECT_FIELDS: { id: string; label: string }[] = [
  { id: 'title', label: 'Название' },
  { id: 'category', label: 'Категория' },
  { id: 'location', label: 'Местоположение' },
  { id: 'year', label: 'Год' },
  { id: 'site_area', label: 'Площадь участка' },
  { id: 'total_area', label: 'Общая площадь' },
  { id: 'status', label: 'Статус' },
  { id: 'excerpt', label: 'Краткое описание' },
  { id: 'body', label: 'Полное описание' },
  { id: 'cover', label: 'Обложка' },
  { id: 'gallery', label: 'Галерея' },
]

const GALLERY_ITEM = 'aspect-[2/1] w-full object-cover'

function textValue(field: string, data: ProjectPageData, locale: Locale): string {
  const { project } = data
  if (field === 'status') return statusLabel(project.status, locale)
  if (field === 'category') return t(locale).projects.categories[project.category as Category] ?? project.category
  const value = (project as unknown as Record<string, unknown>)[field]
  return value == null ? '' : String(value)
}

export function hasFieldValue(field: string, data: ProjectPageData, locale: Locale): boolean {
  if (field === 'cover') return !!data.project.cover_image
  if (field === 'gallery') return !!data.project.gallery?.length
  if (field === 'body') return !!data.project.body
  return textValue(field, data, locale).trim() !== ''
}

export function applyProjectField(el: HTMLElement, data: ProjectPageData, locale: Locale) {
  const field = el.dataset.field ?? ''
  const { project } = data
  if (field === 'cover') {
    if (project.cover_image) el.setAttribute('src', project.cover_image)
    return
  }
  if (field === 'gallery') {
    el.innerHTML = (project.gallery ?? [])
      .map((src) => `<img src="${escapeAttr(src)}" class="${GALLERY_ITEM} cursor-zoom-in" alt="">`)
      .join('')
    return
  }
  if (field === 'body') {
    el.innerHTML = sanitise(project.body)
    return
  }
  el.textContent = textValue(field, data, locale)
}

export function fillProjectFields(html: string, data: ProjectPageData, locale: Locale): string {
  return fillFields(
    html,
    (field) => hasFieldValue(field, data, locale),
    (el) => applyProjectField(el, data, locale),
  )
}

const fact = (field: string, label: string) =>
  `<div data-field-group data-gjs-name="${label}" class="border-b border-line pb-3 text-sm"><p class="text-white/40">${label}</p><p data-field="${field}" class="mt-1 text-white/90"></p></div>`

export const PROJECT_FIELD_BLOCKS: { id: string; label: string; content: string }[] = [
  { id: 'field-title', label: 'Название', content: '<h1 data-field="title" class="font-serif text-4xl text-white md:text-5xl lg:text-6xl"></h1>' },
  { id: 'field-category', label: 'Категория', content: '<p data-field="category" class="text-xs uppercase tracking-widest text-white/40"></p>' },
  { id: 'field-location', label: 'Местоположение', content: fact('location', 'Местоположение') },
  { id: 'field-year', label: 'Год', content: fact('year', 'Год') },
  { id: 'field-site-area', label: 'Площадь участка', content: fact('site_area', 'Площадь участка') },
  { id: 'field-total-area', label: 'Общая площадь', content: fact('total_area', 'Общая площадь') },
  { id: 'field-status', label: 'Статус', content: fact('status', 'Статус') },
  { id: 'field-excerpt', label: 'Краткое описание', content: '<p data-field="excerpt" class="max-w-2xl text-base leading-relaxed text-white/70"></p>' },
  { id: 'field-body', label: 'Полное описание', content: '<div data-field="body" class="prose prose-invert max-w-none text-white/70"></div>' },
  { id: 'field-cover', label: 'Обложка', content: '<img data-field="cover" class="aspect-video w-full object-cover" alt="">' },
  { id: 'field-gallery', label: 'Галерея', content: '<div data-field="gallery" class="grid grid-cols-2 gap-1.5 md:grid-cols-4"></div>' },
  {
    id: 'field-cover-hero',
    label: 'Обложка на весь экран',
    content: `<section data-bleed="1" data-gjs-name="Обложка на весь экран" class="relative flex h-[calc(65vh_+_6rem)] items-end overflow-hidden sm:h-[calc(100vh_+_6rem)]">
      <img data-field="cover" class="absolute inset-0 h-full w-full object-cover" alt="">
      <div data-gjs-selectable="false" data-gjs-hoverable="false" data-gjs-layerable="false" class="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-ink-950 via-ink-950/60 to-transparent"></div>
      <div class="relative mx-auto w-full max-w-[84rem] px-6 pb-24"><h1 data-field="title" class="font-serif text-4xl text-white md:text-5xl lg:text-6xl"></h1></div>
    </section>`,
  },
  {
    id: 'field-facts',
    label: 'Характеристики',
    content: `<div data-gjs-name="Характеристики" class="mx-auto grid max-w-[84rem] gap-4 px-6 py-10 sm:grid-cols-2 md:grid-cols-5">${fact('location', 'Местоположение')}${fact('year', 'Год')}${fact('site_area', 'Площадь участка')}${fact('total_area', 'Общая площадь')}${fact('status', 'Статус')}</div>`,
  },
]
