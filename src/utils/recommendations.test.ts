import { describe, expect, it } from 'vitest'
import {
  filterByCategory,
  getMapsUrl,
  getRecommendationsByCountry,
  sortRecommendations,
} from './recommendations'
import type { Recommendation } from '../data/recommendations'

const sampleRecommendations: Recommendation[] = [
  {
    id: 'low-rated',
    name: 'Lower rated place',
    destinationId: 'athens',
    category: 'restaurant',
    googleRating: 4.2,
  },
  {
    id: 'high-rated',
    name: 'Higher rated place',
    destinationId: 'athens',
    category: 'cafe',
    googleRating: 4.9,
  },
  {
    id: 'must-go-lower-rating',
    name: 'Must-go place',
    destinationId: 'athens',
    category: 'attraction',
    googleRating: 4.1,
    mustGo: true,
  },
]

describe('getMapsUrl', () => {
  it('creates a Google Maps search URL from the place and destination', () => {
    expect(getMapsUrl('Acropolis', 'Athens')).toBe(
      'https://www.google.com/maps/search/?api=1&query=Acropolis+Athens',
    )
  })

  it('encodes non-ASCII names in the query string', () => {
    const url = new URL(getMapsUrl('קפה', 'New York'))

    expect(url.searchParams.get('query')).toBe('קפה New York')
  })
})

describe('getRecommendationsByCountry', () => {
  it('groups country recommendations by their destinations', () => {
    const countryRecommendations = getRecommendationsByCountry('GRC')

    expect(countryRecommendations.map(({ destination }) => destination.id)).toEqual([
      'athens',
      'rhodes',
      'corfu',
    ])
    expect(countryRecommendations.every((group) => group.recommendations.length > 0))
      .toBe(true)
    expect(
      countryRecommendations
        .flatMap((group) => group.recommendations)
        .some((recommendation) => recommendation.id === 'acropolis'),
    ).toBe(true)
  })

  it('returns an empty list for countries without recommendations', () => {
    expect(getRecommendationsByCountry('PSE')).toEqual([])
  })
})

describe('filterByCategory', () => {
  it('returns recommendations in the selected category', () => {
    expect(filterByCategory(sampleRecommendations, 'restaurant')).toEqual([
      sampleRecommendations[0],
    ])
  })

  it('returns all recommendations for the all category without mutation', () => {
    const result = filterByCategory(sampleRecommendations, 'all')

    expect(result).toEqual(sampleRecommendations)
    expect(result).not.toBe(sampleRecommendations)
  })
})

describe('sortRecommendations', () => {
  it('sorts must-go picks first, then by Google rating descending', () => {
    expect(
      sortRecommendations(sampleRecommendations).map(
        (recommendation) => recommendation.id,
      ),
    ).toEqual(['must-go-lower-rating', 'high-rated', 'low-rated'])
    expect(sampleRecommendations[0].id).toBe('low-rated')
  })
})
