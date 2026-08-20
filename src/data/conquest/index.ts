import type { ConquestCard } from '../../types/conquest.types'
import cards from './cards.json'

export const CONQUEST_CARD_POOL: ConquestCard[] = cards as ConquestCard[]

const illustrationModules = import.meta.glob<string>('./images/*.{webp,png,jpg,jpeg}', {
  eager: true,
  query: '?url',
  import: 'default',
})

/**
 * Association id de carte -> URL d'illustration, résolue depuis
 * src/data/conquest/images/{id}.{webp,png,jpg,jpeg}. Une carte sans fichier
 * correspondant n'apparaît simplement pas dans cette table (voir ConquestCardFace,
 * qui retombe sur son affichage texte quand aucune illustration n'est trouvée).
 */
export const CONQUEST_CARD_IMAGES: Record<string, string> = Object.fromEntries(
  Object.entries(illustrationModules).map(([path, url]) => {
    const id = path.replace(/^.*\/([^/]+)\.[^.]+$/, '$1')
    return [id, url]
  }),
)
