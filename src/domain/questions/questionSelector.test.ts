import { describe, expect, it } from 'vitest'
import type { QuestionBank } from '../../types/question.types'
import { selectQuestion } from './questionSelector'

function makeBank(): QuestionBank {
  return {
    geographie: [
      { id: 'geo-1', category: 'geographie', question: 'Q1', answer: 'A1' },
      { id: 'geo-2', category: 'geographie', question: 'Q2', answer: 'A2' },
    ],
    divertissement: [],
    histoire: [],
    'art-litterature': [],
    'sciences-nature': [],
    'sport-loisirs': [],
  }
}

describe('selectQuestion', () => {
  it('sélectionne une question de la catégorie demandée', () => {
    const bank = makeBank()
    const { question } = selectQuestion(bank, 'geographie', [])
    expect(question.category).toBe('geographie')
  })

  it('exclut les questions déjà utilisées quand des alternatives existent', () => {
    const bank = makeBank()
    const { question } = selectQuestion(bank, 'geographie', ['geo-1'])
    expect(question.id).toBe('geo-2')
  })

  it('réinitialise les IDs utilisés de la catégorie une fois épuisée (fallback)', () => {
    const bank = makeBank()
    const { question, updatedUsedIds } = selectQuestion(bank, 'geographie', ['geo-1', 'geo-2'])
    expect(['geo-1', 'geo-2']).toContain(question.id)
    // Un seul ID de la catégorie doit rester dans la liste (celui qu'on vient de tirer).
    expect(updatedUsedIds.filter((id) => id.startsWith('geo-'))).toHaveLength(1)
  })

  it('lève une erreur si la catégorie ne contient aucune question', () => {
    const bank = makeBank()
    expect(() => selectQuestion(bank, 'divertissement', [])).toThrow()
  })
})
