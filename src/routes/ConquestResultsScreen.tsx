import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ScreenTransition } from '../components/layout/ScreenTransition'
import { ScreenHeader } from '../components/layout/ScreenHeader'
import { Button } from '../components/ui/Button'
import { ConquestResultSummary } from '../components/conquest/ConquestResultSummary'
import { useConquestStore } from '../store/conquestStore'
import type { ConquestSessionResult } from '../types/conquest.types'

export function ConquestResultsScreen() {
  const navigate = useNavigate()
  const finalizeMatch = useConquestStore((state) => state.finalizeMatch)
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
      <ScreenTransition variant="fade">
        <ScreenHeader title="Résultats" onBack={() => navigate('/conquete')} />
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
          <p className="text-sm text-[var(--color-text-muted)]">Aucune partie à afficher.</p>
          <Button size="lg" onClick={() => navigate('/conquete')}>
            Retour au menu
          </Button>
        </div>
      </ScreenTransition>
    )
  }

  const title = result.outcome === 'égalité' ? 'Égalité !' : `${result.players[result.outcome].name} remporte la partie !`

  return (
    <ScreenTransition variant="fade">
      <div className="flex flex-1 flex-col items-center gap-6 overflow-y-auto px-6 py-8 text-center" aria-live="polite">
        <h1 className="text-xl font-bold tracking-wide font-[var(--font-display)]">{title}</h1>

        <ConquestResultSummary players={result.players} outcome={result.outcome} />

        <div className="flex w-full max-w-xs flex-col gap-3">
          <Button size="lg" className="w-full" onClick={() => navigate('/conquete')}>
            Rejouer
          </Button>
          <Button size="lg" variant="secondary" className="w-full" onClick={() => navigate('/')}>
            Retour à l'accueil
          </Button>
        </div>
      </div>
    </ScreenTransition>
  )
}
