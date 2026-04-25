import { useState } from 'react';
import './Navbar.css';

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="Navbar">
      <div className="navbar-inner">

        {/* Logo */}
        <div className="navbar-logo">
          <span className="logo-icon">⚕</span>
          <span className="logo-text">МУ <span className="logo-accent">Тест</span></span>
        </div>

        {/* Desktop links */}
        <nav className="navbar-links">
          <a href="#" className="nav-link active">Начало</a>
          <a href="#" className="nav-link">За нас</a>
          <a href="#" className="nav-link">Контакт</a>
        </nav>

        {/* Badge */}
        <div className="navbar-badge">
          <span className="pulse-dot" />
          Активен
        </div>

        {/* Hamburger */}
        <button
          className={`hamburger ${menuOpen ? 'open' : ''}`}
          onClick={() => setMenuOpen(o => !o)}
          aria-label="Меню"
        >
          <span /><span /><span />
        </button>

      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <nav className="mobile-menu">
          <a href="#" className="mobile-link" onClick={() => setMenuOpen(false)}>Начало</a>
          <a href="#" className="mobile-link" onClick={() => setMenuOpen(false)}>За нас</a>
          <a href="#" className="mobile-link" onClick={() => setMenuOpen(false)}>Контакт</a>
        </nav>
      )}
    </header>
  );
}

export default Navbar;