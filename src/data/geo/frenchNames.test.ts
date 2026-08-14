import { describe, expect, it } from 'vitest'
import countriesSnapshot from '../../../public/data/countries-snapshot.json'
import frenchNameOverrides from './french-name-overrides.json'

type SnapshotEntry = {
  cca3: string
  nameFr: string
  capital: string | null
}

type Override = { nameFr?: string; capital?: string }

const snapshot = countriesSnapshot as SnapshotEntry[]
const overrides = frenchNameOverrides as Record<string, Override>

describe('countries-snapshot.json — noms français', () => {
  it("reflète la table de correspondance pour chaque pays qui y figure", () => {
    for (const [cca3, override] of Object.entries(overrides)) {
      const entry = snapshot.find((c) => c.cca3 === cca3)
      expect(entry, `entrée ${cca3} absente du snapshot`).toBeDefined()

      if (override.nameFr !== undefined) {
        expect(entry?.nameFr).toBe(override.nameFr)
      }
      if (override.capital !== undefined) {
        expect(entry?.capital).toBe(override.capital)
      }
    }
  })

  it("n'a pas de capitale connue pour être en anglais, hors table de correspondance", () => {
    // Capitales anglaises déjà corrigées : si l'une d'elles réapparaît telle
    // quelle dans le snapshot pour le même pays, c'est qu'une régénération a
    // écrasé la correction sans repasser par la table de correspondance.
    const knownEnglishForms: Record<string, string> = {
      GBR: 'London',
      RUS: 'Moscow',
      AUT: 'Vienna',
      GRC: 'Athens',
      BEL: 'Brussels',
      POL: 'Warsaw',
      CHN: 'Beijing',
      EGY: 'Cairo',
      MEX: 'Mexico City',
      CHE: 'Bern',
      PRT: 'Lisbon',
      KOR: 'Seoul',
      USA: 'Washington D.C.',
    }

    for (const [cca3, englishForm] of Object.entries(knownEnglishForms)) {
      const entry = snapshot.find((c) => c.cca3 === cca3)
      expect(entry?.capital).not.toBe(englishForm)
    }
  })
})
