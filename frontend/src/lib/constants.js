export const DEFAULT_LEVEL = 'B1';
export const DEFAULT_SUBJECT = 'english';

export const LEVELS = [
  { id: 'A1', label: 'A1 · Iniciante' },
  { id: 'A2', label: 'A2 · Elementar' },
  { id: 'B1', label: 'B1 · Intermediário' },
  { id: 'B2', label: 'B2 · Alto-Intermediário' },
  { id: 'C1', label: 'C1 · Avançado' },
  { id: 'C2', label: 'C2 · Proficiente' },
];

export const LEVEL_ORDER = LEVELS.map((level) => level.id);

export const SUBJECTS = {
  english: { label: 'Inglês', flag: '🇺🇸', greeting: 'Hello!', speechLang: 'en-US', type: 'language' },
  spanish: { label: 'Espanhol', flag: '🇪🇸', greeting: '¡Hola!', speechLang: 'es-ES', type: 'language' },
  french: { label: 'Francês', flag: '🇫🇷', greeting: 'Bonjour !', speechLang: 'fr-FR', type: 'language' },
};

export const MATERIAS = {
  portugues: { label: 'Português' },
  matematica: { label: 'Matemática' },
  historia: { label: 'História' },
  geografia: { label: 'Geografia' },
  ciencias: { label: 'Ciências' },
};

export const DEFAULT_MATERIA = 'portugues';

export const CORE_BOARDS = [
  { id: 'chat', kind: 'chat', subject: 'english' },
  { id: 'quiz', kind: 'quiz', subject: 'english' },
  { id: 'materias', kind: 'materias', subject: 'portugues' },
  { id: 'curiosidades', kind: 'curiosidades', subject: 'curiosidades' },
  { id: 'dialogos', kind: 'dialogos', subject: 'english' },
  { id: 'memoria', kind: 'memoria', subject: 'english' },
];

export const BOARD_PATH = /^\/board\/([a-z0-9-]+)\/?$/;

export function subjectOptions() {
  return Object.entries(SUBJECTS).map(([id, meta]) => ({ id, ...meta }));
}

export function materiaOptions() {
  return Object.entries(MATERIAS).map(([id, meta]) => ({ id, ...meta }));
}

export function normalizeBoards(savedBoards, languages = {}) {
  const saved = Array.isArray(savedBoards) ? savedBoards : [];

  return CORE_BOARDS.map((board) => {
    const stored = saved.find((item) => item?.id === board.id);
    let subject = board.subject;
    if (board.kind === 'materias' && Object.hasOwn(MATERIAS, stored?.subject)) {
      subject = stored.subject;
    } else if (
      board.kind === 'chat' ||
      board.kind === 'quiz' ||
      board.kind === 'dialogos' ||
      board.kind === 'memoria'
    ) {
      if (Object.hasOwn(SUBJECTS, stored?.subject)) subject = stored.subject;
      else if (Object.hasOwn(SUBJECTS, languages[board.id])) subject = languages[board.id];
    }
    return { ...board, subject };
  });
}

export function boardIdFromLocation(pathname) {
  return pathname.match(BOARD_PATH)?.[1] || null;
}

export function boardPath(id) {
  return `/board/${id}`;
}

export function boardSnapshot(board) {
  return { id: board.id, subject: board.subject, kind: board.kind };
}

export function maxLevelForAge(age) {
  if (age === null || age === undefined || age === '') return 'C2';
  const value = Number(age);
  if (!Number.isInteger(value)) return 'C2';
  if (value <= 5) return 'A1';
  if (value <= 10) return 'A2';
  if (value <= 14) return 'B1';
  if (value <= 17) return 'B2';
  return 'C2';
}

const BOARD_LABELS = {
  chat: 'Chat',
  quiz: 'Idiomas',
  materias: 'Matérias',
  curiosidades: 'Curiosidades',
  dialogos: 'Diálogos',
  memoria: 'Memória',
};

const BOARD_DESCRIPTIONS = {
  chat: 'Converse e receba correção',
  quiz: 'Desafios de idiomas',
  materias: 'Exercícios escolares',
  curiosidades: 'Quiz de curiosidades do mundo',
  dialogos: 'Duas pessoas conversando, com perguntas depois',
  memoria: 'Combine palavras com seus significados',
};

const BOARD_CLASSES = {
  chat: 'board-chat',
  quiz: 'board-quiz',
  materias: 'board-materias',
  curiosidades: 'board-curiosidades',
  dialogos: 'board-dialogos',
  memoria: 'board-memoria',
};

export function boardLabel(kind) {
  return BOARD_LABELS[kind] ?? 'Quadro';
}

export function boardDescription(kind) {
  return BOARD_DESCRIPTIONS[kind] ?? '';
}

export function boardClass(kind) {
  return BOARD_CLASSES[kind] ?? 'board-chat';
}
