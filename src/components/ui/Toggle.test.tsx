import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { Toggle } from './Toggle'

describe('Toggle', () => {
  it('reflète son état via aria-pressed', () => {
    render(<Toggle checked label="Activer les sons" onChange={() => {}} />)
    expect(screen.getByRole('button', { name: 'Activer les sons' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('appelle onChange au clic', () => {
    const onChange = vi.fn()
    render(<Toggle checked={false} label="Activer les sons" onChange={onChange} />)

    fireEvent.click(screen.getByRole('button', { name: 'Activer les sons' }))

    expect(onChange).toHaveBeenCalledTimes(1)
  })

  it("n'appelle pas onChange quand désactivé", () => {
    const onChange = vi.fn()
    render(<Toggle checked={false} label="Activer les sons" onChange={onChange} disabled />)

    fireEvent.click(screen.getByRole('button', { name: 'Activer les sons' }))

    expect(onChange).not.toHaveBeenCalled()
  })
})
