import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ScreenHeader } from '../components/layout/ScreenHeader'
import { ScreenTransition } from '../components/layout/ScreenTransition'
import { ProgressBar } from '../components/ui/ProgressBar'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { FlagQuizCard } from '../components/geo/FlagQuizCard'
import { CapitalQuizCard } from '../components/geo/CapitalQuizCard'
import { ShapeQuizCard } from '../components/geo/ShapeQuizCard'
import { AnswerFeedback } from '../components/question/AnswerFeedback'
import { loadCountries, loadCountriesWithShape } from '../domain/geo/countriesRepository'
import { generateQuizSession, generateRandomTypeQuestion } from '../domain/geo/quizGenerator'
import { useGeoStore } from '../store/geoStore'
import { useWakeLock } from '../hooks/useWakeLock'
import type { Country, GeoQuizType } from '../types/geo.types'
import { GEO_QUIZ_TYPE_LABELS } from '../types/geo.types'

function formatTime(ms: number): string {
  const totalSeconds = Math.ceil(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

export function GeoQuizScreen() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const modeParam = searchParams.get('mode')
  const isTimerMode = modeParam === 'timer'
  const type = searchParams.get('type') as GeoQuizType | null
  const count = Number(searchParams.get('count') ?? 10)
  const duration = Number(searchParams.get('duration') ?? 60)

  const session = useGeoStore((state) => state.session)
  const startSession = useGeoStore((state) => state.startSession)
  const startTimerSession = useGeoStore((state) => state.startTimerSession)
  const appendQuestion = useGeoStore((state) => state.appendQuestion)
  const answerCurrent = useGeoStore((state) => state.answerCurrent)
  const nextQuestion = useGeoStore((state) => state.nextQuestion)
  const discardSession = useGeoStore((state) => state.discardSession)

  useWakeLock()

  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [remainingMs, setRemainingMs] = useState<number | null>(null)
  const [allCountries, setAllCountries] = useState<Country[]>([])
  const [countriesWithShape, setCountriesWithShape] = useState<Country[]>([])
  const [showQuitConfirm, setShowQuitConfirm] = useState(false)

  // Chargement initial : bifurque entre mode count (existant) et mode timer (nouveau).
  useEffect(() => {
    if (!type && !isTimerMode) return
    setLoading(true)
    setLoadError(false)

    if (isTimerMode) {
      Promise.all([loadCountries(), loadCountriesWithShape()])
        .then(([pool, poolWithShape]) => {
          setAllCountries(pool)
          setCountriesWithShape(poolWithShape)
          const firstQuestion = generateRandomTypeQuestion(pool, poolWithShape, new Set())
          startTimerSession(duration)
          appendQuestion(firstQuestion)
          setLoading(false)
        })
        .catch((err) => {
          console.error('Échec du chargement du quiz Géographie', err)
          setLoadError(true)
          setLoading(false)
        })
      return
    }

    if (!type) return
    const load = type === 'country-to-shape' ? loadCountriesWithShape : loadCountries
    load()
      .then((countries) => {
        const questions = generateQuizSession(countries, type, count)
        startSession(type, questions)
        setLoading(false)
      })
      .catch((err) => {
        console.error('Échec du chargement du quiz Géographie', err)
        setLoadError(true)
        setLoading(false)
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, count, isTimerMode, duration])

  // Décompte du mode timer : redirection automatique vers les résultats à expiration.
  useEffect(() => {
    if (!isTimerMode || !session?.endsAt) return
    const endsAt = session.endsAt
    const tick = () => {
      const remaining = Math.max(0, endsAt - Date.now())
      setRemainingMs(remaining)
      if (remaining <= 0) navigate('/geographie/resultats')
    }
    tick()
    const interval = setInterval(tick, 250)
    return () => clearInterval(interval)
  }, [isTimerMode, session?.endsAt, navigate])

  if (!type && !isTimerMode) {
    return (
      <ScreenTransition>
        <ScreenHeader title="Quiz" />
        <div className="flex flex-1 items-center justify-center px-6">
          <p className="text-sm text-[var(--color-text-muted)]">Type de quiz invalide.</p>
        </div>
      </ScreenTransition>
    )
  }

  if (loadError) {
    return (
      <ScreenTransition>
        <ScreenHeader title={isTimerMode ? 'Défi chrono' : GEO_QUIZ_TYPE_LABELS[type!]} onBack={() => navigate('/geographie')} />
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
          <p className="text-sm text-[var(--color-text-muted)]">
            Impossible de charger les données du quiz. Vérifiez votre connexion, puis réessayez.
          </p>
          <Button variant="secondary" onClick={() => window.location.reload()}>
            Réessayer
          </Button>
        </div>
      </ScreenTransition>
    )
  }

  if (loading || !session) {
    return (
      <ScreenTransition>
        <ScreenHeader title={isTimerMode ? 'Défi chrono' : GEO_QUIZ_TYPE_LABELS[type!]} />
        <div className="flex flex-1 items-center justify-center px-6">
          <p className="text-sm text-[var(--color-text-muted)]">Préparation du quiz...</p>
        </div>
      </ScreenTransition>
    )
  }

  const question = session.questions[session.currentIndex]
  const isLastQuestion = !isTimerMode && session.currentIndex === session.questions.length - 1

  const handleSelect = (optionIndex: number) => {
    if (selectedOption !== null) return
    setSelectedOption(optionIndex)
    answerCurrent(optionIndex)
  }

  const advance = () => {
    setSelectedOption(null)
    if (isTimerMode) {
      if (remainingMs !== null && remainingMs <= 0) {
        navigate('/geographie/resultats')
        return
      }
      const excluded = new Set(session.questions.map((q) => q.correctCountry.cca3))
      const next = generateRandomTypeQuestion(allCountries, countriesWithShape, excluded)
      appendQuestion(next)
      nextQuestion()
      return
    }
    if (isLastQuestion) {
      navigate('/geographie/resultats')
    } else {
      nextQuestion()
    }
  }

  const handleNext = () => {
    advance()
  }

  const handleSkip = () => {
    if (selectedOption !== null) return
    advance()
  }

  const handleQuit = () => {
    discardSession()
    navigate('/geographie')
  }

  return (
    <ScreenTransition>
      <ScreenHeader
        title={isTimerMode ? 'Défi chrono' : GEO_QUIZ_TYPE_LABELS[type!]}
        onBack={() => setShowQuitConfirm(true)}
      />

      <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-5 pb-5">
        {isTimerMode ? (
          <>
            <ProgressBar value={remainingMs ?? duration * 1000} max={duration * 1000} />
            <p className="text-xs text-[var(--color-text-muted)]">
              Temps restant : {formatTime(remainingMs ?? duration * 1000)}
            </p>
          </>
        ) : (
          <>
            <ProgressBar value={session.currentIndex} max={session.questions.length} />
            <p className="text-xs text-[var(--color-text-muted)]">
              Question {session.currentIndex + 1} / {session.questions.length}
            </p>
          </>
        )}

        {question.type === 'flag-to-country' && <FlagQuizCard country={question.correctCountry} />}
        {(question.type === 'country-to-capital' || question.type === 'capital-to-country') && (
          <CapitalQuizCard country={question.correctCountry} type={question.type} />
        )}
        {question.type === 'country-to-shape' && <ShapeQuizCard country={question.correctCountry} />}

        <div className="flex flex-col gap-2.5">
          {question.options.map((option, index) => {
            const isCorrect = index === question.correctOptionIndex
            const isSelected = index === selectedOption
            let stateClasses = 'bg-[var(--color-surface-raised)]'
            if (selectedOption !== null) {
              if (isCorrect)
                stateClasses =
                  'bg-[var(--color-success)]/25 ring-1 ring-[var(--color-success)] shadow-[var(--glow-success)]'
              else if (isSelected)
                stateClasses =
                  'bg-[var(--color-danger)]/25 ring-1 ring-[var(--color-danger)] shadow-[var(--glow-danger)]'
            }
            return (
              <button
                key={option}
                type="button"
                onClick={() => handleSelect(index)}
                disabled={selectedOption !== null}
                className={`rounded-[var(--radius-md)] px-4 py-3 text-left text-sm font-medium transition-[background-color,box-shadow,transform] active:scale-[0.98] disabled:active:scale-100 ${stateClasses}`}
              >
                {option}
              </button>
            )
          })}
        </div>

        {selectedOption !== null && (
          <AnswerFeedback
            correct={selectedOption === question.correctOptionIndex}
            answer={question.options[question.correctOptionIndex]}
          />
        )}
      </div>

      {selectedOption !== null ? (
        <div className="px-5 pb-5">
          <Button size="lg" className="w-full" onClick={handleNext}>
            {isLastQuestion ? 'Voir les résultats' : 'Question suivante'}
          </Button>
        </div>
      ) : (
        <div className="px-5 pb-5">
          <Button size="lg" variant="secondary" className="w-full" onClick={handleSkip}>
            Passer
          </Button>
        </div>
      )}

      <Modal open={showQuitConfirm} onClose={() => setShowQuitConfirm(false)}>
        <div className="flex flex-col gap-4">
          <p className="text-base font-semibold">
            Quitter le quiz ? Votre progression sera perdue.
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
