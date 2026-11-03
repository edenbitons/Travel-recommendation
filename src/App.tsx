import { useEffect, useMemo, useState } from 'react'
import { Link, Route, Routes, useParams } from 'react-router-dom'
import type { Country } from './types'
import { mapCountries } from './utils/countries'
import {
  CATEGORY_LABELS,
  countryIntros,
  destinations,
  type Category,
} from './data/recommendations'
import {
  filterByCategory,
  getEnrichedRecommendations,
  getMapsUrl,
  getRecommendationsByCountry,
  sortRecommendations,
  type EnrichedRecommendation,
} from './utils/recommendations'
import { photos } from './data/photos'
import {
  excludeCountries,
  filterCountriesByRegion,
  filterCountriesWithRecommendations,
  searchCountriesByName,
  sortCountriesByName,
} from './utils/countryFilters'
import Header from './components/Header'
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

const RECOMMENDATION_CATEGORIES = Object.keys(CATEGORY_LABELS) as Category[]

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

function RecommendationCard({
  item,
}: {
  item: EnrichedRecommendation
}) {
  const { recommendation, destination, country } = item

  return (
    <article className="recommendation-card">
      <h3>{recommendation.name}</h3>
      <dl className="recommendation-details">
        <div>
          <dt>יעד</dt>
          <dd>{destination.name}</dd>
        </div>
        <div>
          <dt>מדינה</dt>
          <dd>{country?.name ?? destination.countryCode}</dd>
        </div>
        <div>
          <dt>קטגוריה</dt>
          <dd>{CATEGORY_LABELS[recommendation.category]}</dd>
        </div>
        <div>
          <dt>דירוג גוגל</dt>
          <dd>⭐ {recommendation.googleRating}</dd>
        </div>
      </dl>
      {recommendation.mustGo && (
        <span className="must-go-label">חובה</span>
      )}
      {recommendation.note && (
        <p className="recommendation-note">{recommendation.note}</p>
      )}
      <a
        className="maps-link"
        href={getMapsUrl(recommendation.name, destination.nameEn)}
        rel="noreferrer"
        target="_blank"
      >
        פתחי בגוגל מפס
      </a>
    </article>
  )
}

