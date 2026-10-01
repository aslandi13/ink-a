import axios from 'axios'
import { useState, type FormEvent } from 'react'
import { editorLogin } from '../api/pages'

export default function LoginForm({ onLogin }: { onLogin: () => void }) {
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
