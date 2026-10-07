import { useLayoutEffect, type ReactNode } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'
import Footer from './Footer'
import Header from './Header'

export default function Layout({ children }: { children: ReactNode }) {
  const { pathname } = useLocation()
  const navigationType = useNavigationType()

  useLayoutEffect(() => {
    if (navigationType === 'PUSH') window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [pathname, navigationType])

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
