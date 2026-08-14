import type { Player } from '../../types/game.types'
import { hasAllWedges } from './boardEngine'

export function canAttemptFinalQuestion(player: Player): boolean {
  return player.isInCenter && hasAllWedges(player)
}

export function isVictory(player: Player, answeredCorrectly: boolean): boolean {
  return canAttemptFinalQuestion(player) && answeredCorrectly
}
