import { Button } from '../ui/Button'

interface QuizJudgeControlsProps {
  playerName: string
  onJudge: (correct: boolean) => void
}

export function QuizJudgeControls({ playerName, onJudge }: QuizJudgeControlsProps) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-center text-xs text-[var(--color-text-muted)]">
        {playerName} a-t-il/elle donné la bonne réponse ?
      </p>
      <div className="flex gap-3">
        <Button variant="danger" className="flex-1" onClick={() => onJudge(false)}>
          Incorrect
        </Button>
        <Button className="flex-1" onClick={() => onJudge(true)}>
          Correct
        </Button>
      </div>
    </div>
  )
}
