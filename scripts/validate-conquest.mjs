/**
 * Valide la banque de cartes de Conquête 3x3 dans src/data/conquest/cards.json :
 * conformité de schéma, convention d'ID, unicité des ID, valeurs bornées,
 * présence d'une image dans src/data/conquest/images/ pour chaque carte, et
 * absence d'image orpheline (fichier ne correspondant à aucune carte).
 *
 * Usage : node scripts/validate-conquest.mjs
 */
import { readFile, access, readdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const CARDS_FILE = path.join(ROOT, 'src', 'data', 'conquest', 'cards.json')
const IMAGES_DIR = path.join(ROOT, 'src', 'data', 'conquest', 'images')
const IMAGE_EXTENSIONS = ['webp', 'png', 'jpg', 'jpeg']

const DIRECTIONS = ['nord', 'est', 'sud', 'ouest']
const RARITIES = new Set(['S', 'A', 'B', 'C', 'D'])
const ID_PATTERN = /^cq-(\d{3})$/
// Doit rester cohérent avec CONQUEST_PILE_SIZE dans src/types/conquest.types.ts
// (une pile de 5 cartes par camp, sans chevauchement).
const MIN_POOL_SIZE = 10

async function fileExists(filePath) {
  try {
    await access(filePath)
    return true
  } catch {
    return false
  }
}

async function hasCardImage(id) {
  for (const ext of IMAGE_EXTENSIONS) {
    if (await fileExists(path.join(IMAGES_DIR, `${id}.${ext}`))) return true
  }
  return false
}

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

  for (const [index, entry] of entries.entries()) {
    const where = `${CARDS_FILE} [${index}]`

    if (typeof entry.id !== 'string' || !ID_PATTERN.test(entry.id)) {
      errors.push(`${where}: id "${entry.id}" ne respecte pas le format "cq-NNN"`)
    } else if (seenIds.has(entry.id)) {
      errors.push(`${where}: id "${entry.id}" en double`)
    } else {
      seenIds.add(entry.id)
      if (!(await hasCardImage(entry.id))) {
        errors.push(`${where}: aucune image trouvée pour "${entry.id}" dans ${IMAGES_DIR}`)
      }
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
        if (!Number.isInteger(value) || value < 0 || value > 10) {
          errors.push(`${where}: "values.${direction}" doit être un entier entre 0 et 10 (reçu ${value})`)
        }
      }
    }
  }

  if (entries.length < MIN_POOL_SIZE) {
    errors.push(`${CARDS_FILE}: ${entries.length} carte(s), au moins ${MIN_POOL_SIZE} sont requises`)
  }

  // Sens inverse : une image qui ne correspond à aucune carte signale un renommage
  // incomplet ou un reliquat d'une génération précédente. Seul le niveau racine est
  // inspecté : les sous-dossiers (ex. images/v2) sont les masters, pas des dérivés.
  try {
    const files = await readdir(IMAGES_DIR, { withFileTypes: true })
    for (const file of files) {
      if (!file.isFile()) continue
      const ext = path.extname(file.name).slice(1).toLowerCase()
      if (!IMAGE_EXTENSIONS.includes(ext)) continue

      const stem = path.basename(file.name, path.extname(file.name))
      if (!seenIds.has(stem)) {
        errors.push(`${IMAGES_DIR}: l'image "${file.name}" ne correspond à aucune carte`)
      }
    }
  } catch (err) {
    errors.push(`${IMAGES_DIR}: dossier d'illustrations illisible (${err.message})`)
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
