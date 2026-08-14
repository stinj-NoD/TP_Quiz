/**
 * Vérifie que public/data/countries-snapshot.json reflète bien la table de
 * correspondance src/data/geo/french-name-overrides.json (régression), et
 * liste les entrées du snapshot qui ne sont couvertes par aucune entrée de
 * la table (worklist d'audit manuel, ex. après ajout de nouveaux pays).
 *
 * Usage : node scripts/check-french-geo-names.mjs
 */
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const SNAPSHOT_PATH = path.join(ROOT, 'public', 'data', 'countries-snapshot.json')
const OVERRIDES_PATH = path.join(ROOT, 'src', 'data', 'geo', 'french-name-overrides.json')

async function main() {
  const snapshot = JSON.parse(await readFile(SNAPSHOT_PATH, 'utf-8'))
  const overrides = JSON.parse(await readFile(OVERRIDES_PATH, 'utf-8'))

  const regressions = []
  for (const [cca3, override] of Object.entries(overrides)) {
    const entry = snapshot.find((c) => c.cca3 === cca3)
    if (!entry) {
      regressions.push(`${cca3}: présent dans la table de correspondance mais absent du snapshot`)
      continue
    }
    if (override.nameFr !== undefined && entry.nameFr !== override.nameFr) {
      regressions.push(`${cca3}: nameFr attendu "${override.nameFr}", trouvé "${entry.nameFr}"`)
    }
    if (override.capital !== undefined && entry.capital !== override.capital) {
      regressions.push(`${cca3}: capital attendu "${override.capital}", trouvé "${entry.capital}"`)
    }
  }

  const unaudited = snapshot.filter((c) => !(c.cca3 in overrides))

  console.log(`Snapshot : ${snapshot.length} pays. Table de correspondance : ${Object.keys(overrides).length} entrées.`)

  if (regressions.length > 0) {
    console.error(`\n${regressions.length} régression(s) détectée(s) :\n`)
    for (const r of regressions) console.error(`  - ${r}`)
  } else {
    console.log('Aucune régression : le snapshot reflète bien la table de correspondance.')
  }

  console.log(`\n${unaudited.length} pays non couverts par la table de correspondance (à auditer si de nouveaux pays sont ajoutés) :`)
  for (const c of unaudited) {
    console.log(`  - ${c.cca3} (${c.nameFr}) : capital = "${c.capital}"`)
  }

  if (regressions.length > 0) process.exit(1)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
