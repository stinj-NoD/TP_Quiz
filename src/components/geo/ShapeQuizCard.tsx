import { geoMercator, geoPath } from 'd3-geo'
import type { Feature, Geometry } from 'geojson'
import { useEffect, useState } from 'react'
import { findCountryFeature } from '../../domain/geo/worldAtlasRepository'
import type { Country } from '../../types/geo.types'

const SIZE = 280

interface ShapeQuizCardProps {
  country: Country
}

export function ShapeQuizCard({ country }: ShapeQuizCardProps) {
  const [feature, setFeature] = useState<Feature<Geometry> | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    findCountryFeature(country.ccn3).then((f) => {
      if (!cancelled) {
        setFeature(f ?? null)
        setLoading(false)
      }
    })
    return () => {
      cancelled = true
    }
  }, [country.ccn3])

  const pathData = (() => {
    if (!feature) return null
    const projection = geoMercator().fitSize([SIZE - 32, SIZE - 32], feature)
    const path = geoPath(projection)
    return path(feature)
  })()

  return (
    <div className="flex aspect-square w-full items-center justify-center overflow-hidden rounded-[var(--radius-lg)] bg-[var(--color-surface-raised)] p-4 ring-1 ring-[var(--color-border)]">
      {loading && <p className="text-xs text-[var(--color-text-muted)]">Chargement de la silhouette...</p>}
      {!loading && pathData && (
        <svg viewBox={`0 0 ${SIZE - 32} ${SIZE - 32}`} className="h-full w-full">
          <path
            d={pathData}
            fill="var(--color-primary-light)"
            stroke="white"
            strokeWidth={1}
            style={{ filter: 'drop-shadow(0 0 8px var(--color-primary-light))' }}
          />
        </svg>
      )}
      {!loading && !pathData && (
        <p className="text-xs text-[var(--color-text-muted)]">Silhouette indisponible</p>
      )}
    </div>
  )
}
