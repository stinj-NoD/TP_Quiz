import { BrainCircuit, Globe2, Swords } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { ScreenTransition } from '../components/layout/ScreenTransition'
import { LogoMark } from '../components/branding/LogoMark'

export function HomeScreen() {
  const navigate = useNavigate()

  return (
    <ScreenTransition variant="fade">
      <div className="flex flex-1 flex-col items-center justify-center gap-10 px-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <LogoMark size={80} className="shadow-[var(--glow-lg)]" />
          <h1 className="text-3xl font-bold tracking-wide font-[var(--font-display)]">
            Ludopia
          </h1>
          <p className="text-sm text-[var(--color-text-muted)]">
            L'univers de jeux entre amis
          </p>
        </div>

        <div className="flex w-full max-w-xs flex-col gap-3">
          <Button size="lg" className="w-full" onClick={() => navigate('/quiz')}>
            <BrainCircuit size={18} />
            Lancer un Quiz
          </Button>
          <Button size="lg" variant="secondary" className="w-full" onClick={() => navigate('/geographie')}>
            <Globe2 size={18} />
            Lancer un Géo
          </Button>
          <Button size="lg" variant="secondary" className="w-full" onClick={() => navigate('/conquete')}>
            <Swords size={18} />
            Lancer une Conquête
          </Button>
        </div>
      </div>
    </ScreenTransition>
  )
}
