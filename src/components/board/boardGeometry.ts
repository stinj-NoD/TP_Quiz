export const SIZE = 360
export const CENTER = SIZE / 2

export const SECTOR_COUNT = 6
export const SECTOR_ANGLE = 360 / SECTOR_COUNT

/** Anneau extérieur : circulation normale des pions, 24 cases logiques. */
export const RING_INNER_RADIUS = 150
export const RING_OUTER_RADIUS = 180

/** Bras radiaux : raccourci décoratif vers le centre (6 cases par bras, non logiques). */
export const ARM_INNER_RADIUS = 58
export const ARM_OUTER_RADIUS = RING_INNER_RADIUS
export const ARM_HALF_WIDTH = 13
export const ARM_CELLS = 6

/** Centre : petit hexagone à 6 parts, une par catégorie. */
export const CENTER_RADIUS = ARM_INNER_RADIUS

function toRadians(deg: number) {
  return (deg - 90) * (Math.PI / 180)
}

export function polarPoint(cx: number, cy: number, radius: number, angleDeg: number) {
  const rad = toRadians(angleDeg)
  return {
    x: cx + Math.cos(rad) * radius,
    y: cy + Math.sin(rad) * radius,
  }
}

/** Décrit un secteur annulaire ("part de camembert") en path SVG. */
export function describeDonutSlice(
  cx: number,
  cy: number,
  rInner: number,
  rOuter: number,
  startAngle: number,
  endAngle: number,
) {
  const outerStart = polarPoint(cx, cy, rOuter, startAngle)
  const outerEnd = polarPoint(cx, cy, rOuter, endAngle)
  const innerStart = polarPoint(cx, cy, rInner, startAngle)
  const innerEnd = polarPoint(cx, cy, rInner, endAngle)
  const largeArc = endAngle - startAngle > 180 ? 1 : 0

  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${rOuter} ${rOuter} 0 ${largeArc} 1 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerEnd.x} ${innerEnd.y}`,
    `A ${rInner} ${rInner} 0 ${largeArc} 0 ${innerStart.x} ${innerStart.y}`,
    'Z',
  ].join(' ')
}

/** Le secteur `i` (0-5) est centré sur le wedge `i * WEDGE_INTERVAL`. */
export function sectorAngles(sectorIndex: number) {
  const centerAngle = sectorIndex * SECTOR_ANGLE
  return {
    start: centerAngle - SECTOR_ANGLE / 2,
    end: centerAngle + SECTOR_ANGLE / 2,
    center: centerAngle,
  }
}

// ─── Anneau extérieur : 24 cases de circulation ───────────────────────────

/** Path + centroïde d'une case de l'anneau extérieur (case logique `cellIndex`, sur `ringSize` cases). */
export function ringCellShape(cellIndex: number, ringSize: number) {
  const step = 360 / ringSize
  const angleStart = cellIndex * step - step / 2
  const angleEnd = angleStart + step
  const path = describeDonutSlice(CENTER, CENTER, RING_INNER_RADIUS, RING_OUTER_RADIUS, angleStart, angleEnd)
  const center = polarPoint(CENTER, CENTER, (RING_INNER_RADIUS + RING_OUTER_RADIUS) / 2, cellIndex * step)
  return { path, center }
}

/** Position (centroïde) d'une case de l'anneau — utilisée pour les pions. */
export function ringCellPosition(cellIndex: number, ringSize: number) {
  return ringCellShape(cellIndex, ringSize).center
}

// ─── Bras radiaux : raccourci décoratif vers le centre ────────────────────

interface Point {
  x: number
  y: number
}

function pointOnArm(along: number, across: number, sectorIndex: number): Point {
  const angle = sectorAngles(sectorIndex).center
  const rad = toRadians(angle)
  const dirX = Math.cos(rad)
  const dirY = Math.sin(rad)
  const perpX = -dirY
  const perpY = dirX
  return {
    x: CENTER + dirX * along + perpX * across,
    y: CENTER + dirY * along + perpY * across,
  }
}

/**
 * Un bras est un couloir rectiligne étroit (largeur `2 * ARM_HALF_WIDTH`),
 * du bord du centre jusqu'au bord intérieur de l'anneau, centré sur l'axe
 * du secteur `sectorIndex`. Il est pavé en `ARM_CELLS` cases triangulaires
 * en chevrons alternés (dents de scie), comme sur le plateau physique :
 * même construction en "triangle strip" que l'anneau, mais le long d'un
 * couloir rectiligne (deux bords parallèles) plutôt qu'une bande annulaire.
 */
export function armCellShapes(sectorIndex: number) {
  const totalLength = ARM_OUTER_RADIUS - ARM_INNER_RADIUS
  const step = totalLength / ARM_CELLS

  const shapes: { path: string; center: Point }[] = []
  for (let i = 0; i < ARM_CELLS; i++) {
    const alongStart = ARM_INNER_RADIUS + step * i
    const alongEnd = alongStart + step
    const alongMid = (alongStart + alongEnd) / 2
    const tipOnRight = i % 2 === 0

    const baseNear = pointOnArm(alongStart, -ARM_HALF_WIDTH, sectorIndex)
    const baseFar = pointOnArm(alongStart, ARM_HALF_WIDTH, sectorIndex)
    const tip = pointOnArm(alongMid, tipOnRight ? ARM_HALF_WIDTH * 1.6 : -ARM_HALF_WIDTH * 1.6, sectorIndex)
    const nextNear = pointOnArm(alongEnd, -ARM_HALF_WIDTH, sectorIndex)
    const nextFar = pointOnArm(alongEnd, ARM_HALF_WIDTH, sectorIndex)

    // Quadrilatère du segment (rectangle du couloir) + un chevron pointant alternativement à droite/gauche.
    const path = [
      `M ${baseNear.x} ${baseNear.y}`,
      `L ${tip.x} ${tip.y}`,
      `L ${baseFar.x} ${baseFar.y}`,
      `L ${nextFar.x} ${nextFar.y}`,
      `L ${nextNear.x} ${nextNear.y}`,
      'Z',
    ].join(' ')

    shapes.push({ path, center: pointOnArm(alongMid, 0, sectorIndex) })
  }
  return shapes
}

// ─── Centre : hexagone à 6 parts ───────────────────────────────────────────

export function centerSliceShape(sectorIndex: number) {
  const { start, end } = sectorAngles(sectorIndex)
  return describeDonutSlice(CENTER, CENTER, 0, CENTER_RADIUS, start, end)
}
