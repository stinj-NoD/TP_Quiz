import type { Country } from '../../types/geo.types'

let cache: Country[] | null = null

export async function loadCountries(): Promise<Country[]> {
  if (cache) return cache
  const res = await fetch('/data/countries-snapshot.json')
  if (!res.ok) throw new Error(`Impossible de charger le snapshot pays (HTTP ${res.status})`)
  cache = (await res.json()) as Country[]
  return cache
}

export async function loadCountriesWithShape(): Promise<Country[]> {
  const countries = await loadCountries()
  return countries.filter((c) => c.hasShape)
}
