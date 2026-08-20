import type { PlayerColor } from './game.types'

export type ConquestDirection = 'nord' | 'est' | 'sud' | 'ouest'

/** Camp d'un joueur sur le plateau — l'association humain/IA est un détail du store, pas du moteur. */
export type ConquestSide = 'A' | 'B'

/** Palier de la Tier List (S = le plus fort, D = le plus faible) — pilote les valeurs à la création des cartes. */
export type ConquestRarity = 'S' | 'A' | 'B' | 'C' | 'D'

export interface ConquestCard {
  id: string
  name: string
  values: Record<ConquestDirection, number>
  /** Purement éditorial (collection/méta-progression) — jamais lu par le moteur de règles. */
  rarity?: ConquestRarity
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
  pileA: ConquestCard[]
  pileB: ConquestCard[]
  /** Si omis, tiré aléatoirement. */
  firstPlayer?: ConquestSide
}

/**
 * Pioche d'un camp : `pile` est l'ordre de tirage restant (index 0 = prochaine
 * carte à révéler), `drawnCard` la carte déjà révélée en attente de pose
 * (`null` tant que le camp n'a pas encore pioché ce tour-ci), `mulliganUsed`
 * le fait d'avoir déjà refusé une carte piochée cette partie — limité à une
 * fois par camp et par partie.
 */
export interface ConquestPileState {
  pile: ConquestCard[]
  drawnCard: ConquestCard | null
  mulliganUsed: boolean
}

export type ConquestPiles = Record<ConquestSide, ConquestPileState>

export interface ConquestGameState {
  board: ConquestBoard
  piles: ConquestPiles
  currentTurn: ConquestSide
  firstPlayer: ConquestSide
  moveHistory: ConquestMove[]
}

export type ConquestOutcome = ConquestSide | 'égalité'

export interface ConquestResult {
  outcome: ConquestOutcome
  /** Cartes possédées sur le plateau + restant en pioche (dont la carte piochée non posée) — voir domain/conquest/terminal.ts. */
  cardsControlled: Record<ConquestSide, number>
}

/** Union complète déclarée dès maintenant ; seuls facile/moyen sont implémentés pour l'instant. */
export type ConquestDifficulty = 'facile' | 'moyen' | 'difficile' | 'expert'

export const CONQUEST_AVAILABLE_DIFFICULTIES: ConquestDifficulty[] = ['facile', 'moyen']

export const CONQUEST_PILE_SIZE = 5
export const CONQUEST_BOARD_SIZE = 9
export const CONQUEST_CORNER_POSITIONS = [0, 2, 6, 8]
export const CONQUEST_EDGE_POSITIONS = [1, 3, 5, 7]
export const CONQUEST_CENTER_POSITION = 4

/** Configuration d'un camp saisie sur l'écran de mise en place — détail du store/UI, pas du moteur. */
export interface ConquestPlayerConfig {
  name: string
  color: PlayerColor
  kind: 'human' | 'ai'
  /** Renseigné uniquement si `kind === 'ai'`, parmi CONQUEST_AVAILABLE_DIFFICULTIES. */
  difficulty?: ConquestDifficulty
}

export interface ConquestMatchConfig {
  players: Record<ConquestSide, ConquestPlayerConfig>
}

export type ConquestStorePhase = 'awaiting-draw' | 'card-revealed' | 'resolving-capture' | 'match-complete'

export interface ConquestPlayerResult {
  name: string
  color: PlayerColor
  kind: 'human' | 'ai'
  cardsControlled: number
}

export interface ConquestSessionResult {
  id: string
  outcome: ConquestOutcome
  players: Record<ConquestSide, ConquestPlayerResult>
  finishedAt: string
}

export const CONQUEST_SERIES_TARGET_WINS = 2

/** Une série = plusieurs manches (ConquestMatchState) jouées à la suite ; le premier camp à
 *  atteindre CONQUEST_SERIES_TARGET_WINS victoires de manche remporte la série. Les égalités
 *  ne comptent pour aucun camp mais font tout de même avancer au tour suivant. */
export interface ConquestSeriesState {
  players: Record<ConquestSide, ConquestPlayerConfig>
  roundWins: Record<ConquestSide, number>
  roundsPlayed: number
  roundOutcomes: ConquestOutcome[]
}
