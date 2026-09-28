/**
 * StaggerReveal — анимация последовательного появления дочерних элементов.
 * Используй <StaggerList> как обёртку и <StaggerItem> для каждого элемента.
 */
import { motion, type Variants } from 'framer-motion'
import type { ReactNode } from 'react'

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] },
  },
}

interface Props {
  children: ReactNode
  className?: string
  style?: React.CSSProperties
}

export function StaggerList({ children, className }: Props) {
  return (
    <motion.div
      className={className}
      variants={containerVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-60px' }}
    >
      {children}
    </motion.div>
  )
}

export function StaggerItem({ children, className, style }: Props) {
  return (
    <motion.div className={className} style={style} variants={itemVariants}>
      {children}
    </motion.div>
  )
}
