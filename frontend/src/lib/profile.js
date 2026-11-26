import { AVATAR_GROUPS, normalizeAvatar } from './avatar.js';

export const OBJECTIVES = [
  { id: 'idiomas', label: 'Aprender idiomas' },
  { id: 'escolar', label: 'Reforço escolar' },
  { id: 'curiosidades', label: 'Curiosidades' },
  { id: 'geral', label: 'Praticar um pouco de tudo' },
];

export const SCHOOLING = [
  { id: 'infantil', label: 'Educação infantil' },
  { id: 'fundamental', label: 'Ensino fundamental' },
  { id: 'medio', label: 'Ensino médio' },
  { id: 'superior', label: 'Ensino superior' },
  { id: 'autodidato', label: 'Estudo por conta própria' },
];

export const INTERESTS = [
  { id: 'ciencia', label: 'Ciência' },
  { id: 'espaco', label: 'Espaço' },
  { id: 'natureza', label: 'Natureza' },
  { id: 'historia', label: 'História' },
  { id: 'tecnologia', label: 'Tecnologia' },
  { id: 'cultura', label: 'Cultura' },
];

export const OBJECTIVE_IDS = new Set(OBJECTIVES.map((item) => item.id));
export const SCHOOLING_IDS = new Set(SCHOOLING.map((item) => item.id));
export const INTEREST_IDS = new Set(INTERESTS.map((item) => item.id));
export const AVATAR_OPTION_IDS = new Map(
  AVATAR_GROUPS.map((group) => [group.id, new Set(group.options.map((option) => option.id))])
);

export function suggestSchooling(age) {
  const value = Number(age);
  if (!Number.isFinite(value)) return 'autodidato';
  if (value < 6) return 'infantil';
  if (value < 11) return 'fundamental';
  if (value < 15) return 'medio';
  if (value < 18) return 'medio';
  return 'autodidato';
}

const MASCOT_BY_STAGE = {
  baby: '/img/mascot-baby.svg',
  teen: '/img/mascot-teen.svg',
  adult: '/img/mascot.svg',
};

export function mascotStage(age) {
  const value = Number(age);
  if (!Number.isInteger(value) || value < 3) return 'adult';
  if (value <= 10) return 'baby';
  if (value <= 17) return 'teen';
  return 'adult';
}

export function mascotFor(age) {
  return MASCOT_BY_STAGE[mascotStage(age)];
}

export function cleanText(value, max = 60) {
  return typeof value === 'string' ? value.trim().replace(/\s+/g, ' ').slice(0, max) : '';
}

export function normalizeProfile(saved = {}) {
  const raw = saved && typeof saved === 'object' ? saved : {};
  const age = Number(raw.age);
  const interests = Array.isArray(raw.interests)
    ? raw.interests.filter((id) => INTEREST_IDS.has(id)).slice(0, 3)
    : [];

  return {
    name: cleanText(raw.name),
    age: Number.isInteger(age) && age >= 3 && age <= 100 ? age : null,
    objective: OBJECTIVE_IDS.has(raw.objective) ? raw.objective : 'geral',
    schooling: SCHOOLING_IDS.has(raw.schooling) ? raw.schooling : suggestSchooling(age),
    interests,
    avatar: normalizeAvatar(raw.avatar),
  };
}
