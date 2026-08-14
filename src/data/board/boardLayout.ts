import { CATEGORY_IDS } from '../../types/question.types'
import type { BoardCell } from '../../types/game.types'

/**
 * Anneau de 24 cases : une case "wedge" toutes les 4 cases (6 au total, une par
 * catégorie), le reste en cases "category" classiques réparties en tournant sur
 * les 6 catégories. Chaque case "wedge" est le point de départ d'un rayon vers
 * le centre (voir RADIUS_CELL_INDICES).
 */
const RING_SIZE = 24
const WEDGE_INTERVAL = RING_SIZE / CATEGORY_IDS.length // 4

export const BOARD_RING: BoardCell[] = Array.from({ length: RING_SIZE }, (_, index) => {
  const isWedge = index % WEDGE_INTERVAL === 0
  const categoryIndex = (index / WEDGE_INTERVAL) % CATEGORY_IDS.length
  const category = CATEGORY_IDS[isWedge ? categoryIndex : index % CATEGORY_IDS.length]

  return {
    index,
    type: isWedge ? 'wedge' : 'category',
    category,
  } satisfies BoardCell
})

export const CENTER_CELL: BoardCell = {
  index: RING_SIZE,
  type: 'center',
}

/** Index des cases de l'anneau qui donnent accès au centre (les 6 cases "wedge"). */
export const RADIUS_CELL_INDICES: number[] = BOARD_RING.filter((c) => c.type === 'wedge').map(
  (c) => c.index,
)

export const BOARD: BoardCell[] = [...BOARD_RING, CENTER_CELL]

export function getCell(index: number): BoardCell {
  const cell = BOARD.find((c) => c.index === index)
  if (!cell) throw new Error(`Case de plateau introuvable pour l'index ${index}`)
  return cell
}
