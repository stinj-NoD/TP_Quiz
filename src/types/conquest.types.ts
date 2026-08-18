export type ConquestDirection = 'nord' | 'est' | 'sud' | 'ouest'

/** Camp d'un joueur sur le plateau — l'association humain/IA est un détail du store, pas du moteur. */
export type ConquestSide = 'A' | 'B'

export interface ConquestCard {
  id: string
  name: string
  values: Record<ConquestDirection, number>
}

export interface ConquestBoardCell {
  card: ConquestCard
  ownerId: ConquestSide
}

/** Plateau de longueur fixe 9, index = ligne * 3 + colonne, `null` = case vide. */
export type ConquestBoard = (ConquestBoardCell | null)[]

export interface ConquestMove {
  side: ConquestSide
  cardId: string
  position: number
}

export interface ConquestGameConfig {
  handA: ConquestCard[]
  handB: ConquestCard[]
  /** Si omis, tiré aléatoirement. */
  firstPlayer?: ConquestSide
}

export interface ConquestGameState {
  board: ConquestBoard
  hands: Record<ConquestSide, ConquestCard[]>
  currentTurn: ConquestSide
  firstPlayer: ConquestSide
  moveHistory: ConquestMove[]
}

export type ConquestOutcome = ConquestSide | 'égalité'

export interface ConquestResult {
  outcome: ConquestOutcome
  /** Cartes possédées sur le plateau + restant en main (voir domain/conquest/terminal.ts). */
  cardsControlled: Record<ConquestSide, number>
}

/** Union complète déclarée dès maintenant ; seuls facile/moyen sont implémentés pour l'instant. */
export type ConquestDifficulty = 'facile' | 'moyen' | 'difficile' | 'expert'

export const CONQUEST_HAND_SIZE = 5
export const CONQUEST_BOARD_SIZE = 9
export const CONQUEST_CORNER_POSITIONS = [0, 2, 6, 8]
export const CONQUEST_EDGE_POSITIONS = [1, 3, 5, 7]
export const CONQUEST_CENTER_POSITION = 4
