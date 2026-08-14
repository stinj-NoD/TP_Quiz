import { describe, expect, it } from 'vitest'
import type { Country } from '../../types/geo.types'
import { generateQuizQuestion, generateQuizSession } from './quizGenerator'

function makePool(count: number): Country[] {
  return Array.from({ length: count }, (_, i) => ({
    cca3: `C${i}`,
    ccn3: `${i}`,
    nameFr: `Pays ${i}`,
    capital: `Capitale ${i}`,
    flagSvgUrl: `/flags/C${i}.svg`,
    region: 'Europe',
    latlng: [0, 0] as [number, number],
    hasShape: true,
  }))
}

describe('generateQuizQuestion', () => {
  it('génère 4 options distinctes incluant la bonne réponse', () => {
    const pool = makePool(10)
    const question = generateQuizQuestion(pool, 'flag-to-country')
    expect(question.options).toHaveLength(4)
    expect(new Set(question.options).size).toBe(4)
    expect(question.options[question.correctOptionIndex]).toBe(question.correctCountry.nameFr)
  })

  it('utilise les capitales comme options pour country-to-capital', () => {
    const pool = makePool(10)
    const question = generateQuizQuestion(pool, 'country-to-capital')
    expect(question.options[question.correctOptionIndex]).toBe(question.correctCountry.capital)
  })

  it('lève une erreur si le pool contient moins de 4 pays', () => {
    const pool = makePool(3)
    expect(() => generateQuizQuestion(pool, 'flag-to-country')).toThrow()
  })
})

describe('generateQuizSession', () => {
  it('génère le nombre de questions demandé sans répéter un pays correct', () => {
    const pool = makePool(20)
    const session = generateQuizSession(pool, 'flag-to-country', 10)
    expect(session).toHaveLength(10)
    const correctCca3 = session.map((q) => q.correctCountry.cca3)
    expect(new Set(correctCca3).size).toBe(10)
  })

  it('plafonne le nombre de questions à la taille du pool disponible', () => {
    const pool = makePool(5)
    const session = generateQuizSession(pool, 'flag-to-country', 20)
    expect(session.length).toBeLessThanOrEqual(5)
  })
})
