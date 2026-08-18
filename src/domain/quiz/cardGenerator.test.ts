import { describe, expect, it } from 'vitest'
import type { CategoryId, QuestionBank } from '../../types/question.types'
import { CATEGORY_IDS } from '../../types/question.types'
import { commitChosenCard, generateTurnCards } from './cardGenerator'

function makeBank(): QuestionBank {
  const bank = {} as QuestionBank
  for (const category of CATEGORY_IDS) {
    bank[category] = Array.from({ length: 5 }, (_, i) => ({
      id: `${category}-${i}`,
      category,
      question: `Question ${category} ${i}`,
      answer: `Réponse ${category} ${i}`,
      difficulty: (['facile', 'moyen', 'difficile'] as const)[i % 3],
    }))
  }
  return bank
}

describe('generateTurnCards', () => {
  it('génère toujours 3 cartes', () => {
    const { cards } = generateTurnCards(makeBank(), [])
    expect(cards).toHaveLength(3)
  })

  it('ne pioche jamais deux fois la même question dans un même tour', () => {
    for (let i = 0; i < 20; i++) {
      const { cards } = generateTurnCards(makeBank(), [])
      const ids = cards.map((c) => c.question.id)
      expect(new Set(ids).size).toBe(ids.length)
    }
  })

  it('hiddenInfo.category et hiddenInfo.difficulty correspondent à la question tirée', () => {
    const { cards } = generateTurnCards(makeBank(), [])
    for (const card of cards) {
      expect(card.hiddenInfo.category).toBe(card.question.category)
      expect(card.hiddenInfo.difficulty).toBe(card.question.difficulty)
    }
  })

  it('hiddenInfo.kind vaut toujours "category" ou "difficulty"', () => {
    const { cards } = generateTurnCards(makeBank(), [])
    for (const card of cards) {
      expect(['category', 'difficulty']).toContain(card.hiddenInfo.kind)
    }
  })

  it('respecte les questions déjà utilisées quand la banque le permet', () => {
    const bank = makeBank()
    const usedIds = bank.geographie.map((q) => q.id).slice(0, 4) as string[]
    // Exclut la quasi-totalité de la catégorie geographie ; les cartes générées ne doivent
    // pas reprendre ces IDs tant qu'une alternative existe ailleurs dans la même catégorie.
    const excludedFromOtherCategories = (['divertissement', 'histoire', 'art-litterature', 'sciences-nature', 'sport-loisirs'] as CategoryId[]).flatMap(
      (cat) => bank[cat].map((q) => q.id),
    )
    const { cards } = generateTurnCards(bank, [...usedIds, ...excludedFromOtherCategories])
    for (const card of cards) {
      if (card.question.category === 'geographie') {
        expect(usedIds).not.toContain(card.question.id)
      }
    }
  })
})

describe('commitChosenCard', () => {
  it('ajoute uniquement l\'ID de la carte choisie', () => {
    const result = commitChosenCard(['a', 'b'], 'c')
    expect(result).toEqual(['a', 'b', 'c'])
  })
})
