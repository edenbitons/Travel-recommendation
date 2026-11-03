import { Link, Route, Routes, useParams } from 'react-router-dom'
import countries from './data/countries.json'
import type { Country } from './types'
import Header from './components/Header'
import './App.css'

const exampleCountries: Country[] = countries

function HomePage() {
  return (
    <main className="countries-page" dir="rtl">
      <header className="page-heading">
        <p className="eyebrow">Been There, Done That</p>
        <h1>מדינות לדוגמה</h1>
        <p className="page-description">כמה מהיעדים שמחכים לך באתר</p>
      </header>

      <section
        className="country-grid"
        id="countries"
        aria-label="רשימת מדינות"
      >
        {exampleCountries.map((country) => (
          <Link
            className="country-card"
            key={country.cca3}
            to={`/countries/${country.cca3}`}
          >
            <span className="country-flag" aria-hidden="true">
              {country.flag}
            </span>
            <h2>{country.name}</h2>
          </Link>
        ))}
      </section>
    </main>
  )
}

function CountryPage() {
  const { code } = useParams()
  const country = exampleCountries.find((item) => item.cca3 === code)

  return (
    <main className="simple-page" dir="rtl">
      <h1>{country ? country.name : 'פרטי מדינה'}</h1>
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
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/countries/:code" element={<CountryPage />} />
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
