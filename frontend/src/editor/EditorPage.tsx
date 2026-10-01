import axios from 'axios'
import grapesjs, { type Component, type Editor } from 'grapesjs'
import 'grapesjs/dist/css/grapes.min.css'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { MemoryRouter, Route, Routes, useParams } from 'react-router-dom'
import {
  editorAuthHeaders,
  editorLogin,
  editorUploadUrl,
  getDraftPage,
  getEditorToken,
  publishPage,
  saveDraftPage,
  setEditorToken,
} from '../api/pages'
import { DEFAULT_HOME_LAYOUT, HOME_BLOCKS, loadHomeData, type HomeData } from '../sections/home'
import './editor.css'

const CANVAS_CSS = `
  body { background-color: #050a12 !important; color: rgb(255 255 255 / 0.92); }
  [data-block] > * { pointer-events: none; }
  [data-block] [style*="opacity: 0"] { opacity: 1 !important; transform: none !important; }
  [data-block]:empty { min-height: 120px; }
`

const CONTAINER = 'max-width:84rem;margin:0 auto;padding:48px 24px;'
const SERIF = "font-family:'Playfair Display',Georgia,serif;"
const SANS = "font-family:'Manrope',system-ui,sans-serif;"

const BASIC_BLOCKS = [
  {
    id: 'heading',
    label: 'Заголовок',
    content: `<div style="${CONTAINER}"><h2 style="${SERIF}font-size:40px;line-height:1.1;font-weight:400;color:#ffffff;margin:0">Заголовок</h2></div>`,
  },
  {
    id: 'text',
    label: 'Текст',
    content: `<div style="${CONTAINER}"><p style="${SANS}font-size:16px;line-height:1.6;color:rgba(255,255,255,0.7);margin:0;max-width:640px">Текст абзаца. Нажмите дважды, чтобы изменить.</p></div>`,
  },
  {
    id: 'image',
    label: 'Фото',
    content: { type: 'image', style: { display: 'block', width: '100%', height: 'auto', 'max-width': '84rem', margin: '0 auto' }, activate: true },
  },
  {
    id: 'video',
    label: 'Видео',
    content: {
      type: 'video',
      style: { display: 'block', width: '100%', 'max-width': '84rem', height: '480px', margin: '0 auto', 'object-fit': 'cover' },
      autoplay: true,
      loop: true,
      muted: true,
      controls: false,
    },
  },
  {
    id: 'button',
    label: 'Кнопка',
    content: `<div style="${CONTAINER}"><a href="/ru/contacts" style="${SANS}display:inline-block;padding:12px 32px;border-radius:20px;background:#39404b;color:#ffffff;text-decoration:none;font-size:16px">Кнопка</a></div>`,
  },
  {
    id: 'columns-2',
    label: '2 колонки',
    content: `<div style="${CONTAINER}display:flex;flex-wrap:wrap;gap:24px"><div style="flex:1 1 300px;min-height:120px"></div><div style="flex:1 1 300px;min-height:120px"></div></div>`,
  },
  {
    id: 'columns-3',
    label: '3 колонки',
    content: `<div style="${CONTAINER}display:flex;flex-wrap:wrap;gap:24px"><div style="flex:1 1 220px;min-height:120px"></div><div style="flex:1 1 220px;min-height:120px"></div><div style="flex:1 1 220px;min-height:120px"></div></div>`,
  },
  {
    id: 'spacer',
    label: 'Отступ',
    content: '<div style="height:80px"></div>',
  },
]

function BlockPreview({ id, data }: { id: string; data: HomeData }) {
  const { locale } = useParams()
  const block = HOME_BLOCKS.find((b) => b.id === id)
  if (!block) return <div style={{ padding: 24, color: '#fff' }}>Неизвестный блок: {id}</div>
  return <>{block.render({ data, locale: locale === 'kz' || locale === 'en' ? locale : 'ru' })}</>
}

function inkPlugin(data: HomeData) {
  return (editor: Editor) => {
    const roots = new WeakMap<HTMLElement, Root>()

    const mount = (el: HTMLElement, id: string) => {
      let root = roots.get(el)
      if (!root) {
        root = createRoot(el)
        roots.set(el, root)
      }
      root.render(
        <MemoryRouter initialEntries={['/ru']}>
          <Routes>
            <Route path=":locale/*" element={<BlockPreview id={id} data={data} />} />
          </Routes>
        </MemoryRouter>,
      )
    }

    editor.DomComponents.addType('ink-block', {
      isComponent: (el) =>
        el instanceof HTMLElement && el.tagName === 'SECTION' && el.dataset.block ? { type: 'ink-block' } : undefined,
      model: {
        defaults: {
          tagName: 'section',
          droppable: false,
          editable: false,
          components: [],
          traits: [],
        },
        init(this: Component) {
          const id = this.getAttributes()['data-block']
          const label = HOME_BLOCKS.find((b) => b.id === id)?.label ?? id
          this.set('name', `Секция: ${label}`)
        },
      },
      view: {
        onRender({ el, model }) {
          mount(el as HTMLElement, model.getAttributes()['data-block'])
        },
      },
    })

    editor.on('component:remove', (component: Component) => {
      const el = component.getEl()
      if (el) roots.get(el)?.unmount()
    })

    HOME_BLOCKS.forEach((block) => {
      editor.Blocks.add(`section-${block.id}`, {
        label: block.label,
        category: 'Секции сайта',
        content: { type: 'ink-block', attributes: { 'data-block': block.id } },
      })
    })

    BASIC_BLOCKS.forEach((block) => {
      editor.Blocks.add(block.id, { label: block.label, category: 'Элементы', content: block.content })
    })

    const injectStyles = (doc: Document) => {
      if (doc.head.querySelector('[data-ink-styles]')) return
      document.querySelectorAll('style, link[rel="stylesheet"]').forEach((node) => {
        const source = node instanceof HTMLLinkElement ? node.href : node.getAttribute('data-vite-dev-id') ?? ''
        if (/grapes|EditorPage|editor\.css/i.test(source)) return
        doc.head.appendChild(node.cloneNode(true))
      })
      const style = doc.createElement('style')
      style.setAttribute('data-ink-styles', '')
      style.textContent = CANVAS_CSS
      doc.head.appendChild(style)
    }

    editor.on('load', () => {
      const doc = editor.Canvas.getDocument()
      if (doc) injectStyles(doc)
    })
    editor.on('canvas:frame:load', ({ window: frameWindow }: { window: Window }) => injectStyles(frameWindow.document))
  }
}

