import { useEffect, useState } from 'react'
import { Link, Route, Routes, useParams } from 'react-router-dom'
import type { Country } from './types'
import { mapCountries } from './utils/countries'
import { sortCountriesByName } from './utils/countryFilters'
import Header from './components/Header'
import './App.css'

const COUNTRIES_API_URL =
  'https://cdn.jsdelivr.net/gh/mledoze/countries@master/countries.json'

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
  return (
    <main className="countries-page" dir="rtl">
      <header className="page-heading">
        <p className="eyebrow">Been There, Done That</p>
        <h1>מדינות העולם</h1>
        <p className="page-description">גלו את המדינות והיעדים שמחכים לכם</p>
      </header>

      <CountriesStatus
        error={error}
        isLoading={isLoading}
        onRetry={onRetry}
      />
      {!isLoading && !error && (
        <section
          className="country-grid"
          id="countries"
          aria-label="רשימת מדינות"
        >
          {sortCountriesByName(countries).map((country) => (
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
              <h2>{country.name}</h2>
            </Link>
          ))}
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
