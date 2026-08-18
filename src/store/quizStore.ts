import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { QUESTION_BANKS } from '../data/questions'
import { commitChosenCard, generateTurnCards } from '../domain/quiz/cardGenerator'
import { pointsForQuestion } from '../domain/quiz/scoring'
import { determineStartingPlayerIndex } from '../domain/quiz/turnOrder'
import type { PlayerColor } from '../types/game.types'
import type { AgeLevel } from '../types/question.types'
import type { QuizGameState, QuizPlayer, QuizSessionResult } from '../types/quiz.types'

const MAX_HISTORY = 50

export interface NewQuizPlayerConfig {
  name: string
  color: PlayerColor
  ageLevel: AgeLevel
}

interface QuizStore {
  quiz: QuizGameState | null
  history: QuizSessionResult[]

  startQuiz: (players: NewQuizPlayerConfig[], roundsPerPlayer: number) => void
  resetQuiz: () => void

  startTurnCards: () => void
  chooseCard: (cardId: string) => void
  revealAnswer: () => void
  judgeAnswer: (correct: boolean) => void
  advanceToNextPlayer: () => void

  isSessionComplete: () => boolean
  finalizeSession: () => QuizSessionResult | null
}

function nextPlayerIndex(index: number, total: number): number {
  return (index + 1) % total
}

export const useQuizStore = create<QuizStore>()(
  persist(
    (set, get) => ({
      quiz: null,
      history: [],

      startQuiz: (playerConfigs, roundsPerPlayer) => {
        const players: QuizPlayer[] = playerConfigs.map((p, index) => ({
          id: `quiz-player-${index}`,
          name: p.name,
          color: p.color,
          ageLevel: p.ageLevel,
          score: 0,
        }))
        const startingIndex = determineStartingPlayerIndex(players)

        set({
          quiz: {
            players,
            currentPlayerIndex: startingIndex,
            roundsPerPlayer,
            turnsPlayedByPlayer: players.map(() => 0),
            totalTurnsPlayed: 0,
            usedQuestionIds: [],
            turn: null,
            startingPlayerId: players[startingIndex].id,
          },
        })
      },

      resetQuiz: () => set({ quiz: null }),

      startTurnCards: () => {
        const { quiz } = get()
        if (!quiz || quiz.turn) return

        const currentPlayer = quiz.players[quiz.currentPlayerIndex]
        const bank = QUESTION_BANKS[currentPlayer.ageLevel]
        const { cards } = generateTurnCards(bank, quiz.usedQuestionIds)

        set({
          quiz: {
            ...quiz,
            turn: { phase: 'choosing-card', cards, chosenCardId: null, lastCorrect: null },
          },
        })
      },

      chooseCard: (cardId) => {
        const { quiz } = get()
        if (!quiz || !quiz.turn || quiz.turn.phase !== 'choosing-card') return

        set({
          quiz: { ...quiz, turn: { ...quiz.turn, chosenCardId: cardId, phase: 'reading-question' } },
        })
      },

      revealAnswer: () => {
        const { quiz } = get()
        if (!quiz || !quiz.turn || quiz.turn.phase !== 'reading-question') return

        set({ quiz: { ...quiz, turn: { ...quiz.turn, phase: 'reveal-answer' } } })
      },

      judgeAnswer: (correct) => {
        const { quiz } = get()
        if (!quiz || !quiz.turn || quiz.turn.phase !== 'reveal-answer' || !quiz.turn.chosenCardId) return

        const chosenCard = quiz.turn.cards.find((c) => c.id === quiz.turn!.chosenCardId)
        if (!chosenCard) return

        const updatedPlayers = quiz.players.map((p, i) =>
          i === quiz.currentPlayerIndex && correct
            ? { ...p, score: p.score + pointsForQuestion(chosenCard.question) }
            : p,
        )

        set({
          quiz: {
            ...quiz,
            players: updatedPlayers,
            usedQuestionIds: commitChosenCard(quiz.usedQuestionIds, chosenCard.question.id),
            turn: { ...quiz.turn, lastCorrect: correct, phase: 'turn-result' },
          },
        })
      },

      advanceToNextPlayer: () => {
        const { quiz } = get()
        if (!quiz) return

        const turnsPlayedByPlayer = quiz.turnsPlayedByPlayer.map((n, i) =>
          i === quiz.currentPlayerIndex ? n + 1 : n,
        )

        set({
          quiz: {
            ...quiz,
            turnsPlayedByPlayer,
            totalTurnsPlayed: quiz.totalTurnsPlayed + 1,
            currentPlayerIndex: nextPlayerIndex(quiz.currentPlayerIndex, quiz.players.length),
            turn: null,
          },
        })
      },

      isSessionComplete: () => {
        const { quiz } = get()
        return !!quiz && quiz.turnsPlayedByPlayer.every((n) => n >= quiz.roundsPerPlayer)
      },

      finalizeSession: () => {
        const { quiz } = get()
        if (!quiz) return null

        const sortedPlayers = [...quiz.players].sort((a, b) => b.score - a.score)
        const result: QuizSessionResult = {
          id: `quiz-result-${Date.now()}`,
          players: sortedPlayers.map((p) => ({ name: p.name, color: p.color, score: p.score })),
          winnerName: sortedPlayers[0]?.name ?? 'Joueur',
          playerCount: quiz.players.length,
          roundsPerPlayer: quiz.roundsPerPlayer,
          finishedAt: new Date().toISOString(),
        }

        set((state) => ({
          history: [result, ...state.history].slice(0, MAX_HISTORY),
          quiz: null,
        }))

        return result
      },
    }),
    { name: 'trivial-poursuit-quiz-state' },
  ),
)
