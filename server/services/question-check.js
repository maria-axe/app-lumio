const ACCENT_PATTERNS = {
  agudo: /[áéíóúýÁÉÍÓÚÝ]/,
  grave: /[àìòùÀÌÒÙ]/,
  circunflexo: /[âêôÂÊÔ]/,
  til: /[ãõÃÕ]/,
};

function stripDiacritics(value) {
  return typeof value === 'string'
    ? value.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()
    : '';
}

function hasDiacritic(value) {
  return typeof value === 'string' && /\p{M}/u.test(value.normalize('NFD'));
}

function detectAccentKind(question) {
  const text = stripDiacritics(question);

  if (/acento agudo|agudo/.test(text)) return 'agudo';
  if (/acento grave|grave/.test(text)) return 'grave';
  if (/acento circunflexo|circunflexo/.test(text)) return 'circunflexo';
  if (/acento de til|acento til|\btil\b/.test(text)) return 'til';
  if (/sem acento|nao tem acento/.test(text)) return 'none';
  if (/(?:tem|possui|apresenta|contem)\s+(?:algum\s+)?acento/.test(text)) return 'any';

  return null;
}

function matchesKind(word, kind) {
  if (kind === 'none') return !hasDiacritic(word);
  if (kind === 'any') return hasDiacritic(word);
  return ACCENT_PATTERNS[kind].test(word);
}

/**
 * Valida perguntas do tipo "Qual palavra tem acento agudo?".
 * Exige uma única alternativa compatível e que `correctIndex` aponte para ela.
 */
export function isAccentQuestionValid(question, options, correctIndex) {
  const kind = detectAccentKind(question);
  if (!kind) return true;
  if (!Array.isArray(options) || !Number.isInteger(correctIndex)) return false;

  const matches = options.map((option) => matchesKind(option, kind));
  return matches.filter(Boolean).length === 1 && matches[correctIndex] === true;
}

const BROKEN_PORTUGUESE_PATTERNS = [
  /\bsobre\s+(?:a\s+)?nature\b/i,
  /\btema\s+(?:de\s+)?nature\b/i,
];

/** Rejeita instruções em português com anglicismos como "sobre a nature". */
export function isQuestionWordingValid(question) {
  if (typeof question !== 'string') return false;
  if (/\.\.\.|…/.test(question)) return false;
  return !BROKEN_PORTUGUESE_PATTERNS.some((pattern) => pattern.test(question));
}
