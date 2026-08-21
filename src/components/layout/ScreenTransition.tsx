import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface ScreenTransitionProps {
  children: ReactNode
  variant?: 'slide' | 'fade'
  /** Classes additionnelles sur le conteneur d'écran — sert notamment aux modes qui
   *  imposent leur propre fond (Conquête), sans toucher au fond global de l'app. */
  className?: string
}

const variants = {
  slide: {
    initial: { opacity: 0, x: 24 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -24 },
  },
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
}

export function ScreenTransition({ children, variant = 'slide', className = '' }: ScreenTransitionProps) {
  return (
    <motion.div
      className={`flex h-full w-full flex-col ${className}`}
      initial={variants[variant].initial}
      animate={variants[variant].animate}
      exit={variants[variant].exit}
      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  )
}
