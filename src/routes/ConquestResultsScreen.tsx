import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ScreenTransition } from '../components/layout/ScreenTransition'
import { ScreenHeader } from '../components/layout/ScreenHeader'
import { Button } from '../components/ui/Button'
import { ConquestResultSummary } from '../components/conquest/ConquestResultSummary'
import { ConquestScreenFrame } from '../components/conquest/ConquestScreenFrame'
import { getSeriesWinner } from '../domain/conquest/series'
import { useConquestStore } from '../store/conquestStore'
import type { ConquestSessionResult } from '../types/conquest.types'

export function ConquestResultsScreen() {
  const navigate = useNavigate()
  const finalizeMatch = useConquestStore((state) => state.finalizeMatch)
  const series = useConquestStore((state) => state.series)
  const startNextRound = useConquestStore((state) => state.startNextRound)
  const abandonMatch = useConquestStore((state) => state.abandonMatch)
  const finalizedRef = useRef(false)
  const [result, setResult] = useState<ConquestSessionResult | null>(null)

  useEffect(() => {
    if (finalizedRef.current) return
    finalizedRef.current = true
    setResult(finalizeMatch())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!result) {
    return (
      <ScreenTransition variant="fade" className="bg-[var(--color-cq-bg)]">
        <ConquestScreenFrame />
        <ScreenHeader title="Résultats" onBack={() => navigate('/conquete')} accent="conquest" />
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
          <p className="text-sm text-[var(--color-text-muted)]">Aucune partie à afficher.</p>
          <Button size="lg" accent="conquest" onClick={() => navigate('/conquete')}>
            Retour au menu
          </Button>
        </div>
      </ScreenTransition>
    )
  }

  const seriesWinner = series ? getSeriesWinner(series) : null
  const seriesDecided = series !== null && seriesWinner !== null

  const title = seriesDecided
    ? `${series.players[seriesWinner].name} remporte la série !`
    : series
      ? `Manche ${series.roundsPlayed} : ${
          result.outcome === 'égalité' ? 'égalité !' : `${result.players[result.outcome].name} l'emporte`
        }`
      : result.outcome === 'égalité'
        ? 'Égalité !'
        : `${result.players[result.outcome].name} remporte la partie !`

  const handleNextRound = () => {
    startNextRound()
    navigate('/conquete/partie')
  }

  const handleQuitSeries = () => {
    abandonMatch()
    navigate('/')
  }

  return (
    <ScreenTransition variant="fade" className="bg-[var(--color-cq-bg)]">
      <ConquestScreenFrame />
      <ScreenHeader title="Résultats" showBack={false} accent="conquest" />
      <div className="flex flex-1 flex-col items-center gap-6 overflow-y-auto px-6 py-8 text-center" aria-live="polite">
        <h1
          className={`font-[var(--font-display)] tracking-wide ${
            seriesDecided
              ? 'text-2xl font-bold'
              : series
                ? 'text-base font-semibold text-[var(--color-text-muted)]'
                : 'text-xl font-bold'
          }`}
          style={seriesDecided ? { textShadow: '2px 2px 0 var(--color-cq-ink-deep)' } : undefined}
        >
          {title}
        </h1>

        <ConquestResultSummary players={result.players} outcome={result.outcome} roundWins={series?.roundWins} />

        {series && !seriesDecided ? (
          <div className="flex w-full max-w-xs flex-col gap-3">
            <Button size="lg" accent="conquest" className="w-full" onClick={handleNextRound}>
              Manche suivante
            </Button>
            <button
              type="button"
              onClick={handleQuitSeries}
              className="text-sm text-[var(--color-text-muted)] underline-offset-2 active:underline"
            >
              Quitter la série
            </button>
          </div>
        ) : (
          <div className="flex w-full max-w-xs flex-col gap-3">
            <Button size="lg" accent="conquest" className="w-full" onClick={() => navigate('/conquete')}>
              Rejouer
            </Button>
            <Button size="lg" variant="secondary" accent="conquest" className="w-full" onClick={() => navigate('/')}>
              Retour à l'accueil
            </Button>
          </div>
        )}
      </div>
    </ScreenTransition>
  )
}
