import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ScreenHeader } from '../components/layout/ScreenHeader'
import { ScreenTransition } from '../components/layout/ScreenTransition'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { ConquestActionBar } from '../components/conquest/ConquestActionBar'
import { ConquestBoardGrid } from '../components/conquest/ConquestBoardGrid'
import { ConquestCardFace } from '../components/conquest/ConquestCardFace'
import { ConquestScoreHud } from '../components/conquest/ConquestScoreHud'
import { ConquestScreenFrame } from '../components/conquest/ConquestScreenFrame'
import { ConquestShuffleOverlay } from '../components/conquest/ConquestShuffleOverlay'
import { ConquestTurnBanner } from '../components/conquest/ConquestTurnBanner'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import { useConquestStore } from '../store/conquestStore'
import {
  canDraw as canDrawCard,
  canMulligan as canMulliganCard,
  canRedeal as canRedealRound,
} from '../domain/conquest/draw'
import type { ConquestSide } from '../types/conquest.types'

export function ConquestMatchScreen() {
  const navigate = useNavigate()
  const match = useConquestStore((state) => state.match)
  const series = useConquestStore((state) => state.series)
  const draw = useConquestStore((state) => state.draw)
  const mulligan = useConquestStore((state) => state.mulligan)
  const place = useConquestStore((state) => state.place)
  const acknowledgeCapture = useConquestStore((state) => state.acknowledgeCapture)
  const runAiTurnIfNeeded = useConquestStore((state) => state.runAiTurnIfNeeded)
  const redealRound = useConquestStore((state) => state.redealRound)
  const abandonMatch = useConquestStore((state) => state.abandonMatch)
  const prefersReducedMotion = usePrefersReducedMotion()

  const [showQuitConfirm, setShowQuitConfirm] = useState(false)
  const [inspectedSide, setInspectedSide] = useState<ConquestSide | null>(null)
  // Donne dont l'animation de mélange a déjà été jouée (ou passée) : null tant qu'aucune.
  const [shuffledDealId, setShuffledDealId] = useState<number | null>(null)

  useEffect(() => {
    if (!match) navigate('/conquete')
  }, [match, navigate])

  useEffect(() => {
    if (match?.phase === 'match-complete') navigate('/conquete/resultats')
  }, [match, navigate])

  // Pilote le tour de l'IA par petits pas (pioche -> mulligan éventuel -> pose), à distance
  // pour laisser le temps aux animations plutôt que de tout résoudre en un seul rendu.
  // Suspendu pendant le mélange, pour que l'IA ne joue pas derrière le rideau.
  useEffect(() => {
    if (!match || match.phase === 'match-complete' || match.phase === 'resolving-capture') return
    if (match.dealId !== shuffledDealId) return
    if (match.players[match.game.currentTurn].kind !== 'ai') return

    const timer = setTimeout(
      () => runAiTurnIfNeeded(),
      prefersReducedMotion ? 150 : 650,
    )
    return () => clearTimeout(timer)
  }, [match, shuffledDealId, runAiTurnIfNeeded, prefersReducedMotion])

  useEffect(() => {
    if (!match || match.phase !== 'resolving-capture') return

    const timer = setTimeout(() => acknowledgeCapture(), prefersReducedMotion ? 200 : 900)
    return () => clearTimeout(timer)
  }, [match, acknowledgeCapture, prefersReducedMotion])

  if (!match) return null

  const { game, phase, players, lastCapturedPositions } = match
  const activeSide = game.currentTurn
  const activePlayer = players[activeSide]
  const inspectedCard = inspectedSide ? game.piles[inspectedSide].drawnCard : null

  const handleQuit = () => {
    abandonMatch()
    navigate('/conquete')
  }

  const message = (() => {
    if (phase === 'resolving-capture') {
      return lastCapturedPositions.length > 0
        ? `Capture ! ${lastCapturedPositions.length} carte${lastCapturedPositions.length > 1 ? 's' : ''} retournée${lastCapturedPositions.length > 1 ? 's' : ''}.`
        : ''
    }
    if (phase === 'awaiting-draw') {
      return activePlayer.kind === 'ai' ? 'Réflexion...' : 'Piochez une carte.'
    }
    if (phase === 'card-revealed') {
      return activePlayer.kind === 'ai' ? 'Choix de la case...' : 'Posez votre carte sur une case libre.'
    }
    return ''
  })()

  const isShuffling = match.dealId !== shuffledDealId
  const boardInteractive = phase === 'card-revealed' && activePlayer.kind === 'human' && !isShuffling

  return (
    <ScreenTransition className="bg-[var(--color-cq-bg)]">
      <ConquestScreenFrame />
      <ScreenHeader title="Conquête 3x3" onBack={() => setShowQuitConfirm(true)} accent="conquest" />

      {/* overflow-hidden et non auto : le plateau s'adapte à la place restante au lieu de
          l'imposer, ce qui garantit que la barre d'action reste visible sans défilement. */}
      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden px-3 pb-2">
        <ConquestScoreHud
          players={players}
          activeSide={activeSide}
          roundWins={series?.roundWins ?? { A: 0, B: 0 }}
          piles={{
            A: {
              remaining: game.piles.A.pile.length,
              drawnCard: game.piles.A.drawnCard,
              canDraw:
                !isShuffling &&
                activeSide === 'A' &&
                activePlayer.kind === 'human' &&
                phase === 'awaiting-draw' &&
                canDrawCard(game),
            },
            B: {
              remaining: game.piles.B.pile.length,
              drawnCard: game.piles.B.drawnCard,
              canDraw:
                !isShuffling &&
                activeSide === 'B' &&
                activePlayer.kind === 'human' &&
                phase === 'awaiting-draw' &&
                canDrawCard(game),
            },
          }}
          onDraw={draw}
          onInspect={setInspectedSide}
        />
        <ConquestTurnBanner message={message} />

        {/* Le plateau se dimensionne sur la hauteur disponible tout en gardant son ratio :
            trois cases 2:3 côte à côte forment un ensemble lui aussi en 2:3. */}
        <div className="flex min-h-0 min-w-0 flex-1 items-center justify-center">
          <ConquestBoardGrid board={game.board} interactive={boardInteractive} onPlace={place} />
        </div>
      </div>

      <ConquestActionBar
        canMulligan={
          !isShuffling && phase === 'card-revealed' && activePlayer.kind === 'human' && canMulliganCard(game)
        }
        onMulligan={mulligan}
        canRedeal={!isShuffling && activePlayer.kind === 'human' && canRedealRound(game)}
        onRedeal={redealRound}
      />

      {isShuffling && (
        <ConquestShuffleOverlay dealKey={match.dealId} onDone={() => setShuffledDealId(match.dealId)} />
      )}

      <Modal open={showQuitConfirm} onClose={() => setShowQuitConfirm(false)} accent="conquest">
        <div className="flex flex-col gap-4">
          <p className="text-base font-semibold">Quitter la partie ? Votre progression sera perdue.</p>
          <div className="flex gap-3">
            <Button variant="secondary" accent="conquest" className="flex-1" onClick={() => setShowQuitConfirm(false)}>
              Annuler
            </Button>
            <Button variant="danger" className="flex-1" onClick={handleQuit}>
              Quitter
            </Button>
          </div>
        </div>
      </Modal>

      <Modal open={inspectedCard !== null} onClose={() => setInspectedSide(null)} accent="conquest">
        {inspectedCard && (
          <div className="flex flex-col items-center gap-4">
            <div className="w-full max-w-[240px]">
              <ConquestCardFace card={inspectedCard} size="reveal" />
            </div>
            <p className="text-center text-sm text-[var(--color-text-muted)]">
              Touchez une case du plateau pour la poser.
            </p>
          </div>
        )}
      </Modal>
    </ScreenTransition>
  )
}
