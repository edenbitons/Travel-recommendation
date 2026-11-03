import { describe, expect, it } from 'vitest'
import type { Country } from '../types'
import {
  EXCLUDED_COUNTRIES,
  excludeCountries,
  filterCountriesWithRecommendations,
  filterCountriesByRegion,
  searchCountriesByName,
  sortCountriesByName,
} from './countryFilters'

const countries: Country[] = [
  {
    cca2: 'TH',
    cca3: 'THA',
    name: 'Thailand',
    flagUrl: 'https://flagcdn.com/w320/th.png',
    capital: ['Bangkok'],
    region: 'Asia',
    currencies: ['Baht'],
    languages: ['Thai'],
    area: 513120,
  },
  {
    cca2: 'GR',
    cca3: 'GRC',
    name: 'Greece',
    flagUrl: 'https://flagcdn.com/w320/gr.png',
    capital: ['Athens'],
    region: 'Europe',
    currencies: ['Euro'],
    languages: ['Greek'],
    area: 131990,
  },
  {
    cca2: 'HU',
    cca3: 'HUN',
    name: 'Hungary',
    flagUrl: 'https://flagcdn.com/w320/hu.png',
    capital: ['Budapest'],
    region: 'Europe',
    currencies: ['Forint'],
    languages: ['Hungarian'],
    area: 93028,
  },
]

describe('searchCountriesByName', () => {
  it('finds countries by a case-insensitive partial name', () => {
    expect(searchCountriesByName(countries, '  gReE  ')).toEqual([
      countries[1],
    ])
  })

  it('returns all countries for an empty search', () => {
    expect(searchCountriesByName(countries, '  ')).toEqual(countries)
    expect(searchCountriesByName(countries, '  ')).not.toBe(countries)
  })

  it('returns an empty list when there are no matches', () => {
    expect(searchCountriesByName(countries, 'Atlantis')).toEqual([])
  })
})

describe('filterCountriesByRegion', () => {
  it('returns only countries in the selected region', () => {
    expect(filterCountriesByRegion(countries, 'Europe')).toEqual([
      countries[1],
      countries[2],
    ])
  })

  it('returns all countries when no region is selected', () => {
    expect(filterCountriesByRegion(countries, '')).toEqual(countries)
    expect(filterCountriesByRegion(countries, '')).not.toBe(countries)
  })
})

describe('sortCountriesByName', () => {
  it('sorts names alphabetically without mutating the input', () => {
    const sorted = sortCountriesByName(countries)

    expect(sorted.map((country) => country.name)).toEqual([
      'Greece',
      'Hungary',
      'Thailand',
    ])
    expect(countries.map((country) => country.name)).toEqual([
      'Thailand',
      'Greece',
      'Hungary',
    ])
  })
})

describe('filterCountriesWithRecommendations', () => {
  it('keeps only countries that have a destination recommendation', () => {
    expect(
      filterCountriesWithRecommendations(countries, [
        { countryCode: 'GRC' },
        { countryCode: 'THA' },
      ]),
    ).toEqual([countries[0], countries[1]])
  })

  it('returns an empty list when no destinations are provided', () => {
    expect(filterCountriesWithRecommendations(countries, [])).toEqual([])
  })
})

describe('excludeCountries', () => {
  it('excludes configured countries without mutating the input', () => {
    const countriesWithExcluded = [
      ...countries,
      {
        ...countries[1],
        cca2: 'PS',
        cca3: 'PSE',
        name: 'Palestine',
      },
    ]

    expect(EXCLUDED_COUNTRIES).toContain('PSE')
    expect(excludeCountries(countriesWithExcluded)).toEqual(countries)
    expect(countriesWithExcluded).toHaveLength(4)
  })
})
