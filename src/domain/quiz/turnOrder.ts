import type { AgeLevel } from '../../types/question.types'

const AGE_ORDER: Record<AgeLevel, number> = { enfant: 0, ado: 1, adulte: 2 }

/**
 * Retourne l'index du joueur qui commence : le plus jeune (enfant < ado < adulte),
 * égalité tranchée par ordre de saisie (index le plus bas gagne).
 */
export function determineStartingPlayerIndex(players: { ageLevel: AgeLevel }[]): number {
  let bestIndex = 0
  for (let i = 1; i < players.length; i++) {
    if (AGE_ORDER[players[i].ageLevel] < AGE_ORDER[players[bestIndex].ageLevel]) bestIndex = i
  }
  return bestIndex
}
