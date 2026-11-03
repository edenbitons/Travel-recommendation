import { describe, expect, it } from 'vitest'
import {
  filterByCategory,
  getDestinationById,
  getMapsUrl,
  getRecommendationsByCountry,
  getRecommendationStats,
  sortRecommendations,
} from './recommendations'
import {
  CATEGORY_LABELS,
  destinationGroups,
  destinations,
  recommendations,
  type Recommendation,
} from '../data/recommendations'
import { photos } from '../data/photos'

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
  {
    id: 'unrated',
    name: 'Unrated place',
    destinationId: 'athens',
    category: 'restaurant',
  },
]

describe('getDestinationById', () => {
  it('returns a destination by its id', () => {
    expect(getDestinationById('koh-tao')).toMatchObject({
      id: 'koh-tao',
      name: 'קו טאו',
      countryCode: 'THA',
    })
  })

  it('returns a destination group by its id', () => {
    expect(getDestinationById('thailand')).toMatchObject({
      id: 'thailand',
      name: 'תאילנד',
      destinationIds: ['koh-tao', 'koh-phangan', 'bangkok'],
    })
    expect(destinationGroups).toContain(getDestinationById('thailand'))
  })

  it('returns undefined when the destination does not exist', () => {
    expect(getDestinationById('unknown-destination')).toBeUndefined()
  })
})

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

  it('creates a valid destination query for every recommendation', () => {
    expect(recommendations.length).toBeGreaterThan(0)
    expect(new Set(recommendations.map(({ id }) => id)).size).toBe(
      recommendations.length,
    )

    for (const recommendation of recommendations) {
      expect(recommendation.id.trim()).not.toBe('')
      expect(recommendation.name.trim()).not.toBe('')
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

  it('keeps destination photos linked to existing media', () => {
    expect(photos.length).toBeGreaterThan(0)

    const photoIds = new Set(photos.map((photo) => photo.id))
    for (const photo of photos) {
      expect(photo.id.trim()).not.toBe('')
      expect(photo.title.trim()).not.toBe('')
      expect(photo.src.trim()).not.toBe('')
    }

    for (const destination of destinations) {
      for (const photoId of destination.photos ?? []) {
        expect(photoIds.has(photoId)).toBe(true)
      }
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
      sampleRecommendations[3],
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
    ).toEqual([
      'must-go-lower-rating',
      'high-rated',
      'low-rated',
      'unrated',
    ])
    expect(sampleRecommendations[0].id).toBe('low-rated')
  })

  it('places unrated recommendations after all rated recommendations', () => {
    const sorted = sortRecommendations(sampleRecommendations)

    expect(sorted.at(-1)?.id).toBe('unrated')
    expect(sorted.slice(0, -1).every((item) => item.googleRating !== undefined))
      .toBe(true)
  })
})

describe('getRecommendationStats', () => {
  it('calculates country, destination, recommendation, and category totals', () => {
    const stats = getRecommendationStats()
    const destinationsWithRecommendations = destinations.filter((destination) =>
      recommendations.some(
        (recommendation) => recommendation.destinationId === destination.id,
      ),
    )
    const expectedCountries = new Set(
      destinationsWithRecommendations.map(
        (destination) => destination.countryCode,
      ),
    )

    expect(stats.countriesWithRecommendations).toBe(expectedCountries.size)
    expect(stats.destinationsCount).toBe(destinationsWithRecommendations.length)
    expect(stats.recommendationsCount).toBe(recommendations.length)
    expect(stats.categories).toHaveLength(Object.keys(CATEGORY_LABELS).length)
    expect(stats.categories.reduce((total, category) => total + category.count, 0))
      .toBe(stats.recommendationsCount)

    for (const categoryStats of stats.categories) {
      expect(categoryStats.label).toBe(CATEGORY_LABELS[categoryStats.category])
      expect(categoryStats.count).toBe(
        recommendations.filter(
          (recommendation) =>
            recommendation.category === categoryStats.category,
        ).length,
      )
    }
  })
})
