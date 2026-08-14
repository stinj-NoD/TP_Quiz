export type CategoryId =
  | 'geographie'
  | 'divertissement'
  | 'histoire'
  | 'art-litterature'
  | 'sciences-nature'
  | 'sport-loisirs'

export interface Question {
  id: string
  category: CategoryId
  question: string
  answer: string
  difficulty?: 'facile' | 'moyen' | 'difficile'
}

export type QuestionBank = Record<CategoryId, Question[]>

export type AgeLevel = 'enfant' | 'ado' | 'adulte'

export const AGE_LEVELS: AgeLevel[] = ['enfant', 'ado', 'adulte']

export const AGE_LEVEL_LABELS: Record<AgeLevel, string> = {
  enfant: 'Enfant',
  ado: 'Ado',
  adulte: 'Adulte',
}

export const CATEGORY_IDS: CategoryId[] = [
  'geographie',
  'divertissement',
  'histoire',
  'art-litterature',
  'sciences-nature',
  'sport-loisirs',
]

export const CATEGORY_LABELS: Record<CategoryId, string> = {
  geographie: 'Géographie',
  divertissement: 'Divertissement',
  histoire: 'Histoire',
  'art-litterature': 'Art & Littérature',
  'sciences-nature': 'Sciences & Nature',
  'sport-loisirs': 'Sport & Loisirs',
}

export const CATEGORY_COLORS: Record<CategoryId, string> = {
  geographie: 'var(--color-cat-geographie)',
  divertissement: 'var(--color-cat-divertissement)',
  histoire: 'var(--color-cat-histoire)',
  'art-litterature': 'var(--color-cat-art-litterature)',
  'sciences-nature': 'var(--color-cat-sciences-nature)',
  'sport-loisirs': 'var(--color-cat-sport-loisirs)',
}
