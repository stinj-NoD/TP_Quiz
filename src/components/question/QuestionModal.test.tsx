import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import type { Question } from '../../types/question.types'
import { QuestionModal } from './QuestionModal'

const question: Question = {
  id: 'geo-adulte-001',
  category: 'geographie',
  question: 'Quelle est la capitale de la France ?',
  answer: 'Paris',
}

describe('QuestionModal', () => {
  it("n'affiche rien quand aucune question n'est fournie", () => {
    const { container } = render(<QuestionModal question={null} playerName="Alex" onAnswer={() => {}} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('affiche la question et la catégorie', () => {
    render(<QuestionModal question={question} playerName="Alex" onAnswer={() => {}} />)
    expect(screen.getByText(question.question)).toBeInTheDocument()
    expect(screen.getByText('Géographie')).toBeInTheDocument()
  })

  it('révèle la réponse puis appelle onAnswer avec le verdict choisi', () => {
    const onAnswer = vi.fn()
    render(<QuestionModal question={question} playerName="Alex" onAnswer={onAnswer} />)

    fireEvent.click(screen.getByRole('button', { name: 'Révéler la réponse' }))
    expect(screen.getByText('Paris')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Correct' }))
    fireEvent.click(screen.getByRole('button', { name: 'Continuer' }))

    expect(onAnswer).toHaveBeenCalledWith(true)
  })

  it('signale une réponse incorrecte', () => {
    const onAnswer = vi.fn()
    render(<QuestionModal question={question} playerName="Alex" onAnswer={onAnswer} />)

    fireEvent.click(screen.getByRole('button', { name: 'Révéler la réponse' }))
    fireEvent.click(screen.getByRole('button', { name: 'Incorrect' }))
    fireEvent.click(screen.getByRole('button', { name: 'Continuer' }))

    expect(onAnswer).toHaveBeenCalledWith(false)
  })
})
