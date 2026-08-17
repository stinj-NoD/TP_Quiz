import { useState } from 'react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import { AnswerFeedback } from './AnswerFeedback'
import { CATEGORY_COLORS, CATEGORY_LABELS, DIFFICULTY_COLORS, DIFFICULTY_LABELS } from '../../types/question.types'
import type { Question } from '../../types/question.types'

interface QuestionModalProps {
  question: Question | null
  playerName: string
  onAnswer: (correct: boolean) => void
}

export function QuestionModal({ question, playerName, onAnswer }: QuestionModalProps) {
  const [revealed, setRevealed] = useState(false)
  const [result, setResult] = useState<boolean | null>(null)

  if (!question) return null

  const handleJudge = (correct: boolean) => {
    setResult(correct)
  }

  const handleContinue = () => {
    if (result == null) return
    onAnswer(result)
    setRevealed(false)
    setResult(null)
  }

  return (
    <Modal open={!!question}>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge color={CATEGORY_COLORS[question.category]}>{CATEGORY_LABELS[question.category]}</Badge>
            {question.difficulty && (
              <Badge color={DIFFICULTY_COLORS[question.difficulty]} filled={false}>
                {DIFFICULTY_LABELS[question.difficulty]}
              </Badge>
            )}
          </div>
          <span className="text-xs text-[var(--color-text-muted)]">Au tour de {playerName}</span>
        </div>

        <p className="text-lg font-semibold leading-snug">{question.question}</p>

        {!revealed && (
          <Button size="lg" variant="secondary" className="w-full" onClick={() => setRevealed(true)}>
            Révéler la réponse
          </Button>
        )}

        {revealed && result === null && (
          <div className="flex flex-col gap-3">
            <p className="rounded-[var(--radius-md)] bg-[var(--color-surface-raised)] p-3 text-sm ring-1 ring-[var(--color-border)]">
              {question.answer}
            </p>
            <p className="text-xs text-[var(--color-text-muted)]">
              {playerName} a-t-il/elle donné la bonne réponse ?
            </p>
            <div className="flex gap-3">
              <Button variant="danger" className="flex-1" onClick={() => handleJudge(false)}>
                Incorrect
              </Button>
              <Button className="flex-1" onClick={() => handleJudge(true)}>
                Correct
              </Button>
            </div>
          </div>
        )}

        {result !== null && (
          <div className="flex flex-col gap-3">
            <AnswerFeedback correct={result} answer={question.answer} />
            <Button size="lg" className="w-full" onClick={handleContinue}>
              Continuer
            </Button>
          </div>
        )}
      </div>
    </Modal>
  )
}
