import type { AgeLevel, CategoryId, Question } from './question.types'

export type PlayerColor = 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'orange'

export const PLAYER_COLORS: PlayerColor[] = ['red', 'blue', 'green', 'yellow', 'purple', 'orange']

export const PLAYER_COLOR_VALUES: Record<PlayerColor, string> = {
  red: 'var(--color-player-red)',
  blue: 'var(--color-player-blue)',
  green: 'var(--color-player-green)',
  yellow: 'var(--color-player-yellow)',
  purple: 'var(--color-player-purple)',
  orange: 'var(--color-player-orange)',
}

export interface Player {
  id: string
  name: string
  color: PlayerColor
  ageLevel: AgeLevel
  position: string
  wedges: Record<CategoryId, boolean>
  isInCenter: boolean
}

export type BoardNodeType = 'ring' | 'wedge' | 'arm' | 'center'

/**
 * Case du plateau modélisé en graphe. `next` contient les identifiants des
 * cases atteignables en un pas : une seule entrée en temps normal, deux sur
 * une case "wedge" (next[0] = continuer sur l'anneau, next[1] = entrer dans
 * le rayon de la catégorie), aucune sur le centre (terminus).
 */
export interface BoardNode {
  id: string
  type: BoardNodeType
  category?: CategoryId
  next: string[]
}

export type GamePhase =
  | 'awaiting-roll'
  | 'moving'
  | 'choosing-path'
  | 'awaiting-answer'
  | 'victory'

export interface PendingBranch {
  nodeId: string
  remainingSteps: number
}

export interface GameState {
  players: Player[]
  currentPlayerIndex: number
  board: BoardNode[]
  phase: GamePhase
  lastDiceValue: number | null
  currentQuestion: Question | null
  usedQuestionIds: string[]
  pendingBranch: PendingBranch | null
}

export interface BoardGameResult {
  winnerName: string
  playerCount: number
  finishedAt: string
}

export function createEmptyWedges(): Record<CategoryId, boolean> {
  return {
    geographie: false,
    divertissement: false,
    histoire: false,
    'art-litterature': false,
    'sciences-nature': false,
    'sport-loisirs': false,
  }
}
