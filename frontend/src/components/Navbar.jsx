import { useState } from 'react';
import './Navbar.css';

const SUBJECT_LABELS = {
  mixed: 'Смесен',
  medicine: 'Медицина',
  chemistry: 'Химия'
};

const DIFFICULTY_LABELS = {
  beginner: 'Начинаещ',
  intermediate: 'Среден',
  advanced: 'Напреднал'
};

function loadHistory() {
  return JSON.parse(localStorage.getItem('muquizz_history') || '[]');
}

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [modal, setModal] = useState(null);

  const motivations = [
    "Aide dai mu be mashinakis ",
    "Dali ne gi razmaza tiq vuprosi, a? ",
    "Uchim za da nqma posle tsiganski nevoli",
    "Doktorite se rajdat ot uporstvo ",
    "Tolkoz moga, tolkova davam, na poveche dori ne se nadqvam - Kerana :P",
    "Ne se otkazvai, vsichko e v tvoite ruki! ",
    "Umorata e vremenna, gordostta e za vsekoga",
    "Srubska skara i edna studena bira",
    "Vsekoi iska da te stigne ma ne moje",
    "Nqma sramni vuprosi, ima tupi otgovori",
    "Rok, metal i goli babki",
    "punk, cici, narkotici",
  ];

  const [quote, setQuote] = useState(() =>
    motivations[Math.floor(Math.random() * motivations.length)]
  );

  const [history, setHistory] = useState([]);

  function openHistory() {
    setHistory(loadHistory());
    setModal('history');
  }

  function clearHistory() {
    localStorage.removeItem('muquizz_history');
    setHistory([]);
  }

  function newQuote() {
    let next;
    do {
      next = motivations[Math.floor(Math.random() * motivations.length)];
    } while (next === quote);
    setQuote(next);
  }

  return (
    <>
      <header className="Navbar">
        <div className="navbar-inner">

          <div className="navbar-logo">
            <span className="logo-icon">⚕</span>
            <span className="logo-text">МУ <span className="logo-accent">Тест</span></span>
          </div>

          <nav className="navbar-links">
            <button className="nav-link active">Начало</button>
            <button className="nav-link active" onClick={openHistory}>История</button>
            <button className="nav-link active" onClick={() => setModal('motivation')}>Мотивейшън</button>
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
            <button className="mobile-link" onClick={() => { setMenuOpen(false); openHistory(); }}>История</button>
            <button className="mobile-link" onClick={() => { setMenuOpen(false); setModal('motivation'); }}>Мотивейшън</button>
          </nav>
        )}
      </header>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>

            {modal === 'motivation' && (
              <>
                <div className="modal-emoji">✨</div>
                <h2 className="modal-title">Мотивация</h2>
                <p className="modal-quote">{quote}</p>
                <button className="modal-btn-secondary" onClick={newQuote}>Рифреш</button>
                <button className="modal-btn" onClick={() => setModal(null)}>Затваряй</button>
              </>
            )}

            {modal === 'history' && (
              <>
                <div className="modal-emoji">📊</div>
                <h2 className="modal-title">История</h2>

                {history.length === 0 ? (
                  <p className="modal-text">Още няма направени тестове.</p>
                ) : (
                  <div className="history-list">
                    {history.map((h, i) => (
                      <div key={i} className="history-item">
                        <div className="history-top">
                          <span className="history-score" style={{
                            color: h.pct >= 70 ? 'var(--success)' : h.pct >= 50 ? 'var(--warning)' : 'var(--error)'
                          }}>
                            {h.score}/{h.total} — {h.pct}%
                          </span>
                          <span className="history-date">{h.date}</span>
                        </div>
                        <div className="history-meta">
                          {SUBJECT_LABELS[h.subject] || h.subject} · {DIFFICULTY_LABELS[h.difficulty] || h.difficulty}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {history.length > 0 && (
                  <button className="modal-btn-secondary" onClick={clearHistory}>
                    Изчисти историята 
                  </button>
                )}
                <button className="modal-btn" onClick={() => setModal(null)}>Затваряй</button>
              </>
            )}

          </div>
        </div>
      )}
    </>
  );
}

export default Navbar;