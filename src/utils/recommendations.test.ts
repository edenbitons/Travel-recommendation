import { describe, expect, it } from 'vitest'
import {
  filterByCategory,
  getMapsUrl,
  getRecommendationsByCountry,
  getRecommendationStats,
  sortRecommendations,
} from './recommendations'
import {
  destinations,
  recommendations,
  type Recommendation,
} from '../data/recommendations'

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

  it('creates a valid destination query for all 113 recommendations', () => {
    expect(recommendations).toHaveLength(113)

    for (const recommendation of recommendations) {
      const destination = destinations.find(
        (item) => item.id === recommendation.destinationId,
      )

      expect(destination).toBeDefined()
      if (!destination) {
        continue
      }

      const url = new URL(
        getMapsUrl(recommendation.name, destination.nameEn),
      )

      expect(url.origin + url.pathname).toBe(
        'https://www.google.com/maps/search/',
      )
      expect(url.searchParams.get('api')).toBe('1')
      expect(url.searchParams.get('query')).toBe(
        `${recommendation.name} ${destination.nameEn}`,
      )
    }
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

describe('getRecommendationStats', () => {
  it('calculates country, destination, recommendation, and category totals', () => {
    const stats = getRecommendationStats()

    expect(stats.countriesWithRecommendations).toBe(6)
    expect(stats.destinationsCount).toBe(10)
    expect(stats.recommendationsCount).toBe(113)
    expect(stats.categories).toHaveLength(7)
    expect(stats.categories.reduce((total, category) => total + category.count, 0))
      .toBe(stats.recommendationsCount)
    expect(stats.categories.find(({ category }) => category === 'restaurant'))
      .toMatchObject({ label: 'מסעדות', count: 34 })
  })
})
