import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

const ease = [0.76, 0, 0.24, 1] as const

export default function PageTransition({ children }: { children: ReactNode }) {
  return (
    <>
      {/* Curtain: exit=covers screen (scaleY 0→1 from top), animate=reveals (scaleY 1→0 upward) */}
      <motion.div
        className="pointer-events-none fixed inset-0 z-[9999] bg-ink-950"
        initial={{ scaleY: 1, transformOrigin: 'top' }}
        animate={{ scaleY: 0, transformOrigin: 'top', transition: { duration: 0.5, ease } }}
        exit={{ scaleY: 1, transformOrigin: 'bottom', transition: { duration: 0.45, ease } }}
      />
      {/* Content always visible — curtain covers the swap */}
      {children}
    </>
  )
}
