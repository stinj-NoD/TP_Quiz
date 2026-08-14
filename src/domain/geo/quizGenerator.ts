import type { Country, GeoQuizQuestion, GeoQuizType } from '../../types/geo.types'

function shuffle<T>(items: T[]): T[] {
  const arr = [...items]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)]
}

function optionLabel(country: Country, type: GeoQuizType): string {
  return type === 'country-to-capital' ? country.capital ?? country.nameFr : country.nameFr
}

/**
 * Génère une question de QCM à partir d'un pool de pays (déjà filtré, par ex.
 * sur `hasShape` pour le mode "country-to-shape"). Tire 3 mauvaises réponses
 * distinctes du pays correct, en évitant les doublons de libellé (ex: deux
 * pays partageant un nom de capitale rare).
 */
export function generateQuizQuestion(pool: Country[], type: GeoQuizType): GeoQuizQuestion {
  if (pool.length < 4) {
    throw new Error('Le pool de pays doit contenir au moins 4 entrées pour générer un QCM')
  }

  const correctCountry = pickRandom(pool)
  const correctLabel = optionLabel(correctCountry, type)

  const distractors: string[] = []
  const usedLabels = new Set([correctLabel])
  const candidates = shuffle(pool.filter((c) => c.cca3 !== correctCountry.cca3))

  for (const candidate of candidates) {
    if (distractors.length >= 3) break
    const label = optionLabel(candidate, type)
    if (usedLabels.has(label)) continue
    usedLabels.add(label)
    distractors.push(label)
  }

  const options = shuffle([correctLabel, ...distractors])
  const correctOptionIndex = options.indexOf(correctLabel)

  return {
    type,
    correctCountry,
    options,
    correctOptionIndex,
  }
}

export function generateQuizSession(
  pool: Country[],
  type: GeoQuizType,
  count: number,
): GeoQuizQuestion[] {
  const usedCca3 = new Set<string>()
  const questions: GeoQuizQuestion[] = []
  const maxQuestions = Math.min(count, pool.length)

  while (questions.length < maxQuestions) {
    const remainingPool = pool.filter((c) => !usedCca3.has(c.cca3))
    if (remainingPool.length < 4) break
    const question = generateQuizQuestion(remainingPool, type)
    usedCca3.add(question.correctCountry.cca3)
    questions.push(question)
  }

  return questions
}

export const GEO_QUIZ_TYPES: GeoQuizType[] = [
  'flag-to-country',
  'country-to-capital',
  'capital-to-country',
  'country-to-shape',
]

/**
 * Génère une question de type aléatoire (mode "Défi chrono"). `pool` doit
 * contenir tous les pays, `poolWithShape` uniquement ceux ayant une silhouette
 * exploitable — utilisé automatiquement quand le type tiré est "country-to-shape".
 */
export function generateRandomTypeQuestion(
  pool: Country[],
  poolWithShape: Country[],
  excludedCca3: Set<string>,
): GeoQuizQuestion {
  const type = pickRandom(GEO_QUIZ_TYPES)
  const basePool = type === 'country-to-shape' ? poolWithShape : pool
  const available = basePool.filter((c) => !excludedCca3.has(c.cca3))
  const effectivePool = available.length >= 4 ? available : basePool
  return generateQuizQuestion(effectivePool, type)
}
