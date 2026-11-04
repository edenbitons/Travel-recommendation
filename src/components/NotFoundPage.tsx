import { Link } from 'react-router-dom'

function NotFoundPage() {
  return (
    <main className="simple-page not-found-page" dir="rtl">
      <p className="not-found-code">404</p>
      <h1>העמוד לא נמצא</h1>
      <p className="page-description">
        נראה שהגעתם ליעד שעוד לא ביקרתי בו.
      </p>
      <Link className="not-found-link" to="/">
        חזרה לדף הבית
      </Link>
    </main>
  )
}

export default NotFoundPage