function TravelPhotoCard({
  photo,
}: {
  photo: (typeof photos)[number]
}) {
  return (
    <figure className="travel-photo-card">
      <div
        aria-label={`${photo.title}, ${photo.location}`}
        className="travel-photo-placeholder"
        role="img"
        style={{ background: photo.background }}
      >
        <span aria-hidden="true">✦</span>
      </div>
      <figcaption>
        <strong>{photo.title}</strong>
        <span>{photo.location}</span>
      </figcaption>
    </figure>
  )
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
  const featuredRecommendations = useMemo(() => {
    const enrichedRecommendations = getEnrichedRecommendations(countries)
    const topRecommendations = sortRecommendations(
      enrichedRecommendations.map(({ recommendation }) => recommendation),
    ).slice(0, 4)

    return topRecommendations.flatMap((recommendation) => {
      const enriched = enrichedRecommendations.find(
        (item) => item.recommendation.id === recommendation.id,
      )
      return enriched ? [enriched] : []
    })
  }, [countries])

  const scrollToCountries = () => {
    document.getElementById('countries')?.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'auto'
        : 'smooth',
    })
  }

  return (
    <main className="countries-page" dir="rtl">
      <section aria-labelledby="home-title" className="home-hero">
        <svg
          aria-labelledby="travel-logo-title"
          className="travel-logo"
          role="img"
          viewBox="0 0 240 210"
        >
          <title id="travel-logo-title">כדור ארץ עם מסלול טיסה</title>
          <defs>
            <linearGradient id="globe-gradient" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0%" stopColor="#78c5e8" />
              <stop offset="100%" stopColor="#1769aa" />
            </linearGradient>
          </defs>
          <circle
            cx="120"
            cy="112"
            r="61"
            fill="url(#globe-gradient)"
            stroke="#124f7d"
            strokeWidth="3"
          />
          <path
            d="M92 65 108 70 114 82 106 91 94 88 86 99 72 92 70 79ZM122 62 142 67 152 81 145 91 131 88 123 99 112 89ZM116 103 132 98 144 106 140 119 148 132 135 151 126 165 117 151 119 135 108 124Z"
            fill="#f3fbff"
            opacity=".95"
          />
          <path
            d="M27 105C44 30 157 19 203 77c18 23 9 54-7 77"
            fill="none"
            stroke="#1769aa"
            strokeDasharray="5 8"
            strokeLinecap="round"
            strokeWidth="3"
          />
          <path
            d="m187 147 16 8-11 13-1-8-8-3Z"
            fill="#1769aa"
            transform="rotate(-25 190 158)"
          />
          <path
            d="m188 149 18-21-3 15 13 7-25 3-9 12Z"
            fill="#f08b45"
            stroke="#fff"
            strokeLinejoin="round"
            strokeWidth="2"
          />
          <circle cx="120" cy="112" r="73" fill="none" stroke="#d4eaf6" strokeWidth="2" />
        </svg>
        <h1 id="home-title">Been There, Done That</h1>
        <p className="home-tagline">המלצות זהב מאחת שהייתה שם</p>
        <p className="home-intro">
          היי, אני עדן, ואני אוהבת לגלות מקומות חדשים ולשמור את כל הפינות
          המיוחדות שמצאתי בדרך. כאן ריכזתי המלצות אישיות מהטיולים שלי.
        </p>
      </section>

      <section aria-label="תמונות מהטיולים" className="photo-strip">
        <div className="photo-strip-track">
          {[...photos, ...photos].map((photo, index) => (
            <div
              aria-hidden={index >= photos.length}
              className="photo-strip-item"
              key={`${photo.id}-${index}`}
            >
              <TravelPhotoCard photo={photo} />
            </div>
          ))}
        </div>
      </section>

      <header className="page-heading">
        <p className="eyebrow">סביב העולם</p>
        <h2 className="countries-page-title">מדינות העולם</h2>
        <p className="page-description">גלו את המדינות והיעדים שמחכים לכם</p>
      </header>

      <section
        aria-labelledby="featured-recommendations-heading"
        className="featured-recommendations"
      >
        <header className="featured-recommendations-heading">
          <div>
            <h2 id="featured-recommendations-heading">
              המלצות מאחת שיודעת
            </h2>
            <p>המקומות שכדאי להכיר</p>
          </div>
          <Link className="all-recommendations-link" to="/recommendations">
            לכל ההמלצות
          </Link>
        </header>
        <div className="recommendation-list">
          {featuredRecommendations.map((item) => (
            <RecommendationCard
              item={item}
              key={item.recommendation.id}
            />
          ))}
        </div>
      </section>

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

  const countryRecommendations = country
    ? getRecommendationsByCountry(country.cca3)
    : []
  const countryIntro = countryIntros[country?.cca3 ?? '']?.trim()

  return (
    <main className="simple-page" dir="rtl">
      {!country ? (
        <h1>מדינה לא נמצאה</h1>
      ) : (
        <>
          <section aria-labelledby="country-title" className="country-details">
            <img
              alt={`דגל ${country.name}`}
              className="country-detail-flag"
              height="120"
              src={country.flagUrl}
              width="180"
            />
            <h1 id="country-title">{country.name}</h1>
            <dl className="country-facts">
              <div>
                <dt>בירה</dt>
                <dd>{country.capital.length > 0 ? country.capital.join(', ') : 'לא ידועה'}</dd>
              </div>
              <div>
                <dt>מטבע</dt>
                <dd>{country.currencies.length > 0 ? country.currencies.join(', ') : 'לא ידוע'}</dd>
              </div>
              <div>
                <dt>שפה</dt>
                <dd>{country.languages.length > 0 ? country.languages.join(', ') : 'לא ידועה'}</dd>
              </div>
              <div>
                <dt>שטח</dt>
                <dd>{new Intl.NumberFormat('he-IL').format(country.area)} קמ״ר</dd>
              </div>
              <div>
                <dt>יבשת</dt>
                <dd>{REGION_LABELS[country.region] ?? country.region}</dd>
              </div>
            </dl>
          </section>

          <section
            aria-labelledby="recommendations-title"
            className="country-recommendations"
          >
            <h2 id="recommendations-title">המלצות מאחת שיודעת</h2>
            {countryIntro && <p className="country-intro">{countryIntro}</p>}

            {countryRecommendations.length === 0 ? (
              <p className="no-country-recommendations">עוד לא הייתי כאן ✈️</p>
            ) : (
              <div className="destination-list">
                {countryRecommendations.map(({ destination, recommendations }) => (
                  <section
                    aria-labelledby={`destination-${destination.id}`}
                    className="destination-group"
                    key={destination.id}
                  >
                    <h3 id={`destination-${destination.id}`}>
                      {destination.name}
                    </h3>
                    <div className="recommendation-list">
                      {recommendations.map((recommendation) => (
                        <article
                          className="recommendation-card"
                          key={recommendation.id}
                        >
                          <h4>{recommendation.name}</h4>
                          <p className="recommendation-meta">
                            <span>
                              {CATEGORY_LABELS[recommendation.category]}
                            </span>
                            <span aria-label={`דירוג גוגל ${recommendation.googleRating} מתוך 5`}>
                              ⭐ {recommendation.googleRating}
                            </span>
                            {recommendation.mustGo && (
                              <span className="must-go-label">חובה</span>
                            )}
                          </p>
                          {recommendation.note && (
                            <p className="recommendation-note">
                              {recommendation.note}
                            </p>
                          )}
                          <a
                            className="maps-link"
                            href={getMapsUrl(
                              recommendation.name,
                              destination.nameEn,
                            )}
                            rel="noreferrer"
                            target="_blank"
                          >
                            פתחי בגוגל מפס
                          </a>
                        </article>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            )}
          </section>
        </>
      )}
      <Link className="back-to-countries" to="/#countries">
        חזרה לכל המדינות
      </Link>
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

function RecommendationsPage({ countries }: { countries: Country[] }) {
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>(
    'all',
  )
  const enrichedRecommendations = useMemo(
    () => getEnrichedRecommendations(countries),
    [countries],
  )
  const visibleRecommendations = useMemo(() => {
    const filtered = filterByCategory(
      enrichedRecommendations.map(({ recommendation }) => recommendation),
      selectedCategory,
    )
    const sorted = sortRecommendations(filtered)

    return sorted.flatMap((recommendation) => {
      const enriched = enrichedRecommendations.find(
        (item) => item.recommendation.id === recommendation.id,
      )
      return enriched ? [enriched] : []
    })
  }, [enrichedRecommendations, selectedCategory])

  return (
    <main className="simple-page recommendations-page" dir="rtl">
      <header className="page-heading">
        <p className="eyebrow">Been There, Done That</p>
        <h1>המלצות מאחת שיודעת</h1>
        <p className="page-description">
          המקומות שאהבתי, עם דירוגים וטיפים אישיים
        </p>
      </header>

      <div aria-label="סינון לפי קטגוריה" className="category-filters">
        <button
          aria-pressed={selectedCategory === 'all'}
          className={selectedCategory === 'all' ? 'is-active' : ''}
          onClick={() => setSelectedCategory('all')}
          type="button"
        >
          הכל
        </button>
        {RECOMMENDATION_CATEGORIES.map((category) => (
          <button
            aria-pressed={selectedCategory === category}
            className={selectedCategory === category ? 'is-active' : ''}
            key={category}
            onClick={() => setSelectedCategory(category)}
            type="button"
          >
            {CATEGORY_LABELS[category]}
          </button>
        ))}
      </div>

      <p className="recommendation-count" aria-live="polite">
        {visibleRecommendations.length} המלצות
      </p>
      <div className="recommendation-list">
        {visibleRecommendations.map((item) => (
          <RecommendationCard
            item={item}
            key={item.recommendation.id}
          />
        ))}
      </div>
    </main>
  )
}

function GalleryPage() {
  return (
    <main className="simple-page gallery-page" dir="rtl">
      <header className="page-heading">
        <p className="eyebrow">Been There, Done That</p>
        <h1>תמונות מהדרך</h1>
        <p className="page-description">רגעים ומקומות מהטיולים שלי</p>
      </header>
      <div className="gallery-grid">
        {photos.map((photo) => (
          <TravelPhotoCard key={photo.id} photo={photo} />
        ))}
      </div>
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
          element={<RecommendationsPage countries={countries} />}
        />
        <Route path="/about" element={<SimplePage title="אודות הפרויקט" />} />
        <Route path="/gallery" element={<GalleryPage />} />
      </Routes>
    </>
  )
}

export default App
