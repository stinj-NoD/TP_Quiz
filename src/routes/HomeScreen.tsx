import { Dices, Play } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { ScreenTransition } from '../components/layout/ScreenTransition'
import { useGameStore } from '../store/gameStore'

export function HomeScreen() {
  const navigate = useNavigate()
  const game = useGameStore((state) => state.game)

  return (
    <ScreenTransition variant="fade">
      <div className="flex flex-1 flex-col items-center justify-center gap-10 px-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--gradient-primary)] shadow-[var(--glow-lg)]">
            <Dices size={40} />
          </div>
          <h1 className="text-3xl font-bold tracking-wide font-[var(--font-display)]">
            Trivial Poursuit
          </h1>
          <p className="text-sm text-[var(--color-text-muted)]">
            Le jeu de culture générale, entre amis
          </p>
        </div>

        <div className="flex w-full max-w-xs flex-col gap-3">
          {game ? (
            <Button size="lg" className="w-full" onClick={() => navigate('/plateau')}>
              <Play size={18} />
              Reprendre la partie
            </Button>
          ) : (
            <Button size="lg" className="w-full" onClick={() => navigate('/jouer')}>
              <Dices size={18} />
              Jouer
            </Button>
          )}
        </div>
      </div>
    </ScreenTransition>
  )
}
