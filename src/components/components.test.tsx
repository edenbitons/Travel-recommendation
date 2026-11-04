// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Header from './Header'
import NotFoundPage from './NotFoundPage'
import FavoriteButton from './FavoriteButton'
import FavoritesProvider from './FavoritesProvider'
import { FAVORITES_STORAGE_KEY } from '../utils/favorites'

afterEach(() => cleanup())

describe('Header', () => {
  it('opens the menu with all the pages when ☰ is clicked', () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>,
    )

    expect(screen.queryByRole('navigation')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'פתיחת תפריט' }))

    const links = screen.getAllByRole('link').map((link) => link.textContent)
    expect(links).toEqual([
      'בית',
      'המלצות מאחת שיודעת',
      'מועדפים',
      'תמונות',
      'אודות הפרויקט',
    ])
  })
})

describe('NotFoundPage', () => {
  it('shows a 404 message and a link back home', () => {
    render(
      <MemoryRouter>
        <NotFoundPage />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: 'העמוד לא נמצא' })).toBeTruthy()
    expect(
      screen.getByRole('link', { name: 'חזרה לדף הבית' }).getAttribute('href'),
    ).toBe('/')
  })
})

describe('FavoriteButton', () => {
  beforeEach(() => localStorage.clear())

  it('saves a favorite to localStorage and removes it on a second click', () => {
    render(
      <FavoritesProvider>
        <FavoriteButton id="nui-bakery" name="Nui Bakery" />
      </FavoritesProvider>,
    )

    const button = screen.getByRole('button', { name: 'שמירת Nui Bakery במועדפים' })
    fireEvent.click(button)
    expect(button.getAttribute('aria-pressed')).toBe('true')
    expect(localStorage.getItem(FAVORITES_STORAGE_KEY)).toBe('["nui-bakery"]')

    fireEvent.click(button)
    expect(button.getAttribute('aria-pressed')).toBe('false')
    expect(localStorage.getItem(FAVORITES_STORAGE_KEY)).toBe('[]')
  })

  it('remembers favorites that were saved before (after a refresh)', () => {
    localStorage.setItem(FAVORITES_STORAGE_KEY, '["nui-bakery"]')
    render(
      <FavoritesProvider>
        <FavoriteButton id="nui-bakery" name="Nui Bakery" />
      </FavoritesProvider>,
    )

    expect(
      screen.getByRole('button', { name: 'הסרת Nui Bakery מהמועדפים' }),
    ).toBeTruthy()
  })
})
