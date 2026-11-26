import { generateContent } from './gemini-client.js';
import { appendStudentContext } from './student-context.js';
import { isAccentQuestionValid, isQuestionWordingValid } from './question-check.js';

const MAX_OUTPUT_TOKENS = 1024;

export const DIALOG_SUBJECTS = {
  english: 'Inglês',
  spanish: 'Espanhol',
  french: 'Francês',
};

const TURN_SCHEMA = {
  type: 'OBJECT',
  properties: {
    speaker: { type: 'INTEGER' },
    text: { type: 'STRING' },
    translation: { type: 'STRING' },
  },
  required: ['speaker', 'text', 'translation'],
};

const QUESTION_SCHEMA = {
  type: 'OBJECT',
  properties: {
    question: { type: 'STRING' },
    options: { type: 'ARRAY', items: { type: 'STRING' } },
    correctIndex: { type: 'INTEGER' },
    explanation: { type: 'STRING' },
  },
  required: ['question', 'options', 'correctIndex', 'explanation'],
};

const RESPONSE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    title: { type: 'STRING' },
    speakers: { type: 'ARRAY', items: { type: 'STRING' } },
    turns: { type: 'ARRAY', items: TURN_SCHEMA },
    questions: { type: 'ARRAY', items: QUESTION_SCHEMA },
  },
  required: ['title', 'speakers', 'turns', 'questions'],
};

export class DialogosError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'DialogosError';
    this.status = status;
  }
}

function clean(value, max = 160) {
  return typeof value === 'string' ? value.trim().replace(/\s+/g, ' ').slice(0, max) : '';
}

function parseTurn(value, index) {
  if (!value || typeof value !== 'object') return null;

  const speaker = value.speaker;
  const text = clean(value.text, 160);
  const translation = clean(value.translation, 200);

  const isValid =
    speaker === index % 2 &&
    text.length > 0 &&
    translation.length > 0;

  return isValid ? { speaker, text, translation } : null;
}

function parseQuestion(value) {
  if (!value || typeof value !== 'object') return null;

  let question = clean(value.question, 200);
  if (question && !question.endsWith('?')) {
    question = `${question.replace(/[.!:]+$/, '').trim()}?`;
  }
  const options = Array.isArray(value.options)
    ? value.options.map((option) => clean(option, 100))
    : [];
  const explanation = clean(value.explanation, 300);
  const correctIndex = value.correctIndex;

  const isValid =
    question.length > 0 && question.endsWith('?') &&
    options.length === 4 && options.every(Boolean) &&
    Number.isInteger(correctIndex) && correctIndex >= 0 && correctIndex < 4 &&
    explanation.length > 0 &&
    isAccentQuestionValid(question, options, correctIndex) &&
    isQuestionWordingValid(question);

  return isValid ? { question, options, correctIndex, explanation } : null;
}

function parseDialogo(text) {
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error('AI returned invalid JSON');
  }

  const title = clean(data?.title, 80);
  const speakers = Array.isArray(data?.speakers)
    ? data.speakers.map((name) => clean(name, 40))
    : [];
  const rawTurns = Array.isArray(data?.turns) ? data.turns : [];
  const turns = rawTurns.map(parseTurn);
  const rawQuestions = Array.isArray(data?.questions) ? data.questions : [];
  const questions = rawQuestions.map(parseQuestion);

  const isValid =
    title.length > 0 &&
    speakers.length === 2 && speakers.every(Boolean) &&
    turns.length === 6 && turns.every(Boolean) &&
    questions.length === 2 && questions.every(Boolean);

  if (!isValid) {
    throw new Error('AI returned an invalid dialogo shape');
  }

  return { title, speakers, turns, questions };
}

function buildSystemInstruction({ subject, level, used = [] }) {
  const language = DIALOG_SUBJECTS[subject] || DIALOG_SUBJECTS.english;
  const parts = [
    `Você cria um DIÁLOGO original entre DUAS PESSOAS para estudantes brasileiros.

REGRAS OBRIGATÓRIAS:
- Todo o conteúdo em português do Brasil, exceto "text" das falas, que devem estar em ${language}.
- "title": título curto em português.
- "speakers": exatamente 2 nomes curtos e diferentes. Nunca use pessoas famosas ou marcas.
- "turns": exatamente 6 falas, alternando obrigatoriamente speaker 0, 1, 0, 1, 0, 1.
- Cada "text" deve ser uma fala curta e natural em ${language}, com no máximo 18 palavras.
- Cada "translation" deve ser a tradução da fala em português do Brasil.
- A conversa deve ter começo, meio e fim, com detalhes concretos que permitam perguntas de compreensão.
- "questions": exatamente 2 perguntas em português sobre a conversa.
  - A primeira pergunta deve testar um detalhe literal da conversa.
  - A segunda deve testar inferência, intenção ou sentido de uma expressão.
  - Cada "question" termina com "?". Mesmo quando parecer instrução terminada com ":" ou ".", substitua a pontuação final por "?".
  - Cada "options" tem exatamente 4 alternativas curtas. Apenas uma é correta. Nunca use "todas as anteriores" ou "nenhuma das anteriores".
  - "correctIndex" é 0, 1, 2 ou 3. Varie a posição entre as duas perguntas.
  - "explanation": 1 ou 2 frases curtas em português, citando a parte da conversa que comprova a resposta.
  - Se perguntar sobre acentos, exija UM tipo por pergunta e garanta que apenas uma alternativa corresponda: agudo (á é í ó ú), grave (à), circunflexo (â ê ô) ou til (ã õ). "pão" tem til, não agudo.
- Nível do estudante: ${level}. Adapte vocabulário e complexidade.
- Não use markdown, emojis, links ou referências externas.`,
  ];

  if (used.length) {
    parts.push(`TÍTULOS JÁ USADOS (NÃO REPITA):\n${used.map((item, i) => `${i + 1}. ${item}`).join('\n')}`);
  }

  return { parts: [{ text: parts.join('\n\n') }] };
}

export async function generateDialogo({ subject = 'english', level = 'B1', used = [], profile, apiKey, signal, env = process.env }) {
  try {
    return await generateContent({
      apiKey,
      signal,
      env,
      systemInstruction: appendStudentContext(
        buildSystemInstruction({ subject, level, used: used.slice(-12) }),
        profile,
      ),
      contents: [{ role: 'user', parts: [{ text: 'Gere AGORA um novo diálogo entre duas pessoas com duas perguntas.' }] }],
      generationConfig: {
        maxOutputTokens: MAX_OUTPUT_TOKENS,
        temperature: 1,
        topP: 0.95,
        responseMimeType: 'application/json',
        responseSchema: RESPONSE_SCHEMA,
      },
      parse: parseDialogo,
    });
  } catch (error) {
    throw new DialogosError(error.message, error.status ?? 502);
  }
}
