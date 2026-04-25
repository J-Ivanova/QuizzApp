import { useState } from 'react';
import './QuestionsBox.css';

export default function QuestionsBox() {
  const [stage, setStage] = useState('setup');
  const [config, setConfig] = useState({
    subject: 'mixed',
    numq: 10,
    difficulty: 'intermediate'
  });

  const [pool, setPool] = useState([]);
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState(null);

  async function startQuiz() {
    setStage('loading');
    setError(null);

    try {
      const res = await fetch('http://localhost:3001/api/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...config, numq: Number(config.numq) }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Server error');
      if (!data.questions || !data.questions.length) throw new Error('No questions received');

      setPool(data.questions);
      setIdx(0);
      setScore(0);
      setSelected(null);
      setStage('quiz');
    } catch (e) {
      setError(`Грешка: ${e.message}`);
      setStage('setup');
    }
  }

  function choose(i) {
    if (selected !== null || !pool[idx]) return;
    setSelected(i);
    if (i === pool[idx].answer) setScore(s => s + 1);
  }

  function next() {
    setSelected(null);
    if (idx + 1 >= pool.length) setStage('score');
    else setIdx(i => i + 1);
  }

  const q = pool[idx];
  const pct = pool.length ? Math.round((idx / pool.length) * 100) : 0;

  // ── SETUP ──
  if (stage === 'setup') return (
    <div className="QuestionsBox">
      <div className="box-header">
        <h3>Тест — МУ София</h3>
        <p className="box-subtitle">Конфигурирай своя тест</p>
      </div>

      {error && <p className="error-msg">{error}</p>}

      <div className="form-grid">
        <label>Предмет
          <select value={config.subject} onChange={e => setConfig({ ...config, subject: e.target.value })}>
            <option value="mixed">Смесен</option>
            <option value="medicine">Медицина</option>
            <option value="chemistry">Химия</option>
          </select>
        </label>

        <label>Брой въпроси
          <select value={config.numq} onChange={e => setConfig({ ...config, numq: e.target.value })}>
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="15">15</option>
          </select>
        </label>

        <label>Трудност
          <select value={config.difficulty} onChange={e => setConfig({ ...config, difficulty: e.target.value })}>
            <option value="beginner">Начинаещ</option>
            <option value="intermediate">Среден</option>
            <option value="advanced">Напреднал</option>
          </select>
        </label>
      </div>

      <button className="start-btn" onClick={startQuiz}>
        Генерирай въпроси →
      </button>
    </div>
  );

  // ── LOADING ──
  if (stage === 'loading') return (
    <div className="QuestionsBox loading-box">
      <div className="spinner" />
      <p className="loading-text">Генериране на въпроси...</p>
      <p className="loading-sub">Това може да отнеме няколко секунди</p>
    </div>
  );

  // ── SCORE ──
  if (stage === 'score') {
    const scorePct = Math.round((score / pool.length) * 100);
    const grade =
      scorePct >= 90 ? 'Отличен резултат! 🏆' :
      scorePct >= 70 ? 'Добре справен! 👍' :
      scorePct >= 50 ? 'Може и по-добре 📚' :
      'Продължавай да учиш 💪';

    return (
      <div className="QuestionsBox score-box">
        <div className="score-circle">
          <span className="score-number">{scorePct}%</span>
        </div>
        <h2 className="score-title">{grade}</h2>
        <p className="score-detail">{score} верни от {pool.length} въпроса</p>
        <button className="start-btn" onClick={() => setStage('setup')}>
          Нов тест →
        </button>
      </div>
    );
  }

  if (!q) return (
    <div className="QuestionsBox">
      <p>Няма въпроси. Опитай отново.</p>
    </div>
  );

  // ── QUIZ ──
  return (
    <div className="QuestionsBox">

      {/* Progress */}
      <div className="progress-header">
        <span className="progress-label">Въпрос {idx + 1} от {pool.length}</span>
        <span className="score-label">★ {score}</span>
      </div>
      <div className="progress-bar">
        <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
      </div>

      {/* Badge */}
      <span className={`badge ${q.subject === 'медицина' ? 'badge-medicine' : q.subject === 'химия' ? 'badge-chemistry' : 'badge-medicine'}`}>
        {q.subject}
      </span>

      {/* Question */}
      <p className="question">{q.q}</p>

      {/* Options */}
      <div className="options-list">
        {q.options.map((o, i) => (
          <button
            key={i}
            className={`option ${
              selected === null ? '' :
              i === q.answer ? 'correct' :
              selected === i ? 'wrong' : 'dimmed'
            }`}
            onClick={() => choose(i)}
            disabled={selected !== null}
          >
            <span className="option-letter">{String.fromCharCode(1040 + i)}</span>
            <span className="option-text">{o}</span>
          </button>
        ))}
      </div>

      {/* Feedback */}
      {selected !== null && (
        <div className={`feedback ${selected === q.answer ? 'correct' : 'wrong'}`}>
          <span className="feedback-icon">{selected === q.answer ? '✓' : '✗'}</span>
          <span>{selected === q.answer ? 'Правилно! ' : 'Грешно. '}{q.explanation}</span>
        </div>
      )}

      {selected !== null && (
        <button className="next-btn" onClick={next}>
          {idx + 1 >= pool.length ? 'Виж резултата →' : 'Следващ въпрос →'}
        </button>
      )}
    </div>
  );
}