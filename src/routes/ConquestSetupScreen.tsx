import { Check } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ScreenHeader } from '../components/layout/ScreenHeader'
import { ScreenTransition } from '../components/layout/ScreenTransition'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { ConquestScreenFrame } from '../components/conquest/ConquestScreenFrame'
import { useConquestStore } from '../store/conquestStore'
import { useProfileStore } from '../store/profileStore'
import { PLAYER_COLORS, PLAYER_COLOR_VALUES, type PlayerColor } from '../types/game.types'
import {
  CONQUEST_AVAILABLE_DIFFICULTIES,
  type ConquestDifficulty,
  type ConquestPlayerConfig,
  type ConquestSide,
} from '../types/conquest.types'

const DIFFICULTY_LABELS: Record<ConquestDifficulty, string> = {
  facile: 'Facile',
  moyen: 'Moyen',
  difficile: 'Difficile',
  expert: 'Expert',
}

const SIDES: ConquestSide[] = ['A', 'B']

export function ConquestSetupScreen() {
  const navigate = useNavigate()
  const startSeries = useConquestStore((state) => state.startSeries)
  const profileName = useProfileStore((state) => state.playerName)

  const [players, setPlayers] = useState<Record<ConquestSide, ConquestPlayerConfig>>({
    A: { name: profileName || 'Joueur A', color: 'red', kind: 'human' },
    B: { name: 'IA', color: 'blue', kind: 'ai', difficulty: 'facile' },
  })

  const usedColors = new Set(SIDES.map((side) => players[side].color))

  const updateSide = (side: ConquestSide, patch: Partial<ConquestPlayerConfig>) => {
    setPlayers((prev) => ({ ...prev, [side]: { ...prev[side], ...patch } }))
  }

  const updateKind = (side: ConquestSide, kind: 'human' | 'ai') => {
    updateSide(side, { kind, difficulty: kind === 'ai' ? (players[side].difficulty ?? 'facile') : undefined })
  }

  const updateColor = (side: ConquestSide, color: PlayerColor) => {
    if (usedColors.has(color) && players[side].color !== color) return
    updateSide(side, { color })
  }

  const canStart = SIDES.every((side) => players[side].name.trim().length > 0)

  const handleStart = () => {
    startSeries({
      players: {
        A: { ...players.A, name: players.A.name.trim() },
        B: { ...players.B, name: players.B.name.trim() },
      },
    })
    navigate('/conquete/partie')
  }

  return (
    <ScreenTransition>
      <ConquestScreenFrame />
      <ScreenHeader title="Conquête 3x3" showBack={false} accent="conquest" />
      <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-5 pb-4">
        <p className="text-sm text-[var(--color-text-muted)]">
          Chaque camp pioche dans son propre tas mélangé, une carte à la fois. Capturez les cartes adverses
          adjacentes en posant une valeur strictement supérieure face à elles.
        </p>

        <div className="flex flex-col gap-3">
          {SIDES.map((side) => {
            const player = players[side]
            return (
              <Card key={side} className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <span
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                    style={{ backgroundColor: PLAYER_COLOR_VALUES[player.color] }}
                  >
                    {side}
                  </span>
                  <input
                    value={player.name}
                    onChange={(e) => updateSide(side, { name: e.target.value })}
                    placeholder={`Camp ${side}`}
                    maxLength={20}
                    aria-label={`Nom du camp ${side}`}
                    className="flex-1 rounded-[var(--radius-md)] bg-[var(--color-surface-raised)] px-3 py-2 text-sm text-[var(--color-text)] outline-none ring-1 ring-transparent focus:ring-[var(--color-primary-light)]"
                  />
                </div>

                <div className="flex gap-2">
                  {PLAYER_COLORS.map((color) => {
                    const disabled = usedColors.has(color) && player.color !== color
                    const selected = player.color === color
                    return (
                      <button
                        key={color}
                        type="button"
                        disabled={disabled}
                        onClick={() => updateColor(side, color)}
                        aria-label={color}
                        className="flex h-8 w-8 items-center justify-center rounded-full transition-shadow active:scale-90 disabled:opacity-20"
                        style={{
                          backgroundColor: PLAYER_COLOR_VALUES[color],
                          boxShadow: selected ? `0 0 10px ${PLAYER_COLOR_VALUES[color]}` : undefined,
                        }}
                      >
                        {selected && <Check size={16} color="white" />}
                      </button>
                    )
                  })}
                </div>

                <div className="flex gap-2">
                  {(['human', 'ai'] as const).map((kind) => (
                    <button
                      key={kind}
                      type="button"
                      onClick={() => updateKind(side, kind)}
                      className={`flex-1 rounded-[var(--radius-md)] py-2 text-xs font-semibold transition-[transform,box-shadow] active:scale-95 ${
                        player.kind === kind
                          ? 'bg-[image:var(--gradient-cq)] text-white shadow-[var(--shadow-cq-sm)]'
                          : 'bg-[var(--color-surface-raised)] text-[var(--color-text-muted)]'
                      }`}
                    >
                      {kind === 'human' ? 'Humain' : 'IA'}
                    </button>
                  ))}
                </div>

                {player.kind === 'ai' && (
                  <div className="flex gap-2">
                    {CONQUEST_AVAILABLE_DIFFICULTIES.map((difficulty) => (
                      <button
                        key={difficulty}
                        type="button"
                        onClick={() => updateSide(side, { difficulty })}
                        className={`flex-1 rounded-[var(--radius-md)] py-2 text-xs font-semibold transition-[transform,box-shadow] active:scale-95 ${
                          player.difficulty === difficulty
                            ? 'bg-[image:var(--gradient-cq)] text-white shadow-[var(--shadow-cq-sm)]'
                            : 'bg-[var(--color-surface-raised)] text-[var(--color-text-muted)]'
                        }`}
                      >
                        {DIFFICULTY_LABELS[difficulty]}
                      </button>
                    ))}
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      </div>

      <div className="px-5 pb-5">
        <Button size="lg" accent="conquest" className="w-full" disabled={!canStart} onClick={handleStart}>
          Lancer la partie
        </Button>
      </div>
    </ScreenTransition>
  )
}
