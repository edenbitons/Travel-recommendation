import countries from './data/countries.json'
import type { Country } from './types'
import './App.css'

const exampleCountries: Country[] = countries

function App() {
  return (
    <main className="countries-page" dir="rtl">
      <header className="page-heading">
        <p className="eyebrow">Been There, Done That</p>
        <h1>מדינות לדוגמה</h1>
        <p className="page-description">
          כמה מהיעדים שמחכים לך באתר
        </p>
      </header>

      <section className="country-grid" aria-label="רשימת מדינות">
        {exampleCountries.map((country) => (
          <article className="country-card" key={country.cca3}>
            <span className="country-flag" aria-hidden="true">
              {country.flag}
            </span>
            <h2>{country.name}</h2>
          </article>
        ))}
      </section>
    </main>
  )
}

export default App
