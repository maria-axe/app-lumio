import { createHmac, timingSafeEqual } from 'node:crypto';
import { SUBJECTS, maxLevelForAge, resolveSubject } from '../prompts.js';
import { generateContent } from './gemini-client.js';
import { appendStudentContext } from './student-context.js';
import { isAccentQuestionValid, isQuestionWordingValid } from './question-check.js';

export const PLACEMENT_VERSION = 1;
export const PLACEMENT_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
export const PLACEMENT_QUESTION_COUNT = PLACEMENT_LEVELS.length;

const MAX_OUTPUT_TOKENS = 768;
const TOKEN_TTL_MS = 30 * 60 * 1000;

const QUESTION_SCHEMA = {
  type: 'OBJECT',
  properties: {
    question: { type: 'STRING' },
    options: {
      type: 'ARRAY',
      items: { type: 'STRING' },
      minItems: 4,
      maxItems: 4,
    },
    correctIndex: { type: 'INTEGER' },
    explanation: { type: 'STRING' },
  },
  required: ['question', 'options', 'correctIndex', 'explanation'],
};

const RESPONSE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    questions: {
      type: 'ARRAY',
      items: QUESTION_SCHEMA,
      minItems: PLACEMENT_QUESTION_COUNT,
      maxItems: PLACEMENT_QUESTION_COUNT,
    },
  },
  required: ['questions'],
};

export class PlacementError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'PlacementError';
    this.status = status;
  }
}

function clean(value, max = 160) {
  return typeof value === 'string' ? value.trim().replace(/\s+/g, ' ').slice(0, max) : '';
}

function parseQuestion(value) {
  if (!value || typeof value !== 'object') return null;

  let question = clean(value.question, 240);
  if (question && !question.endsWith('?')) {
    question = `${question.replace(/[.!:]+$/, '').trim()}?`;
  }
  const options = Array.isArray(value.options)
    ? value.options.map((option) => clean(option, 120))
    : [];
  const explanation = clean(value.explanation, 300);
  const correctIndex = value.correctIndex;

  const isValid =
    question.length > 0 &&
    question.endsWith('?') &&
    options.length === 4 &&
    options.every(Boolean) &&
    Number.isInteger(correctIndex) &&
    correctIndex >= 0 &&
    correctIndex < 4 &&
    explanation.length > 0 &&
    isAccentQuestionValid(question, options, correctIndex) &&
    isQuestionWordingValid(question);

  return isValid ? { question, options, correctIndex, explanation } : null;
}

function parsePlacement(text) {
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error('AI returned invalid JSON');
  }

  const rawQuestions = Array.isArray(data?.questions) ? data.questions : [];
  const questions = rawQuestions.map(parseQuestion);
  const isValid =
    questions.length === PLACEMENT_QUESTION_COUNT && questions.every(Boolean);

  if (!isValid) {
    throw new Error('AI returned an invalid placement shape');
  }

  return { questions };
}

function shuffleQuestions(questions) {
  return questions.map((item) => {
    const indices = item.options.map((_, index) => index);
    for (let i = indices.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }

    return {
      question: item.question,
      options: indices.map((index) => item.options[index]),
      correctIndex: indices.indexOf(item.correctIndex),
    };
  });
}

function getSecret() {
  const secret = process.env.PLACEMENT_SECRET || process.env.GEMINI_API_KEY || process.env.GROQ_API_KEY;
  if (!secret) throw new PlacementError('Placement secret not configured', 500);
  return secret;
}

function sign(payload) {
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = createHmac('sha256', getSecret()).update(encoded).digest('base64url');
  return `${encoded}.${signature}`;
}

function verify(token) {
  if (typeof token !== 'string') throw new PlacementError('Invalid placement token', 400);

  const [encoded, signature] = token.split('.');
  if (!encoded || !signature) throw new PlacementError('Invalid placement token', 400);

  const expected = createHmac('sha256', getSecret()).update(encoded).digest('base64url');
  const receivedBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (
    receivedBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(receivedBuffer, expectedBuffer)
  ) {
    throw new PlacementError('Invalid placement token', 400);
  }

  let payload;
  try {
    payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8'));
  } catch {
    throw new PlacementError('Invalid placement token', 400);
  }

  const now = Date.now();
  const isValid =
    payload?.v === PLACEMENT_VERSION &&
    typeof payload.sub === 'string' &&
    typeof payload.max === 'string' &&
    Number.isFinite(payload.iat) &&
    Number.isFinite(payload.exp) &&
    payload.exp > now &&
    Array.isArray(payload.a) &&
    payload.a.length === PLACEMENT_QUESTION_COUNT &&
    payload.a.every((index) => Number.isInteger(index) && index >= 0 && index < 4);

  if (!isValid) throw new PlacementError('Expired or invalid placement token', 400);
  return payload;
}

