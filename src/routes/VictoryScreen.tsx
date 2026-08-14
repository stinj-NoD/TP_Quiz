import { Trophy } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ScreenTransition } from '../components/layout/ScreenTransition'
import { Button } from '../components/ui/Button'
import { PLAYER_COLOR_VALUES } from '../types/game.types'
import { useGameStore } from '../store/gameStore'

export function VictoryScreen() {
  const navigate = useNavigate()
  const game = useGameStore((state) => state.game)
  const resetGame = useGameStore((state) => state.resetGame)

  const winner = game?.players[game.currentPlayerIndex]

  const handleNewGame = () => {
    resetGame()
    navigate('/nouvelle-partie')
  }

  const handleHome = () => {
    resetGame()
    navigate('/')
  }

  return (
    <ScreenTransition variant="fade">
      <div className="flex flex-1 flex-col items-center justify-center gap-8 px-6 text-center">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 14 }}
          className="flex h-24 w-24 items-center justify-center rounded-full shadow-[var(--shadow-raised)]"
          style={{
            backgroundColor: winner ? PLAYER_COLOR_VALUES[winner.color] : 'var(--color-primary)',
            boxShadow: `0 0 50px ${winner ? PLAYER_COLOR_VALUES[winner.color] : 'var(--color-primary)'}`,
          }}
        >
          <Trophy size={48} color="white" />
        </motion.div>

        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold tracking-wide font-[var(--font-display)]">
            {winner ? `${winner.name} a gagné !` : 'Victoire !'}
          </h1>
          <p className="text-sm text-[var(--color-text-muted)]">
            Les 6 camemberts complétés, bonne réponse à la question finale.
          </p>
        </div>

        <div className="flex w-full max-w-xs flex-col gap-3">
          <Button size="lg" className="w-full" onClick={handleNewGame}>
            Nouvelle partie
          </Button>
          <Button size="lg" variant="secondary" className="w-full" onClick={handleHome}>
            Retour à l'accueil
          </Button>
        </div>
      </div>
    </ScreenTransition>
  )
}
