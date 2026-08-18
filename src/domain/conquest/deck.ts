import type { ConquestCard, ConquestSide } from '../../types/conquest.types'

export function shuffle<T>(items: T[]): T[] {
  const arr = [...items]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

/** Mélange `pool` et distribue `handSize` cartes à chaque camp, sans chevauchement. */
export function dealHands(
  pool: ConquestCard[],
  handSize: number,
): { handA: ConquestCard[]; handB: ConquestCard[] } {
  if (pool.length < handSize * 2) {
    throw new Error(`Le pool doit contenir au moins ${handSize * 2} cartes pour distribuer 2 mains de ${handSize}`)
  }

  const shuffled = shuffle(pool)
  return {
    handA: shuffled.slice(0, handSize),
    handB: shuffled.slice(handSize, handSize * 2),
  }
}

export function chooseFirstPlayer(): ConquestSide {
  return Math.random() < 0.5 ? 'A' : 'B'
}
