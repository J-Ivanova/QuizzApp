import { useState } from 'react';
import './QuestionsBox.css';
import UsageTracker, { incrementUsage } from './UsageTracker';

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
        body: JSON.stringify({
          ...config,
          numq: Number(config.numq) // FIX: ensure number
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Server error');

      if (!data.questions || !data.questions.length) {
        throw new Error('No questions received');
      }

      setPool(data.questions);
      setIdx(0);
      setScore(0);
      setSelected(null);
      setStage('quiz');

      incrementUsage(); // still OK here

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

    if (idx + 1 >= pool.length) {
      setStage('score');
    } else {
      setIdx(i => i + 1);
    }
  }

  // ---------- SAFE RENDER ----------
  const q = pool[idx];

  if (stage === 'setup') return (
    <div className="QuestionsBox">
      <h3>Тест - МУ София</h3>
      {error && <p className="error">{error}</p>}

      <label>Предмет
        <select value={config.subject} onChange={e =>
          setConfig({ ...config, subject: e.target.value })
        }>
          <option value="mixed">Смесен</option>
          <option value="medicine">Медицина</option>
          <option value="chemistry">Химия</option>
        </select>
      </label>

      <label>Брой въпроси
        <select value={config.numq} onChange={e =>
          setConfig({ ...config, numq: e.target.value })
        }>
          <option value="5">5</option>
          <option value="10">10</option>
          <option value="15">15</option>
        </select>
      </label>

      <label>Трудност
        <select value={config.difficulty} onChange={e =>
          setConfig({ ...config, difficulty: e.target.value })
        }>
          <option value="beginner">Начинаещ</option>
          <option value="intermediate">Среден</option>
          <option value="advanced">Напреднал</option>
        </select>
      </label>

      <button className="start-btn" onClick={startQuiz}>
        Генерирай въпроси →
      </button>
    </div>
  );

  if (stage === 'loading') return (
    <div className="QuestionsBox">
      <p className="loading">Генериране на въпроси...</p>
    </div>
  );

  if (stage === 'score') {
    const pct = Math.round((score / pool.length) * 100);

    return (
      <div className="QuestionsBox score">
        <h2>{score}/{pool.length}</h2>
        <p>{pct}% верни отговори</p>
        <button onClick={() => setStage('setup')}>Нов тест</button>
      </div>
    );
  }

  // ---------- SAFE GUARD ----------
  if (!q) {
    return (
      <div className="QuestionsBox">
        <p>Няма въпроси. Опитай отново.</p>
      </div>
    );
  }

  return (
    <div className="QuestionsBox">
      <p className="meta">
        Въпрос {idx + 1}/{pool.length} — Точки: {score}
      </p>

      <span className="badge">
        {q.subject}
      </span>

      <p className="question">{q.q}</p>

      {q.options.map((o, i) => (
        <button
          key={i}
          className={`option ${
            selected === null
              ? ''
              : i === q.answer
              ? 'correct'
              : selected === i
              ? 'wrong'
              : ''
          }`}
          onClick={() => choose(i)}
          disabled={selected !== null}
        >
          {String.fromCharCode(1040 + i)}. {o}
        </button>
      ))}

      {selected !== null && (
        <p className={`feedback ${selected === q.answer ? 'correct' : 'wrong'}`}>
          {selected === q.answer ? '✓ Правилно! ' : '✗ Грешно. '}
          {q.explanation}
        </p>
      )}

      {selected !== null && (
        <button className="next-btn" onClick={next}>
          Следващ →
        </button>
      )}
    </div>
  );
}