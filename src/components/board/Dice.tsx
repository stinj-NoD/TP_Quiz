import { motion } from 'framer-motion'
import {
  Dice1,
  Dice2,
  Dice3,
  Dice4,
  Dice5,
  Dice6,
  type LucideIcon,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useHaptics } from '../../hooks/useHaptics'

const DICE_ICONS: Record<number, LucideIcon> = {
  1: Dice1,
  2: Dice2,
  3: Dice3,
  4: Dice4,
  5: Dice5,
  6: Dice6,
}

interface DiceProps {
  value: number | null
  rolling: boolean
  onRollEnd?: () => void
  onClick?: () => void
  disabled?: boolean
}

export function Dice({ value, rolling, onRollEnd, onClick, disabled }: DiceProps) {
  const [displayValue, setDisplayValue] = useState(value ?? 1)
  const vibrate = useHaptics()

  useEffect(() => {
    if (!rolling) {
      if (value != null) setDisplayValue(value)
      return
    }

    const interval = setInterval(() => {
      setDisplayValue(Math.floor(Math.random() * 6) + 1)
    }, 80)

    const timeout = setTimeout(() => {
      clearInterval(interval)
      if (value != null) setDisplayValue(value)
      vibrate(20)
      onRollEnd?.()
    }, 800)

    return () => {
      clearInterval(interval)
      clearTimeout(timeout)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rolling])

  const Icon = DICE_ICONS[displayValue] ?? Dice1

  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label="Lancer le dé"
      className="flex h-16 w-16 items-center justify-center rounded-[var(--radius-md)] bg-[linear-gradient(145deg,var(--color-surface-raised),var(--color-surface))] text-[var(--color-text)] ring-2 ring-[var(--color-primary-light)] shadow-[var(--glow-md)] transition-shadow disabled:opacity-40 disabled:shadow-none"
      animate={
        rolling
          ? { rotate: [0, 90, 180, 270, 360], scale: [1, 1.08, 1, 1.08, 1] }
          : { rotate: 0, scale: 1 }
      }
      style={{ boxShadow: rolling ? 'var(--glow-lg)' : undefined }}
      transition={rolling ? { duration: 0.8, ease: 'easeInOut' } : { duration: 0.15 }}
      whileTap={{ scale: 0.92 }}
    >
      <Icon size={36} style={{ filter: 'drop-shadow(0 0 6px var(--color-primary-light))' }} />
    </motion.button>
  )
}
