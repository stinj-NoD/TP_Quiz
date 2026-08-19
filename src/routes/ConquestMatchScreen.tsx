import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ScreenHeader } from '../components/layout/ScreenHeader'
import { ScreenTransition } from '../components/layout/ScreenTransition'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { ConquestBoardGrid } from '../components/conquest/ConquestBoardGrid'
import { ConquestDrawPile } from '../components/conquest/ConquestDrawPile'
import { ConquestMulliganControl } from '../components/conquest/ConquestMulliganControl'
import { ConquestTurnBanner } from '../components/conquest/ConquestTurnBanner'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import { useConquestStore } from '../store/conquestStore'
import { canDraw as canDrawCard, canMulligan as canMulliganCard } from '../domain/conquest/draw'

export function ConquestMatchScreen() {
  const navigate = useNavigate()
  const match = useConquestStore((state) => state.match)
  const draw = useConquestStore((state) => state.draw)
  const mulligan = useConquestStore((state) => state.mulligan)
  const place = useConquestStore((state) => state.place)
  const acknowledgeCapture = useConquestStore((state) => state.acknowledgeCapture)
  const runAiTurnIfNeeded = useConquestStore((state) => state.runAiTurnIfNeeded)
  const abandonMatch = useConquestStore((state) => state.abandonMatch)
  const prefersReducedMotion = usePrefersReducedMotion()

  const [showQuitConfirm, setShowQuitConfirm] = useState(false)

  useEffect(() => {
    if (!match) navigate('/conquete')
  }, [match, navigate])

  useEffect(() => {
    if (match?.phase === 'match-complete') navigate('/conquete/resultats')
  }, [match, navigate])

  // Pilote le tour de l'IA par petits pas (pioche -> mulligan éventuel -> pose), à distance
  // pour laisser le temps aux animations plutôt que de tout résoudre en un seul rendu.
  useEffect(() => {
    if (!match || match.phase === 'match-complete' || match.phase === 'resolving-capture') return
    if (match.players[match.game.currentTurn].kind !== 'ai') return

    const timer = setTimeout(
      () => runAiTurnIfNeeded(),
      prefersReducedMotion ? 150 : 650,
    )
    return () => clearTimeout(timer)
  }, [match, runAiTurnIfNeeded, prefersReducedMotion])

  useEffect(() => {
    if (!match || match.phase !== 'resolving-capture') return

    const timer = setTimeout(() => acknowledgeCapture(), prefersReducedMotion ? 200 : 900)
    return () => clearTimeout(timer)
  }, [match, acknowledgeCapture, prefersReducedMotion])

  if (!match) return null

  const { game, phase, players, lastCapturedPositions } = match
  const activeSide = game.currentTurn
  const activePlayer = players[activeSide]

  const handleQuit = () => {
    abandonMatch()
    navigate('/conquete')
  }

  const message = (() => {
    if (phase === 'resolving-capture') {
      return lastCapturedPositions.length > 0
        ? `Capture ! ${activePlayer.name} retourne ${lastCapturedPositions.length} carte${lastCapturedPositions.length > 1 ? 's' : ''}.`
        : ''
    }
    if (phase === 'awaiting-draw') {
      return activePlayer.kind === 'ai' ? `${activePlayer.name} réfléchit...` : `${activePlayer.name} : piochez une carte.`
    }
    if (phase === 'card-revealed') {
      return activePlayer.kind === 'ai'
        ? `${activePlayer.name} choisit une case...`
        : `${activePlayer.name} : posez votre carte sur une case libre.`
    }
    return ''
  })()

  const boardInteractive = phase === 'card-revealed' && activePlayer.kind === 'human'

  return (
    <ScreenTransition>
      <ScreenHeader title="Conquête 3x3" onBack={() => setShowQuitConfirm(true)} />

      <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-5 pb-5">
        <ConquestTurnBanner message={message} />

        <div className="flex items-center justify-center gap-8">
          <ConquestDrawPile
            label={players.A.name}
            remaining={game.piles.A.pile.length}
            drawnCard={game.piles.A.drawnCard}
            canDraw={activeSide === 'A' && activePlayer.kind === 'human' && phase === 'awaiting-draw' && canDrawCard(game)}
            onDraw={draw}
          />
          <ConquestDrawPile
            label={players.B.name}
            remaining={game.piles.B.pile.length}
            drawnCard={game.piles.B.drawnCard}
            canDraw={activeSide === 'B' && activePlayer.kind === 'human' && phase === 'awaiting-draw' && canDrawCard(game)}
            onDraw={draw}
          />
        </div>

        <ConquestBoardGrid board={game.board} interactive={boardInteractive} onPlace={place} />

        <ConquestMulliganControl
          visible={phase === 'card-revealed' && activePlayer.kind === 'human' && canMulliganCard(game)}
          onMulligan={mulligan}
        />
      </div>

      <Modal open={showQuitConfirm} onClose={() => setShowQuitConfirm(false)}>
        <div className="flex flex-col gap-4">
          <p className="text-base font-semibold">Quitter la partie ? Votre progression sera perdue.</p>
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => setShowQuitConfirm(false)}>
              Annuler
            </Button>
            <Button variant="danger" className="flex-1" onClick={handleQuit}>
              Quitter
            </Button>
          </div>
        </div>
      </Modal>
    </ScreenTransition>
  )
}
