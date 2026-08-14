/**
 * Script one-shot : génère public/data/countries-snapshot.json et
 * public/flags/{cca3}.svg à partir du dataset ouvert mledoze/countries
 * (plus de clé API requise, contrairement à REST Countries v5) et de
 * flagcdn.com pour les drapeaux SVG. Croise avec world-atlas/countries-50m
 * pour marquer les pays exploitables dans le QCM "Pays -> Forme".
 *
 * Usage : node scripts/generate-geo-data.mjs
 */
import { mkdir, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import * as topojson from 'topojson-client'
import world50 from '../node_modules/world-atlas/countries-50m.json' with { type: 'json' }
import frenchNameOverrides from '../src/data/geo/french-name-overrides.json' with { type: 'json' }

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const FLAGS_DIR = path.join(ROOT, 'public', 'flags')
const SNAPSHOT_PATH = path.join(ROOT, 'public', 'data', 'countries-snapshot.json')

const MLEDOZE_URL = 'https://raw.githubusercontent.com/mledoze/countries/master/countries.json'

async function fetchJson(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Fetch failed ${res.status} for ${url}`)
  return res.json()
}

async function downloadFlag(cca2, cca3) {
  const dest = path.join(FLAGS_DIR, `${cca3}.svg`)
  if (existsSync(dest)) return true
  const url = `https://flagcdn.com/${cca2.toLowerCase()}.svg`
  const res = await fetch(url)
  if (!res.ok) {
    console.warn(`  ! Drapeau introuvable pour ${cca3} (${cca2}): HTTP ${res.status}`)
    return false
  }
  const svg = await res.text()
  await writeFile(dest, svg, 'utf-8')
  return true
}

async function main() {
  await mkdir(FLAGS_DIR, { recursive: true })
  await mkdir(path.dirname(SNAPSHOT_PATH), { recursive: true })

  console.log('Récupération du dataset mledoze/countries...')
  const countries = await fetchJson(MLEDOZE_URL)
  console.log(`  ${countries.length} entités reçues.`)

  const worldGeo = topojson.feature(world50, world50.objects.countries)
  const shapeIds = new Set(worldGeo.features.map((f) => f.id))

  const eligible = countries.filter(
    (c) => c.capital?.length > 0 && c.cca2 && c.cca3 && c.translations?.fra?.common,
  )
  console.log(`  ${eligible.length} entités éligibles (drapeau + capitale + nom FR).`)

  const snapshot = []
  let flagsOk = 0
  let flagsFailed = 0

  for (const c of eligible) {
    const hasShape = shapeIds.has(c.ccn3)
    const flagDownloaded = await downloadFlag(c.cca2, c.cca3)
    if (flagDownloaded) flagsOk++
    else flagsFailed++

    const override = frenchNameOverrides[c.cca3]

    snapshot.push({
      cca3: c.cca3,
      ccn3: c.ccn3 ?? '',
      nameFr: override?.nameFr ?? c.translations.fra.common,
      capital: override?.capital ?? c.capital[0],
      flagSvgUrl: `/flags/${c.cca3}.svg`,
      region: c.region,
      latlng: c.latlng ?? [0, 0],
      hasShape,
    })
  }

  snapshot.sort((a, b) => a.nameFr.localeCompare(b.nameFr, 'fr'))

  await writeFile(SNAPSHOT_PATH, JSON.stringify(snapshot, null, 2), 'utf-8')

  const withShape = snapshot.filter((c) => c.hasShape).length
  console.log('---')
  console.log(`Snapshot écrit : ${SNAPSHOT_PATH}`)
  console.log(`  ${snapshot.length} pays au total, dont ${withShape} avec silhouette exploitable.`)
  console.log(`  Drapeaux téléchargés : ${flagsOk} OK, ${flagsFailed} échoués.`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
