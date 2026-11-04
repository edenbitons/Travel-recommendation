import { useContext } from 'react'
import { FavoritesContext } from './favoritesContext'

export function useFavorites() {
  const value = useContext(FavoritesContext)
  if (!value) {
    throw new Error('useFavorites must be used inside FavoritesProvider')
  }
  return value
}
