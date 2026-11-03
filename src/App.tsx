import { useEffect, useMemo, useState } from 'react'
import { Link, Route, Routes, useParams } from 'react-router-dom'
import type { Country } from './types'
import { mapCountries } from './utils/countries'
import {
  excludeCountries,
  filterCountriesByRegion,
  filterCountriesWithRecommendations,
  searchCountriesByName,
  sortCountriesByName,
} from './utils/countryFilters'
import Header from './components/Header'
import { destinations } from './data/recommendations'
import './App.css'

const COUNTRIES_API_URL =
  'https://cdn.jsdelivr.net/gh/mledoze/countries@master/countries.json'

const REGION_LABELS: Record<string, string> = {
  Africa: 'אפריקה',
  Americas: 'אמריקה',
  Asia: 'אסיה',
  Europe: 'אירופה',
  Oceania: 'אוקיאניה',
  Antarctic: 'אנטארקטיקה',
}

function CountriesStatus({
  isLoading,
  error,
  onRetry,
}: {
  isLoading: boolean
  error: string | null
  onRetry: () => void
}) {
  if (isLoading) {
    return (
      <p className="countries-status" role="status">
        טוען מדינות...
      </p>
    )
  }

  if (error) {
    return (
      <div className="countries-error" role="alert">
        <p>לא הצלחנו לטעון את רשימת המדינות.</p>
        <p className="error-details">{error}</p>
        <button className="retry-button" onClick={onRetry} type="button">
          נסו שוב
        </button>
      </div>
    )
  }

  return null
}

function HomePage({
  countries,
  isLoading,
  error,
  onRetry,
}: {
  countries: Country[]
  isLoading: boolean
  error: string | null
  onRetry: () => void
}) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRegion, setSelectedRegion] = useState('')
  const [onlyRecommended, setOnlyRecommended] = useState(false)

  const availableRegions = useMemo(
    () =>
      Array.from(new Set(countries.map((country) => country.region))).sort(),
    [countries],
  )
  const recommendedCountryCodes = useMemo(
    () => new Set(destinations.map((destination) => destination.countryCode)),
    [],
  )
  const visibleCountries = useMemo(() => {
    const countriesWithoutExcluded = excludeCountries(countries)
    const matchingName = searchCountriesByName(
      countriesWithoutExcluded,
      searchTerm,
    )
    const matchingRegion = filterCountriesByRegion(
      matchingName,
      selectedRegion,
    )
    const matchingRecommendations = onlyRecommended
      ? filterCountriesWithRecommendations(matchingRegion, destinations)
      : matchingRegion

    return sortCountriesByName(matchingRecommendations)
  }, [countries, onlyRecommended, searchTerm, selectedRegion])

  const scrollToCountries = () => {
    document.getElementById('countries')?.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'auto'
        : 'smooth',
    })
  }

  return (
    <main className="countries-page" dir="rtl">
      <header className="page-heading">
        <p className="eyebrow">Been There, Done That</p>
        <h1>מדינות העולם</h1>
        <p className="page-description">גלו את המדינות והיעדים שמחכים לכם</p>
      </header>

      <section aria-labelledby="world-heading" className="world-section">
        <svg
          aria-labelledby="globe-title globe-description"
          className="world-globe"
          role="img"
          viewBox="0 0 240 240"
        >
          <title id="globe-title">איור כדור הארץ</title>
          <desc id="globe-description">
            כדור ארץ כחול עם איורים של היבשות
          </desc>
          <circle cx="120" cy="120" r="104" fill="#e7f3fb" />
          <circle
            cx="120"
            cy="120"
            r="92"
            fill="#7db9df"
            stroke="#1769aa"
            strokeWidth="3"
          />
          <path
            d="M66 54 88 47 103 58 99 72 112 78 106 93 91 94 83 108 69 102 62 87 49 82 53 67Z"
            fill="#f7fbfd"
          />
          <path
            d="m99 107 17 4 9 16-8 13-3 20-12 18-9-13 3-18-9-14 3-16Z"
            fill="#f7fbfd"
          />
          <path
            d="m113 55 18-10 21 5 7 11 19 3 12 13-8 12-15 1-9 12-17-2-8-12-17-1-8-13Z"
            fill="#f7fbfd"
          />
          <path
            d="m139 104 18-7 18 9 7 18-10 20-14 9-11-8-2-18-11-9Z"
            fill="#f7fbfd"
          />
          <path
            d="M47 125a74 74 0 0 0 116 59 92 92 0 0 1-116-59Z"
            fill="#5ca7d2"
            opacity=".55"
          />
          <path
            d="M120 28a92 92 0 0 1 0 184M28 120h184M47 74a145 145 0 0 0 146 0M47 166a145 145 0 0 1 146 0"
            fill="none"
            stroke="#fff"
            strokeOpacity=".62"
            strokeWidth="2"
          />
        </svg>
        <h2 id="world-heading">סביב העולם</h2>
        <p>בחרו מדינה וגלו מה מחכה לכם בה</p>
        <button className="world-button" onClick={scrollToCountries} type="button">
          לחצו למידע אודות כלל המדינות
        </button>
      </section>

      <CountriesStatus
        error={error}
        isLoading={isLoading}
        onRetry={onRetry}
      />
      {!isLoading && !error && (
        <section
          className="countries-section"
          id="countries"
          aria-labelledby="countries-heading"
        >
          <header className="countries-heading">
            <h2 id="countries-heading">כל מדינות העולם</h2>
            <p>חפשו מדינה או סננו לפי יבשת</p>
          </header>

          <div className="country-filters">
            <label className="country-search">
              <span>חיפוש מדינה</span>
              <input
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="לדוגמה, Greece"
                type="search"
                value={searchTerm}
              />
            </label>

            <label className="region-filter">
              <span>יבשת</span>
              <select
                onChange={(event) => setSelectedRegion(event.target.value)}
                value={selectedRegion}
              >
                <option value="">כל היבשות</option>
                {availableRegions.map((region) => (
                  <option key={region} value={region}>
                    {REGION_LABELS[region] ?? region}
                  </option>
                ))}
              </select>
            </label>

            <button
              aria-pressed={onlyRecommended}
              className={`recommendations-filter${onlyRecommended ? ' is-active' : ''}`}
              onClick={() => setOnlyRecommended((enabled) => !enabled)}
              type="button"
            >
              רק עם המלצות
            </button>
          </div>

          {visibleCountries.length === 0 ? (
            <p className="empty-countries" role="status">
              לא נמצאו מדינות מתאימות. נסו לשנות את החיפוש או את הסינון.
            </p>
          ) : (
            <div className="country-grid" aria-label="רשימת מדינות">
              {visibleCountries.map((country) => (
                <Link
                  className="country-card"
                  key={country.cca3}
                  to={`/countries/${country.cca3}`}
                >
                  <img
                    alt={`דגל ${country.name}`}
                    className="country-flag"
                    height="48"
                    loading="lazy"
                    src={country.flagUrl}
                    width="64"
                  />
                  <h3>{country.name}</h3>
                  {recommendedCountryCodes.has(country.cca3) && (
                    <span aria-label="יש המלצות אישיות" className="country-star">
                      ⭐
                    </span>
                  )}
                </Link>
              ))}
            </div>
          )}
        </section>
      )}
    </main>
  )
}

