import { describe, expect, it } from 'vitest'
import { parseFavorites, toggleFavorite } from './favorites'

describe('toggleFavorite', () => {
  it('adds an id that is not in the list', () => {
    expect(toggleFavorite(['nolita-corfu'], 'nui-bakery')).toEqual([
      'nolita-corfu',
      'nui-bakery',
    ])
  })

  it('removes an id that is already in the list without mutating it', () => {
    const favorites = ['nolita-corfu', 'nui-bakery']

    expect(toggleFavorite(favorites, 'nolita-corfu')).toEqual(['nui-bakery'])
    expect(favorites).toEqual(['nolita-corfu', 'nui-bakery'])
  })
})

describe('parseFavorites', () => {
  it('reads a saved list of ids', () => {
    expect(parseFavorites('["a","b"]')).toEqual(['a', 'b'])
  })

  it('returns an empty list for missing or broken data', () => {
    expect(parseFavorites(null)).toEqual([])
    expect(parseFavorites('not json')).toEqual([])
    expect(parseFavorites('{"a":1}')).toEqual([])
  })
})
