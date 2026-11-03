import {
  destinations,
  recommendations,
  type Destination,
  type Recommendation,
} from '../data/recommendations'

export interface DestinationRecommendations {
  destination: Destination
  recommendations: Recommendation[]
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
