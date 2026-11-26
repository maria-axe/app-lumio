import { generateContent } from './gemini-client.js';
import { appendStudentContext } from './student-context.js';
import { isAccentQuestionValid, isQuestionWordingValid } from './question-check.js';

const MAX_OUTPUT_TOKENS = 512;
const OPTIONS_COUNT = 3;

const RESPONSE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    question: { type: 'STRING' },
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

export class MateriasError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'MateriasError';
    this.status = status;
  }
}

function parseMaterias(text) {
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error('AI returned invalid JSON');
  }

  const { question, options, correctIndex, translation, explanation } = data ?? {};

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
    throw new Error('AI returned an invalid materias shape');
  }

  return {
    question,
    options,
    correctIndex,
    translation: String(translation ?? ''),
    explanation: String(explanation ?? ''),
  };
}

function shuffleOptions({ question, options, correctIndex, translation, explanation }) {
  const correct = options[correctIndex];
  const shuffled = [...options];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return {
    question,
    options: shuffled,
    correctIndex: shuffled.indexOf(correct),
    translation,
    explanation,
  };
}

export const MATERIAS = {
  portugues: {
    label: 'Língua Portuguesa',
    extra: 'Foque em gramática e interpretação de texto.',
    topics: [
      'interpretação de texto', 'sujeito e predicado', 'classes gramaticais',
      'substantivo e adjetivo', 'verbo e tempos verbais', 'concordância verbal',
      'concordância nominal', 'regência verbal', 'crase', 'pontuação',
      'ortografia', 'acentuação gráfica', 'coesão e coerência', 'tipos de sujeito',
    ],
  },
  matematica: {
    label: 'Matemática',
    extra: 'Use números simples e enunciados curtos. A explicação deve mostrar o raciocínio passo a passo. Não peça figuras ou desenhos.',
    topics: [
      'operações com números naturais', 'frações', 'porcentagem', 'geometria plana',
      'área e perímetro', 'equações do primeiro grau', 'proporcionalidade',
      'gráficos e tabelas', 'medidas de comprimento, massa e tempo', 'resolução de problemas',
    ],
  },
  historia: {
    label: 'História',
    extra: 'Priorize fatos, datas e conceitos do currículo do Ensino Fundamental.',
    topics: [
      'História do Brasil', 'Independência do Brasil', 'Era Vargas', 'Redemocratização',
      'Brasil Republicano', 'História antiga', 'Idade Média', 'Renascimento',
      'Revoluções', 'cultura e sociedade',
    ],
  },
  geografia: {
    label: 'Geografia',
    extra: 'Relacione os conceitos com situações do cotidiano do estudante brasileiro.',
    topics: [
      'regiões do Brasil', 'clima', 'relevo', 'hidrografia', 'vegetação',
      'população', 'urbanização', 'mapas e coordenadas', 'meio ambiente', 'globalização',
    ],
  },
  ciencias: {
    label: 'Ciências',
    extra: 'Use linguagem simples e exemplos do cotidiano.',
    topics: [
      'sistema solar', 'corpo humano', 'ecossistemas', 'ciclo da água',
      'matéria e energia', 'estados da matéria', 'cadeias alimentares',
      'saúde e higiene', 'física do cotidiano', 'química do cotidiano',
    ],
  },
};

export function resolveMateria(value) {
  return Object.hasOwn(MATERIAS, value) ? value : 'portugues';
}

function pickTopic(subject) {
  const topics = MATERIAS[subject].topics;
  return topics[Math.floor(Math.random() * topics.length)];
}

function buildSystemInstruction(subject, asked = []) {
  const { label, extra, topics } = MATERIAS[subject];
  const parts = [
    `Você é um professor de ${label}, especializado em exercícios para estudantes brasileiros.

REGRAS OBRIGATÓRIAS:
- TODO O CONTEÚDO DEVE SER EM PORTUGUÊS DO BRASIL. Questão, alternativas, explicação e observação.
- NÃO crie exercícios de listening, speaking, pronúncia ou "ouvir/repetir/falar".
- Gere EXCLUSIVAMENTE exercícios de ${label} sobre: ${topics.join(', ')}.
- ${extra}
- Produza EXATAMENTE 3 alternativas, APENAS 1 correta.
- As alternativas devem ser curtas, plausíveis e sem letras A/B/C ou numeração.
- Foque em questões objetivas, diretas e didáticas.
- Use "___" para lacunas, nunca "..." ou "…".
- "explanation" deve explicar o motivo da resposta correta em português.
- "translation" pode ser vazio ou uma breve observação em português.
- Se perguntar sobre acentos, exija UM tipo por pergunta e garanta que apenas uma alternativa corresponda: agudo (á é í ó ú), grave (à), circunflexo (â ê ô) ou til (ã õ). "pão" tem til, não agudo.

NÍVEL: use o nível escolar informado no CONTEXTO DO ESTUDANTE. Se não houver contexto, use Ensino Fundamental (anos finais), dificuldade média, linguagem didática.`,
    `TEMA SUGERIDO PARA ESTA QUESTÃO: ${pickTopic(subject)}. Varie bastante entre os temas. Nunca repita o mesmo tipo de questão consecutivamente.`,
  ];

  if (asked.length > 0) {
    const list = asked.map((q, i) => `${i + 1}. ${q}`).join('\n');
    parts.push(
      `JÁ FORAM FEITAS ESTAS QUESTÕES (NUNCA REPITA, NEM REESCREVA):\n${list}`,
    );
  }

  return { parts: [{ text: parts.join('\n\n') }] };
}

export async function generateMaterias({ subject = 'portugues', asked = [], profile, apiKey, signal }) {
  const materia = resolveMateria(subject);
  try {
    const quiz = await generateContent({
      apiKey,
      signal,
      systemInstruction: appendStudentContext(buildSystemInstruction(materia, asked), profile),
      contents: [{ role: 'user', parts: [{ text: `Gere APENAS 1 exercício de ${MATERIAS[materia].label} agora. Tudo em português do Brasil. Sem áudio, sem listening, sem speaking.` }] }],
      generationConfig: {
        maxOutputTokens: MAX_OUTPUT_TOKENS,
        temperature: 0.9,
        topP: 0.95,
        responseMimeType: 'application/json',
        responseSchema: RESPONSE_SCHEMA,
      },
      parse: parseMaterias,
    });
    return shuffleOptions(quiz);
  } catch (error) {
    throw new MateriasError(error.message, error.status ?? 502);
  }
}
