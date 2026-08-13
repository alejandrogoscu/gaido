import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { HomePage } from './HomePage'

describe('inicio de colecciones', () => {
  it('muestra el buscador visual y los resúmenes de colecciones', () => {
    render(<HomePage />)

    const search = screen.getByRole('searchbox', {
      name: 'Buscar en tu colección',
    })

    expect(search.hasAttribute('disabled')).toBe(true)
    expect(screen.getByRole('heading', { name: 'Videojuegos' })).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Cómics' })).toBeTruthy()
    expect(screen.getByText('Hollow Knight')).toBeTruthy()
    expect(screen.getByText('Saga')).toBeTruthy()
    expect(screen.getAllByRole('listitem')).toHaveLength(6)
  })

  it('muestra centrados los accesos visuales a cada tipo de colección', () => {
    render(<HomePage />)

    const videoGamesShortcut = screen.getByRole('button', {
      name: 'Videojuegos',
    })
    const comicsShortcut = screen.getByRole('button', { name: 'Cómics' })

    expect(videoGamesShortcut.hasAttribute('disabled')).toBe(true)
    expect(comicsShortcut.hasAttribute('disabled')).toBe(true)
  })

  it('mantiene deshabilitadas las acciones sin ruta disponible', () => {
    render(<HomePage />)

    const viewAllActions = screen.getAllByRole('button', {
      name: /^Ver todos:/,
    })

    expect(viewAllActions).toHaveLength(2)
    expect(viewAllActions.every((action) => action.hasAttribute('disabled'))).toBe(
      true,
    )
  })
})