import { describe, expect, it } from 'vitest'
import type { ConquestBoard, ConquestDirection } from '../../types/conquest.types'
import { countCardsBySide, createEmptyBoard, getNeighborPosition, isBoardFull, positionToRowCol } from './board'

function makeCard(id: string) {
  return { id, name: id, values: { nord: 1, est: 1, sud: 1, ouest: 1 } }
}

describe('positionToRowCol', () => {
  it('convertit chaque position en ligne/colonne', () => {
    expect(positionToRowCol(0)).toEqual({ row: 0, col: 0 })
    expect(positionToRowCol(4)).toEqual({ row: 1, col: 1 })
    expect(positionToRowCol(8)).toEqual({ row: 2, col: 2 })
  })
})

describe('getNeighborPosition', () => {
  // Table de vérité complète : les 9 positions × 4 directions.
  // Grille : 0 1 2 / 3 4 5 / 6 7 8
  const cases: [number, ConquestDirection, number | null][] = [
    [0, 'nord', null], [0, 'sud', 3], [0, 'est', 1], [0, 'ouest', null],
    [1, 'nord', null], [1, 'sud', 4], [1, 'est', 2], [1, 'ouest', 0],
    [2, 'nord', null], [2, 'sud', 5], [2, 'est', null], [2, 'ouest', 1],
    [3, 'nord', 0], [3, 'sud', 6], [3, 'est', 4], [3, 'ouest', null],
    [4, 'nord', 1], [4, 'sud', 7], [4, 'est', 5], [4, 'ouest', 3],
    [5, 'nord', 2], [5, 'sud', 8], [5, 'est', null], [5, 'ouest', 4],
    [6, 'nord', 3], [6, 'sud', null], [6, 'est', 7], [6, 'ouest', null],
    [7, 'nord', 4], [7, 'sud', null], [7, 'est', 8], [7, 'ouest', 6],
    [8, 'nord', 5], [8, 'sud', null], [8, 'est', null], [8, 'ouest', 7],
  ]

  it.each(cases)('position %i, direction %s -> %s', (position, direction, expected) => {
    expect(getNeighborPosition(position, direction)).toBe(expected)
  })
})

describe('countCardsBySide', () => {
  it('compte zéro sur un plateau vide', () => {
    expect(countCardsBySide(createEmptyBoard())).toEqual({ A: 0, B: 0 })
  })

  it('compte les cartes de chaque camp sur un plateau partiel', () => {
    const board: ConquestBoard = createEmptyBoard()
    board[0] = { card: makeCard('a1'), ownerId: 'A' }
    board[1] = { card: makeCard('a2'), ownerId: 'A' }
    board[2] = { card: makeCard('b1'), ownerId: 'B' }
    expect(countCardsBySide(board)).toEqual({ A: 2, B: 1 })
  })
})

describe('isBoardFull', () => {
  it('est faux sur un plateau vide', () => {
    expect(isBoardFull(createEmptyBoard())).toBe(false)
  })

  it('est faux sur un plateau partiel', () => {
    const board = createEmptyBoard()
    board[0] = { card: makeCard('a1'), ownerId: 'A' }
    expect(isBoardFull(board)).toBe(false)
  })

  it('est vrai quand les 9 cases sont occupées', () => {
    const board: ConquestBoard = new Array(9)
      .fill(null)
      .map((_, i) => ({ card: makeCard(`c${i}`), ownerId: i % 2 === 0 ? 'A' : 'B' }))
    expect(isBoardFull(board)).toBe(true)
  })
})
