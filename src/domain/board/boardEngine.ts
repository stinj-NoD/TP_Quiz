import { getNode } from '../../data/board/boardLayout'
import type { Player } from '../../types/game.types'

export function hasAllWedges(player: Player): boolean {
  return Object.values(player.wedges).every(Boolean)
}

export interface MoveResult {
  nodeId: string
  /** true si le déplacement s'est arrêté sur un embranchement (case wedge) faute de direction choisie. */
  awaitingChoice: boolean
  branchNodeId?: string
  remainingSteps?: number
}

/**
 * Déplace un joueur de `diceValue` cases en suivant le graphe du plateau à
 * partir de `startNodeId`. S'arrête dès qu'un embranchement (case wedge, 2
 * chemins possibles) est atteint avec des pas restants et qu'aucune
 * direction n'a été fournie — l'appelant doit alors relancer movePlayer
 * avec `chosenDirection` en repartant du `nodeId` retourné. Un rayon se
 * terminant toujours au centre (aucun `next`), un dépassement en fin de
 * rayon plafonne simplement l'arrivée au centre.
 */
export function movePlayer(
  startNodeId: string,
  diceValue: number,
  chosenDirection?: 'ring' | 'arm',
): MoveResult {
  let current = getNode(startNodeId)
  let remaining = diceValue
  let isFirstStep = true

  while (remaining > 0) {
    if (current.next.length === 0) {
      // Terminus (centre) atteint avant d'avoir consommé tous les pas.
      break
    }

    if (current.next.length > 1) {
      // Embranchement à quitter : une direction est requise pour ce pas.
      // Fournie soit par l'appelant dès le départ (reprise après un choix,
      // le nœud de départ étant alors précisément le wedge), soit absente,
      // auquel cas on s'arrête ici en attente de décision.
      const direction = isFirstStep ? chosenDirection : undefined
      if (direction === undefined) {
        return {
          nodeId: current.id,
          awaitingChoice: true,
          branchNodeId: current.id,
          remainingSteps: remaining,
        }
      }
      current = getNode(current.next[direction === 'ring' ? 0 : 1])
    } else {
      current = getNode(current.next[0])
    }

    remaining -= 1
    isFirstStep = false
  }

  return { nodeId: current.id, awaitingChoice: false }
}
