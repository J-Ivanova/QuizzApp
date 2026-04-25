import { useState } from 'react';
import './Navbar.css';

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="Navbar">
      <div className="navbar-inner">

        <div className="navbar-logo">
          <span className="logo-icon">⚕</span>
          <span className="logo-text">МУ <span className="logo-accent">Тест</span></span>
        </div>

        <nav className="navbar-links">
          <button className="nav-link active">Начало</button>
          <button className="nav-link">За нас</button>
          <button className="nav-link">Контакт</button>
        </nav>

        <div className="navbar-badge">
          <span className="pulse-dot" />
          Активен
        </div>

        <button
          className={`hamburger ${menuOpen ? 'open' : ''}`}
          onClick={() => setMenuOpen(o => !o)}
          aria-label="Меню"
        >
          <span /><span /><span />
        </button>

      </div>

      {menuOpen && (
        <nav className="mobile-menu">
          <button className="mobile-link" onClick={() => setMenuOpen(false)}>Начало</button>
          <button className="mobile-link" onClick={() => setMenuOpen(false)}>За нас</button>
          <button className="mobile-link" onClick={() => setMenuOpen(false)}>Контакт</button>
        </nav>
      )}
    </header>
  );
}

export default Navbar;