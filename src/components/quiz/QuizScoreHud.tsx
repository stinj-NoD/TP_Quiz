import { PLAYER_COLOR_VALUES } from '../../types/game.types'
import type { QuizPlayer } from '../../types/quiz.types'

interface QuizScoreHudProps {
  players: QuizPlayer[]
  currentPlayerIndex: number
}

export function QuizScoreHud({ players, currentPlayerIndex }: QuizScoreHudProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {players.map((player, index) => {
        const active = index === currentPlayerIndex
        const color = PLAYER_COLOR_VALUES[player.color]
        return (
          <div
            key={player.id}
            className="flex shrink-0 items-center gap-2 rounded-[var(--radius-md)] px-3 py-2 transition-[box-shadow]"
            style={{
              backgroundColor: 'var(--color-surface-raised)',
              boxShadow: active ? `0 0 0 1.5px ${color}, 0 0 12px ${color}66` : undefined,
            }}
          >
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}` }}
            />
            <span className="max-w-[80px] truncate text-xs font-medium">{player.name}</span>
            <span className="shrink-0 text-xs font-bold text-[var(--color-primary-light)]">{player.score}</span>
          </div>
        )
      })}
    </div>
  )
}
