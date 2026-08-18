import { Badge } from '../ui/Badge'
import {
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  DIFFICULTY_COLORS,
  DIFFICULTY_LABELS,
} from '../../types/question.types'
import type { Question } from '../../types/question.types'

interface QuizCardFrontProps {
  question: Question
}

export function QuizCardFront({ question }: QuizCardFrontProps) {
  return (
    <div className="flex h-full w-full flex-col gap-2 overflow-y-auto rounded-[var(--radius-lg)] bg-[var(--color-surface)] p-3 ring-1 ring-[var(--color-border)]">
      <div className="flex flex-wrap items-center gap-1.5">
        <Badge color={CATEGORY_COLORS[question.category]}>{CATEGORY_LABELS[question.category]}</Badge>
        {question.difficulty && (
          <Badge color={DIFFICULTY_COLORS[question.difficulty]} filled={false}>
            {DIFFICULTY_LABELS[question.difficulty]}
          </Badge>
        )}
      </div>
      <p className="text-sm font-semibold leading-snug">{question.question}</p>
    </div>
  )
}
