import { motion } from 'framer-motion'
import type { ConquestCard } from '../../types/conquest.types'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'
import { ConquestCardFace } from './ConquestCardFace'

interface ConquestDrawPileProps {
  label: string
  remaining: number
  drawnCard: ConquestCard | null
  canDraw: boolean
  onDraw: () => void
}

export function ConquestDrawPile({ label, remaining, drawnCard, canDraw, onDraw }: ConquestDrawPileProps) {
  const prefersReducedMotion = usePrefersReducedMotion()
  const isFlipped = drawnCard !== null

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="[perspective:1000px]">
        <motion.button
          type="button"
          onClick={onDraw}
          disabled={!canDraw}
          aria-label={
            canDraw
              ? `${label} : piocher une carte (${remaining} restante${remaining > 1 ? 's' : ''})`
              : `${label} : ${remaining} carte${remaining > 1 ? 's' : ''} restante${remaining > 1 ? 's' : ''}`
          }
          className="relative h-24 w-[68px] [transform-style:preserve-3d] disabled:cursor-default"
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          whileHover={canDraw ? { scale: 1.06 } : undefined}
          whileTap={canDraw ? { scale: 0.94 } : undefined}
          transition={{ duration: prefersReducedMotion ? 0 : 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <div
            className="absolute inset-0 flex items-center justify-center rounded-[var(--radius-sm)] [backface-visibility:hidden]"
            style={{ background: 'var(--gradient-primary)', boxShadow: canDraw ? 'var(--glow-sm)' : undefined }}
          >
            <span className="text-sm font-bold text-white">{remaining}</span>
          </div>
          <div className="absolute inset-0 [backface-visibility:hidden]" style={{ transform: 'rotateY(180deg)' }}>
            {drawnCard && <ConquestCardFace card={drawnCard} size="reveal" />}
          </div>
        </motion.button>
      </div>
      <span className="text-[11px] font-medium text-[var(--color-text-muted)]">{label}</span>
    </div>
  )
}
