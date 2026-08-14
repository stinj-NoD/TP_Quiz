import type { CategoryId, Question, QuestionBank } from '../../types/question.types'

export interface QuestionSelectionResult {
  question: Question
  /** IDs à ajouter à usedQuestionIds (gère le reset si la catégorie est épuisée). */
  updatedUsedIds: string[]
}

export function selectQuestion(
  bank: QuestionBank,
  category: CategoryId,
  usedQuestionIds: string[],
): QuestionSelectionResult {
  const categoryQuestions = bank[category]
  if (!categoryQuestions || categoryQuestions.length === 0) {
    throw new Error(`Aucune question disponible pour la catégorie ${category}`)
  }

  const usedSet = new Set(usedQuestionIds)
  let available = categoryQuestions.filter((q) => !usedSet.has(q.id))

  // Fallback : la catégorie est épuisée, on réinitialise uniquement ses IDs utilisés.
  let usedIdsAfterReset = usedQuestionIds
  if (available.length === 0) {
    const categoryIds = new Set(categoryQuestions.map((q) => q.id))
    usedIdsAfterReset = usedQuestionIds.filter((id) => !categoryIds.has(id))
    available = categoryQuestions
  }

  const question = available[Math.floor(Math.random() * available.length)]

  return {
    question,
    updatedUsedIds: [...usedIdsAfterReset, question.id],
  }
}
