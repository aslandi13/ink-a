import axios from 'axios'
import grapesjs, { type Editor } from 'grapesjs'
import 'grapesjs/dist/css/grapes.min.css'
import ru from 'grapesjs/locale/ru.mjs'
import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import {
  editorAuthHeaders,
  editorUploadUrl,
  getDraftPage,
  getEditorToken,
  publishPage,
  saveDraftPage,
  saveSectionContent,
  setEditorToken,
} from '../api/pages'
import { LOCALES, type Locale } from '../lib/locale'
import { DEFAULT_HOME_LAYOUT, HOME_BLOCKS, loadHomeData } from '../sections/home'
import {
  DEFAULT_PROJECT_LAYOUT,
  isProjectTemplate,
  loadSampleProject,
  PROJECT_BLOCKS,
  PROJECT_CATEGORIES,
  PROJECT_TEMPLATE,
  templateCategory,
} from '../sections/project'
import { createContentStore, type ContentStore } from './contentStore'
import { CONTACTS_EXPLODERS, EXPLODERS, LEGAL_EXPLODERS } from './explode'
import { ABOUT_BLOCKS, DEFAULT_ABOUT_LAYOUT, loadAboutData } from '../sections/about'
import {
  applyNewsField,
  DEFAULT_NEWS_LAYOUT,
  DEFAULT_NEWS_LIST_LAYOUT,
  loadSampleNews,
  NEWS_BLOCKS,
  NEWS_FIELD_BLOCKS,
  NEWS_FIELDS,
  NEWS_LIST_BLOCKS,
  NEWS_TEMPLATE,
} from '../sections/news'
import { DEFAULT_PROJECTS_LIST_LAYOUT, PROJECTS_LIST_BLOCKS } from '../sections/projectsList'
import { DEFAULT_LEGAL_LAYOUT, LEGAL_BLOCKS, loadLegalData } from '../sections/legal'
import { CONTACTS_BLOCKS, DEFAULT_CONTACTS_LAYOUT, loadContactsData } from '../sections/contacts'
import { APPROACH_BLOCKS, DEFAULT_APPROACH_LAYOUT, loadApproachData } from '../sections/approach'
import { applyProjectField, PROJECT_FIELD_BLOCKS, PROJECT_FIELDS } from '../sections/projectFields'
import { inkPlugin, type InkBlock, type InkFields } from './inkPlugin'
import LoginForm from './LoginForm'
import { applyTranslations, ensureTextKeys, withBaseTexts } from './translations'
import './editor.css'

function takeTokenFromHash(): string | null {
  const match = window.location.hash.match(/token=([^&]+)/)
  if (match) {
    setEditorToken(decodeURIComponent(match[1]))
    window.history.replaceState(null, '', window.location.pathname + window.location.search)
  }
  return getEditorToken()
}

const STYLE_PROPERTIES_RU: Record<string, string> = {
  display: 'Отображение',
  float: 'Обтекание',
  position: 'Позиция',
  top: 'Сверху',
  right: 'Справа',
  left: 'Слева',
  bottom: 'Снизу',
  'flex-direction': 'Направление',
  'flex-wrap': 'Перенос',
  'justify-content': 'Выравнивание по оси',
  'align-items': 'Выравнивание поперёк',
  'align-content': 'Выравнивание строк',
  order: 'Порядок',
  'flex-basis': 'Базовый размер',
  'flex-grow': 'Растяжение',
  'flex-shrink': 'Сжатие',
  'align-self': 'Своё выравнивание',
  width: 'Ширина',
  height: 'Высота',
  'max-width': 'Макс. ширина',
  'min-height': 'Мин. высота',
  margin: 'Внешний отступ',
  padding: 'Внутренний отступ',
  'font-family': 'Шрифт',
  'font-size': 'Размер шрифта',
  'font-weight': 'Толщина шрифта',
  'letter-spacing': 'Межбуквенный интервал',
  color: 'Цвет текста',
  'line-height': 'Межстрочный интервал',
  'text-align': 'Выравнивание текста',
  'text-shadow': 'Тень текста',
  'background-color': 'Цвет фона',
  'border-radius': 'Скругление',
  border: 'Рамка',
  'box-shadow': 'Тень',
  background: 'Фон',
  opacity: 'Прозрачность',
  transition: 'Переход',
  transform: 'Трансформация',
}

