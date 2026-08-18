import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ScreenHeader } from '../components/layout/ScreenHeader'
import { ScreenTransition } from '../components/layout/ScreenTransition'
import { ProgressBar } from '../components/ui/ProgressBar'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { AnswerFeedback } from '../components/question/AnswerFeedback'
import { QuizCardFan } from '../components/quiz/QuizCardFan'
import { QuizJudgeControls } from '../components/quiz/QuizJudgeControls'
import { QuizScoreHud } from '../components/quiz/QuizScoreHud'
import { useQuizStore } from '../store/quizStore'
import { useWakeLock } from '../hooks/useWakeLock'

export function QuizSessionScreen() {
  const navigate = useNavigate()
  const quiz = useQuizStore((state) => state.quiz)
  const startTurnCards = useQuizStore((state) => state.startTurnCards)
  const chooseCard = useQuizStore((state) => state.chooseCard)
  const revealAnswer = useQuizStore((state) => state.revealAnswer)
  const judgeAnswer = useQuizStore((state) => state.judgeAnswer)
  const advanceToNextPlayer = useQuizStore((state) => state.advanceToNextPlayer)
  const isSessionComplete = useQuizStore((state) => state.isSessionComplete)
  const resetQuiz = useQuizStore((state) => state.resetQuiz)

  const [showQuitConfirm, setShowQuitConfirm] = useState(false)
  const [showStartBanner, setShowStartBanner] = useState(true)

  useWakeLock()

  useEffect(() => {
    if (!quiz) navigate('/quiz')
  }, [quiz, navigate])

  useEffect(() => {
    if (quiz && quiz.turn === null && quiz.totalTurnsPlayed > 0) {
      startTurnCards()
    }
  }, [quiz, startTurnCards])

  if (!quiz) return null

  const currentPlayer = quiz.players[quiz.currentPlayerIndex]

  const handleBeginFirstTurn = () => {
    setShowStartBanner(false)
    startTurnCards()
  }

  const handleQuit = () => {
    resetQuiz()
    navigate('/quiz')
  }

  const handleNext = () => {
    advanceToNextPlayer()
    if (isSessionComplete()) {
      navigate('/quiz/resultats')
    }
  }

  if (quiz.totalTurnsPlayed === 0 && quiz.turn === null && showStartBanner) {
    return (
      <ScreenTransition variant="fade">
        <ScreenHeader title="Quiz" onBack={() => setShowQuitConfirm(true)} />
        <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
          <p className="text-sm text-[var(--color-text-muted)]">Le plus jeune joueur commence</p>
          <h1 className="text-2xl font-bold tracking-wide font-[var(--font-display)]">
            C'est à {currentPlayer.name} de commencer !
          </h1>
          <Button size="lg" onClick={handleBeginFirstTurn}>
            Commencer
          </Button>
        </div>

        <Modal open={showQuitConfirm} onClose={() => setShowQuitConfirm(false)}>
          <div className="flex flex-col gap-4">
            <p className="text-base font-semibold">Quitter le quiz ? Votre progression sera perdue.</p>
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

  if (!quiz.turn) {
    return (
      <ScreenTransition>
        <ScreenHeader title="Quiz" onBack={() => setShowQuitConfirm(true)} />
        <div className="flex flex-1 items-center justify-center px-6">
          <p className="text-sm text-[var(--color-text-muted)]">Préparation du tour suivant...</p>
        </div>
      </ScreenTransition>
    )
  }

  const { turn } = quiz
  const chosenCard = turn.chosenCardId ? turn.cards.find((c) => c.id === turn.chosenCardId) ?? null : null
  const totalTurns = quiz.roundsPerPlayer * quiz.players.length
  const isLastTurn = quiz.totalTurnsPlayed + 1 >= totalTurns

  const visualState = turn.phase === 'reveal-answer' || turn.phase === 'turn-result' ? 'revealed' : 'front'

  return (
    <ScreenTransition>
      <ScreenHeader title="Quiz" onBack={() => setShowQuitConfirm(true)} />

      <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-5 pb-5">
        <QuizScoreHud players={quiz.players} currentPlayerIndex={quiz.currentPlayerIndex} />

        <ProgressBar value={quiz.totalTurnsPlayed} max={totalTurns} />
        <p className="text-center text-xs text-[var(--color-text-muted)]">
          Au tour de {currentPlayer.name} · Tour {quiz.totalTurnsPlayed + 1} / {totalTurns}
        </p>

        <QuizCardFan
          cards={turn.cards}
          chosenCardId={turn.chosenCardId}
          visualState={visualState}
          onChoose={chooseCard}
        />

        {turn.phase === 'choosing-card' && (
          <p className="text-center text-xs text-[var(--color-text-muted)]">
            Choisissez une carte : thème ou difficulté visible, le reste est un mystère.
          </p>
        )}

        {turn.phase === 'reading-question' && (
          <Button size="lg" className="w-full" onClick={revealAnswer}>
            Révéler la réponse
          </Button>
        )}

        {turn.phase === 'reveal-answer' && (
          <QuizJudgeControls playerName={currentPlayer.name} onJudge={judgeAnswer} />
        )}

        {turn.phase === 'turn-result' && chosenCard && (
          <div className="flex flex-col gap-3">
            <AnswerFeedback correct={!!turn.lastCorrect} answer={chosenCard.question.answer} />
            <Button size="lg" className="w-full" onClick={handleNext}>
              {isLastTurn ? 'Voir les résultats' : 'Joueur suivant'}
            </Button>
          </div>
        )}
      </div>

      <Modal open={showQuitConfirm} onClose={() => setShowQuitConfirm(false)}>
        <div className="flex flex-col gap-4">
          <p className="text-base font-semibold">Quitter le quiz ? Votre progression sera perdue.</p>
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
