import type { ConquestCard, ConquestSide } from '../../types/conquest.types'

export function shuffle<T>(items: T[]): T[] {
  const arr = [...items]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

/**
 * Mélange `pool` et distribue `pileSize` cartes à chaque camp, sans
 * chevauchement — chaque tranche du pool mélangé constitue déjà un ordre de
 * pioche indépendant et aléatoire pour son camp (index 0 = première carte
 * piochée), pas besoin d'un mélange supplémentaire par pile.
 */
export function dealPiles(
  pool: ConquestCard[],
  pileSize: number,
): { pileA: ConquestCard[]; pileB: ConquestCard[] } {
  if (pool.length < pileSize * 2) {
    throw new Error(`Le pool doit contenir au moins ${pileSize * 2} cartes pour distribuer 2 piles de ${pileSize}`)
  }

  const shuffled = shuffle(pool)
  return {
    pileA: shuffled.slice(0, pileSize),
    pileB: shuffled.slice(pileSize, pileSize * 2),
  }
}

export function chooseFirstPlayer(): ConquestSide {
  return Math.random() < 0.5 ? 'A' : 'B'
}
