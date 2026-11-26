import { maxLevelForAge } from './constants.js';

export const PLACEMENT_VERSION = 1;

export const LANGUAGE_BOARDS = new Set(['chat', 'quiz', 'dialogos', 'memoria']);

export function isLanguageBoard(boardId) {
  return LANGUAGE_BOARDS.has(boardId);
}

export function placementMaxLevel(profile) {
  return maxLevelForAge(profile?.age);
}

export function isPlacementDone(records, subject, profile) {
  const record = records?.[subject];
  return Boolean(
    record &&
      record.version === PLACEMENT_VERSION &&
      record.maxLevel === placementMaxLevel(profile) &&
      typeof record.level === 'string'
  );
}
