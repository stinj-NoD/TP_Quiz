/**
 * Convertit les illustrations sources de Conquête (src/data/conquest/images/v2/*.png,
 * nommées d'après le nom de carte) en dérivés webp nommés d'après l'ID de carte
 * (src/data/conquest/images/cq-NNN.webp), seule convention comprise par le résolveur
 * d'images de src/data/conquest/index.ts.
 *
 * La jointure source <-> carte se fait sur une clé normalisée (voir normalizeKey) et doit
 * être une bijection parfaite : le script refuse d'écrire quoi que ce soit sinon, plutôt
 * que de produire un jeu de cartes partiellement illustré.
 *
 * Idempotent, et ne supprime jamais les sources.
 *
 * Usage : node scripts/migrate-conquest-images.mjs
 */
import { mkdir, readdir, readFile, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const CARDS_FILE = path.join(ROOT, 'src', 'data', 'conquest', 'cards.json')
const SOURCE_DIR = path.join(ROOT, 'src', 'data', 'conquest', 'images', 'v2')
const OUTPUT_DIR = path.join(ROOT, 'src', 'data', 'conquest', 'images')

// Doit rester cohérent avec le gabarit des cartes (ratio 2:3) et avec ce que les écrans
// affichent au plus grand (aperçu plein écran ~240px de large, soit 480px en DPR 2).
const OUTPUT_WIDTH = 600
const OUTPUT_HEIGHT = 900
const OUTPUT_QUALITY = 82

/**
 * Clé de rapprochement insensible à la casse, aux accents, aux espaces et à la
 * ponctuation : les sources mélangent deux conventions ("Cù Sith-card.png" et
 * "genie_de_la_tempete-card.png") qui doivent retomber sur le même nom de carte.
 */
function normalizeKey(value) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
}

/** Retire le suffixe "-card" autant de fois qu'il est présent ("Amarok-card-card"). */
function stripCardSuffix(stem) {
  let result = stem
  while (result.toLowerCase().endsWith('-card')) {
    result = result.slice(0, -'-card'.length)
  }
  return result
}

function formatBytes(bytes) {
  return `${(bytes / 1024 / 1024).toFixed(1)} Mo`
}

async function main() {
  const cards = JSON.parse(await readFile(CARDS_FILE, 'utf-8'))
  if (!Array.isArray(cards) || cards.length === 0) {
    throw new Error(`${CARDS_FILE}: banque de cartes vide ou invalide`)
  }

  const sourceFiles = (await readdir(SOURCE_DIR)).filter((f) => f.toLowerCase().endsWith('.png'))
  if (sourceFiles.length === 0) {
    throw new Error(`${SOURCE_DIR}: aucune image source (.png) trouvée`)
  }

  // Index des sources par clé normalisée, en détectant les collisions au passage.
  const sourcesByKey = new Map()
  const sourceCollisions = []
  for (const file of sourceFiles) {
    const key = normalizeKey(stripCardSuffix(path.basename(file, path.extname(file))))
    if (sourcesByKey.has(key)) {
      sourceCollisions.push(`"${file}" et "${sourcesByKey.get(key)}" se normalisent tous deux en "${key}"`)
      continue
    }
    sourcesByKey.set(key, file)
  }

  const pairs = []
  const cardsWithoutSource = []
  const cardCollisions = []
  const usedKeys = new Set()

  for (const card of cards) {
    const key = normalizeKey(card.name)
    if (usedKeys.has(key)) {
      cardCollisions.push(`${card.id} ("${card.name}") entre en collision avec une autre carte sur la clé "${key}"`)
      continue
    }
    usedKeys.add(key)

    const source = sourcesByKey.get(key)
    if (!source) {
      cardsWithoutSource.push(`${card.id} ("${card.name}")`)
      continue
    }
    pairs.push({ id: card.id, source })
  }

  const orphanSources = [...sourcesByKey.entries()]
    .filter(([key]) => !usedKeys.has(key))
    .map(([, file]) => file)

  const errors = []
  if (sourceCollisions.length > 0) errors.push(...sourceCollisions.map((m) => `Collision de sources : ${m}`))
  if (cardCollisions.length > 0) errors.push(...cardCollisions.map((m) => `Collision de cartes : ${m}`))
  if (cardsWithoutSource.length > 0) {
    errors.push(`${cardsWithoutSource.length} carte(s) sans image source : ${cardsWithoutSource.join(', ')}`)
  }
  if (orphanSources.length > 0) {
    errors.push(`${orphanSources.length} image(s) source sans carte correspondante : ${orphanSources.join(', ')}`)
  }

  if (errors.length > 0) {
    console.error(`\nJointure imparfaite — aucune image n'a été écrite.\n`)
    for (const err of errors) console.error(`  - ${err}`)
    process.exit(1)
  }

  await mkdir(OUTPUT_DIR, { recursive: true })

  let sourceBytes = 0
  let outputBytes = 0

  for (const { id, source } of pairs) {
    const sourcePath = path.join(SOURCE_DIR, source)
    const outputPath = path.join(OUTPUT_DIR, `${id}.webp`)

    sourceBytes += (await stat(sourcePath)).size

    const buffer = await sharp(sourcePath)
      .resize(OUTPUT_WIDTH, OUTPUT_HEIGHT, { fit: 'cover' })
      .webp({ quality: OUTPUT_QUALITY })
      .toBuffer()

    await writeFile(outputPath, buffer)
    outputBytes += buffer.length
  }

  console.log(`OK — ${pairs.length} illustration(s) converties en ${OUTPUT_WIDTH}x${OUTPUT_HEIGHT} webp.`)
  console.log(`  sources : ${formatBytes(sourceBytes)}`)
  console.log(`  sorties : ${formatBytes(outputBytes)}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
