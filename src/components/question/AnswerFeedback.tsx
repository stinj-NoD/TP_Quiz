import { Check, X } from 'lucide-react'
import { motion } from 'framer-motion'
import { useEffect } from 'react'
import { useHaptics } from '../../hooks/useHaptics'

interface AnswerFeedbackProps {
  correct: boolean
  answer: string
}

export function AnswerFeedback({ correct, answer }: AnswerFeedbackProps) {
  const vibrate = useHaptics()

  useEffect(() => {
    vibrate(correct ? 20 : [30, 40, 30])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 rounded-[var(--radius-md)] p-3"
      style={{
        backgroundColor: correct ? 'var(--color-success-bg)' : 'var(--color-danger-bg)',
        boxShadow: correct ? 'var(--glow-success)' : 'var(--glow-danger)',
      }}
    >
      <span
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
        style={{
          backgroundColor: correct ? 'var(--color-success)' : 'var(--color-danger)',
          boxShadow: correct ? 'var(--glow-success)' : 'var(--glow-danger)',
        }}
      >
        {correct ? <Check size={18} color="white" /> : <X size={18} color="white" />}
      </span>
      <div className="text-sm">
        <p className="font-semibold">{correct ? 'Bonne réponse !' : 'Mauvaise réponse'}</p>
        {!correct && <p className="text-[var(--color-text-muted)]">Réponse : {answer}</p>}
      </div>
    </motion.div>
  )
}
