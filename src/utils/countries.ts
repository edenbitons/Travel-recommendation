import type { Country } from '../types'

type JsonRecord = Record<string, unknown>

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function getStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : []
}

function getCurrencyNames(value: unknown): string[] {
  if (!isRecord(value)) {
    return []
  }

  return Object.values(value).flatMap((currency) => {
    if (!isRecord(currency) || typeof currency.name !== 'string') {
      return []
    }
    return [currency.name]
  })
}

function getLanguageNames(value: unknown): string[] {
  if (!isRecord(value)) {
    return []
  }

  return Object.values(value).filter(
    (language): language is string => typeof language === 'string',
  )
}

function mapCountry(value: unknown): Country {
  if (!isRecord(value)) {
    throw new Error('מבנה נתוני מדינה לא תקין.')
  }

  const name = isRecord(value.name) ? value.name.common : undefined
  const cca2 = value.cca2
  const cca3 = value.cca3
  const region = value.region
  const area = value.area

  if (
    typeof name !== 'string' ||
    typeof cca2 !== 'string' ||
    typeof cca3 !== 'string' ||
    typeof region !== 'string' ||
    typeof area !== 'number'
  ) {
    throw new Error('חסרים נתונים נדרשים במדינה שהתקבלה מהשרת.')
  }

  return {
    cca2,
    cca3,
    name,
    flagUrl: `https://flagcdn.com/w320/${cca2.toLowerCase()}.png`,
    capital: getStringArray(value.capital),
    region,
    currencies: getCurrencyNames(value.currencies),
    languages: getLanguageNames(value.languages),
    area,
  }
}

export function mapCountries(response: unknown): Country[] {
  if (!Array.isArray(response)) {
    throw new Error('תשובת המדינות מהשרת אינה רשימה תקינה.')
  }

  return response.map(mapCountry)
}
