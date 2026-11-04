import { useFavorites } from './useFavorites'

function FavoriteButton({ id, name }: { id: string; name: string }) {
  const { isFavorite, toggle } = useFavorites()
  const saved = isFavorite(id)

  return (
    <button
      aria-label={saved ? `הסרת ${name} מהמועדפים` : `שמירת ${name} במועדפים`}
      aria-pressed={saved}
      className={`favorite-button${saved ? ' is-saved' : ''}`}
      onClick={() => toggle(id)}
      type="button"
    >
      {saved ? '♥' : '♡'}
    </button>
  )
}

export default FavoriteButton
