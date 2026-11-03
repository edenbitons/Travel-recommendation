import { describe, expect, it } from 'vitest'
import { mapCountries } from './countries'

describe('mapCountries', () => {
  it('maps countries from the mledoze data format', () => {
    expect(
      mapCountries([
        {
          name: { common: 'Greece', official: 'Hellenic Republic' },
          cca2: 'GR',
          cca3: 'GRC',
          capital: ['Athens'],
          region: 'Europe',
          area: 131990,
          currencies: { EUR: { name: 'Euro', symbol: '€' } },
          languages: { ell: 'Greek' },
        },
      ]),
    ).toEqual([
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
    ])
  })

  it('rejects a response that is not a list', () => {
    expect(() => mapCountries({ countries: [] })).toThrow(
      'תשובת המדינות מהשרת אינה רשימה תקינה.',
    )
  })

  it('rejects entries that are missing required fields', () => {
    expect(() => mapCountries([{ cca2: 'GR' }])).toThrow(
      'חסרים נתונים נדרשים במדינה שהתקבלה מהשרת.',
    )
  })
})
