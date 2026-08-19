/**
 * Valide la banque de cartes de Conquête 3x3 dans src/data/conquest/cards.json :
 * conformité de schéma, convention d'ID, unicité des ID, valeurs bornées.
 *
 * Usage : node scripts/validate-conquest.mjs
 */
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const CARDS_FILE = path.join(ROOT, 'src', 'data', 'conquest', 'cards.json')

const DIRECTIONS = ['nord', 'est', 'sud', 'ouest']
const RARITIES = new Set(['commune', 'rare', 'legendaire'])
const ID_PATTERN = /^cq-(\d{3})$/
// Doit rester cohérent avec CONQUEST_PILE_SIZE dans src/types/conquest.types.ts
// (une pile de 5 cartes par camp, sans chevauchement).
const MIN_POOL_SIZE = 10

async function validate() {
  const errors = []

  let raw
  try {
    raw = await readFile(CARDS_FILE, 'utf-8')
  } catch (err) {
    return [`${CARDS_FILE}: fichier introuvable ou illisible (${err.message})`]
  }

  let entries
  try {
    entries = JSON.parse(raw)
  } catch (err) {
    return [`${CARDS_FILE}: JSON invalide (${err.message})`]
  }

  if (!Array.isArray(entries)) {
    return [`${CARDS_FILE}: le contenu doit être un tableau`]
  }

  const seenIds = new Set()

  entries.forEach((entry, index) => {
    const where = `${CARDS_FILE} [${index}]`

    if (typeof entry.id !== 'string' || !ID_PATTERN.test(entry.id)) {
      errors.push(`${where}: id "${entry.id}" ne respecte pas le format "cq-NNN"`)
    } else if (seenIds.has(entry.id)) {
      errors.push(`${where}: id "${entry.id}" en double`)
    } else {
      seenIds.add(entry.id)
    }

    if (typeof entry.name !== 'string' || entry.name.trim().length === 0) {
      errors.push(`${where}: "name" manquant ou vide`)
    }

    if (entry.rarity !== undefined && !RARITIES.has(entry.rarity)) {
      errors.push(`${where}: "rarity" invalide "${entry.rarity}"`)
    }

    if (typeof entry.values !== 'object' || entry.values === null) {
      errors.push(`${where}: "values" manquant`)
    } else {
      const keys = Object.keys(entry.values).sort()
      const expectedKeys = [...DIRECTIONS].sort()
      if (keys.length !== expectedKeys.length || !keys.every((k, i) => k === expectedKeys[i])) {
        errors.push(`${where}: "values" doit contenir exactement les clés ${DIRECTIONS.join(', ')}`)
      }
      for (const direction of DIRECTIONS) {
        const value = entry.values[direction]
        if (!Number.isInteger(value) || value < 1 || value > 9) {
          errors.push(`${where}: "values.${direction}" doit être un entier entre 1 et 9 (reçu ${value})`)
        }
      }
    }
  })

  if (entries.length < MIN_POOL_SIZE) {
    errors.push(`${CARDS_FILE}: ${entries.length} carte(s), au moins ${MIN_POOL_SIZE} sont requises`)
  }

  return errors
}

async function main() {
  const errors = await validate()

  if (errors.length > 0) {
    console.error(`\n${errors.length} problème(s) détecté(s) :\n`)
    for (const err of errors) console.error(`  - ${err}`)
    process.exit(1)
  }

  console.log('OK — aucun problème détecté.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
