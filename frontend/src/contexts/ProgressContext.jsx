import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { storage } from '../lib/storage.js';

const ProgressContext = createContext(null);

export const XP_PER_CORRECT = 10;
export const XP_ROUND_BONUS = 5;
export const DEFAULT_DAILY_GOAL = 30;

function dayKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function yesterdayKey() {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return dayKey(date);
}

function intOr(value, fallback) {
  return Number.isFinite(value) ? value : fallback;
}

function createSubjectState(saved = {}) {
  return {
    xp: intOr(saved.xp, 0),
    streak: intOr(saved.streak, 0),
    lastActiveDate: typeof saved.lastActiveDate === 'string' ? saved.lastActiveDate : null,
    dailyGoal:
      Number.isFinite(saved.dailyGoal) && saved.dailyGoal > 0
        ? saved.dailyGoal
        : DEFAULT_DAILY_GOAL,
    todayXp: intOr(saved.todayXp, 0),
    todayDate: typeof saved.todayDate === 'string' ? saved.todayDate : null,
  };
}

function syncSubjectState(state) {
  const today = dayKey(new Date());
  let changed = false;
  let next = state;

  if (next.todayDate !== today) {
    next = { ...next, todayDate: today, todayXp: 0 };
    changed = true;
  }

  if (
    next.lastActiveDate &&
    next.lastActiveDate !== today &&
    next.lastActiveDate !== yesterdayKey() &&
    next.streak !== 0
  ) {
    next = { ...next, streak: 0 };
    changed = true;
  }

  return { state: next, changed };
}

function syncAll(source) {
  let changed = false;
  const subjects = {};

  for (const [key, value] of Object.entries(source)) {
    const result = syncSubjectState(value);
    subjects[key] = result.state;
    if (result.changed) changed = true;
  }

  return { subjects, changed };
}

function buildInitialSubjects(saved) {
  const savedSubjects = saved?.subjects && typeof saved.subjects === 'object' ? saved.subjects : {};
  const legacy =
    saved && !saved.subjects && (saved.xp || saved.streak || saved.todayXp) ? saved : null;
  const subjects = {};

  for (const [key, value] of Object.entries(savedSubjects)) {
    subjects[key] = createSubjectState(value);
  }

  if (legacy && !subjects.english) subjects.english = createSubjectState(legacy);
  return subjects;
}

export function ProgressProvider({ children }) {
  const [saved] = useState(() => storage.loadProgress() || {});
  const [subjects, setSubjects] = useState(() => buildInitialSubjects(saved));
  const subjectsRef = useRef(subjects);
  const legacyRef = useRef(
    saved && !saved.subjects && (saved.xp || saved.streak || saved.todayXp) ? saved : null
  );

  const commit = useCallback((next) => {
    subjectsRef.current = next;
    setSubjects(next);
    storage.saveProgress({ subjects: next });
  }, []);

  const state = useCallback(
    (subject) =>
      subjects[subject] ??
      createSubjectState(subject === 'english' && legacyRef.current ? legacyRef.current : {}),
    [subjects]
  );

  const totals = useMemo(() => {
    const values = Object.values(subjects);
    const xp = values.reduce((sum, item) => sum + item.xp, 0);
    const streak = values.reduce((max, item) => Math.max(max, item.streak), 0);
    const todayXp = values.reduce((sum, item) => sum + item.todayXp, 0);
    const dailyGoal = values.reduce((sum, item) => sum + item.dailyGoal, 0) || DEFAULT_DAILY_GOAL;
    return {
      xp,
      streak,
      todayXp,
      dailyGoal,
      goalProgress: (Math.min(todayXp, dailyGoal) / dailyGoal) * 100,
      goalReached: todayXp >= dailyGoal,
    };
  }, [subjects]);

  const subjectGoalReached = useCallback(
    (subject) => {
      const current = state(subject);
      return current.todayXp >= current.dailyGoal;
    },
    [state]
  );

  const sync = useCallback(() => {
    const result = syncAll(subjectsRef.current);
    if (result.changed) commit(result.subjects);
  }, [commit]);

  const addXp = useCallback(
    (subject, amount) => {
      if (!subject || !Number.isFinite(amount) || amount <= 0) return;

      const base = syncAll(subjectsRef.current).subjects;
      const current =
        base[subject] ??
        createSubjectState(subject === 'english' && legacyRef.current ? legacyRef.current : {});
      const next = {
        ...base,
        [subject]: {
          ...current,
          xp: current.xp + amount,
          todayXp: current.todayXp + amount,
        },
      };
      commit(next);
    },
    [commit]
  );

  const registerPractice = useCallback(
    (subject) => {
      if (!subject) return;

      const synced = syncAll(subjectsRef.current);
      const base = synced.subjects;
      const current =
        base[subject] ??
        createSubjectState(subject === 'english' && legacyRef.current ? legacyRef.current : {});
      const today = dayKey(new Date());
      if (current.lastActiveDate === today) {
        if (synced.changed) commit(base);
        return;
      }

      const next = {
        ...base,
        [subject]: {
          ...current,
          streak: current.lastActiveDate === yesterdayKey() ? current.streak + 1 : 1,
          lastActiveDate: today,
        },
      };
      commit(next);
    },
    [commit]
  );

  useEffect(() => {
    sync();
  }, [sync]);

  const value = useMemo(
    () => ({
      subjects,
      state,
      ...totals,
      subjectGoalReached,
      sync,
      addXp,
      registerPractice,
    }),
    [
      subjects,
      state,
      totals,
      subjectGoalReached,
      sync,
      addXp,
      registerPractice,
    ]
  );

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress() {
  const context = useContext(ProgressContext);
  if (!context) throw new Error('useProgress must be used inside ProgressProvider');
  return context;
}
