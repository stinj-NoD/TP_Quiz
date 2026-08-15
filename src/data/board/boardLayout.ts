import { CATEGORY_IDS } from '../../types/question.types'
import type { BoardNode } from '../../types/game.types'

/**
 * Plateau modélisé en graphe : un anneau extérieur de 24 cases de
 * circulation (une case "wedge" toutes les 4, une par catégorie), et pour
 * chaque wedge un rayon de 3 cases menant au centre. Sur une case "wedge",
 * le joueur choisit entre continuer sur l'anneau (next[0]) ou s'engager
 * dans le rayon vers le centre (next[1]) — c'est le seul point
 * d'embranchement du graphe (`next.length > 1`). Les rayons sont à sens
 * unique : ils ne mènent qu'au centre, jamais de retour vers l'anneau.
 */
const RING_SIZE = 24
const WEDGE_INTERVAL = RING_SIZE / CATEGORY_IDS.length // 4
const ARM_CELLS = 3

function ringNodeId(index: number): string {
  return `ring-${index}`
}

function armNodeId(category: string, step: number): string {
  return `arm-${category}-${step}`
}

const CENTER_ID = 'center'

function buildRingNodes(): BoardNode[] {
  return Array.from({ length: RING_SIZE }, (_, index) => {
    const isWedge = index % WEDGE_INTERVAL === 0
    const categoryIndex = (index / WEDGE_INTERVAL) % CATEGORY_IDS.length
    const category = CATEGORY_IDS[isWedge ? categoryIndex : index % CATEGORY_IDS.length]
    const nextRingId = ringNodeId((index + 1) % RING_SIZE)

    return {
      id: ringNodeId(index),
      type: isWedge ? 'wedge' : 'ring',
      category,
      next: isWedge ? [nextRingId, armNodeId(category, 1)] : [nextRingId],
    } satisfies BoardNode
  })
}

function buildArmNodes(): BoardNode[] {
  const arms: BoardNode[] = []
  for (const category of CATEGORY_IDS) {
    for (let step = 1; step <= ARM_CELLS; step++) {
      const next = step < ARM_CELLS ? [armNodeId(category, step + 1)] : [CENTER_ID]
      arms.push({
        id: armNodeId(category, step),
        type: 'arm',
        category,
        next,
      })
    }
  }
  return arms
}

const CENTER_NODE: BoardNode = { id: CENTER_ID, type: 'center', next: [] }

export const BOARD_RING: BoardNode[] = buildRingNodes()
export const BOARD_ARMS: BoardNode[] = buildArmNodes()
export const CENTER_CELL: BoardNode = CENTER_NODE

export const BOARD: BoardNode[] = [...BOARD_RING, ...BOARD_ARMS, CENTER_NODE]

const BOARD_INDEX: Map<string, BoardNode> = new Map(BOARD.map((node) => [node.id, node]))

export function getNode(id: string): BoardNode {
  const node = BOARD_INDEX.get(id)
  if (!node) throw new Error(`Case de plateau introuvable pour l'identifiant ${id}`)
  return node
}

export const START_NODE_ID = ringNodeId(0)
