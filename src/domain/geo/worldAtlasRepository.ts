import * as topojson from 'topojson-client'
import type { Topology, GeometryCollection } from 'topojson-specification'
import type { Feature, Geometry } from 'geojson'

let cache: Feature<Geometry>[] | null = null

export async function loadCountryFeatures(): Promise<Feature<Geometry>[]> {
  if (cache) return cache
  const res = await fetch('/data/world-50m.json')
  if (!res.ok) throw new Error(`Impossible de charger les silhouettes (HTTP ${res.status})`)
  const topology = (await res.json()) as Topology
  const collection = topojson.feature(
    topology,
    topology.objects.countries as GeometryCollection,
  ) as unknown as { features: Feature<Geometry>[] }
  cache = collection.features
  return cache
}

/**
 * mledoze/countries fournit ccn3 (code numérique ISO 3166-1) pour croiser avec
 * l'id numérique des features world-atlas.
 */
export async function findCountryFeature(ccn3: string): Promise<Feature<Geometry> | undefined> {
  const features = await loadCountryFeatures()
  return features.find((f) => f.id === ccn3)
}
