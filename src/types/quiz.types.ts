import type { PlayerColor } from './game.types'
import type { AgeLevel, CategoryId, Difficulty, Question } from './question.types'

export interface QuizPlayer {
  id: string
  name: string
  color: PlayerColor
  ageLevel: AgeLevel
  score: number
}

/** Ce qui est révélé au dos d'une carte, jamais les deux à la fois. */
export type QuizHiddenInfoKind = 'category' | 'difficulty'

export interface QuizHiddenInfo {
  kind: QuizHiddenInfoKind
  category: CategoryId
  difficulty: Difficulty
}

/** Une des 3 cartes proposées à un joueur pendant son tour. */
export interface QuizCardSlot {
  id: string
  question: Question
  /** Info affichée au dos (l'autre reste cachée jusqu'au flip). */
  hiddenInfo: QuizHiddenInfo
}

export type QuizCardVisualState = 'back' | 'front' | 'revealed'

export type QuizTurnPhase =
  | 'choosing-card' // 3 cartes dos affichées, en attente du choix du joueur
  | 'reading-question' // carte retournée face visible, réponse pas encore révélée
  | 'reveal-answer' // réponse affichée, en attente du jugement Correct/Incorrect
  | 'turn-result' // jugement fait, feedback affiché, en attente de "Joueur suivant"

export interface QuizTurnState {
  phase: QuizTurnPhase
  cards: QuizCardSlot[] // toujours 3, générées en début de tour
  chosenCardId: string | null
  lastCorrect: boolean | null
}

export interface QuizGameState {
  players: QuizPlayer[]
  currentPlayerIndex: number
  /** Nombre de tours par joueur configuré au lancement. */
  roundsPerPlayer: number
  /** Nombre de tours joués par chaque joueur, indexé comme players. */
  turnsPlayedByPlayer: number[]
  /** Total de tours résolus tous joueurs confondus, pour la progression globale. */
  totalTurnsPlayed: number
  usedQuestionIds: string[]
  turn: QuizTurnState | null
  startingPlayerId: string
}

export interface QuizPlayerResult {
  name: string
  color: PlayerColor
  score: number
}

export interface QuizSessionResult {
  id: string
  players: QuizPlayerResult[]
  winnerName: string
  playerCount: number
  roundsPerPlayer: number
  finishedAt: string
}

export const QUIZ_POINTS_BY_DIFFICULTY: Record<Difficulty, number> = {
  facile: 1,
  moyen: 2,
  difficile: 3,
}

export const QUIZ_MIN_PLAYERS = 1
export const QUIZ_MAX_PLAYERS = 6
export const QUIZ_MIN_ROUNDS = 1
export const QUIZ_MAX_ROUNDS = 30
export const QUIZ_DEFAULT_ROUNDS = 10
