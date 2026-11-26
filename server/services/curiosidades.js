import { generateContent } from './gemini-client.js';
import { appendStudentContext } from './student-context.js';

const MAX_OUTPUT_TOKENS = 512;
const CATEGORIES = [
  'Ciência', 'Espaço', 'Natureza', 'Animais', 'Corpo humano',
  'História', 'Geografia', 'Cultura', 'Tecnologia',
];

const RESPONSE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    question: { type: 'STRING' },
    options: { type: 'ARRAY', items: { type: 'STRING' } },
    correctIndex: { type: 'INTEGER' },
    explanation: { type: 'STRING' },
    category: { type: 'STRING' },
  },
  required: ['question', 'options', 'correctIndex', 'explanation', 'category'],
};

export class CuriosidadesError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'CuriosidadesError';
    this.status = status;
  }
}

function parseCuriosidade(text) {
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error('AI returned invalid JSON');
  }

  const { question, options, correctIndex, explanation, category } = data ?? {};
  const isValid =
    typeof question === 'string' && question.trim().length > 0 &&
    Array.isArray(options) && options.length === 4 &&
    options.every((option) => typeof option === 'string' && option.trim().length > 0) &&
    Number.isInteger(correctIndex) && correctIndex >= 0 && correctIndex < 4 &&
    typeof explanation === 'string' && explanation.trim().length > 0 &&
    typeof category === 'string' && CATEGORIES.includes(category);

  if (!isValid) {
    throw new Error('AI returned an invalid curiosidade question shape');
  }

  return { question, options, correctIndex, explanation, category };
}

export function shuffleCuriosidadeOptions({ question, options, correctIndex, explanation, category }) {
  const indices = options.map((_, index) => index);
  for (let i = indices.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }

  return {
    question,
    options: indices.map((index) => options[index]),
    correctIndex: indices.indexOf(correctIndex),
    explanation,
    category,
  };
}

function buildSystemInstruction(asked = []) {
  const parts = [
    `Você cria PERGUNTAS DE CURIOSIDADES DO MUNDO para estudantes brasileiros.

REGRAS OBRIGATÓRIAS:
- TODO O CONTEÚDO EM PORTUGUÊS DO BRASIL.
- Adapte vocabulário, exemplos e dificuldade à idade e escolaridade informadas no contexto do estudante; nunca infantilize adultos.
- Crie UMA pergunta de múltipla escolha sobre UM fato surpreendente, verídico e verificável do mundo. Prefira fatos concretos e incontestáveis; evite opiniões, polêmicas e números que possam estar desatualizados.
- "question": uma pergunta curta e direta, que teste se a pessoa conhece a curiosidade. Termine com "?".
- "options": exatamente 4 alternativas curtas. Apenas UMA é correta. As erradas devem ser plausíveis e do mesmo tamanho aproximado. Nunca use "todas as anteriores" ou "nenhuma das anteriores".
- "correctIndex": índice (0, 1, 2 ou 3) da alternativa correta. Não tente controlar a posição; o sistema embaralha as alternativas antes de mostrar a pergunta.
- "explanation": 2 a 3 frases curtas revelando POR QUE a alternativa correta é certa e explicando a curiosidade.
- "category" deve ser EXATAMENTE uma destas opções: ${CATEGORIES.join(', ')}.
- Não use markdown, emojis, aspas externas, links ou referências a fontes.
- NÃO repita nenhuma das perguntas da lista JÁ FEITAS.`,
  ];

  if (asked.length > 0) {
    parts.push(`PERGUNTAS JÁ FEITAS (NÃO REPITA NEM REESCREVA):\n${asked.map((item, i) => `${i + 1}. ${item}`).join('\n')}`);
  }

  return { parts: [{ text: parts.join('\n\n') }] };
}

export async function generateCuriosidade({ asked = [], profile, apiKey, signal }) {
  try {
    const curiosidade = await generateContent({
      apiKey,
      signal,
      systemInstruction: appendStudentContext(buildSystemInstruction(asked.slice(-20)), profile),
      contents: [{ role: 'user', parts: [{ text: 'Gere AGORA uma nova pergunta de curiosidade, diferente das anteriores.' }] }],
      generationConfig: {
        maxOutputTokens: MAX_OUTPUT_TOKENS,
        temperature: 1,
        topP: 0.95,
        responseMimeType: 'application/json',
        responseSchema: RESPONSE_SCHEMA,
      },
      parse: parseCuriosidade,
    });
    return shuffleCuriosidadeOptions(curiosidade);
  } catch (error) {
    throw new CuriosidadesError(error.message, error.status ?? 502);
  }
}
