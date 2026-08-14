import { motion } from 'framer-motion'
import { PLAYER_COLOR_VALUES } from '../../types/game.types'
import type { Player } from '../../types/game.types'

interface PlayerTokenProps {
  player: Player
  x: number
  y: number
  offsetIndex: number
}

export function PlayerToken({ player, x, y, offsetIndex }: PlayerTokenProps) {
  const angle = offsetIndex * 60 * (Math.PI / 180)
  const offsetRadius = 7
  const cx = x + Math.cos(angle) * offsetRadius
  const cy = y + Math.sin(angle) * offsetRadius

  const color = PLAYER_COLOR_VALUES[player.color]

  return (
    <motion.g initial={false} animate={{ x: 0, y: 0 }}>
      <motion.circle
        cx={cx}
        cy={cy}
        r={13}
        fill={color}
        opacity={0.35}
        initial={false}
        animate={{ cx, cy }}
        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      />
      <motion.circle
        cx={cx}
        cy={cy}
        r={7.5}
        fill={color}
        stroke="var(--color-bg)"
        strokeWidth={1.5}
        initial={false}
        animate={{ cx, cy }}
        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      />
      <motion.circle
        cx={cx}
        cy={cy}
        r={3}
        fill="rgba(255,255,255,0.55)"
        initial={false}
        animate={{ cx: cx - 2, cy: cy - 2 }}
        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      />
    </motion.g>
  )
}