function LoginForm({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    editorLogin(email, password)
      .then(onLogin)
      .catch((err) => {
        const message = axios.isAxiosError(err) ? err.response?.data?.message : null
        setError(message || 'Не удалось войти')
      })
      .finally(() => setBusy(false))
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-950 px-6">
      <form onSubmit={submit} className="w-full max-w-sm space-y-4">
        <h1 className="font-serif text-3xl text-white">Визуальный редактор</h1>
        <p className="text-sm text-white/50">Войдите с логином и паролем от админки.</p>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full border border-white/20 bg-transparent px-4 py-3 text-white outline-none focus:border-white"
        />
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Пароль"
          className="w-full border border-white/20 bg-transparent px-4 py-3 text-white outline-none focus:border-white"
        />
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={busy}
          className="w-full bg-white px-4 py-3 text-ink-950 transition-opacity hover:opacity-80 disabled:opacity-50"
        >
          {busy ? 'Вход…' : 'Войти'}
        </button>
      </form>
    </div>
  )
}

const SUPPORTED_PAGES = ['home']

export default function EditorPage() {
  const { slug = 'home' } = useParams()
  const [authed, setAuthed] = useState(() => !!getEditorToken())
  const [status, setStatus] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const editorRef = useRef<Editor | null>(null)

  useEffect(() => {
    if (!authed || !SUPPORTED_PAGES.includes(slug) || !containerRef.current) return
    let cancelled = false
    setStatus('Загрузка…')

    Promise.all([loadHomeData('ru'), getDraftPage(slug)])
      .then(([data, page]) => {
        if (cancelled || !containerRef.current) return

        const editor = grapesjs.init({
          container: containerRef.current,
          height: '100%',
          width: 'auto',
          storageManager: false,
          fromElement: false,
          plugins: [inkPlugin(data)],
          ...(page.draft?.project ? { projectData: page.draft.project } : { components: DEFAULT_HOME_LAYOUT }),
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

        const handleError = (err: unknown) => {
          if (axios.isAxiosError(err) && err.response?.status === 401) {
            setEditorToken(null)
            setAuthed(false)
            return
          }
          setStatus('Ошибка — изменения не сохранены')
        }

        const save = (): Promise<boolean> => {
          setStatus('Сохранение…')
          return saveDraftPage(slug, {
            project: editor.getProjectData(),
            html: editor.getHtml(),
            css: editor.getCss({ avoidProtected: true }) ?? '',
          })
            .then(() => {
              editor.clearDirtyCount()
              setStatus('Черновик сохранён')
              return true
            })
            .catch((err) => {
              handleError(err)
              return false
            })
        }

        editor.Commands.add('ink-save', { run: () => void save() })
        editor.Commands.add('ink-publish', {
          run: () => {
            if (!window.confirm('Опубликовать изменения на сайте?')) return
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
            void save().then((ok) => ok && window.open('/ru?preview=1', '_blank'))
          },
        })
        for (const device of ['desktop', 'tablet', 'mobile']) {
          editor.Commands.add(`ink-device-${device}`, { run: (ed: Editor) => ed.setDevice(device) })
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
          if (editor.getDirtyCount() > 0) setStatus('Есть несохранённые изменения')
        })

        editor.on('load', () => setStatus(page.draft ? 'Черновик загружен' : 'Новая раскладка из текущей главной'))
      })
      .catch((err) => {
        if (axios.isAxiosError(err) && err.response?.status === 401) {
          setEditorToken(null)
          setAuthed(false)
          return
        }
        setStatus('Не удалось загрузить редактор')
      })

    const beforeUnload = (e: BeforeUnloadEvent) => {
      if ((editorRef.current?.getDirtyCount() ?? 0) > 0) e.preventDefault()
    }
    window.addEventListener('beforeunload', beforeUnload)

    return () => {
      cancelled = true
      window.removeEventListener('beforeunload', beforeUnload)
      editorRef.current?.destroy()
      editorRef.current = null
    }
  }, [authed, slug])

  if (!authed) return <LoginForm onLogin={() => setAuthed(true)} />

  if (!SUPPORTED_PAGES.includes(slug)) {
    return <div className="p-10 text-white">Эта страница пока не подключена к редактору.</div>
  }

  return (
    <div className="ink-editor fixed inset-0 flex flex-col bg-ink-950">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-2 text-xs text-white/60">
        <span>Редактор · Главная</span>
        <span>{status}</span>
        <button
          onClick={() => {
            setEditorToken(null)
            setAuthed(false)
          }}
          className="hover:text-white"
        >
          Выйти
        </button>
      </div>
      <div ref={containerRef} className="min-h-0 flex-1" />
    </div>
  )
}
