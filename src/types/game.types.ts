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
  position: number
  wedges: Record<CategoryId, boolean>
  isInCenter: boolean
}

export type CellType = 'category' | 'wedge' | 'roll-again' | 'center'

export interface BoardCell {
  index: number
  type: CellType
  category?: CategoryId
}

export type GamePhase = 'awaiting-roll' | 'moving' | 'awaiting-answer' | 'resolving' | 'victory'

export interface GameState {
  players: Player[]
  currentPlayerIndex: number
  board: BoardCell[]
  phase: GamePhase
  lastDiceValue: number | null
  currentQuestion: Question | null
  usedQuestionIds: string[]
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
