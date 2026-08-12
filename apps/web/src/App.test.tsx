import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { App } from './App'

describe('aplicación', () => {
  it('muestra la identidad de Gaido', () => {
    render(<App />)

    expect(screen.getByRole('heading', { name: 'Gaido' })).toBeTruthy()
    expect(screen.getByRole('img', { name: 'Gaido' })).toBeTruthy()
  })
})