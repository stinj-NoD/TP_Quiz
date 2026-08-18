import { describe, expect, it } from 'vitest'
import type { Question } from '../../types/question.types'
import { pointsForQuestion } from './scoring'

function makeQuestion(difficulty?: Question['difficulty']): Question {
  return { id: 'q-1', category: 'geographie', question: 'Q', answer: 'A', difficulty }
}

describe('pointsForQuestion', () => {
  it('retourne 1 point pour une question facile', () => {
    expect(pointsForQuestion(makeQuestion('facile'))).toBe(1)
  })

  it('retourne 2 points pour une question moyenne', () => {
    expect(pointsForQuestion(makeQuestion('moyen'))).toBe(2)
  })

  it('retourne 3 points pour une question difficile', () => {
    expect(pointsForQuestion(makeQuestion('difficile'))).toBe(3)
  })

  it('utilise "moyen" comme repli si la difficulté est absente', () => {
    expect(pointsForQuestion(makeQuestion(undefined))).toBe(2)
  })
})
