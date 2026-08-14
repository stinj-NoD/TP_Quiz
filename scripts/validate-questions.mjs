/**
 * Valide les banques de questions dans src/data/questions/{ageLevel}/{category}.json :
 * conformité de schéma, convention d'ID, unicité des ID et détection de doublons.
 *
 * Usage : node scripts/validate-questions.mjs
 */
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const QUESTIONS_DIR = path.join(ROOT, 'src', 'data', 'questions')

const AGE_LEVELS = ['enfant', 'ado', 'adulte']

const CATEGORY_CODES = {
  geographie: 'geo',
  divertissement: 'div',
  histoire: 'his',
  'art-litterature': 'art',
  'sciences-nature': 'sci',
  'sport-loisirs': 'spo',
}

const DIFFICULTIES = new Set(['facile', 'moyen', 'difficile'])

const ENGLISH_MARKERS = [
  /\bthe\b/i,
  /\bwhat is\b/i,
  /\bwhich\b/i,
  /\bwho is\b/i,
  /\bhow many\b/i,
]

function normalize(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

async function validateFile(ageLevel, category) {
  const code = CATEGORY_CODES[category]
  const filePath = path.join(QUESTIONS_DIR, ageLevel, `${category}.json`)
  const errors = []

  let raw
  try {
    raw = await readFile(filePath, 'utf-8')
  } catch (err) {
    return [`${filePath}: fichier introuvable ou illisible (${err.message})`]
  }

  let entries
  try {
    entries = JSON.parse(raw)
  } catch (err) {
    return [`${filePath}: JSON invalide (${err.message})`]
  }

  if (!Array.isArray(entries)) {
    return [`${filePath}: le contenu doit être un tableau`]
  }

  const idPattern = new RegExp(`^${code}-${ageLevel}-(\\d{3})$`)
  const seenIds = new Set()
  const seenNormalizedQuestions = new Map()

  entries.forEach((entry, index) => {
    const where = `${filePath} [${index}]`

    if (typeof entry.id !== 'string') {
      errors.push(`${where}: "id" manquant ou invalide`)
    } else {
      const match = entry.id.match(idPattern)
      if (!match) {
        errors.push(`${where}: id "${entry.id}" ne respecte pas le format "${code}-${ageLevel}-NNN"`)
      }
      if (seenIds.has(entry.id)) {
        errors.push(`${where}: id "${entry.id}" en double dans ce fichier`)
      }
      seenIds.add(entry.id)
    }

    if (entry.category !== category) {
      errors.push(`${where}: "category" attendu "${category}", reçu "${entry.category}"`)
    }

    if (typeof entry.question !== 'string' || entry.question.trim().length === 0) {
      errors.push(`${where}: "question" manquant ou vide`)
    }

    if (typeof entry.answer !== 'string' || entry.answer.trim().length === 0) {
      errors.push(`${where}: "answer" manquant ou vide`)
    }

    if (entry.difficulty !== undefined && !DIFFICULTIES.has(entry.difficulty)) {
      errors.push(`${where}: "difficulty" invalide "${entry.difficulty}"`)
    }

    if (typeof entry.question === 'string') {
      // Ignore le texte entre guillemets (titres, surnoms propres) qui peut
      // légitimement contenir de l'anglais dans une question par ailleurs française.
      const withoutQuotedText = entry.question.replace(/"[^"]*"/g, '')
      for (const marker of ENGLISH_MARKERS) {
        if (marker.test(withoutQuotedText)) {
          errors.push(`${where}: "question" semble contenir de l'anglais ("${entry.question}")`)
          break
        }
      }

      const normalized = normalize(entry.question)
      if (seenNormalizedQuestions.has(normalized)) {
        const otherId = seenNormalizedQuestions.get(normalized)
        errors.push(`${where}: question quasi-identique à "${otherId}" ("${entry.question}")`)
      } else {
        seenNormalizedQuestions.set(normalized, entry.id ?? `index ${index}`)
      }
    }
  })

  return errors
}

async function main() {
  const allErrors = []
  let totalQuestions = 0

  for (const ageLevel of AGE_LEVELS) {
    for (const category of Object.keys(CATEGORY_CODES)) {
      const errors = await validateFile(ageLevel, category)
      allErrors.push(...errors)

      try {
        const filePath = path.join(QUESTIONS_DIR, ageLevel, `${category}.json`)
        const raw = await readFile(filePath, 'utf-8')
        const entries = JSON.parse(raw)
        if (Array.isArray(entries)) totalQuestions += entries.length
      } catch {
        // déjà signalé ci-dessus
      }
    }
  }

  console.log(`Validation de ${totalQuestions} questions dans ${AGE_LEVELS.length * Object.keys(CATEGORY_CODES).length} fichiers...`)

  if (allErrors.length > 0) {
    console.error(`\n${allErrors.length} problème(s) détecté(s) :\n`)
    for (const err of allErrors) console.error(`  - ${err}`)
    process.exit(1)
  }

  console.log('OK — aucun problème détecté.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
