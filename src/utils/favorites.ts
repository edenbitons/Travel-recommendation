// מפתח השמירה של המועדפים ב-localStorage
export const FAVORITES_STORAGE_KEY = 'been-there-favorites'

// מוסיף id לרשימה אם הוא לא שם, ומוריד אותו אם הוא כבר שם.
// לא משנה את הרשימה המקורית, אלא מחזיר רשימה חדשה.
export function toggleFavorite(favorites: string[], id: string): string[] {
  return favorites.includes(id)
    ? favorites.filter((favoriteId) => favoriteId !== id)
    : [...favorites, id]
}

// הופך את הטקסט השמור ב-localStorage לרשימה.
// אם אין כלום, או שהטקסט פגום, מחזיר רשימה ריקה במקום לקרוס.
export function parseFavorites(storedValue: string | null): string[] {
  if (!storedValue) {
    return []
  }

  try {
    const parsed: unknown = JSON.parse(storedValue)
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === 'string')
      : []
  } catch {
    return []
  }
}
