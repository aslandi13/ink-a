import type { ReactNode } from 'react'
import { t } from '../lib/i18n'
import { useLocale } from '../lib/useLocale'

interface ErrorMessageProps {
  children?: ReactNode
  className?: string
}

/**
 * Generic error state component displayed when an API request fails.
 */
export default function ErrorMessage({
  children,
  className = '',
}: ErrorMessageProps) {
  const tr = t(useLocale())
  return (
    <div
      role="alert"
      className={`flex min-h-[40vh] flex-col items-center justify-center gap-4 px-6 text-center ${className}`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="40"
        height="40"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-white/20"
        aria-hidden
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      <p className="max-w-sm text-sm text-white/40">{children ?? tr.ui.error}</p>
      <button
        onClick={() => window.location.reload()}
        className="mt-2 border border-white/20 px-4 py-2 text-sm text-white/60 transition-colors hover:border-white/40 hover:text-white/80"
      >
        {tr.ui.reload}
      </button>
    </div>
  )
}
