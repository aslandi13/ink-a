const CONTAINER = 'max-width:84rem;margin:0 auto;padding:48px 24px;'
const SERIF = "font-family:'Playfair Display',Georgia,serif;"
const SANS = "font-family:'Manrope',system-ui,sans-serif;"

export const BASIC_BLOCKS = [
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
