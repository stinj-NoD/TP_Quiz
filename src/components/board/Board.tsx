import { motion } from 'framer-motion'
import { BOARD_RING } from '../../data/board/boardLayout'
import { CATEGORY_COLORS, CATEGORY_IDS } from '../../types/question.types'
import type { Player } from '../../types/game.types'
import { PlayerToken } from './PlayerToken'
import {
  ARM_INNER_RADIUS,
  CENTER,
  RING_INNER_RADIUS,
  SECTOR_COUNT,
  SIZE,
  armCellShapes,
  centerSliceShape,
  polarPoint,
  ringCellPosition,
  ringCellShape,
  sectorAngles,
} from './boardGeometry'

interface BoardProps {
  players: Player[]
}

export function Board({ players }: BoardProps) {
  const ringSize = BOARD_RING.length

  const playersByPosition = new Map<number, Player[]>()
  for (const player of players) {
    const list = playersByPosition.get(player.position) ?? []
    list.push(player)
    playersByPosition.set(player.position, list)
  }

  const centerPlayers = players.filter((p) => p.isInCenter)

  return (
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="w-full max-w-[380px]">
      <defs>
        <radialGradient id="center-glow" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor="var(--color-primary-light)" stopOpacity={0.5} />
          <stop offset="100%" stopColor="var(--color-primary-light)" stopOpacity={0} />
        </radialGradient>
      </defs>

      {/* Halo doux derrière le centre */}
      <circle cx={CENTER} cy={CENTER} r={ARM_INNER_RADIUS + 14} fill="url(#center-glow)" />

      {/* Centre : hexagone à 6 parts, une par catégorie */}
      {CATEGORY_IDS.map((category, i) => (
        <path
          key={`center-${category}`}
          d={centerSliceShape(i)}
          fill={CATEGORY_COLORS[category]}
          stroke="var(--color-bg)"
          strokeWidth={2}
        />
      ))}
      <motion.circle
        cx={CENTER}
        cy={CENTER}
        r={6}
        fill="var(--color-text)"
        animate={{ scale: [1, 1.3, 1] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformOrigin: `${CENTER}px ${CENTER}px` }}
      />

      {/* 6 bras radiaux : raccourci décoratif vers le centre, cases en chevrons */}
      {Array.from({ length: SECTOR_COUNT }, (_, sectorIndex) => {
        const category = CATEGORY_IDS[sectorIndex]
        const color = CATEGORY_COLORS[category]
        return (
          <g key={`arm-${sectorIndex}`}>
            {armCellShapes(sectorIndex).map((cell, i) => (
              <path
                key={i}
                d={cell.path}
                fill={color}
                fillOpacity={i % 2 === 0 ? 0.85 : 0.55}
                stroke="var(--color-bg)"
                strokeWidth={1.25}
              />
            ))}
          </g>
        )
      })}

      {/* Anneau extérieur : 24 cases de circulation */}
      {BOARD_RING.map((cell) => {
        const { path } = ringCellShape(cell.index, ringSize)
        const color = cell.category ? CATEGORY_COLORS[cell.category] : 'var(--color-surface-raised)'
        const isWedge = cell.type === 'wedge'

        return (
          <path
            key={cell.index}
            d={path}
            fill={color}
            stroke="var(--color-bg)"
            strokeWidth={1.5}
            style={isWedge ? { filter: 'drop-shadow(0 0 5px var(--color-primary-light))' } : undefined}
          />
        )
      })}

      {/* Liseré lumineux marquant l'axe de chaque bras */}
      {Array.from({ length: SECTOR_COUNT }, (_, i) => {
        const angle = sectorAngles(i).center
        const inner = polarPoint(CENTER, CENTER, ARM_INNER_RADIUS, angle)
        const outer = polarPoint(CENTER, CENTER, RING_INNER_RADIUS, angle)
        return (
          <line
            key={`axis-${i}`}
            x1={inner.x}
            y1={inner.y}
            x2={outer.x}
            y2={outer.y}
            stroke="rgba(255,255,255,0.15)"
            strokeWidth={1}
          />
        )
      })}

      {/* Pions sur l'anneau */}
      {Array.from(playersByPosition.entries()).map(([position, group]) => {
        if (BOARD_RING[position]?.index !== position) return null
        const pos = ringCellPosition(position, ringSize)
        return group
          .filter((p) => !p.isInCenter)
          .map((player, i) => (
            <PlayerToken key={player.id} player={player} x={pos.x} y={pos.y} offsetIndex={i} />
          ))
      })}

      {/* Pions au centre */}
      {centerPlayers.map((player, i) => (
        <PlayerToken key={player.id} player={player} x={CENTER} y={CENTER} offsetIndex={i} />
      ))}
    </svg>
  )
}
