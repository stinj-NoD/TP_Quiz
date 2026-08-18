import { describe, expect, it } from 'vitest'
import type { ConquestBoard, ConquestBoardCell, ConquestDirection } from '../../types/conquest.types'
import { createEmptyBoard } from './board'
import { getOpposingDirection, resolveCaptures } from './capture'

function makeCard(id: string, nord: number, est: number, sud: number, ouest: number) {
  return { id, name: id, values: { nord, est, sud, ouest } }
}

function place(board: ConquestBoard, position: number, cell: ConquestBoardCell): ConquestBoard {
  const next = [...board]
  next[position] = cell
  return next
}

describe('getOpposingDirection', () => {
  const cases: [ConquestDirection, ConquestDirection][] = [
    ['nord', 'sud'],
    ['sud', 'nord'],
    ['est', 'ouest'],
    ['ouest', 'est'],
  ]

  it.each(cases)('%s <-> %s', (direction, expected) => {
    expect(getOpposingDirection(direction)).toBe(expected)
  })
})

describe('resolveCaptures', () => {
  it('capture si la valeur attaquante est strictement supérieure', () => {
    let board = createEmptyBoard()
    // Voisin au nord de la position 4, sa face sud (tournée vers 4) vaut 1.
    board = place(board, 1, { card: makeCard('def', 1, 1, 1, 1), ownerId: 'B' })
    board = place(board, 4, { card: makeCard('att', 5, 1, 1, 1), ownerId: 'A' })

    const { board: result, capturedPositions } = resolveCaptures(board, 4)
    expect(capturedPositions).toEqual([1])
    expect(result[1]?.ownerId).toBe('A')
  })

  it("ne capture pas sur une égalité stricte", () => {
    let board = createEmptyBoard()
    board = place(board, 1, { card: makeCard('def', 1, 5, 5, 5), ownerId: 'B' })
    board = place(board, 4, { card: makeCard('att', 5, 1, 1, 1), ownerId: 'A' })

    const { capturedPositions } = resolveCaptures(board, 4)
    expect(capturedPositions).toEqual([])
  })

  it('ne capture jamais une carte de son propre camp', () => {
    let board = createEmptyBoard()
    board = place(board, 1, { card: makeCard('allie', 1, 1, 1, 1), ownerId: 'A' })
    board = place(board, 4, { card: makeCard('att', 9, 1, 1, 1), ownerId: 'A' })

    const { capturedPositions, board: result } = resolveCaptures(board, 4)
    expect(capturedPositions).toEqual([])
    expect(result[1]?.ownerId).toBe('A')
  })

  it('capture simultanément dans les 4 directions depuis le centre', () => {
    let board = createEmptyBoard()
    board = place(board, 1, { card: makeCard('n', 1, 1, 1, 1), ownerId: 'B' }) // sud faible
    board = place(board, 3, { card: makeCard('o', 1, 1, 1, 1), ownerId: 'B' }) // est faible
    board = place(board, 5, { card: makeCard('e', 1, 1, 1, 1), ownerId: 'B' }) // ouest faible
    board = place(board, 7, { card: makeCard('s', 1, 1, 1, 1), ownerId: 'B' }) // nord faible
    board = place(board, 4, { card: makeCard('att', 9, 9, 9, 9), ownerId: 'A' })

    const { capturedPositions, board: result } = resolveCaptures(board, 4)
    expect(new Set(capturedPositions)).toEqual(new Set([1, 3, 5, 7]))
    for (const pos of [1, 3, 5, 7]) {
      expect(result[pos]?.ownerId).toBe('A')
    }
  })

  it("ne capture pas à travers un bord depuis un coin (pas de voisin nord/est en position 2)", () => {
    let board = createEmptyBoard()
    board = place(board, 5, { card: makeCard('sud', 1, 1, 1, 1), ownerId: 'B' })
    board = place(board, 1, { card: makeCard('ouest', 1, 1, 1, 1), ownerId: 'B' })
    board = place(board, 2, { card: makeCard('att', 9, 9, 9, 9), ownerId: 'A' })

    const { capturedPositions } = resolveCaptures(board, 2)
    expect(new Set(capturedPositions)).toEqual(new Set([5, 1]))
  })

  it("ne capture pas à travers un bord depuis le milieu d'un côté (pas de voisin ouest en position 5)", () => {
    let board = createEmptyBoard()
    board = place(board, 2, { card: makeCard('nord', 1, 1, 1, 1), ownerId: 'B' })
    board = place(board, 8, { card: makeCard('sud', 1, 1, 1, 1), ownerId: 'B' })
    board = place(board, 4, { card: makeCard('ouest-voisin', 1, 1, 1, 1), ownerId: 'B' })
    board = place(board, 5, { card: makeCard('att', 9, 9, 9, 9), ownerId: 'A' })

    const { capturedPositions } = resolveCaptures(board, 5)
    expect(new Set(capturedPositions)).toEqual(new Set([2, 8, 4]))
  })

  it("lève une erreur si aucune carte n'est posée à la position donnée", () => {
    const board = createEmptyBoard()
    expect(() => resolveCaptures(board, 4)).toThrow()
  })
})
