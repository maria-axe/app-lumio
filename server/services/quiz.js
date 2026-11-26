import { buildQuizSystemInstruction, SUBJECTS } from '../prompts.js';
import { generateContent } from './gemini-client.js';
import { appendStudentContext } from './student-context.js';
import { isAccentQuestionValid, isQuestionWordingValid } from './question-check.js';

const MAX_OUTPUT_TOKENS = 512;
const OPTIONS_COUNT = 3;

const RESPONSE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    question: { type: 'STRING' },
    audio: { type: 'STRING' },
    options: {
      type: 'ARRAY',
      items: { type: 'STRING' },
      minItems: OPTIONS_COUNT,
      maxItems: OPTIONS_COUNT,
    },
    correctIndex: { type: 'INTEGER' },
    translation: { type: 'STRING' },
    explanation: { type: 'STRING' },
  },
  required: ['question', 'options', 'correctIndex', 'translation', 'explanation'],
};

export class QuizError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'QuizError';
    this.status = status;
  }
}

function parseQuiz(text) {
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error('AI returned invalid JSON');
  }

  const { question, options, correctIndex, translation, explanation, audio } = data ?? {};

  const isValid =
    typeof question === 'string' &&
    question.trim().length > 0 &&
    Array.isArray(options) &&
    options.length === OPTIONS_COUNT &&
    options.every((option) => typeof option === 'string' && option.trim().length > 0) &&
    Number.isInteger(correctIndex) &&
    correctIndex >= 0 &&
    correctIndex < options.length &&
    isAccentQuestionValid(question, options, correctIndex) &&
    isQuestionWordingValid(question);

  if (!isValid) {
    throw new Error('AI returned an invalid quiz shape');
  }

  return {
    question,
    // `audio` só existe em exercícios de listening; string vazia nos demais.
    audio: typeof audio === 'string' ? audio.trim() : '',
    options,
    correctIndex,
    translation: String(translation ?? ''),
    explanation: String(explanation ?? ''),
  };
}

function shuffleOptions({ question, audio, options, correctIndex, translation, explanation }) {
  const correct = options[correctIndex];
  const shuffled = [...options];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return {
    question,
    audio,
    options: shuffled,
    correctIndex: shuffled.indexOf(correct),
    translation,
    explanation,
  };
}

export async function generateQuiz({ level, subject, asked = [], profile, apiKey, signal }) {
  try {
    const subj = SUBJECTS?.[subject] || {};
    const isGeneral = subj.type === 'general';
    let typeHint = 'Generate one exercise now.';
    if (!isGeneral) {
      const r = Math.random();
      if (r < 0.34) {
        typeHint =
          'Generate ONE LISTENING COMPREHENSION exercise now (type f). Follow ALL listening rules: "audio" must be only the sentence in the target language, "question" must be in Portuguese and must NOT reveal the sentence, options in Portuguese.';
      } else if (r < 0.67) {
        typeHint =
          'Generate ONE SPEAKING/PRONUNCIATION exercise now (type speaking). Rules: the student must SAY the target sentence aloud. "audio" should be omitted or empty. "question" MUST be in Portuguese EXACTLY like "Repita em voz alta esta frase: <TARGET_SENTENCE_IN_TARGET_LANGUAGE>". The TARGET SENTENCE must be shown clearly in the question for them to repeat. The 3 options MUST be in the target language: option A/B/C = 3 versions of that sentence where ONLY 1 is CORRECT and the other 2 are wrong (grammar/order/mistakes). The correctIndex points to the CORRECT version to say. "explanation" should give a short pronunciation/grammar tip in Portuguese.';
      } else {
        typeHint =
          'Generate ONE TEXT/READING exercise now. Prefer fill-in-the-blank, choose correct sentence, translation choice, or dialogue response. Keep "audio" omitted or empty. Enunciado in Portuguese, options in the correct language as per rules.';
      }
    } else {
      typeHint =
        'Generate ONE TEXT/READING exercise EXCLUSIVELY for BRAZILIAN PORTUGUESE (Língua Portuguesa). DO NOT generate any English or foreign language exercise. DO NOT generate listening or speaking. "audio" MUST be omitted or empty. Write question, options, translation, explanation ALL in Brazilian Portuguese. Focus ONLY on: ortografia, acentuação, pontuação, concordância verbal/nominal, regência, crase, classes gramaticais, interpretação de texto, coesão/coerência. Use only Portuguese examples. Avoid any English words in question/options.';
    }
    const quiz = await generateContent({
      apiKey,
      signal,
      systemInstruction: appendStudentContext(buildQuizSystemInstruction(level, subject, asked), profile),
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: typeHint,
            },
          ],
        },
      ],
      generationConfig: {
        maxOutputTokens: MAX_OUTPUT_TOKENS,
        temperature: 0.9,
        topP: 0.95,
        responseMimeType: 'application/json',
        responseSchema: RESPONSE_SCHEMA,
      },
      parse: parseQuiz,
    });
    return shuffleOptions(quiz);
  } catch (error) {
    throw new QuizError(error.message, error.status ?? 502);
  }
}
