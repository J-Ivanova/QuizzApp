import dotenv from 'dotenv';
import Groq from 'groq-sdk';
import { safeParse } from '../utils/safeParse.js';

dotenv.config();

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ---------------- JSON EXTRACTOR ----------------
function extractJSON(text) {
  if (!text) return null;

  let result = safeParse(text);
  if (result) return result;

  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced) {
    result = safeParse(fenced[1].trim());
    if (result) return result;
  }

  const arrayMatch = text.match(/\[[\s\S]*\]/);
  if (arrayMatch) {
    result = safeParse(arrayMatch[0]);
    if (result) return result;
  }

  return null;
}

// ---------------- CALL LLM ----------------
async function callLLM(prompt) {
  const message = await client.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    max_tokens: 2048,
    messages: [
      {
        role: 'system',
        content: `You are a quiz question generator. 
You ALWAYS respond with a valid JSON array and NOTHING else.
No markdown, no code fences, no explanation — raw JSON only.
CRITICAL: You MUST write ALL text (questions, options, explanations) in BULGARIAN language only. Never use Russian or any other language.`
      },
      { role: 'user', content: prompt }
    ],
  });

  return message.choices[0].message.content;
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

  const prompt = `Generate ${numq} multiple choice questions about ${subjectText} at ${difficultyText} level.

IMPORTANT: ALL text must be in BULGARIAN (български език). Do NOT use Russian. Do NOT use any other language.

Return ONLY a valid JSON array. No markdown, no extra text.

Format:
[
  {
    "subject": "string",
    "q": "string",
    "options": ["A", "B", "C", "D"],
    "answer": 0,
    "explanation": "string"
  }
]`;

  try {
    const text = await callLLM(prompt);
    let questions = extractJSON(text);

    if (!questions) {
      const fixed = await callLLM(`
The following is supposed to be a JSON array of quiz questions but may be malformed.
Fix it and return ONLY the corrected JSON array, nothing else:

${text}`);
      questions = extractJSON(fixed);
    }

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return res.json({ questions: [], warning: 'AI returned invalid output' });
    }

    return res.json({ questions });

  } catch (e) {
    console.error('AI ERROR:', e.message);
    return res.status(500).json({ error: 'AI failed, please try again' });
  }
}