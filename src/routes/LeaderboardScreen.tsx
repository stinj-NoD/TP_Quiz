import { Trophy } from 'lucide-react'
import { ScreenHeader } from '../components/layout/ScreenHeader'
import { ScreenTransition } from '../components/layout/ScreenTransition'
import { Card } from '../components/ui/Card'
import { useGeoStore } from '../store/geoStore'
import { GEO_QUIZ_TYPE_LABELS } from '../types/geo.types'

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}

const RANK_COLORS: Record<number, string> = {
  0: '#ffd60a',
  1: '#c9c9d9',
  2: '#c9a06a',
}

export function LeaderboardScreen() {
  const history = useGeoStore((state) => state.history)

  return (
    <ScreenTransition>
      <ScreenHeader title="Classement" />
      <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-5 pb-5">
        {history.length === 0 && (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
            <Trophy size={40} className="text-[var(--color-text-muted)]" />
            <p className="text-sm text-[var(--color-text-muted)]">
              Aucun score enregistré pour l'instant. Jouez une session en mode Géographie pour
              apparaître ici !
            </p>
          </div>
        )}

        {history.map((result, index) => {
          const percent =
            result.totalQuestions > 0
              ? Math.round((result.correctAnswers / result.totalQuestions) * 100)
              : 0
          const rankColor = RANK_COLORS[index]

          return (
            <Card key={`${result.answeredAt}-${index}`} className="flex items-center gap-3">
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold font-[var(--font-display)]"
                style={{
                  backgroundColor: rankColor ?? 'var(--color-surface-raised)',
                  color: rankColor ? '#1a1420' : 'var(--color-text-muted)',
                  boxShadow: rankColor ? `0 0 10px ${rankColor}88` : undefined,
                }}
              >
                {index + 1}
              </span>
              <div className="flex-1">
                <p className="text-sm font-semibold">{result.playerName ?? 'Joueur'}</p>
                <p className="text-xs text-[var(--color-text-muted)]">
                  {result.mode === 'timer' ? 'Défi chrono' : GEO_QUIZ_TYPE_LABELS[result.type!]} ·{' '}
                  {result.correctAnswers} / {result.totalQuestions} · {formatDate(result.answeredAt)}
                </p>
              </div>
              <span className="text-lg font-bold font-[var(--font-display)] text-[var(--color-primary-light)]">
                {percent}%
              </span>
            </Card>
          )
        })}
      </div>
    </ScreenTransition>
  )
}
