import { Badge } from '../ui/Badge'
import {
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  DIFFICULTY_COLORS,
  DIFFICULTY_LABELS,
} from '../../types/question.types'
import type { QuizHiddenInfo } from '../../types/quiz.types'

interface QuizCardBackProps {
  hiddenInfo: QuizHiddenInfo
}

export function QuizCardBack({ hiddenInfo }: QuizCardBackProps) {
  return (
    <div
      className="flex h-full w-full flex-col items-center justify-center gap-3 rounded-[var(--radius-lg)] p-3 text-center ring-1 ring-[var(--color-border-glow)]"
      style={{
        backgroundColor: 'var(--color-surface-raised)',
        backgroundImage:
          'radial-gradient(circle at 20% 20%, color-mix(in srgb, var(--color-primary) 18%, transparent) 0, transparent 45%), radial-gradient(circle at 80% 80%, color-mix(in srgb, var(--color-accent-cyan) 18%, transparent) 0, transparent 45%), repeating-linear-gradient(135deg, color-mix(in srgb, var(--color-primary-light) 6%, transparent) 0 2px, transparent 2px 14px)',
      }}
    >
      <span className="text-2xl">?</span>
      {hiddenInfo.kind === 'category' ? (
        <Badge color={CATEGORY_COLORS[hiddenInfo.category]}>{CATEGORY_LABELS[hiddenInfo.category]}</Badge>
      ) : (
        <Badge color={DIFFICULTY_COLORS[hiddenInfo.difficulty]}>
          {DIFFICULTY_LABELS[hiddenInfo.difficulty]}
        </Badge>
      )}
    </div>
  )
}
