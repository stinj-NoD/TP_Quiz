import type { Difficulty, Question } from '../../types/question.types'
import { QUIZ_POINTS_BY_DIFFICULTY } from '../../types/quiz.types'

const FALLBACK_DIFFICULTY: Difficulty = 'moyen'

export function pointsForQuestion(question: Question): number {
  return QUIZ_POINTS_BY_DIFFICULTY[question.difficulty ?? FALLBACK_DIFFICULTY]
}
