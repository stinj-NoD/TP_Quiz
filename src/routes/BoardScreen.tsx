import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ScreenHeader } from '../components/layout/ScreenHeader'
import { ScreenTransition } from '../components/layout/ScreenTransition'
import { Board } from '../components/board/Board'
import { Dice } from '../components/board/Dice'
import { PlayerHUD } from '../components/board/PlayerHUD'
import { QuestionModal } from '../components/question/QuestionModal'
import { Modal } from '../components/ui/Modal'
import { Button } from '../components/ui/Button'
import { useGameStore } from '../store/gameStore'
import { useWakeLock } from '../hooks/useWakeLock'
import { PLAYER_COLOR_VALUES } from '../types/game.types'
import { getNode } from '../data/board/boardLayout'
import { CATEGORY_LABELS } from '../types/question.types'

export function BoardScreen() {
  const navigate = useNavigate()
  useWakeLock()
  const game = useGameStore((state) => state.game)
  const rollDiceForCurrentPlayer = useGameStore((state) => state.rollDiceForCurrentPlayer)
  const applyPendingMove = useGameStore((state) => state.applyPendingMove)
  const choosePathDirection = useGameStore((state) => state.choosePathDirection)
  const answerCurrentQuestion = useGameStore((state) => state.answerCurrentQuestion)
  const resetGame = useGameStore((state) => state.resetGame)

  const [rolling, setRolling] = useState(false)
  const [showQuitConfirm, setShowQuitConfirm] = useState(false)

  const handleQuit = () => {
    resetGame()
    navigate('/')
  }

  useEffect(() => {
    if (game?.phase === 'victory') {
      navigate('/victoire')
    }
  }, [game?.phase, navigate])

  if (!game) {
    return (
      <ScreenTransition>
        <ScreenHeader title="Plateau" />
        <div className="flex flex-1 items-center justify-center px-6">
          <p className="text-sm text-[var(--color-text-muted)]">Aucune partie en cours.</p>
        </div>
      </ScreenTransition>
    )
  }

  const currentPlayer = game.players[game.currentPlayerIndex]

  const handleRoll = () => {
    if (game.phase !== 'awaiting-roll') return
    setRolling(true)
    rollDiceForCurrentPlayer()
  }

  const handleRollEnd = () => {
    setRolling(false)
    applyPendingMove()
  }

  return (
    <ScreenTransition>
      <ScreenHeader title="Plateau" onBack={() => setShowQuitConfirm(true)} />

      <PlayerHUD players={game.players} currentPlayerIndex={game.currentPlayerIndex} />

      <div className="relative flex flex-1 flex-col items-center justify-center gap-6 px-4">
        <div
          className="pointer-events-none absolute inset-0 -z-10 opacity-80"
          style={{ background: 'var(--gradient-radial-glow)' }}
        />
        <Board players={game.players} />

        <div className="flex flex-col items-center gap-2">
          <p className="text-sm text-[var(--color-text-muted)]">
            Au tour de{' '}
            <span
              className="font-semibold"
              style={{ color: PLAYER_COLOR_VALUES[currentPlayer.color] }}
            >
              {currentPlayer.name}
            </span>
          </p>
          <Dice
            value={game.lastDiceValue}
            rolling={rolling}
            onRollEnd={handleRollEnd}
            onClick={handleRoll}
            disabled={game.phase !== 'awaiting-roll'}
          />
        </div>
      </div>

      <QuestionModal
        question={game.currentQuestion}
        playerName={currentPlayer.name}
        onAnswer={answerCurrentQuestion}
      />

      <Modal open={game.phase === 'choosing-path'}>
        <div className="flex flex-col gap-4">
          <p className="text-base font-semibold">
            {currentPlayer.name}, quelle direction pour votre pion ?
          </p>
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => choosePathDirection('ring')}>
              Continuer sur le plateau
            </Button>
            <Button className="flex-1" onClick={() => choosePathDirection('arm')}>
              {game.pendingBranch?.nodeId
                ? `Rayon ${CATEGORY_LABELS[getNode(game.pendingBranch.nodeId).category!]}`
                : 'Entrer dans le rayon'}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal open={showQuitConfirm} onClose={() => setShowQuitConfirm(false)}>
        <div className="flex flex-col gap-4">
          <p className="text-base font-semibold">
            Voulez-vous quitter la partie ? Votre progression sera perdue.
          </p>
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
