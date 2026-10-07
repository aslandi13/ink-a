import { useLayoutEffect, useRef, type ReactNode } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'
import Footer from './Footer'
import Header from './Header'

export default function Layout({ children }: { children: ReactNode }) {
  const { pathname } = useLocation()
  const navigationType = useNavigationType()
  const page = pathname.replace(/^\/[a-z]{2}(?=\/|$)/, '')
  const lastPage = useRef(page)

  useLayoutEffect(() => {
    if (navigationType === 'PUSH' && lastPage.current !== page) window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
    lastPage.current = page
  }, [page, navigationType])

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
