import { useEffect, useState, type ReactNode } from 'react'
import {
  FAVORITES_STORAGE_KEY,
  parseFavorites,
  toggleFavorite,
} from '../utils/favorites'
import { FavoritesContext } from './favoritesContext'

function readStoredFavorites(): string[] {
  try {
    return parseFavorites(localStorage.getItem(FAVORITES_STORAGE_KEY))
  } catch {
    return []
  }
}

function FavoritesProvider({ children }: { children: ReactNode }) {
  // קריאה מ-localStorage פעם אחת, כשהאתר עולה
  const [favorites, setFavorites] = useState<string[]>(readStoredFavorites)

  // שמירה ל-localStorage בכל פעם שהרשימה משתנה
  useEffect(() => {
    try {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites))
    } catch {
      // אם הדפדפן חוסם שמירה, המועדפים פשוט לא יישמרו אחרי רענון
    }
  }, [favorites])

  const value = {
    favorites,
    isFavorite: (id: string) => favorites.includes(id),
    toggle: (id: string) => setFavorites((current) => toggleFavorite(current, id)),
  }

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  )
}

export default FavoritesProvider
