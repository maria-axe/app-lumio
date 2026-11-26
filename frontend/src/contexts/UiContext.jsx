import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { storage } from '../lib/storage.js';
import { useOnboarding } from './OnboardingContext.jsx';
import {
  DEFAULT_LEVEL,
  DEFAULT_MATERIA,
  DEFAULT_SUBJECT,
  LEVELS,
  LEVEL_ORDER,
  MATERIAS,
  SUBJECTS,
  boardIdFromLocation,
  boardPath,
  boardSnapshot,
  materiaOptions,
  maxLevelForAge,
  normalizeBoards,
  subjectOptions,
} from '../lib/constants.js';

const UiContext = createContext(null);

function savedAge(profile) {
  if (profile?.age === null || profile?.age === undefined || profile?.age === '') return null;
  const age = Number(profile.age);
  return Number.isInteger(age) ? age : null;
}

export function UiProvider({ children }) {
  const { profile } = useOnboarding();

  const [boards, setBoards] = useState(() => {
    const normalized = normalizeBoards(storage.loadBoards?.(), storage.loadLanguages?.());
    storage.saveBoards?.(normalized);
    return normalized;
  });
  const [levels, setLevels] = useState(() => storage.loadLevels() || {});
  const [theme, setTheme] = useState(() =>
    document.documentElement.classList.contains('dark') ? 'dark' : 'light'
  );
  const [sound, setSound] = useState(() => storage.loadSound());
  const [lastBoardId, setLastBoardId] = useState(() => storage.loadLastBoard?.() ?? null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(() => storage.loadSidebarOpen());

  const [initialBoard] = useState(() => {
    const id = boardIdFromLocation(window.location.pathname);
    if (id && !boards.some((board) => board.id === id)) {
      window.history.replaceState({}, '', '/');
      return null;
    }
    return boards.find((board) => board.id === id) ?? null;
  });

  const [activeBoard, setActiveBoard] = useState(() =>
    initialBoard ? boardSnapshot(initialBoard) : null
  );
  const [route, setRoute] = useState(initialBoard ? 'board' : 'home');

  const maxLevel = useMemo(() => maxLevelForAge(savedAge(profile)), [profile]);

  const levelAllowed = useCallback(
    (level) => {
      const index = LEVEL_ORDER.indexOf(level);
      return index >= 0 && index <= LEVEL_ORDER.indexOf(maxLevel);
    },
    [maxLevel]
  );

  const levelOptions = useMemo(
    () => LEVELS.map((level) => ({ ...level, allowed: levelAllowed(level.id) })),
    [levelAllowed]
  );

  const level = useCallback(
    (subject) => {
      const current = Object.hasOwn(levels, subject) ? levels[subject] : DEFAULT_LEVEL;
      return levelAllowed(current) ? current : maxLevel;
    },
    [levels, levelAllowed, maxLevel]
  );

  const subject = useCallback(
    (id) => (Object.hasOwn(SUBJECTS, id) ? SUBJECTS[id] : SUBJECTS[DEFAULT_SUBJECT]),
    []
  );

  const materia = useCallback(
    (id) => (Object.hasOwn(MATERIAS, id) ? MATERIAS[id] : MATERIAS[DEFAULT_MATERIA]),
    []
  );

  const setLevel = useCallback(
    (subjectId, nextLevel) => {
      if (!Object.hasOwn(SUBJECTS, subjectId) || !levelAllowed(nextLevel)) return;
      setLevels((current) => {
        const updated = { ...current, [subjectId]: nextLevel };
        storage.saveLevels(updated);
        return updated;
      });
    },
    [levelAllowed]
  );

  const setBoardSubject = useCallback(
    (boardOrId, subjectId) => {
      const id = typeof boardOrId === 'string' ? boardOrId : boardOrId?.id;
      const board = boards.find((item) => item.id === id);
      if (!board) return;

      const registry = board.kind === 'materias' ? MATERIAS : SUBJECTS;
      if (!Object.hasOwn(registry, subjectId)) return;

      const updated = boards.map((item) =>
        item.id === id ? { ...item, subject: subjectId } : item
      );
      setBoards(updated);
      storage.saveBoards?.(updated);
      setActiveBoard((current) =>
        current?.id === id ? { ...current, subject: subjectId } : current
      );
    },
    [boards]
  );

  const syncFromLocation = useCallback(() => {
    const id = boardIdFromLocation(window.location.pathname);
    const board = id ? boards.find((item) => item.id === id) : null;
    if (id && !board) window.history.replaceState({}, '', '/');

    setRoute(board ? 'board' : 'home');
    setActiveBoard(board ? boardSnapshot(board) : null);
    setMobileMenuOpen(false);
    window.scrollTo(0, 0);
  }, [boards]);

  const openBoard = useCallback(
    (boardOrId) => {
      const id = typeof boardOrId === 'string' ? boardOrId : boardOrId?.id;
      const board = boards.find((item) => item.id === id);
      if (!board) return;

      if (boardIdFromLocation(window.location.pathname) !== board.id) {
        window.history.pushState({}, '', boardPath(board.id));
      }
      setLastBoardId(board.id);
      storage.saveLastBoard?.(board.id);
      syncFromLocation();
    },
    [boards, syncFromLocation]
  );

  const goHome = useCallback(() => {
    if (window.location.pathname !== '/') window.history.replaceState({}, '', '/');
    syncFromLocation();
  }, [syncFromLocation]);

  const closeBoard = goHome;

  const closeMobileMenu = useCallback(() => setMobileMenuOpen(false), []);
  const toggleMobileMenu = useCallback(() => setMobileMenuOpen((open) => !open), []);

  const openSidebar = useCallback(() => setSidebarOpen(true), []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  const toggleSound = useCallback(() => {
    setSound((current) => {
      const next = !current;
      storage.saveSound(next);
      return next;
    });
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((current) => {
      const next = current === 'dark' ? 'light' : 'dark';
      storage.saveTheme(next);
      return next;
    });
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  useEffect(() => {
    storage.saveSidebarOpen(sidebarOpen);
  }, [sidebarOpen]);

  useEffect(() => {
    const onPopState = () => syncFromLocation();
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [syncFromLocation]);

  const value = useMemo(
    () => ({
      subjects: subjectOptions(),
      materias: materiaOptions(),
      boards,
      levels,
      theme,
      sound,
      activeBoard,
      route,
      lastBoardId,
      mobileMenuOpen,
      sidebarOpen,
      maxLevel,
      levelOptions,

      get continueBoard() {
        return boards.find((board) => board.id === lastBoardId) || boards[0];
      },

      subject,
      materia,
      level,
      levelAllowed,
      setLevel,
      setBoardSubject,
      syncFromLocation,
      openBoard,
      goHome,
      closeBoard,
      closeMobileMenu,
      toggleMobileMenu,
      openSidebar,
      closeSidebar,
      toggleSound,
      toggleTheme,
    }),
    [
      boards,
      levels,
      theme,
      sound,
      activeBoard,
      route,
      lastBoardId,
      mobileMenuOpen,
      sidebarOpen,
      maxLevel,
      levelOptions,
      subject,
      materia,
      level,
      levelAllowed,
      setLevel,
      setBoardSubject,
      syncFromLocation,
      openBoard,
      goHome,
      closeBoard,
      closeMobileMenu,
      toggleMobileMenu,
      openSidebar,
      closeSidebar,
      toggleSound,
      toggleTheme,
    ]
  );

  return <UiContext.Provider value={value}>{children}</UiContext.Provider>;
}

export function useUi() {
  const context = useContext(UiContext);
  if (!context) throw new Error('useUi must be used inside UiProvider');
  return context;
}
