import type { Country } from '../types'
import type { Destination } from '../data/recommendations'

const countryNameCollator = new Intl.Collator('en', {
  numeric: true,
  sensitivity: 'base',
})

export const EXCLUDED_COUNTRIES = ['PSE'] as const

export function searchCountriesByName(
  countries: Country[],
  searchTerm: string,
): Country[] {
  const normalizedSearch = searchTerm.trim().toLocaleLowerCase()

  if (!normalizedSearch) {
    return countries.slice()
  }

  return countries.filter((country) =>
    country.name.toLocaleLowerCase().includes(normalizedSearch),
  )
}

export function filterCountriesByRegion(
  countries: Country[],
  region: string,
): Country[] {
  if (!region.trim()) {
    return countries.slice()
  }

  return countries.filter((country) => country.region === region)
}

export function sortCountriesByName(countries: Country[]): Country[] {
  return countries.slice().sort((first, second) =>
    countryNameCollator.compare(first.name, second.name),
  )
}

export function filterCountriesWithRecommendations(
  countries: Country[],
  destinations: Pick<Destination, 'countryCode'>[],
): Country[] {
  const countryCodesWithRecommendations = new Set(
    destinations.map((destination) => destination.countryCode),
  )

  return countries.filter((country) =>
    countryCodesWithRecommendations.has(country.cca3),
  )
}

export function excludeCountries(
  countries: Country[],
  excludedCodes: readonly string[] = EXCLUDED_COUNTRIES,
): Country[] {
  const excludedCountryCodes = new Set(excludedCodes)
  return countries.filter((country) => !excludedCountryCodes.has(country.cca3))
}
