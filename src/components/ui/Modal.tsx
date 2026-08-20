import { AnimatePresence, motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'

interface ModalProps {
  open: boolean
  children: ReactNode
  onClose?: () => void
  /** Habillage optionnel propre à un mode — 'conquest' pour la DA pixel du mode Conquête.
   *  Par défaut : style neutre, inchangé pour Quiz et Géo. */
  accent?: 'conquest'
}

export function Modal({ open, children, onClose, accent }: ModalProps) {
  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className={`w-full max-w-[var(--app-max-width)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-raised)] ${
              accent === 'conquest'
                ? 'rounded-t-[var(--radius-sm)] ring-2 ring-[var(--color-cq-frame)] sm:rounded-[var(--radius-sm)]'
                : 'rounded-t-[var(--radius-lg)] ring-1 ring-[var(--color-border-glow)] sm:rounded-[var(--radius-lg)]'
            }`}
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
