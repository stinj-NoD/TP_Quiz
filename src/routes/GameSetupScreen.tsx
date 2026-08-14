import { Check, Minus, Plus } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ScreenHeader } from '../components/layout/ScreenHeader'
import { ScreenTransition } from '../components/layout/ScreenTransition'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { useGameStore, type NewPlayerConfig } from '../store/gameStore'
import { useProfileStore } from '../store/profileStore'
import { PLAYER_COLORS, PLAYER_COLOR_VALUES, type PlayerColor } from '../types/game.types'
import { AGE_LEVELS, AGE_LEVEL_LABELS, type AgeLevel } from '../types/question.types'

const MIN_PLAYERS = 2
const MAX_PLAYERS = 6

function defaultPlayers(count: number, defaultName: string, defaultAgeLevel: AgeLevel): NewPlayerConfig[] {
  return Array.from({ length: count }, (_, i) => ({
    name: i === 0 && defaultName ? defaultName : `Joueur ${i + 1}`,
    color: PLAYER_COLORS[i],
    ageLevel: defaultAgeLevel,
  }))
}

export function GameSetupScreen() {
  const navigate = useNavigate()
  const startGame = useGameStore((state) => state.startGame)
  const profileName = useProfileStore((state) => state.playerName)
  const profileAgeLevel = useProfileStore((state) => state.ageLevel)
  const [players, setPlayers] = useState<NewPlayerConfig[]>(
    defaultPlayers(2, profileName, profileAgeLevel),
  )

  const usedColors = new Set(players.map((p) => p.color))

  const addPlayer = () => {
    if (players.length >= MAX_PLAYERS) return
    const nextColor = PLAYER_COLORS.find((c) => !usedColors.has(c)) ?? PLAYER_COLORS[players.length]
    setPlayers([
      ...players,
      { name: `Joueur ${players.length + 1}`, color: nextColor, ageLevel: profileAgeLevel },
    ])
  }

  const removePlayer = () => {
    if (players.length <= MIN_PLAYERS) return
    setPlayers(players.slice(0, -1))
  }

  const updateName = (index: number, name: string) => {
    setPlayers(players.map((p, i) => (i === index ? { ...p, name } : p)))
  }

  const updateColor = (index: number, color: PlayerColor) => {
    if (usedColors.has(color) && players[index].color !== color) return
    setPlayers(players.map((p, i) => (i === index ? { ...p, color } : p)))
  }

  const updateAgeLevel = (index: number, ageLevel: AgeLevel) => {
    setPlayers(players.map((p, i) => (i === index ? { ...p, ageLevel } : p)))
  }

  const canStart = players.every((p) => p.name.trim().length > 0)

  const handleStart = () => {
    startGame(players.map((p) => ({ ...p, name: p.name.trim() })))
    navigate('/plateau')
  }

  return (
    <ScreenTransition>
      <ScreenHeader title="Nouvelle partie" />
      <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-5 pb-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-[var(--color-text-muted)]">Nombre de joueurs</span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={removePlayer}
              disabled={players.length <= MIN_PLAYERS}
              aria-label="Retirer un joueur"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-surface-raised)] active:scale-95 disabled:opacity-30"
            >
              <Minus size={16} />
            </button>
            <span className="w-6 text-center text-lg font-semibold">{players.length}</span>
            <button
              type="button"
              onClick={addPlayer}
              disabled={players.length >= MAX_PLAYERS}
              aria-label="Ajouter un joueur"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-surface-raised)] active:scale-95 disabled:opacity-30"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {players.map((player, index) => (
            <Card key={index} className="flex flex-col gap-3">
              <input
                value={player.name}
                onChange={(e) => updateName(index, e.target.value)}
                placeholder={`Joueur ${index + 1}`}
                maxLength={20}
                className="rounded-[var(--radius-md)] bg-[var(--color-surface-raised)] px-3 py-2 text-sm text-[var(--color-text)] outline-none ring-1 ring-transparent focus:ring-[var(--color-primary-light)]"
              />
              <div className="flex gap-2">
                {PLAYER_COLORS.map((color) => {
                  const disabled = usedColors.has(color) && player.color !== color
                  const selected = player.color === color
                  return (
                    <button
                      key={color}
                      type="button"
                      disabled={disabled}
                      onClick={() => updateColor(index, color)}
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
                {AGE_LEVELS.map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => updateAgeLevel(index, level)}
                    className={`flex-1 rounded-[var(--radius-md)] py-2 text-xs font-semibold transition-[transform,box-shadow] active:scale-95 ${
                      player.ageLevel === level
                        ? 'bg-[var(--gradient-primary)] text-white shadow-[var(--glow-sm)]'
                        : 'bg-[var(--color-surface-raised)] text-[var(--color-text-muted)]'
                    }`}
                  >
                    {AGE_LEVEL_LABELS[level]}
                  </button>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div className="px-5 pb-5">
        <Button size="lg" className="w-full" disabled={!canStart} onClick={handleStart}>
          Lancer la partie
        </Button>
      </div>
    </ScreenTransition>
  )
}
