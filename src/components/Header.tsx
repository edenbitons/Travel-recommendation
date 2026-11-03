import { useState } from 'react'
import { Link } from 'react-router-dom'
import './Header.css'

const menuItems = [
  { label: 'בית', to: '/' },
  { label: 'המלצות מאחת שיודעת', to: '/recommendations' },
  { label: 'תמונות', to: '/gallery' },
  { label: 'אודות הפרויקט', to: '/about' },
]

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="site-header" dir="rtl">
      <div className="header-bar">
        <span className="header-blessing">בס״ד</span>
        <button
          aria-controls="site-menu"
          aria-expanded={isMenuOpen}
          aria-label={isMenuOpen ? 'סגירת תפריט' : 'פתיחת תפריט'}
          className="menu-toggle"
          onClick={() => setIsMenuOpen((isOpen) => !isOpen)}
          type="button"
        >
          ☰
        </button>
      </div>
      {isMenuOpen && (
        <nav aria-label="תפריט ראשי" className="site-menu" id="site-menu">
          {menuItems.map((item) => (
            <Link
              key={item.to}
              onClick={() => setIsMenuOpen(false)}
              to={item.to}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  )
}

export default Header