function CountryPage({
  countries,
  isLoading,
  error,
  onRetry,
}: {
  countries: Country[]
  isLoading: boolean
  error: string | null
  onRetry: () => void
}) {
  const { code } = useParams()
  const country = countries.find((item) => item.cca3 === code)

  if (isLoading || error) {
    return (
      <main className="simple-page" dir="rtl">
        <CountriesStatus
          error={error}
          isLoading={isLoading}
          onRetry={onRetry}
        />
      </main>
    )
  }

  return (
    <main className="simple-page" dir="rtl">
      <h1>{country ? country.name : 'מדינה לא נמצאה'}</h1>
      {country && (
        <p className="country-area">
          שטח: {new Intl.NumberFormat('he-IL').format(country.area)} קמ״ר
        </p>
      )}
    </main>
  )
}

function SimplePage({ title }: { title: string }) {
  return (
    <main className="simple-page" dir="rtl">
      <h1>{title}</h1>
    </main>
  )
}

function App() {
  const [countries, setCountries] = useState<Country[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    async function loadCountries() {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch(COUNTRIES_API_URL, {
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error(`שגיאת שרת (${response.status})`)
        }

        const responseData: unknown = await response.json()
        setCountries(mapCountries(responseData))
      } catch (caughtError) {
        if (controller.signal.aborted) {
          return
        }

        setError(
          caughtError instanceof Error
            ? caughtError.message
            : 'אירעה שגיאה לא צפויה בטעינת המדינות.',
        )
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false)
        }
      }
    }

    void loadCountries()
    return () => controller.abort()
  }, [retryCount])

  const retry = () => setRetryCount((count) => count + 1)

  return (
    <>
      <Header />
      <Routes>
        <Route
          path="/"
          element={
            <HomePage
              countries={countries}
              error={error}
              isLoading={isLoading}
              onRetry={retry}
            />
          }
        />
        <Route
          path="/countries/:code"
          element={
            <CountryPage
              countries={countries}
              error={error}
              isLoading={isLoading}
              onRetry={retry}
            />
          }
        />
        <Route
          path="/recommendations"
          element={<SimplePage title="המלצות מאחת שיודעת" />}
        />
        <Route path="/about" element={<SimplePage title="אודות הפרויקט" />} />
        <Route path="/gallery" element={<SimplePage title="תמונות" />} />
      </Routes>
    </>
  )
}

export default App
