import { Trophy } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ScreenHeader } from '../components/layout/ScreenHeader'
import { ScreenTransition } from '../components/layout/ScreenTransition'
import { Button } from '../components/ui/Button'
import { GeoScoreSummary } from '../components/geo/GeoScoreSummary'
import { useGeoStore } from '../store/geoStore'
import { useProfileStore } from '../store/profileStore'
import { GEO_QUIZ_TYPE_LABELS } from '../types/geo.types'
import type { GeoQuizType, GeoSessionMode } from '../types/geo.types'

interface FinalResult {
  mode: GeoSessionMode
  type?: GeoQuizType
  correctCount: number
  totalQuestions: number
  durationSeconds: number | null
}

export function GeoResultsScreen() {
  const navigate = useNavigate()
  const session = useGeoStore((state) => state.session)
  const endSession = useGeoStore((state) => state.endSession)
  const defaultName = useProfileStore((state) => state.playerName)
  const saved = useRef(false)
  const [result, setResult] = useState<FinalResult | null>(null)
  const [playerName, setPlayerName] = useState(defaultName)
  const [isSaved, setIsSaved] = useState(false)

  useEffect(() => {
    if (session && !saved.current) {
      saved.current = true
      setResult({
        mode: session.mode,
        type: session.mode === 'timer' ? undefined : (session.type as GeoQuizType),
        correctCount: session.correctCount,
        totalQuestions: session.questions.length,
        durationSeconds: session.durationSeconds,
      })
    }
  }, [session])

  if (!result) {
    return (
      <ScreenTransition variant="fade">
        <ScreenHeader title="Résultats" onBack={() => navigate('/geographie')} />
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
          <p className="text-sm text-[var(--color-text-muted)]">Aucune session à afficher.</p>
          <Button size="lg" onClick={() => navigate('/geographie')}>
            Retour au menu
          </Button>
        </div>
      </ScreenTransition>
    )
  }

  const handleSave = () => {
    endSession(playerName)
    setIsSaved(true)
  }

  const handleReplay = () => {
    if (result.mode === 'timer') {
      navigate(`/geographie/quiz?mode=timer&duration=${result.durationSeconds ?? 60}`)
    } else {
      navigate(`/geographie/quiz?type=${result.type}&count=${result.totalQuestions}`)
    }
  }

  return (
    <ScreenTransition variant="fade">
      <div className="flex flex-1 flex-col items-center justify-center gap-8 px-6 text-center">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold">
            {result.mode === 'timer' ? 'Défi chrono' : GEO_QUIZ_TYPE_LABELS[result.type!]}
          </h1>
          <p className="text-sm text-[var(--color-text-muted)]">Résultats de la session</p>
        </div>

        <GeoScoreSummary correct={result.correctCount} total={result.totalQuestions} />

        {isSaved ? (
          <div className="flex w-full max-w-xs flex-col gap-3">
            <Button size="lg" className="w-full" onClick={handleReplay}>
              Rejouer
            </Button>
            <Button size="lg" variant="secondary" className="w-full" onClick={() => navigate('/geographie')}>
              Retour au menu
            </Button>
            <Button size="md" variant="ghost" className="w-full" onClick={() => navigate('/classement')}>
              <Trophy size={16} />
              Voir le classement
            </Button>
          </div>
        ) : (
          <div className="flex w-full max-w-xs flex-col gap-3">
            <input
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Joueur"
              maxLength={20}
              className="rounded-[var(--radius-md)] bg-[var(--color-surface-raised)] px-3 py-2 text-center text-sm text-[var(--color-text)] outline-none ring-1 ring-transparent focus:ring-[var(--color-primary-light)]"
            />
            <Button size="lg" className="w-full" onClick={handleSave}>
              Enregistrer le score
            </Button>
          </div>
        )}
      </div>
    </ScreenTransition>
  )
}
