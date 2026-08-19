import type { ConquestGameState } from '../../types/conquest.types'

export function canDraw(state: ConquestGameState): boolean {
  const pileState = state.piles[state.currentTurn]
  return pileState.drawnCard === null && pileState.pile.length > 0
}

/** Révèle la prochaine carte de la pile du camp actif comme carte à jouer ce tour-ci. */
export function drawCard(state: ConquestGameState): ConquestGameState {
  const pileState = state.piles[state.currentTurn]
  if (pileState.drawnCard !== null) {
    throw new Error(`Le camp ${state.currentTurn} a déjà pioché ce tour-ci`)
  }
  if (pileState.pile.length === 0) {
    throw new Error(`La pile du camp ${state.currentTurn} est vide`)
  }

  return {
    ...state,
    piles: {
      ...state.piles,
      [state.currentTurn]: {
        ...pileState,
        pile: pileState.pile.slice(1),
        drawnCard: pileState.pile[0],
      },
    },
  }
}

export function canMulligan(state: ConquestGameState): boolean {
  const pileState = state.piles[state.currentTurn]
  return pileState.drawnCard !== null && !pileState.mulliganUsed
}

/**
 * Refuse la carte piochée : elle retourne en fond de pile et le camp actif en
 * pioche immédiatement une nouvelle. Limité à une fois par camp et par
 * partie (`mulliganUsed`). Cas limite : si la carte refusée était la dernière
 * de la pile, le renvoi puis la nouvelle pioche redonnent la même carte — un
 * no-op inoffensif qui consomme quand même le mulligan, uniquement atteignable
 * sur la dernière pioche du camp qui joue en premier.
 */
export function mulligan(state: ConquestGameState): ConquestGameState {
  const pileState = state.piles[state.currentTurn]
  if (pileState.drawnCard === null) {
    throw new Error(`Le camp ${state.currentTurn} n'a pas encore pioché de carte à refuser`)
  }
  if (pileState.mulliganUsed) {
    throw new Error(`Le camp ${state.currentTurn} a déjà utilisé son mulligan`)
  }

  const requeuedPile = [...pileState.pile, pileState.drawnCard]

  return {
    ...state,
    piles: {
      ...state.piles,
      [state.currentTurn]: {
        pile: requeuedPile.slice(1),
        drawnCard: requeuedPile[0],
        mulliganUsed: true,
      },
    },
  }
}
