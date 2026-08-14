import { describe, expect, it } from 'vitest'
import { AGE_LEVELS, CATEGORY_IDS } from '../../types/question.types'
import { QUESTION_BANKS } from './index'

const CATEGORY_CODES: Record<string, string> = {
  geographie: 'geo',
  divertissement: 'div',
  histoire: 'his',
  'art-litterature': 'art',
  'sciences-nature': 'sci',
  'sport-loisirs': 'spo',
}

describe('QUESTION_BANKS', () => {
  it('a un identifiant unique pour chaque question, sur l\'ensemble de la banque', () => {
    const seen = new Set<string>()
    for (const ageLevel of AGE_LEVELS) {
      for (const category of CATEGORY_IDS) {
        for (const question of QUESTION_BANKS[ageLevel][category]) {
          expect(seen.has(question.id)).toBe(false)
          seen.add(question.id)
        }
      }
    }
  })

  it('respecte le format d\'identifiant "{code}-{ageLevel}-NNN" pour chaque fichier', () => {
    for (const ageLevel of AGE_LEVELS) {
      for (const category of CATEGORY_IDS) {
        const code = CATEGORY_CODES[category]
        const pattern = new RegExp(`^${code}-${ageLevel}-\\d{3}$`)
        for (const question of QUESTION_BANKS[ageLevel][category]) {
          expect(question.id).toMatch(pattern)
        }
      }
    }
  })

  it('a une catégorie cohérente avec la clé de la banque qui la contient', () => {
    for (const ageLevel of AGE_LEVELS) {
      for (const category of CATEGORY_IDS) {
        for (const question of QUESTION_BANKS[ageLevel][category]) {
          expect(question.category).toBe(category)
        }
      }
    }
  })

  it('n\'a pas de question ou de réponse vide', () => {
    for (const ageLevel of AGE_LEVELS) {
      for (const category of CATEGORY_IDS) {
        for (const question of QUESTION_BANKS[ageLevel][category]) {
          expect(question.question.trim().length).toBeGreaterThan(0)
          expect(question.answer.trim().length).toBeGreaterThan(0)
        }
      }
    }
  })
})
