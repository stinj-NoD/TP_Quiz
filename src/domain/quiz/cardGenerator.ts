import { CATEGORY_IDS } from '../../types/question.types'
import type { CategoryId, QuestionBank } from '../../types/question.types'
import type { QuizCardSlot, QuizHiddenInfoKind } from '../../types/quiz.types'
import { selectQuestion } from '../questions/questionSelector'

const CARDS_PER_TURN = 3

function pickRandomCategories(count: number): CategoryId[] {
  // Tirage sans remise tant qu'il reste des catégories distinctes disponibles (6 catégories,
  // 3 cartes -> favorise la variété), puis autorise les doublons si count > CATEGORY_IDS.length.
  const shuffled = [...CATEGORY_IDS].sort(() => Math.random() - 0.5)
  const result: CategoryId[] = []
  for (let i = 0; i < count; i++) result.push(shuffled[i % shuffled.length])
  return result
}

function randomHiddenInfoKind(): QuizHiddenInfoKind {
  return Math.random() < 0.5 ? 'category' : 'difficulty'
}

export interface GenerateTurnCardsResult {
  cards: QuizCardSlot[]
}

export function generateTurnCards(bank: QuestionBank, usedQuestionIds: string[]): GenerateTurnCardsResult {
  const categories = pickRandomCategories(CARDS_PER_TURN)
  const cards: QuizCardSlot[] = []
  const usedThisTurn = new Set<string>()

  for (let i = 0; i < CARDS_PER_TURN; i++) {
    // Exclut aussi les questions déjà piochées dans CE tour pour éviter un doublon visible
    // entre les 3 cartes, même si selectQuestion ne le garantit pas nativement.
    const localExclusion = [...usedQuestionIds, ...usedThisTurn]
    const { question } = selectQuestion(bank, categories[i], localExclusion)
    usedThisTurn.add(question.id)
    cards.push({
      id: `slot-${i}-${question.id}`,
      question,
      hiddenInfo: {
        kind: randomHiddenInfoKind(),
        category: question.category,
        difficulty: question.difficulty ?? 'moyen',
      },
    })
  }

  return { cards }
}

/**
 * À appeler seulement pour la carte réellement JOUÉE par le joueur (les 2 cartes écartées
 * restent disponibles pour de futurs tours - pas de gaspillage de questions).
 */
export function commitChosenCard(usedQuestionIds: string[], chosenQuestionId: string): string[] {
  return [...usedQuestionIds, chosenQuestionId]
}