function clampLevel(level, max) {
  const currentIndex = PLACEMENT_LEVELS.indexOf(level);
  const maxIndex = PLACEMENT_LEVELS.indexOf(max);
  return maxIndex >= 0 && currentIndex > maxIndex ? max : level;
}

function buildSystemInstruction(subject) {
  const { language } = SUBJECTS[resolveSubject(subject)];

  return {
    parts: [
      {
        text: `Você cria um TESTE DE NIVELAMENTO de ${language} para estudantes brasileiros.

REGRAS OBRIGATÓRIAS:
- Gere exatamente ${PLACEMENT_QUESTION_COUNT} perguntas, nesta ordem de dificuldade: ${PLACEMENT_LEVELS.join(', ')}.
- "question": enunciado curto em português do Brasil, sempre terminando com "?". Mesmo quando parecer instrução terminada com ":" ou ".", substitua a pontuação final por "?". Use "___" para lacunas, nunca "..." ou "…".
- "options": exatamente 4 alternativas curtas. Apenas uma é correta. As erradas devem ser plausíveis e do mesmo tamanho aproximado. Nunca use "todas as anteriores" ou "nenhuma das anteriores".
- Quando a tarefa pedir identificação, escolha ou completar uma frase em ${language}, as opções devem estar em ${language}. Quando pedir tradução para o português, as opções devem estar em português do Brasil.
- "correctIndex": índice (0, 1, 2 ou 3) da alternativa correta. Não tente controlar a posição; o sistema embaralha as alternativas.
- "explanation": explicação curta em português do Brasil.
- Se perguntar sobre acentos, exija UM tipo por pergunta e garanta que apenas uma alternativa corresponda: agudo (á é í ó ú), grave (à), circunflexo (â ê ô) ou til (ã õ). "pão" tem til, não agudo.
- Não use markdown, emojis, links, referências externas ou aspas externas.`,
      },
    ],
  };
}

export async function generatePlacement({ subject = 'english', profile, apiKey, signal }) {
  try {
    const resolvedSubject = resolveSubject(subject);
    const { questions } = await generateContent({
      apiKey,
      signal,
      systemInstruction: appendStudentContext(buildSystemInstruction(resolvedSubject), profile),
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `Gere AGORA as ${PLACEMENT_QUESTION_COUNT} perguntas do teste de nivelamento em ordem de dificuldade crescente.`,
            },
          ],
        },
      ],
      generationConfig: {
        maxOutputTokens: MAX_OUTPUT_TOKENS,
        temperature: 0.8,
        topP: 0.95,
        responseMimeType: 'application/json',
        responseSchema: RESPONSE_SCHEMA,
      },
      parse: parsePlacement,
    });

    const shuffled = shuffleQuestions(questions);
    const now = Date.now();
    const token = sign({
      v: PLACEMENT_VERSION,
      sub: resolvedSubject,
      max: maxLevelForAge(profile?.age),
      iat: now,
      exp: now + TOKEN_TTL_MS,
      a: shuffled.map((question) => question.correctIndex),
    });

    return {
      token,
      version: PLACEMENT_VERSION,
      subject: resolvedSubject,
      total: PLACEMENT_QUESTION_COUNT,
      questions: shuffled.map(({ question, options }) => ({ question, options })),
    };
  } catch (error) {
    if (error instanceof PlacementError) throw error;
    throw new PlacementError(error.message, error.status ?? 502);
  }
}

export function gradePlacement({ token, answers }) {
  const payload = verify(token);

  const isValidAnswers =
    Array.isArray(answers) &&
    answers.length === PLACEMENT_QUESTION_COUNT &&
    answers.every((answer) => Number.isInteger(answer) && answer >= 0 && answer < 4);

  if (!isValidAnswers) throw new PlacementError('Invalid placement answers', 400);

  const score = answers.reduce(
    (total, answer, index) => total + (answer === payload.a[index] ? 1 : 0),
    0
  );
  const rawLevel = score <= 1 ? PLACEMENT_LEVELS[0] : PLACEMENT_LEVELS[score - 1];

  return {
    subject: payload.sub,
    level: clampLevel(rawLevel, payload.max),
    score,
    total: PLACEMENT_QUESTION_COUNT,
    version: PLACEMENT_VERSION,
  };
}
