import type { Country } from '../types'

const countryNameCollator = new Intl.Collator('en', {
  numeric: true,
  sensitivity: 'base',
})

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