const PAGE_OPTIONS = [
  { slug: 'home', label: 'Главная' },
  { slug: 'about', label: 'О нас' },
  { slug: 'approach', label: 'Подход' },
  { slug: 'contacts', label: 'Контакты' },
  { slug: 'news', label: 'Новости' },
  { slug: NEWS_TEMPLATE, label: 'Шаблон новости' },
  { slug: 'legal', label: 'Правовая информация' },
  { slug: 'projects', label: 'Проекты' },
  { slug: PROJECT_TEMPLATE, label: 'Шаблон проекта: общий' },
  ...PROJECT_CATEGORIES.map((c) => ({ slug: `${PROJECT_TEMPLATE}-${c.id}`, label: `Шаблон проекта: ${c.label}` })),
]

interface PageKind {
  load: (locale: Locale) => Promise<unknown>
  blocks: InkBlock[]
  defaultLayout: string
  exploders?: Record<string, (data: never, locale: Locale) => string>
  fields?: InkFields
  previewPath: (locale: Locale, data: unknown) => string
}

function pageKind(slug: string): PageKind {
  if (slug === 'projects') {
    return {
      load: () => Promise.resolve(null),
      blocks: PROJECTS_LIST_BLOCKS as InkBlock[],
      defaultLayout: DEFAULT_PROJECTS_LIST_LAYOUT,
      previewPath: (locale) => `/${locale}/projects?preview=1`,
    }
  }
  if (slug === 'legal') {
    return {
      load: loadLegalData,
      blocks: LEGAL_BLOCKS as InkBlock[],
      defaultLayout: DEFAULT_LEGAL_LAYOUT,
      exploders: LEGAL_EXPLODERS as PageKind['exploders'],
      previewPath: (locale) => `/${locale}/legal?preview=1`,
    }
  }
  if (slug === 'news') {
    return {
      load: () => Promise.resolve(null),
      blocks: NEWS_LIST_BLOCKS as InkBlock[],
      defaultLayout: DEFAULT_NEWS_LIST_LAYOUT,
      previewPath: (locale) => `/${locale}/news?preview=1`,
    }
  }
  if (slug === NEWS_TEMPLATE) {
    return {
      load: loadSampleNews,
      blocks: NEWS_BLOCKS as InkBlock[],
      defaultLayout: DEFAULT_NEWS_LAYOUT,
      fields: {
        apply: applyNewsField as InkFields['apply'],
        options: NEWS_FIELDS,
        blocks: NEWS_FIELD_BLOCKS,
        category: 'Поля новости',
      },
      previewPath: (locale, data) => `/${locale}/news/${(data as { item: { slug: string } }).item.slug}?preview=1`,
    }
  }
  if (slug === 'contacts') {
    return {
      load: loadContactsData,
      blocks: CONTACTS_BLOCKS as InkBlock[],
      defaultLayout: DEFAULT_CONTACTS_LAYOUT,
      exploders: CONTACTS_EXPLODERS as PageKind['exploders'],
      previewPath: (locale) => `/${locale}/contacts?preview=1`,
    }
  }
  if (slug === 'about') {
    return {
      load: loadAboutData,
      blocks: ABOUT_BLOCKS as InkBlock[],
      defaultLayout: DEFAULT_ABOUT_LAYOUT,
      previewPath: (locale) => `/${locale}/about?preview=1`,
    }
  }
  if (slug === 'approach') {
    return {
      load: loadApproachData,
      blocks: APPROACH_BLOCKS as InkBlock[],
      defaultLayout: DEFAULT_APPROACH_LAYOUT,
      previewPath: (locale) => `/${locale}/approach?preview=1`,
    }
  }
  if (isProjectTemplate(slug)) {
    return {
      load: (locale) => loadSampleProject(locale, templateCategory(slug)),
      blocks: PROJECT_BLOCKS as InkBlock[],
      defaultLayout: DEFAULT_PROJECT_LAYOUT,
      fields: {
        apply: applyProjectField as InkFields['apply'],
        options: PROJECT_FIELDS,
        blocks: PROJECT_FIELD_BLOCKS,
        category: 'Поля проекта',
      },
      previewPath: (locale, data) =>
        `/${locale}/projects/${(data as { project: { slug: string } }).project.slug}?preview=1&template=${slug}`,
    }
  }
  return {
    load: loadHomeData,
    blocks: HOME_BLOCKS as InkBlock[],
    defaultLayout: slug === 'home' ? DEFAULT_HOME_LAYOUT : '',
    exploders: EXPLODERS as PageKind['exploders'],
    previewPath: (locale) => `${slug === 'home' ? `/${locale}` : `/${locale}/${slug}`}?preview=1`,
  }
}

type PublishState = 'none' | 'changed' | 'published'

