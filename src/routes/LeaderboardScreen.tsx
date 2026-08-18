import { Trophy } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ScreenHeader } from '../components/layout/ScreenHeader'
import { ScreenTransition } from '../components/layout/ScreenTransition'
import { Card } from '../components/ui/Card'
import { RankBadge } from '../components/ui/RankBadge'
import { useGeoStore } from '../store/geoStore'
import { useQuizStore } from '../store/quizStore'
import { GEO_QUIZ_TYPE_LABELS } from '../types/geo.types'

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}

type Tab = 'geographie' | 'quiz'

function GeoLeaderboard() {
  const history = useGeoStore((state) => state.history)

  if (history.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
        <Trophy size={40} className="text-[var(--color-text-muted)]" />
        <p className="text-sm text-[var(--color-text-muted)]">
          Aucun score enregistré pour l'instant. Jouez une session en mode Géographie pour
          apparaître ici !
        </p>
      </div>
    )
  }

  return (
    <>
      {history.map((result, index) => {
        const percent =
          result.totalQuestions > 0 ? Math.round((result.correctAnswers / result.totalQuestions) * 100) : 0

        return (
          <Card key={`${result.answeredAt}-${index}`} className="flex items-center gap-3">
            <RankBadge index={index} />
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
    </>
  )
}

function QuizLeaderboard() {
  const history = useQuizStore((state) => state.history)

  if (history.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
        <Trophy size={40} className="text-[var(--color-text-muted)]" />
        <p className="text-sm text-[var(--color-text-muted)]">
          Aucune partie de Quiz terminée pour l'instant. Jouez une partie pour apparaître ici !
        </p>
      </div>
    )
  }

  return (
    <>
      {history.map((result, index) => (
        <Card key={result.id} className="flex items-center gap-3">
          <RankBadge index={index} />
          <div className="flex-1">
            <p className="text-sm font-semibold">{result.winnerName}</p>
            <p className="text-xs text-[var(--color-text-muted)]">
              {result.playerCount} joueur{result.playerCount > 1 ? 's' : ''} · {formatDate(result.finishedAt)}
            </p>
          </div>
          <span className="text-lg font-bold font-[var(--font-display)] text-[var(--color-primary-light)]">
            {result.players[0]?.score ?? 0} pts
          </span>
        </Card>
      ))}
    </>
  )
}

export function LeaderboardScreen() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>('geographie')

  return (
    <ScreenTransition>
      <ScreenHeader title="Classement" onBack={() => navigate('/profil')} />
      <div className="flex flex-col gap-3 px-5 pb-2">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setTab('geographie')}
            className={`flex-1 rounded-[var(--radius-md)] py-2 text-sm font-semibold transition-[transform,box-shadow] active:scale-95 ${
              tab === 'geographie'
                ? 'bg-[var(--gradient-primary)] text-white shadow-[var(--glow-sm)]'
                : 'bg-[var(--color-surface-raised)] text-[var(--color-text-muted)]'
            }`}
          >
            Géographie
          </button>
          <button
            type="button"
            onClick={() => setTab('quiz')}
            className={`flex-1 rounded-[var(--radius-md)] py-2 text-sm font-semibold transition-[transform,box-shadow] active:scale-95 ${
              tab === 'quiz'
                ? 'bg-[var(--gradient-primary)] text-white shadow-[var(--glow-sm)]'
                : 'bg-[var(--color-surface-raised)] text-[var(--color-text-muted)]'
            }`}
          >
            Quiz
          </button>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-5 pb-5">
        {tab === 'geographie' && <GeoLeaderboard />}
        {tab === 'quiz' && <QuizLeaderboard />}
      </div>
    </ScreenTransition>
  )
}
