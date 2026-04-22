import dotenv from 'dotenv';
import { safeParse } from '../utils/safeParse.js';

dotenv.config();

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

const MODELS = [
  'meta-llama/llama-3.1-8b-instruct:free',
  'mistralai/mistral-7b-instruct:free'
];

// ---------------- FETCH WITH RETRY ----------------
async function callLLM(prompt, modelIndex = 0, retries = 2) {
  const model = MODELS[modelIndex];

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const data = await response.json();

    if (data.error) throw new Error(data.error.message);

    return data.choices?.[0]?.message?.content;

  } catch (err) {
    console.error(`Model failed: ${model}`, err.message);

    if (retries > 0) {
      return callLLM(prompt, modelIndex, retries - 1);
    }

    if (modelIndex < MODELS.length - 1) {
      return callLLM(prompt, modelIndex + 1, 2);
    }

    throw err;
  }
}

// ---------------- MAIN CONTROLLER ----------------
export async function generateQuestions(req, res) {
  const { subject, numq, difficulty } = req.body;

  const subjectText =
    subject === 'mixed'
      ? 'медицина и химия'
      : subject === 'medicine'
      ? 'медицина'
      : 'химия';

  const difficultyText =
    difficulty === 'beginner'
      ? 'начинаещо'
      : difficulty === 'intermediate'
      ? 'средно'
      : 'напреднало';

  const prompt = `
Generate ${numq} multiple choice questions about ${subjectText} at ${difficultyText} level.

Return ONLY valid JSON array.
No markdown, no extra text.

Format:
[
  {
    "subject": "string",
    "q": "string",
    "options": ["A","B","C","D"],
    "answer": 0,
    "explanation": "string"
  }
]
`;

  try {
    const text = await callLLM(prompt);

    let questions = safeParse(text);

    // repair attempt
    if (!questions) {
      const fixed = await callLLM(`
Fix this into valid JSON ONLY:
${text}
Return ONLY JSON array.
      `);

      questions = safeParse(fixed);
    }

    if (!questions) {
      return res.json({
        questions: [],
        warning: 'Invalid AI output'
      });
    }

    res.json({ questions });

  } catch (e) {
    console.error('AI ERROR:', e.message);
    res.status(500).json({ error: 'AI failed, try again' });
  }
}