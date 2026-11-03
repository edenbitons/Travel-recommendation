import { describe, expect, it } from 'vitest'
import { getMapsUrl, getRecommendationsByCountry } from './recommendations'

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
