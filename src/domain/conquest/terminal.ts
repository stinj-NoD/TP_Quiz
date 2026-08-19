import type { ConquestGameState, ConquestResult, ConquestSide } from '../../types/conquest.types'
import { countCardsBySide, isBoardFull } from './board'

export function isTerminal(state: ConquestGameState): boolean {
  return isBoardFull(state.board)
}

/**
 * Calcule le résultat d'une partie terminée. Le décompte additionne les
 * cartes possédées sur le plateau ET celles restant en pioche (pile non
 * tirée + éventuelle carte déjà piochée mais non posée) : avec des piles
 * symétriques de 5 cartes sur un plateau de 9 cases, le premier joueur pose
 * 5 cartes (pile vidée) et le second n'en pose que 4 (1 carte lui reste en
 * réserve) — soit 10 cartes en jeu, pas 9. Ne compter que le plateau (toujours
 * un total impair) rendrait un score égalité 5-5 mathématiquement impossible.
 */
export function getResult(state: ConquestGameState): ConquestResult {
  if (!isTerminal(state)) {
    throw new Error('getResult ne peut être appelé que sur une partie terminée')
  }

  const onBoard = countCardsBySide(state.board)
  const remaining = (side: ConquestSide): number => {
    const pileState = state.piles[side]
    return pileState.pile.length + (pileState.drawnCard ? 1 : 0)
  }
  const cardsControlled: Record<ConquestSide, number> = {
    A: onBoard.A + remaining('A'),
    B: onBoard.B + remaining('B'),
  }

  const outcome =
    cardsControlled.A === cardsControlled.B ? 'égalité' : cardsControlled.A > cardsControlled.B ? 'A' : 'B'

  return { outcome, cardsControlled }
}