const PUBLISH_BADGE: Record<PublishState, { text: string; className: string }> = {
  none: { text: 'Не опубликовано — на сайте не видно', className: 'bg-amber-400/15 text-amber-300' },
  changed: { text: 'Есть изменения — на сайте ещё не видны', className: 'bg-amber-400/15 text-amber-300' },
  published: { text: 'Опубликовано — так видно на сайте', className: 'bg-emerald-400/15 text-emerald-300' },
}

const HELP_STEPS = [
  ['Выберите страницу и язык', 'Список слева вверху и кнопки RU / KZ / EN. У каждого языка своя раскладка.'],
  ['Меняйте тексты и фото', 'Дважды кликните по тексту или фото на странице. Текст сразу появится и в админке.'],
  ['Добавляйте и двигайте блоки', 'Кнопка «Блоки» справа — перетащите блок на страницу. Выделенный блок двигается стрелкой-крестиком на синей панели, удаляется корзиной.'],
  ['Настраивайте вид', 'Выделите блок и откройте «Настройки» — колонки, размеры, что показывать. «Стиль» — отступы, шрифты, цвета.'],
  ['Сохраните и опубликуйте', '«Сохранить» — черновик, на сайте его не видно. «Опубликовать» — изменения появятся на сайте. «Предпросмотр» — посмотреть до публикации.'],
  ['Разобрать на элементы', 'Кнопка с квадратиками на синей панели. Секция становится отдельными элементами, которые можно двигать. Обратно не собирается: удалите её и перетащите блок заново.'],
]

