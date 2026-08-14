import { Flag, Landmark, MapPin, Shapes, Timer } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ScreenHeader } from '../components/layout/ScreenHeader'
import { ScreenTransition } from '../components/layout/ScreenTransition'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { useProfileStore } from '../store/profileStore'
import { GEO_QUIZ_TYPE_LABELS } from '../types/geo.types'
import type { GeoQuizType } from '../types/geo.types'

const QUIZ_TYPES: { type: GeoQuizType; icon: typeof Flag; description: string }[] = [
  { type: 'flag-to-country', icon: Flag, description: 'Devinez le pays à partir de son drapeau' },
  { type: 'country-to-capital', icon: Landmark, description: 'Devinez la capitale d\'un pays' },
  { type: 'capital-to-country', icon: MapPin, description: 'Devinez le pays à partir de sa capitale' },
  { type: 'country-to-shape', icon: Shapes, description: 'Devinez le pays à partir de sa silhouette' },
]

const QUESTION_COUNTS = [10, 20, 30] as const
const DURATIONS = [60, 120, 180] as const

function formatDuration(seconds: number): string {
  return `${seconds / 60} min`
}

type Selection = GeoQuizType | 'timer'

export function GeoModeMenuScreen() {
  const navigate = useNavigate()
  const defaultCount = useProfileStore((state) => state.geoQuestionCount)
  const defaultDuration = useProfileStore((state) => state.geoDuration)
  const [selectedType, setSelectedType] = useState<Selection | null>(null)
  const [count, setCount] = useState<number>(defaultCount)
  const [duration, setDuration] = useState<number>(defaultDuration)

  const isTimerSelected = selectedType === 'timer'

  const handleStart = () => {
    if (!selectedType) return
    if (selectedType === 'timer') {
      navigate(`/geographie/quiz?mode=timer&duration=${duration}`)
    } else {
      navigate(`/geographie/quiz?type=${selectedType}&count=${count}`)
    }
  }

  return (
    <ScreenTransition>
      <ScreenHeader title="Mode Géographie" showBack={false} />
      <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-5 pb-4">
        <div className="flex flex-col gap-3">
          {QUIZ_TYPES.map(({ type, icon: Icon, description }) => {
            const selected = selectedType === type
            return (
              <Card
                key={type}
                interactive
                onClick={() => setSelectedType(type)}
                className={`flex cursor-pointer items-center gap-3 ${
                  selected ? 'ring-2 ring-[var(--color-primary-light)] shadow-[var(--glow-sm)]' : ''
                }`}
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-surface-raised)]">
                  <Icon size={20} />
                </span>
                <div>
                  <p className="text-sm font-semibold">{GEO_QUIZ_TYPE_LABELS[type]}</p>
                  <p className="text-xs text-[var(--color-text-muted)]">{description}</p>
                </div>
              </Card>
            )
          })}

          <div className="flex items-center gap-2 py-1">
            <div className="h-px flex-1 bg-[var(--color-border)]" />
            <span className="text-xs text-[var(--color-text-muted)]">ou</span>
            <div className="h-px flex-1 bg-[var(--color-border)]" />
          </div>

          <Card
            interactive
            onClick={() => setSelectedType('timer')}
            className={`flex cursor-pointer items-center gap-3 ${
              isTimerSelected ? 'ring-2 ring-[var(--color-primary-light)] shadow-[var(--glow-sm)]' : ''
            }`}
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-surface-raised)]">
              <Timer size={20} />
            </span>
            <div>
              <p className="text-sm font-semibold">Défi chrono</p>
              <p className="text-xs text-[var(--color-text-muted)]">
                Un mélange de toutes les questions, contre la montre
              </p>
            </div>
          </Card>
        </div>

        {isTimerSelected ? (
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-[var(--color-text-muted)]">Durée</span>
            <div className="flex gap-2">
              {DURATIONS.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDuration(d)}
                  className={`flex-1 rounded-[var(--radius-md)] py-2.5 text-sm font-semibold transition-[transform,box-shadow] active:scale-95 ${
                    duration === d
                      ? 'bg-[var(--gradient-primary)] text-white shadow-[var(--glow-sm)]'
                      : 'bg-[var(--color-surface-raised)] text-[var(--color-text-muted)]'
                  }`}
                >
                  {formatDuration(d)}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-[var(--color-text-muted)]">Nombre de questions</span>
            <div className="flex gap-2">
              {QUESTION_COUNTS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCount(c)}
                  className={`flex-1 rounded-[var(--radius-md)] py-2.5 text-sm font-semibold transition-[transform,box-shadow] active:scale-95 ${
                    count === c
                      ? 'bg-[var(--gradient-primary)] text-white shadow-[var(--glow-sm)]'
                      : 'bg-[var(--color-surface-raised)] text-[var(--color-text-muted)]'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="px-5 pb-5">
        <Button size="lg" className="w-full" disabled={!selectedType} onClick={handleStart}>
          Démarrer le quiz
        </Button>
      </div>
    </ScreenTransition>
  )
}
