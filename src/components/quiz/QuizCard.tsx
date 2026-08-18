import { motion } from 'framer-motion'
import type { QuizCardSlot, QuizCardVisualState } from '../../types/quiz.types'
import { QuizCardBack } from './QuizCardBack'
import { QuizCardFront } from './QuizCardFront'
import { QuizCardReveal } from './QuizCardReveal'

interface QuizCardProps {
  card: QuizCardSlot
  state: QuizCardVisualState
  onClick?: () => void
  disabled?: boolean
  large?: boolean
}

/**
 * 'back' -> rotateY 0 (face visible = dos) ; 'front'/'revealed' -> rotateY 180 (face visible = avant).
 * Le contenu 'front' vs 'revealed' est géré par une simple substitution (pas un 2e flip) pour
 * éviter un flip incongru dans le sens inverse : la carte reste rotateY(180) et le contenu
 * interne bascule de QuizCardFront à QuizCardReveal.
 */
export function QuizCard({ card, state, onClick, disabled, large }: QuizCardProps) {
  const isFlipped = state !== 'back'
  const size = large ? { width: 240, height: 336 } : { width: 92, height: 130 }

  return (
    <div className="[perspective:1200px]" style={size}>
      <motion.button
        type="button"
        onClick={onClick}
        disabled={disabled || state !== 'back'}
        className="relative h-full w-full [transform-style:preserve-3d] disabled:cursor-default"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        whileHover={!disabled && state === 'back' ? { scale: 1.06 } : undefined}
        whileTap={!disabled && state === 'back' ? { scale: 0.96 } : undefined}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="absolute inset-0 [backface-visibility:hidden]">
          <QuizCardBack hiddenInfo={card.hiddenInfo} />
        </div>
        <div className="absolute inset-0 [backface-visibility:hidden]" style={{ transform: 'rotateY(180deg)' }}>
          {state === 'revealed' ? (
            <QuizCardReveal question={card.question} />
          ) : (
            <QuizCardFront question={card.question} />
          )}
        </div>
      </motion.button>
    </div>
  )
}
