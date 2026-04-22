import { useState, useEffect } from 'react';

const LIMIT = 20;
const KEY = 'quizz_usage';

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

function loadData() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { date: getTodayKey(), count: 0, session: 0 };
    const data = JSON.parse(raw);
    if (data.date !== getTodayKey()) return { date: getTodayKey(), count: 0, session: data.session || 0 };
    return data;
  } catch { return { date: getTodayKey(), count: 0, session: 0 }; }
}

export function incrementUsage() {
  const data = loadData();
  data.count = (data.count || 0) + 1;
  data.session = (data.session || 0) + 1;
  localStorage.setItem(KEY, JSON.stringify(data));
}

export default function UsageTracker() {
  const [data, setData] = useState(loadData);

  useEffect(() => {
    const interval = setInterval(() => setData(loadData()), 1000);
    return () => clearInterval(interval);
  }, []);

  const used = data.count;
  const remaining = Math.max(0, LIMIT - used);
  const pct = Math.min(100, Math.round((used / LIMIT) * 100));

  return (
    <div style={{ padding: '1rem 0', fontFamily: 'sans-serif' }}>
      <span style={{ background: '#E1F5EE', color: '#0F6E56', fontSize: 12, padding: '3px 10px', borderRadius: 8, marginBottom: 12, display: 'inline-block' }}>
        Free tier — OpenRouter
      </span>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 12, marginBottom: '1rem' }}>
        {[['Used today', used], ['Remaining', remaining], ['Daily limit', LIMIT], ['Session total', data.session]].map(([label, val]) => (
          <div key={label} style={{ background: '#f5f5f5', borderRadius: 8, padding: '1rem' }}>
            <p style={{ fontSize: 13, color: '#888', margin: '0 0 4px' }}>{label}</p>
            <p style={{ fontSize: 24, fontWeight: 500, margin: 0 }}>{val}</p>
          </div>
        ))}
      </div>
      <div style={{ background: '#eee', borderRadius: 999, height: 8, overflow: 'hidden', marginBottom: '1rem' }}>
        <div style={{ height: '100%', borderRadius: 999, width: pct + '%', background: pct >= 90 ? '#E24B4A' : pct >= 60 ? '#EF9F27' : '#1D9E75', transition: 'width 0.4s' }} />
      </div>
      <p style={{ fontSize: 13, color: remaining === 0 ? '#A32D2D' : remaining <= 5 ? '#854F0B' : '#888', margin: 0 }}>
        {remaining === 0 ? 'Daily limit reached. Resets at midnight.' : remaining <= 5 ? `${remaining} generations left — use them wisely!` : `You're good to go. ${remaining} generations left today.`}
      </p>
      <button onClick={() => { const d = loadData(); d.count = 0; localStorage.setItem(KEY, JSON.stringify(d)); setData(loadData()); }}
        style={{ marginTop: 12, fontSize: 13, background: 'none', border: '1px solid #ccc', borderRadius: 8, padding: '6px 14px', cursor: 'pointer' }}>
        Reset counter
      </button>
    </div>
  );
}