export default function EditorPage() {
  const { slug = 'home' } = useParams()
  const [searchParams] = useSearchParams()
  const embed = searchParams.has('embed')
  const navigate = useNavigate()
  const [authed, setAuthed] = useState(() => !!takeTokenFromHash())
  const [locale, setLocale] = useState<Locale>('ru')
  const [status, setStatus] = useState('')
  const [title, setTitle] = useState('')
  const [missing, setMissing] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [publishState, setPublishState] = useState<PublishState>('none')
  const [helpOpen, setHelpOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const editorRef = useRef<Editor | null>(null)
  const storeRef = useRef<ContentStore | null>(null)

  useEffect(() => {
    document.body.classList.add('ink-editor-open')
    return () => document.body.classList.remove('ink-editor-open')
  }, [])

  useEffect(() => {
    if (!authed || !containerRef.current) return
    let cancelled = false
    setStatus('Загрузка…')
    setDirty(false)

    const handleError = (err: unknown) => {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        setEditorToken(null)
        setAuthed(false)
        return
      }
      setStatus('Ошибка — изменения не сохранены')
    }

    const kind = pageKind(slug)
    Promise.all([kind.load(locale), getDraftPage(slug, locale)])
      .then(([data, page]) => {
        if (cancelled || !containerRef.current) return
        setTitle(page.title)
        const wasPublished = !!page.published_at
        setPublishState(!wasPublished ? 'none' : page.has_unpublished ? 'changed' : 'published')

        const store = createContentStore(data)
        storeRef.current = store
        const markDirty = () => {
          setDirty(true)
          setStatus('Есть несохранённые изменения')
        }

        const draft = page.draft
        let originals = new Map<string, string>()
        const editor = grapesjs.init({
          container: containerRef.current,
          height: '100%',
          width: 'auto',
          storageManager: false,
          selectorManager: { componentFirst: true },
          fromElement: false,
          i18n: {
            locale: 'ru',
            localeFallback: 'ru',
            detectLocale: false,
            messages: { ru },
            messagesAdd: { ru: { styleManager: { properties: STYLE_PROPERTIES_RU } } },
          },
          plugins: [inkPlugin({ store, locale, blocks: kind.blocks, exploders: kind.exploders, fields: kind.fields, onContentChange: markDirty })],
          ...((draft?.project?.pages?.length ?? 0) > 0
            ? { projectData: draft!.project }
            : { components: draft?.html || kind.defaultLayout, style: draft?.css ?? '' }),
          deviceManager: {
            devices: [
              { id: 'desktop', name: 'Десктоп', width: '' },
              { id: 'tablet', name: 'Планшет', width: '768px', widthMedia: '1023px' },
              { id: 'mobile', name: 'Телефон', width: '375px', widthMedia: '639px' },
            ],
          },
          assetManager: {
            upload: editorUploadUrl(),
            headers: editorAuthHeaders(),
            uploadName: 'files',
            multiUpload: true,
            autoAdd: true,
          },
        })
        editorRef.current = editor

        const save = async (): Promise<boolean> => {
          editor.runCommand('ink-commit-edit')
          setStatus('Сохранение…')
          const changes = store.takePending()
          try {
            if (changes.length) await saveSectionContent(locale, changes)
            editor.selectRemove(editor.getSelectedAll())
            ensureTextKeys(editor)
            const read = () => ({
              project: editor.getProjectData(),
              html: editor.getHtml(),
              css: editor.getCss({ avoidProtected: true }) ?? '',
            })
            if (locale === 'ru') {
              await saveDraftPage(slug, locale, read())
            } else {
              const { result, translations } = withBaseTexts(editor, originals, read)
              await saveDraftPage(slug, locale, { ...result, translations })
            }
            editor.clearDirtyCount()
            setDirty(false)
            setPublishState((current) => (current === 'none' ? 'none' : 'changed'))
            setStatus(changes.length ? 'Сохранено. Тексты секций уже на сайте, раскладка — в черновике' : 'Черновик сохранён')
            return true
          } catch (err) {
            store.restorePending(changes)
            handleError(err)
            return false
          }
        }

        editor.Commands.add('ink-save', { run: () => void save() })
        editor.Commands.add('ink-publish', {
          run: () => {
            if (!window.confirm('Опубликовать раскладку на сайте?')) return
            void save().then((ok) => {
              if (!ok) return
              publishPage(slug)
                .then(() => {
                  setStatus('Опубликовано на сайте')
                  setPublishState('published')
                })
                .catch(handleError)
            })
          },
        })
        editor.Commands.add('ink-preview', {
          run: () => {
            void save().then((ok) => ok && window.open(kind.previewPath(locale, data), '_blank'))
          },
        })
        for (const device of ['desktop', 'tablet', 'mobile']) {
          editor.Commands.add(`ink-device-${device}`, { run: (ed: Editor) => ed.setDevice(device) })
        }

        editor.Panels.removeButton('options', 'export-template')
        editor.Panels.removeButton('options', 'fullscreen')
        const VIEW_LABELS: Record<string, string> = {
          'open-sm': 'Стиль',
          'open-tm': 'Настройки',
          'open-layers': 'Слои',
          'open-blocks': 'Блоки',
        }
        for (const [id, text] of Object.entries(VIEW_LABELS)) {
          const button = editor.Panels.getButton('views', id)
          if (!button) continue
          button.set('attributes', { ...(button.get('attributes') ?? {}), title: text })
          button.set('label', `${button.get('label') ?? ''}<span class="ink-view-label">${text}</span>`)
        }
        editor.Panels.addPanel({
          id: 'ink-devices',
          buttons: [
            { id: 'dev-desktop', label: 'Десктоп', command: 'ink-device-desktop', togglable: false, active: true },
            { id: 'dev-tablet', label: 'Планшет', command: 'ink-device-tablet', togglable: false },
            { id: 'dev-mobile', label: 'Телефон', command: 'ink-device-mobile', togglable: false },
          ],
        })
        editor.Panels.addPanel({
          id: 'ink-actions',
          buttons: [
            { id: 'ink-save-btn', label: 'Сохранить', command: 'ink-save', togglable: false },
            { id: 'ink-preview-btn', label: 'Предпросмотр', command: 'ink-preview', togglable: false },
            { id: 'ink-publish-btn', label: 'Опубликовать', command: 'ink-publish', togglable: false },
          ],
        })

        editor.Keymaps.add('ink:save', '⌘+s, ctrl+s', 'ink-save', { prevent: true })
        editor.on('update', () => {
          if (editor.getDirtyCount() > 0) markDirty()
        })

        editor.onReady(() => {
          ensureTextKeys(editor)
          if (locale !== 'ru') originals = applyTranslations(editor, draft?.translations ?? {})
          setTimeout(() => {
            editor.clearDirtyCount()
            setDirty(false)
          })
          editor.Panels.getButton('views', 'open-blocks')?.set('active', true)
          editor.on('component:selected', (component) => {
            if (component.get('type') === 'ink-block' && (component.get('traits')?.length ?? 0) > 0) {
              editor.Panels.getButton('views', 'open-tm')?.set('active', true)
            }
          })
          setStatus(
            locale !== 'ru'
              ? `Раскладка общая для всех языков. Здесь меняются только тексты на ${locale.toUpperCase()}`
              : page.draft
                ? 'Дважды кликните по тексту или фото, чтобы изменить'
                : slug === 'legal'
                  ? 'Раскладка из текущей страницы. Текст документа меняется в админке'
                  : ['approach', 'about', 'contacts', 'news', 'projects'].includes(slug)
                  ? 'Раскладка из текущей страницы. Дважды кликните по тексту или фото, чтобы изменить'
                  : isProjectTemplate(slug) || slug === NEWS_TEMPLATE
                  ? 'Шаблон показан на примере. Сами данные меняются в админке'
                  : slug === 'home'
                    ? 'Раскладка из текущей главной. Дважды кликните по тексту или фото, чтобы изменить'
                    : 'Пустая страница — перетащите блоки справа',
          )
        })
      })
      .catch((err) => {
        if (axios.isAxiosError(err) && err.response?.status === 401) {
          setEditorToken(null)
          setAuthed(false)
          return
        }
        if (axios.isAxiosError(err) && err.response?.status === 404) {
          setMissing(true)
          return
        }
        setStatus('Не удалось загрузить редактор')
      })

    const beforeUnload = (e: BeforeUnloadEvent) => {
      if ((editorRef.current?.getDirtyCount() ?? 0) > 0 || storeRef.current?.hasPending()) e.preventDefault()
    }
    window.addEventListener('beforeunload', beforeUnload)

    return () => {
      cancelled = true
      window.removeEventListener('beforeunload', beforeUnload)
      editorRef.current?.destroy()
      editorRef.current = null
      storeRef.current = null
    }
  }, [authed, slug, locale])

  const switchPage = (next: string) => {
    if (next === slug) return
    if (dirty && !window.confirm('Есть несохранённые изменения — они пропадут. Открыть другую страницу?')) return
    navigate(`/editor/${next}${embed ? '?embed=1' : ''}`)
  }

  const switchLocale = (next: Locale) => {
    if (next === locale) return
    if (dirty && !window.confirm('Есть несохранённые изменения — они пропадут. Переключить язык?')) return
    setLocale(next)
  }

  if (!authed) return <LoginForm onLogin={() => setAuthed(true)} />

  if (missing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink-950 p-10 text-center text-white/70">
        Страница «{slug}» не найдена. Создайте её в админке в разделе «Страницы».
      </div>
    )
  }

  return (
    <div className="ink-editor fixed inset-0 flex flex-col bg-ink-950">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-white/10 px-4 py-2 text-xs text-white/60">
        <select
          value={slug}
          onChange={(e) => switchPage(e.target.value)}
          className="min-w-0 max-w-[60vw] shrink rounded bg-white/5 px-2 py-1 text-white/80 outline-none sm:max-w-none"
        >
          {!PAGE_OPTIONS.some((o) => o.slug === slug) && <option value={slug}>{title || slug}</option>}
          {PAGE_OPTIONS.map((o) => (
            <option key={o.slug} value={o.slug} className="bg-ink-950">
              {o.label}
            </option>
          ))}
        </select>
        <div className="flex shrink-0 gap-1">
          {LOCALES.map((code) => (
            <button
              key={code}
              onClick={() => switchLocale(code)}
              className={`rounded px-2 py-1 uppercase transition-colors ${
                code === locale ? 'bg-accent text-ink-950' : 'text-white/60 hover:text-white'
              }`}
            >
              {code}
            </button>
          ))}
        </div>
        <span className={`shrink-0 rounded px-2 py-1 ${dirty ? 'bg-white/10 text-white/80' : PUBLISH_BADGE[publishState].className}`}>
          {dirty ? 'Не сохранено' : PUBLISH_BADGE[publishState].text}
        </span>
        <span className="order-last min-w-0 basis-full truncate sm:order-none sm:basis-auto sm:flex-1 sm:text-center">{status}</span>
        <button
          onClick={() => setHelpOpen(true)}
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/30 text-white/80 hover:border-white hover:text-white"
          title="Как пользоваться"
        >
          ?
        </button>
        {!embed && (
          <button
            onClick={() => {
              setEditorToken(null)
              setAuthed(false)
            }}
            className="shrink-0 hover:text-white"
          >
            Выйти
          </button>
        )}
      </div>
      <div ref={containerRef} className="min-h-0 flex-1" />
      {helpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setHelpOpen(false)}>
          <div
            className="max-h-full w-full max-w-lg overflow-y-auto rounded-lg bg-ink-900 p-6 text-sm text-white/80"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-base font-medium text-white">Как пользоваться редактором</h2>
              <button onClick={() => setHelpOpen(false)} className="text-white/50 hover:text-white" aria-label="Закрыть">
                ✕
              </button>
            </div>
            <ol className="mt-5 space-y-4">
              {HELP_STEPS.map(([heading, text], i) => (
                <li key={heading} className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-medium text-ink-950">
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-medium text-white">{heading}</p>
                    <p className="mt-1 leading-relaxed text-white/60">{text}</p>
                  </div>
                </li>
              ))}
            </ol>
            <p className="mt-5 text-xs text-white/40">Проекты, новости, ссылки и видео заполняются в разделах админки слева.</p>
          </div>
        </div>
      )}
    </div>
  )
}
