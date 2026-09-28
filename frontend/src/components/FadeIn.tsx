import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

/**
 * For above-the-fold content that must be visible immediately on load —
 * animates in on mount rather than waiting for a scroll-into-view
 * IntersectionObserver callback (which can race with the first paint and
 * leave the page looking blank for a moment).
 */
export default function FadeIn({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode
  delay?: number
  className?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut', delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
