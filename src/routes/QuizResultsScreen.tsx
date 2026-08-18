import { Trophy } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ScreenTransition } from '../components/layout/ScreenTransition'
import { ScreenHeader } from '../components/layout/ScreenHeader'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { RankBadge } from '../components/ui/RankBadge'
import { useQuizStore } from '../store/quizStore'
import { PLAYER_COLOR_VALUES } from '../types/game.types'
import type { QuizSessionResult } from '../types/quiz.types'

export function QuizResultsScreen() {
  const navigate = useNavigate()
  const finalizeSession = useQuizStore((state) => state.finalizeSession)
  const finalizedRef = useRef(false)
  const [result, setResult] = useState<QuizSessionResult | null>(null)

  useEffect(() => {
    if (finalizedRef.current) return
    finalizedRef.current = true
    setResult(finalizeSession())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!result) {
    return (
      <ScreenTransition variant="fade">
        <ScreenHeader title="Résultats" onBack={() => navigate('/quiz')} />
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
          <p className="text-sm text-[var(--color-text-muted)]">Aucune session à afficher.</p>
          <Button size="lg" onClick={() => navigate('/quiz')}>
            Retour au menu
          </Button>
        </div>
      </ScreenTransition>
    )
  }

  return (
    <ScreenTransition variant="fade">
      <div className="flex flex-1 flex-col items-center gap-6 overflow-y-auto px-6 py-8 text-center">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold tracking-wide font-[var(--font-display)]">
            {result.winnerName} remporte la partie !
          </h1>
          <p className="text-sm text-[var(--color-text-muted)]">
            {result.playerCount} joueur{result.playerCount > 1 ? 's' : ''} · {result.roundsPerPlayer} tour
            {result.roundsPerPlayer > 1 ? 's' : ''} chacun
          </p>
        </div>

        <div className="flex w-full max-w-xs flex-col gap-2.5">
          {result.players.map((player, index) => (
            <Card key={player.name} className="flex items-center gap-3">
              <RankBadge index={index} />
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{
                  backgroundColor: PLAYER_COLOR_VALUES[player.color],
                  boxShadow: `0 0 6px ${PLAYER_COLOR_VALUES[player.color]}`,
                }}
              />
              <span className="flex-1 text-left text-sm font-semibold">{player.name}</span>
              <span className="text-lg font-bold font-[var(--font-display)] text-[var(--color-primary-light)]">
                {player.score} pts
              </span>
            </Card>
          ))}
        </div>

        <div className="flex w-full max-w-xs flex-col gap-3">
          <Button size="lg" className="w-full" onClick={() => navigate('/quiz')}>
            Rejouer
          </Button>
          <Button size="lg" variant="secondary" className="w-full" onClick={() => navigate('/')}>
            Retour à l'accueil
          </Button>
          <Button size="md" variant="ghost" className="w-full" onClick={() => navigate('/classement')}>
            <Trophy size={16} />
            Voir le classement
          </Button>
        </div>
      </div>
    </ScreenTransition>
  )
}
