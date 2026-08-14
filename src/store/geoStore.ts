import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  GeoQuizQuestion,
  GeoQuizType,
  GeoSessionMode,
  GeoSessionResult,
} from '../types/geo.types'

const MAX_HISTORY = 50

function scoreOf(result: GeoSessionResult): number {
  return result.totalQuestions > 0 ? result.correctAnswers / result.totalQuestions : 0
}

function sortByBestScore(results: GeoSessionResult[]): GeoSessionResult[] {
  return [...results].sort((a, b) => {
    const scoreDiff = scoreOf(b) - scoreOf(a)
    if (scoreDiff !== 0) return scoreDiff
    return new Date(b.answeredAt).getTime() - new Date(a.answeredAt).getTime()
  })
}

interface GeoSession {
  mode: GeoSessionMode
  type: GeoQuizType | 'mixed'
  questions: GeoQuizQuestion[]
  currentIndex: number
  correctCount: number
  lastAnswerCorrect: boolean | null
  endsAt: number | null
  durationSeconds: number | null
}

interface GeoStore {
  history: GeoSessionResult[]
  addResult: (result: GeoSessionResult) => void
  clearHistory: () => void

  session: GeoSession | null
  startSession: (type: GeoQuizType, questions: GeoQuizQuestion[]) => void
  startTimerSession: (durationSeconds: number) => void
  appendQuestion: (question: GeoQuizQuestion) => void
  answerCurrent: (optionIndex: number) => void
  nextQuestion: () => void
  endSession: (playerName: string) => void
  discardSession: () => void
}

export const useGeoStore = create<GeoStore>()(
  persist(
    (set, get) => ({
      history: [],
      addResult: (result) =>
        set((state) => ({ history: sortByBestScore([...state.history, result]).slice(0, MAX_HISTORY) })),
      clearHistory: () => set({ history: [] }),

      session: null,

      startSession: (type, questions) =>
        set({
          session: {
            mode: 'count',
            type,
            questions,
            currentIndex: 0,
            correctCount: 0,
            lastAnswerCorrect: null,
            endsAt: null,
            durationSeconds: null,
          },
        }),

      startTimerSession: (durationSeconds) =>
        set({
          session: {
            mode: 'timer',
            type: 'mixed',
            questions: [],
            currentIndex: 0,
            correctCount: 0,
            lastAnswerCorrect: null,
            endsAt: Date.now() + durationSeconds * 1000,
            durationSeconds,
          },
        }),

      appendQuestion: (question) => {
        const { session } = get()
        if (!session) return
        set({ session: { ...session, questions: [...session.questions, question] } })
      },

      answerCurrent: (optionIndex) => {
        const { session } = get()
        if (!session) return
        const question = session.questions[session.currentIndex]
        const correct = optionIndex === question.correctOptionIndex
        set({
          session: {
            ...session,
            correctCount: session.correctCount + (correct ? 1 : 0),
            lastAnswerCorrect: correct,
          },
        })
      },

      nextQuestion: () => {
        const { session } = get()
        if (!session) return
        set({
          session: {
            ...session,
            currentIndex: session.currentIndex + 1,
            lastAnswerCorrect: null,
          },
        })
      },

      endSession: (playerName) => {
        const { session } = get()
        if (session) {
          get().addResult({
            mode: session.mode,
            type: session.mode === 'timer' ? undefined : (session.type as GeoQuizType),
            totalQuestions: session.questions.length,
            correctAnswers: session.correctCount,
            answeredAt: new Date().toISOString(),
            durationSeconds: session.durationSeconds ?? undefined,
            playerName: playerName.trim() || 'Joueur',
          })
        }
        set({ session: null })
      },

      discardSession: () => set({ session: null }),
    }),
    { name: 'trivial-poursuit-geo-history', partialize: (state) => ({ history: state.history }) },
  ),
)
