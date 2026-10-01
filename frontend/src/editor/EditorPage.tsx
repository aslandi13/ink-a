import axios from 'axios'
import grapesjs, { type Editor } from 'grapesjs'
import 'grapesjs/dist/css/grapes.min.css'
import ru from 'grapesjs/locale/ru.mjs'
import { useEffect, useRef, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
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
import { DEFAULT_HOME_LAYOUT, loadHomeData } from '../sections/home'
import { createContentStore, type ContentStore } from './contentStore'
import { inkPlugin } from './inkPlugin'
import LoginForm from './LoginForm'
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

export default function EditorPage() {
  const { slug = 'home' } = useParams()
  const [searchParams] = useSearchParams()
  const embed = searchParams.has('embed')
  const [authed, setAuthed] = useState(() => !!takeTokenFromHash())
  const [locale, setLocale] = useState<Locale>('ru')
  const [status, setStatus] = useState('')
  const [title, setTitle] = useState('')
  const [missing, setMissing] = useState(false)
  const [dirty, setDirty] = useState(false)
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

    Promise.all([loadHomeData(locale), getDraftPage(slug, locale)])
      .then(([data, page]) => {
        if (cancelled || !containerRef.current) return
        setTitle(page.title)

        const store = createContentStore(data)
        storeRef.current = store
        const markDirty = () => {
          setDirty(true)
          setStatus('Есть несохранённые изменения')
        }

        const draft = page.draft
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
          plugins: [inkPlugin({ store, locale, onContentChange: markDirty })],
          ...((draft?.project?.pages?.length ?? 0) > 0
            ? { projectData: draft!.project }
            : { components: draft?.html || (slug === 'home' ? DEFAULT_HOME_LAYOUT : ''), style: draft?.css ?? '' }),
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
            await saveDraftPage(slug, locale, {
              project: editor.getProjectData(),
              html: editor.getHtml(),
              css: editor.getCss({ avoidProtected: true }) ?? '',
            })
            editor.clearDirtyCount()
            setDirty(false)
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
                .then(() => setStatus('Опубликовано на сайте'))
                .catch(handleError)
            })
          },
        })
        editor.Commands.add('ink-preview', {
          run: () => {
            const path = slug === 'home' ? `/${locale}` : `/${locale}/${slug}`
            void save().then((ok) => ok && window.open(`${path}?preview=1`, '_blank'))
          },
        })
        for (const device of ['desktop', 'tablet', 'mobile']) {
          editor.Commands.add(`ink-device-${device}`, { run: (ed: Editor) => ed.setDevice(device) })
        }

        editor.Panels.removeButton('options', 'export-template')
        editor.Panels.removeButton('options', 'fullscreen')
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
          editor.runCommand('open-blocks')
          setStatus(
            page.inherited
              ? `Версия ${locale.toUpperCase()} создана из RU — измените тексты и сохраните`
              : page.draft
                ? 'Дважды кликните по тексту или фото, чтобы изменить'
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
      <div className="flex items-center gap-4 border-b border-white/10 px-4 py-2 text-xs text-white/60">
        <span className="shrink-0 text-white/80">{title || slug}</span>
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
        <span className="min-w-0 flex-1 truncate text-center">{status}</span>
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
    </div>
  )
}
