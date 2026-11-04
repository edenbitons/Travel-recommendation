import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, Route, Routes, useParams } from 'react-router-dom'
import type { Country } from './types'
import { mapCountries } from './utils/countries'
import {
  CATEGORY_LABELS,
  countryIntros,
  destinationGroups,
  destinations,
  recommendations,
  type Category,
  type Destination,
  type DestinationGroup,
} from './data/recommendations'
import {
  filterByCategory,
  getDestinationById,
  getEnrichedRecommendations,
  getMapsUrl,
  getRecommendationStats,
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
import FavoriteButton from './components/FavoriteButton'
import FavoritesProvider from './components/FavoritesProvider'
import NotFoundPage from './components/NotFoundPage'
import { useFavorites } from './components/useFavorites'
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
const recommendationDestinationIds = new Set(
  recommendations.map((recommendation) => recommendation.destinationId),
)
const destinationsWithRecommendations = destinations.filter(
  (destination) =>
    recommendationDestinationIds.has(destination.id) ||
    Boolean(destination.intro?.trim()) ||
    Boolean(destination.photos?.length),
)
const destinationGroupsByChildId = new Map(
  destinationGroups.flatMap((group) =>
    group.destinationIds.map((id) => [id, group] as const),
  ),
)
const destinationNavigationItems = destinations.reduce<
  (Destination | DestinationGroup)[]
>((items, destination) => {
  const group = destinationGroupsByChildId.get(destination.id)
  if (group) {
    if (!items.some((item) => item.id === group.id)) {
      items.push(group)
    }
  } else {
    items.push(destination)
  }
  return items
}, [])

function isDestinationGroup(
  item: Destination | DestinationGroup,
): item is DestinationGroup {
  return 'destinationIds' in item
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

function RecommendationCard({
  item,
}: {
  item: EnrichedRecommendation
}) {
  const { recommendation, destination, country } = item

  return (
    <article className="recommendation-card">
      <div className="recommendation-card-top">
        <h3>{recommendation.name}</h3>
        <FavoriteButton id={recommendation.id} name={recommendation.name} />
      </div>
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
        {recommendation.googleRating !== undefined && (
          <div>
            <dt>דירוג גוגל</dt>
            <dd>⭐ {recommendation.googleRating}</dd>
          </div>
        )}
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
      {photo.type === 'image' ? (
        <img
          alt={photo.title}
          className="travel-photo-media"
          loading="lazy"
          src={photo.src}
          style={{ backgroundColor: photo.background }}
        />
      ) : (
        <video
          aria-label={photo.title}
          autoPlay
          className="travel-photo-media"
          loop
          muted
          playsInline
          src={photo.src}
          style={{ backgroundColor: photo.background }}
        />
      )}
      <figcaption>
        <strong>{photo.title}</strong>
        <span>{photo.location}</span>
      </figcaption>
    </figure>
  )
}

const homeIntroduction = [
  'אם אתם מתכננים טיול ונמאס לכם לחפש המלצות כל היום – הגעתם למקום הנכון.',
  'אני עדן, אחרי עשר שנים של שירות אינטנסיבי, יצאתי לשנתיים של חופש.',
  'הבטחתי לעצמי שבשנתיים האלה אנצל כל רגע ואבקר בכל מקום שחלמתי להיות בו.',
  'רציתי שכל טיול יהיה מושלם, שלא אפספס אף מסעדה שווה ואף אטרקציה –',
  'אז חקרתי וחקרתי וגיליתי שהרבה המלצות לא רלוונטיות וישנות, ושאני פשוט מבזבזת על זה שעות.',
  'אז אני כאן כדי לגלות לכם את ההמלצות הכי שוות לטיול הבא שלכם!',
]

// מדינות לדוגמה מתחת לחיפוש: שלוש שעוד לא הייתי בהן ושתיים שהייתי
const SAMPLE_COUNTRY_CODES = ['JPN', 'ITA', 'BRA', 'GRC', 'THA']

const GLOBE_TURN = 184

function InteractiveGlobe() {
  const landRef = useRef<SVGGElement>(null)

  useEffect(() => {
    const land = landRef.current
    const svg = land?.ownerSVGElement
    if (!land || !svg) {
      return
    }

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches
    const autoSpeed = prefersReducedMotion ? 0 : 0.012
    let offset = 0
    let velocity = autoSpeed
    let isDragging = false
    let lastX = 0
    let lastTime = performance.now()
    let frame = 0

    const tick = (now: number) => {
      const elapsed = now - lastTime
      lastTime = now
      if (!isDragging) {
        velocity += (autoSpeed - velocity) * Math.min(1, elapsed / 900)
        offset += velocity * elapsed
      }
      offset = ((offset % GLOBE_TURN) + GLOBE_TURN) % GLOBE_TURN
      land.setAttribute('transform', `translate(${offset} -4)`)
      frame = requestAnimationFrame(tick)
    }

    const onPointerDown = (event: PointerEvent) => {
      isDragging = true
      lastX = event.clientX
      svg.setPointerCapture(event.pointerId)
      svg.classList.add('is-dragging')
    }

    const onPointerMove = (event: PointerEvent) => {
      if (!isDragging) {
        return
      }
      const scale = 240 / svg.getBoundingClientRect().width
      const distance = (event.clientX - lastX) * scale
      offset += distance
      velocity = distance / 16
      lastX = event.clientX
    }

    const onPointerUp = () => {
      isDragging = false
      svg.classList.remove('is-dragging')
    }

    svg.addEventListener('pointerdown', onPointerDown)
    svg.addEventListener('pointermove', onPointerMove)
    svg.addEventListener('pointerup', onPointerUp)
    svg.addEventListener('pointercancel', onPointerUp)
    frame = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(frame)
      svg.removeEventListener('pointerdown', onPointerDown)
      svg.removeEventListener('pointermove', onPointerMove)
      svg.removeEventListener('pointerup', onPointerUp)
      svg.removeEventListener('pointercancel', onPointerUp)
    }
  }, [])

  return (
    <svg
      aria-labelledby="globe-title globe-description"
      className="world-globe"
      role="img"
      viewBox="0 0 240 240"
    >
      <title id="globe-title">כדור הארץ</title>
      <desc id="globe-description">
        כדור ארץ מסתובב. אפשר לגרור אותו כדי לסובב אותו.
      </desc>
      <defs>
        <radialGradient id="globe-glow" cx="50%" cy="50%" r="50%">
          <stop offset="78%" stopColor="#8fa6b8" stopOpacity=".35" />
          <stop offset="100%" stopColor="#8fa6b8" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="globe-ocean" cx="36%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#a9bccb" />
          <stop offset="45%" stopColor="#6a8499" />
          <stop offset="100%" stopColor="#34495c" />
        </radialGradient>
        <radialGradient id="globe-shade" cx="50%" cy="50%" r="50%">
          <stop offset="55%" stopColor="#1f2a36" stopOpacity="0" />
          <stop offset="100%" stopColor="#1f2a36" stopOpacity=".45" />
        </radialGradient>
        <radialGradient id="globe-shine" cx="34%" cy="26%" r="40%">
          <stop offset="0%" stopColor="#fff" stopOpacity=".4" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <clipPath id="globe-clip">
          <circle cx="120" cy="116" r="92" />
        </clipPath>
      </defs>
      <ellipse cx="120" cy="228" rx="70" ry="7" fill="#34495c" opacity=".18" />
      <circle cx="120" cy="116" r="108" fill="url(#globe-glow)" />
      <circle cx="120" cy="116" r="92" fill="url(#globe-ocean)" />
      <g clipPath="url(#globe-clip)">
        <g ref={landRef} transform="translate(0 -4)">
          <g opacity=".95">
            <path
              d="M66 54 88 47 103 58 99 72 112 78 106 93 91 94 83 108 69 102 62 87 49 82 53 67Z"
              fill="#efe8da"
            />
            <path
              d="m99 107 17 4 9 16-8 13-3 20-12 18-9-13 3-18-9-14 3-16Z"
              fill="#efe8da"
            />
            <path
              d="m113 55 18-10 21 5 7 11 19 3 12 13-8 12-15 1-9 12-17-2-8-12-17-1-8-13Z"
              fill="#efe8da"
            />
            <path
              d="m139 104 18-7 18 9 7 18-10 20-14 9-11-8-2-18-11-9Z"
              fill="#efe8da"
            />
          </g>
          <g opacity=".95" transform="translate(-184 0)">
            <path
              d="M66 54 88 47 103 58 99 72 112 78 106 93 91 94 83 108 69 102 62 87 49 82 53 67Z"
              fill="#efe8da"
            />
            <path
              d="m99 107 17 4 9 16-8 13-3 20-12 18-9-13 3-18-9-14 3-16Z"
              fill="#efe8da"
            />
            <path
              d="m113 55 18-10 21 5 7 11 19 3 12 13-8 12-15 1-9 12-17-2-8-12-17-1-8-13Z"
              fill="#efe8da"
            />
            <path
              d="m139 104 18-7 18 9 7 18-10 20-14 9-11-8-2-18-11-9Z"
              fill="#efe8da"
            />
          </g>
        </g>
        <circle cx="120" cy="116" r="92" fill="url(#globe-shade)" />
        <circle cx="120" cy="116" r="92" fill="url(#globe-shine)" />
      </g>
    </svg>
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
    () =>
      new Set(
        destinationsWithRecommendations.map(
          (destination) => destination.countryCode,
        ),
      ),
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
      ? filterCountriesWithRecommendations(
          matchingRegion,
          destinationsWithRecommendations,
        )
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

  const sampleCountries = useMemo(
    () =>
      SAMPLE_COUNTRY_CODES.flatMap((code) => {
        const country = countries.find((item) => item.cca3 === code)
        return country ? [country] : []
      }),
    [countries],
  )

  const renderCountryCard = (country: Country) => (
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
          ★
        </span>
      )}
    </Link>
  )

  const isSearching =
    searchTerm.trim() !== '' || selectedRegion !== '' || onlyRecommended

  return (
    <main className="countries-page" dir="rtl">
      <section aria-labelledby="home-title" className="home-hero">
        <h1 id="home-title">Been There | Done That</h1>
        <p className="home-tagline">המלצות מאחת שיודעת</p>
      </section>

      <section aria-label="קצת עליי" className="home-about">
        <p className="home-intro">
          {homeIntroduction.map((sentence) => (
            <span key={sentence}>{sentence}</span>
          ))}
        </p>
      </section>

      <section aria-labelledby="photos-heading" className="home-photos">
          <svg
            aria-labelledby="travel-logo-title"
            className="travel-logo"
            role="img"
            viewBox="0 0 240 210"
          >
            <title id="travel-logo-title">כדור ארץ עם מסלול טיסה</title>
            <defs>
              <linearGradient id="globe-gradient" x1="0" x2="1" y1="0" y2="1">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#ffffff" />
              </linearGradient>
            </defs>
            <circle
              cx="120"
              cy="112"
              r="61"
              fill="url(#globe-gradient)"
              stroke="#111318"
              strokeWidth="3"
            />
            <path
              d="M92 65 108 70 114 82 106 91 94 88 86 99 72 92 70 79ZM122 62 142 67 152 81 145 91 131 88 123 99 112 89ZM116 103 132 98 144 106 140 119 148 132 135 151 126 165 117 151 119 135 108 124Z"
              fill="#111318"
              opacity=".95"
            />
            <path
              d="M27 105C44 30 157 19 203 77c18 23 9 54-7 77"
              fill="none"
              stroke="#111318"
              strokeDasharray="5 8"
              strokeLinecap="round"
              strokeWidth="3"
            />
            <path
              d="m187 147 16 8-11 13-1-8-8-3Z"
              fill="#111318"
              transform="rotate(-25 190 158)"
            />
            <path
              d="m188 149 18-21-3 15 13 7-25 3-9 12Z"
              fill="#111318"
              stroke="#fff"
              strokeLinejoin="round"
              strokeWidth="2"
            />
            <circle cx="120" cy="112" r="73" fill="none" stroke="#c9cbd0" strokeWidth="2" />
          </svg>
        <h2 className="section-title is-wide" id="photos-heading">
          Around the world with me
        </h2>

      <section aria-label="תמונות מהטיולים" className="photo-strip">
        <div
          className="photo-strip-track"
          style={{ animationDuration: `${photos.length * 4}s` }}
        >
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
      </section>

      <section
        aria-labelledby="featured-recommendations-heading"
        className="featured-recommendations"
      >
        <h2 className="section-title" id="featured-recommendations-heading">
          היעדים וההמלצות
        </h2>
        <p aria-label="היעדים שלנו" className="destination-strip" dir="rtl">
          {destinationNavigationItems.map((item, index) => {
            const itemPlaces = isDestinationGroup(item)
              ? item.destinationIds.flatMap((id) => {
                  const destination = destinations.find(
                    (entry) => entry.id === id,
                  )
                  return destination ? [destination.name] : []
                })
              : item.places

            return (
              <span className="destination-strip-item" key={item.id}>
                {index > 0 && <span aria-hidden="true">•</span>}
                <Link to={`/destinations/${item.id}`}>
                  {item.name}
                  {itemPlaces && itemPlaces.length > 0 && (
                    <> [{itemPlaces.join(', ')}]</>
                  )}
                </Link>
              </span>
            )
          })}
        </p>
        <div className="recommendation-list">
          {featuredRecommendations.map((item) => (
            <RecommendationCard
              item={item}
              key={item.recommendation.id}
            />
          ))}
        </div>
        <Link className="all-recommendations-link" to="/recommendations">
          לכל ההמלצות
        </Link>
      </section>

      <div className="world-band">
      <section aria-labelledby="world-heading" className="world-section">
        <InteractiveGlobe />
        <h2 className="section-title" id="world-heading">
          סביב העולם
        </h2>
        <p>גררו את הכדור כדי לסובב אותו, וכתבו שם של מדינה בחיפוש</p>
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
          aria-label="חיפוש מדינות"
        >

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

          {!isSearching ? (
            <>
              <p className="countries-hint">
                הקלידו שם של מדינה, בחרו יבשת או לחצו על "רק עם המלצות". ★ = מדינה שהייתי בה
              </p>
              <div className="country-grid" aria-label="מדינות לדוגמה">
                {sampleCountries.map(renderCountryCard)}
              </div>
            </>
          ) : visibleCountries.length === 0 ? (
            <p className="empty-countries" role="status">
              לא נמצאו מדינות מתאימות. נסו לשנות את החיפוש או את הסינון.
            </p>
          ) : (
            <div className="country-grid" aria-label="רשימת מדינות">
              {visibleCountries.map(renderCountryCard)}
            </div>
          )}
        </section>
      )}
      </div>
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

  const countryDestinations = country
    ? destinations.filter(
        (destination) => destination.countryCode === country.cca3,
      )
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
            <p className="eyebrow">מהשטח, באהבה</p>
            <h2 id="recommendations-title">המלצות מאחת שיודעת</h2>
            {countryIntro && <p className="country-intro">{countryIntro}</p>}

            {countryDestinations.length === 0 ? (
              <p className="no-country-recommendations">עוד לא הייתי כאן ✈️</p>
            ) : (
              <div className="destination-list">
                {countryDestinations.map((destination) => {
                  const destinationRecommendations = recommendations.filter(
                    (recommendation) =>
                      recommendation.destinationId === destination.id,
                  )

                  return (
                    <section
                      aria-labelledby={`destination-${destination.id}`}
                      className="destination-group"
                      key={destination.id}
                    >
                      <h3 id={`destination-${destination.id}`}>
                        <Link to={`/destinations/${destination.id}`}>
                          {destination.name}
                        </Link>
                      </h3>
                      {destinationRecommendations.length > 0 && (
                        <div className="recommendation-list">
                          {destinationRecommendations.map((recommendation) => (
                            <article
                              className="recommendation-card"
                              key={recommendation.id}
                            >
                              <h4>{recommendation.name}</h4>
                              <p className="recommendation-meta">
                                <span>
                                  {CATEGORY_LABELS[recommendation.category]}
                                </span>
                                {recommendation.googleRating !== undefined && (
                                  <span aria-label={`דירוג גוגל ${recommendation.googleRating} מתוך 5`}>
                                    ⭐ {recommendation.googleRating}
                                  </span>
                                )}
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
                      )}
                    </section>
                  )
                })}
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

function DestinationPage({ countries }: { countries: Country[] }) {
  const { id } = useParams()
  const destinationEntry = getDestinationById(id ?? '')

  if (!destinationEntry) {
    return (
      <main className="simple-page destination-page" dir="rtl">
        <h1>יעד לא נמצא</h1>
        <Link className="back-to-countries" to="/">
          חזרה
        </Link>
      </main>
    )
  }

  const groupedDestination = isDestinationGroup(destinationEntry)
  const pageDestinations: Destination[] = groupedDestination
    ? destinations.filter((destination) =>
        destinationEntry.destinationIds.includes(destination.id),
      )
    : [destinationEntry]
  const countryCode = pageDestinations[0]?.countryCode
  const country = countries.find((item) => item.cca3 === countryCode)
  const photoIds = pageDestinations.flatMap(
    (destination) => destination.photos ?? [],
  )
  const destinationPhotos = Array.from(new Set(photoIds)).flatMap((photoId) => {
    const photo = photos.find((item) => item.id === photoId)
    return photo ? [photo] : []
  })
  const pageDestinationIds = new Set(
    pageDestinations.map((destination) => destination.id),
  )
  const pageRecommendations = getEnrichedRecommendations(countries).filter(
    (item) => pageDestinationIds.has(item.destination.id),
  )
  const recommendationsByDestination = pageDestinations.map((destination) => ({
    destination,
    recommendations: pageRecommendations.filter(
      (item) => item.destination.id === destination.id,
    ),
  }))

  return (
    <main className="simple-page destination-page" dir="rtl">
      <header className="page-heading destination-heading">
        <p className="eyebrow">היעד הבא שלך</p>
        <h1>{destinationEntry.name}</h1>
        <p className="page-description">
          {country?.name ?? countryCode}
        </p>
        {countryCode && (
          <Link
            className="destination-country-link"
            to={`/countries/${countryCode}`}
          >
            לעמוד המדינה {country?.name ?? countryCode}
          </Link>
        )}
      </header>

      {destinationEntry.intro?.trim() && (
        <p className="destination-intro">{destinationEntry.intro}</p>
      )}

      {destinationPhotos.length > 0 && (
        <section
          aria-label={`תמונות וסרטונים מ${destinationEntry.name}`}
          className="destination-media"
        >
          <p className="eyebrow">רגעים מהדרך</p>
          <div className="gallery-grid">
            {destinationPhotos.map((photo) => (
              <TravelPhotoCard key={photo.id} photo={photo} />
            ))}
          </div>
        </section>
      )}

      <section
        aria-labelledby="destination-recommendations-title"
        className="destination-recommendations"
      >
        <p className="eyebrow">מה כדאי לעשות</p>
        <h2 id="destination-recommendations-title">
          המלצות ב{destinationEntry.name}
        </h2>
        {pageRecommendations.length > 0 ? (
          groupedDestination ? (
            <div className="destination-list">
              {recommendationsByDestination.map(
                ({ destination, recommendations: destinationRecommendations }) =>
                  destinationRecommendations.length > 0 && (
                    <section
                      aria-labelledby={`group-destination-${destination.id}`}
                      className="destination-group"
                      key={destination.id}
                    >
                      <h3 id={`group-destination-${destination.id}`}>
                        <Link to={`/destinations/${destination.id}`}>
                          {destination.name}
                        </Link>
                      </h3>
                      <div className="recommendation-list">
                        {destinationRecommendations.map((item) => (
                          <RecommendationCard
                            item={item}
                            key={item.recommendation.id}
                          />
                        ))}
                      </div>
                    </section>
                  ),
              )}
            </div>
          ) : (
            <div className="recommendation-list">
              {pageRecommendations.map((item) => (
                <RecommendationCard
                  item={item}
                  key={item.recommendation.id}
                />
              ))}
            </div>
          )
        ) : (
          <p className="no-country-recommendations">
            ההמלצות ליעד הזה יתווספו בקרוב.
          </p>
        )}
      </section>

      {countryCode && (
        <Link className="back-to-countries" to={`/countries/${countryCode}`}>
          חזרה
        </Link>
      )}
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

function FavoritesPage({ countries }: { countries: Country[] }) {
  const { favorites } = useFavorites()
  const favoriteRecommendations = getEnrichedRecommendations(countries).filter(
    (item) => favorites.includes(item.recommendation.id),
  )

  return (
    <main className="simple-page favorites-page" dir="rtl">
      <header className="page-heading">
        <p className="eyebrow">Been There, Done That</p>
        <h1>המועדפים שלי</h1>
        <p className="page-description">
          ההמלצות ששמרתם עם ♡. הן נשמרות בדפדפן גם אחרי רענון.
        </p>
      </header>
      {favoriteRecommendations.length === 0 ? (
        <p className="empty-countries" role="status">
          עוד לא שמרתם מועדפים. לחצו על ♡ ליד המלצה כדי לשמור אותה.
        </p>
      ) : (
        <div className="recommendation-list">
          {favoriteRecommendations.map((item) => (
            <RecommendationCard item={item} key={item.recommendation.id} />
          ))}
        </div>
      )}
      <Link className="all-recommendations-link" to="/recommendations">
        לכל ההמלצות
      </Link>
    </main>
  )
}

function AboutPage() {
  const stats = getRecommendationStats()
  const maximumCategoryCount = Math.max(
    ...stats.categories.map((category) => category.count),
  )

  return (
    <main className="simple-page about-page" dir="rtl">
      <header className="page-heading">
        <p className="eyebrow">Been There, Done That</p>
        <h1>אודות הפרויקט</h1>
        <p className="page-description">
          המלצות זהב מאחת שהייתה שם
        </p>
      </header>

      <section aria-labelledby="about-purpose-heading" className="about-section">
        <p className="eyebrow">הסיפור</p>
        <h2 id="about-purpose-heading">מה האתר?</h2>
        <p>
          Been There, Done That מחבר בין מידע שימושי על מדינות לבין המלצות
          אישיות למקומות שביקרתי בהם — מסעדות, בתי קפה, מלונות, קניות ואטרקציות.
          לכל המלצה מצורפים דירוג Google Maps וטיפ אישי כשיש כזה.
        </p>
      </section>

      <section aria-labelledby="about-audience-heading" className="about-section">
        <p className="eyebrow">למי אנחנו כאן</p>
        <h2 id="about-audience-heading">למי האתר מיועד?</h2>
        <p>
          למטיילות ולמטיילים ישראלים שמתכננים טיול ורוצים למצוא במקום אחד גם
          פרטים בסיסיים על היעד וגם המלצות ממקור אישי, בגובה העיניים.
        </p>
      </section>

      <section aria-labelledby="about-tech-heading" className="about-section">
        <p className="eyebrow">מאחורי הקלעים</p>
        <h2 id="about-tech-heading">ממה הוא בנוי?</h2>
        <ul className="technology-list">
          <li>
            <strong>React, TypeScript ו-Vite</strong>
            <span>ממשק המשתמש, טיפוסים ובנייה מהירה.</span>
          </li>
          <li>
            <strong>React Router</strong>
            <span>ניווט בין דף הבית לעמודי המדינות והתוכן.</span>
          </li>
          <li>
            <strong>mledoze/countries דרך jsDelivr</strong>
            <span>נתוני מדינות, בירות, מטבעות, שפות, יבשות ושטחים.</span>
          </li>
          <li>
            <strong>FlagCDN</strong>
            <span>תמונות הדגלים, לפי קוד המדינה.</span>
          </li>
          <li>
            <strong>Vitest</strong>
            <span>בדיקות לפונקציות וללוגיקה של האפליקציה.</span>
          </li>
        </ul>
      </section>

      <section aria-labelledby="about-stats-heading" className="about-section">
        <p className="eyebrow">במספרים</p>
        <h2 id="about-stats-heading">המספרים שמאחורי ההמלצות</h2>
        <div className="stats-summary">
          <article className="stat-card">
            <strong>{stats.countriesWithRecommendations}</strong>
            <span>מדינות עם המלצות</span>
          </article>
          <article className="stat-card">
            <strong>{stats.destinationsCount}</strong>
            <span>יעדים</span>
          </article>
          <article className="stat-card">
            <strong>{stats.recommendationsCount}</strong>
            <span>המלצות</span>
          </article>
        </div>

        <h3 className="category-stats-heading">פילוח לפי קטגוריה</h3>
        <div className="category-stats">
          {stats.categories.map(({ category, label, count }) => {
            const percentage =
              stats.recommendationsCount === 0
                ? 0
                : (count / stats.recommendationsCount) * 100

            return (
              <div className="category-stat" key={category}>
                <div className="category-stat-label">
                  <span>{label}</span>
                  <span>{count}</span>
                </div>
                <div
                  aria-label={`${label}: ${count} המלצות`}
                  className="category-stat-track"
                  role="img"
                >
                  <span
                    className="category-stat-bar"
                    style={{
                      width: `${percentage}%`,
                      maxWidth:
                        maximumCategoryCount === 0
                          ? '0%'
                          : `${(count / maximumCategoryCount) * 100}%`,
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </section>
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
    <FavoritesProvider>
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
          path="/destinations/:id"
          element={<DestinationPage countries={countries} />}
        />
        <Route
          path="/recommendations"
          element={<RecommendationsPage countries={countries} />}
        />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route
          path="/favorites"
          element={<FavoritesPage countries={countries} />}
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </FavoritesProvider>
  )
}

export default App
