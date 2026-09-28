import type { ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import Footer from './Footer'
import Header from './Header'

export default function Layout({ children }: { children: ReactNode }) {
  const location = useLocation()
  void location

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
