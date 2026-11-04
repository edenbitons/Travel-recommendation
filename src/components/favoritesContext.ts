import { createContext } from 'react'

export interface FavoritesValue {
  favorites: string[]
  isFavorite: (id: string) => boolean
  toggle: (id: string) => void
}

// ה-Context מאפשר לכל רכיב באתר לקרוא את המועדפים בלי להעביר props בכל שכבה
export const FavoritesContext = createContext<FavoritesValue | null>(null)
