export type PlayerColor = 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'orange'

export const PLAYER_COLORS: PlayerColor[] = ['red', 'blue', 'green', 'yellow', 'purple', 'orange']

export const PLAYER_COLOR_VALUES: Record<PlayerColor, string> = {
  red: 'var(--color-player-red)',
  blue: 'var(--color-player-blue)',
  green: 'var(--color-player-green)',
  yellow: 'var(--color-player-yellow)',
  purple: 'var(--color-player-purple)',
  orange: 'var(--color-player-orange)',
}
