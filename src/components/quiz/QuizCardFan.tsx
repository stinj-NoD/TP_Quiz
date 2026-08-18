import { AnimatePresence, motion } from 'framer-motion'
import type { QuizCardSlot, QuizCardVisualState } from '../../types/quiz.types'
import { QuizCard } from './QuizCard'

interface QuizCardFanProps {
  cards: QuizCardSlot[]
  chosenCardId: string | null
  visualState: QuizCardVisualState
  onChoose: (id: string) => void
}

const FAN_ROTATION = [-10, 0, 10]
const FAN_OFFSET_X = [-48, 0, 48]
const FAN_OFFSET_Y = [10, -6, 10]

export function QuizCardFan({ cards, chosenCardId, visualState, onChoose }: QuizCardFanProps) {
  const isLarge = chosenCardId !== null

  return (
    <div className={`relative flex items-center justify-center ${isLarge ? 'h-[350px]' : 'h-[190px]'}`}>
      <AnimatePresence>
        {cards.map((card, i) => {
          const isChosen = card.id === chosenCardId
          if (chosenCardId && !isChosen) return null

          return (
            <motion.div
              key={card.id}
              layout
              initial={false}
              animate={{
                rotate: chosenCardId ? 0 : FAN_ROTATION[i],
                x: chosenCardId ? 0 : FAN_OFFSET_X[i],
                y: chosenCardId ? 0 : FAN_OFFSET_Y[i],
                scale: 1,
              }}
              exit={{ opacity: 0, scale: 0.8, y: 24, transition: { duration: 0.25 } }}
              transition={{ type: 'spring', stiffness: 260, damping: 24 }}
              className="absolute"
            >
              <QuizCard
                card={card}
                state={isChosen ? visualState : 'back'}
                onClick={() => onChoose(card.id)}
                disabled={!!chosenCardId}
                large={isChosen && isLarge}
              />
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
