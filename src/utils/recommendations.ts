import {
  CATEGORY_LABELS,
  destinations,
  recommendations,
  type Category,
  type Destination,
  type Recommendation,
} from '../data/recommendations'
import type { Country } from '../types'

export interface DestinationRecommendations {
  destination: Destination
  recommendations: Recommendation[]
}

export interface EnrichedRecommendation {
  recommendation: Recommendation
  destination: Destination
  country: Country | undefined
}

export interface RecommendationStats {
  countriesWithRecommendations: number
  destinationsCount: number
  recommendationsCount: number
  categories: {
    category: Category
    label: string
    count: number
  }[]
}

export function getDestinationById(id: string): Destination | undefined {
  return destinations.find((destination) => destination.id === id)
}

export function getMapsUrl(name: string, destinationNameEn: string): string {
  const query = new URLSearchParams({
    query: `${name} ${destinationNameEn}`,
  })

  return `https://www.google.com/maps/search/?api=1&${query.toString()}`
}

export function getRecommendationsByCountry(
  cca3: string,
): DestinationRecommendations[] {
  return destinations
    .filter((destination) => destination.countryCode === cca3)
    .flatMap((destination) => {
      const destinationRecommendations = recommendations.filter(
        (recommendation) =>
          recommendation.destinationId === destination.id,
      )

      return destinationRecommendations.length > 0
        ? [{ destination, recommendations: destinationRecommendations }]
        : []
    })
}

export function filterByCategory(
  items: Recommendation[],
  category: Category | 'all',
): Recommendation[] {
  if (category === 'all') {
    return items.slice()
  }

  return items.filter((recommendation) => recommendation.category === category)
}

export function sortRecommendations(
  items: Recommendation[],
): Recommendation[] {
  return items.slice().sort((first, second) => {
    const mustGoOrder = Number(Boolean(second.mustGo)) - Number(Boolean(first.mustGo))
    return mustGoOrder || second.googleRating - first.googleRating
  })
}

export function getEnrichedRecommendations(
  countries: Country[],
): EnrichedRecommendation[] {
  const countriesByCode = new Map(
    countries.map((country) => [country.cca3, country]),
  )

  return recommendations.flatMap((recommendation) => {
    const destination = destinations.find(
      (item) => item.id === recommendation.destinationId,
    )

    return destination
      ? [
          {
            recommendation,
            destination,
            country: countriesByCode.get(destination.countryCode),
          },
        ]
      : []
  })
}

export function getRecommendationStats(): RecommendationStats {
  const activeDestinations = destinations.filter((destination) =>
    recommendations.some(
      (recommendation) => recommendation.destinationId === destination.id,
    ),
  )
  const countriesWithRecommendations = new Set(
    activeDestinations.map((destination) => destination.countryCode),
  )

  return {
    countriesWithRecommendations: countriesWithRecommendations.size,
    destinationsCount: activeDestinations.length,
    recommendationsCount: recommendations.length,
    categories: (Object.keys(CATEGORY_LABELS) as Category[]).map(
      (category) => ({
        category,
        label: CATEGORY_LABELS[category],
        count: recommendations.filter(
          (recommendation) => recommendation.category === category,
        ).length,
      }),
    ),
  }
}
