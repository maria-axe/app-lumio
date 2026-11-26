import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { finishPlacement, startPlacement } from '../lib/api.js';
import {
  isPlacementDone,
  placementMaxLevel,
} from '../lib/placement.js';
import { storage } from '../lib/storage.js';
import { useOnboarding } from './OnboardingContext.jsx';
import { useUi } from './UiContext.jsx';

const PlacementContext = createContext(null);

export function PlacementProvider({ children }) {
  const onboarding = useOnboarding();
  const ui = useUi();

  const [records, setRecords] = useState(() => storage.loadPlacement());
  const [visible, setVisible] = useState(false);
  const [boardId, setBoardId] = useState(null);
  const [subject, setSubject] = useState(null);
  const [phase, setPhase] = useState('language');
  const [test, setTest] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [index, setIndex] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [dismissed, setDismissed] = useState(null);

  const controllerRef = useRef(null);

  useEffect(
    () => () => {
      controllerRef.current?.abort();
    },
    []
  );

  const isDone = useCallback(
    (subjectId) => isPlacementDone(records, subjectId, onboarding.profile),
    [records, onboarding.profile]
  );

  const openFor = useCallback((nextBoardId, nextSubject) => {
    controllerRef.current?.abort();
    controllerRef.current = null;
    setBoardId(nextBoardId);
    setSubject(nextSubject);
    setPhase('language');
    setTest(null);
    setAnswers([]);
    setIndex(0);
    setResult(null);
    setError('');
    setDismissed(null);
    setVisible(true);
  }, []);

  const close = useCallback(() => {
    controllerRef.current?.abort();
    controllerRef.current = null;
    setVisible(false);
    setPhase('language');
  }, []);

  const cancel = useCallback(() => {
    setDismissed({ boardId, subject });
    close();
  }, [boardId, close, subject]);

  const clearDismissed = useCallback(() => setDismissed(null), []);

  const selectSubject = useCallback((nextSubject) => {
    setSubject(nextSubject);
    setError('');
  }, []);

  const begin = useCallback(async () => {
    if (!subject) return;

    ui.setBoardSubject(boardId, subject);

    if (isDone(subject)) {
      const record = records[subject];
      ui.setLevel(subject, record.level);
      close();
      return;
    }

    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    setPhase('loading');
    setError('');
    setTest(null);

    try {
      const data = await startPlacement({
        subject,
        profile: onboarding.profile,
        signal: controller.signal,
      });
      if (controllerRef.current !== controller) return;
      setTest(data);
      setAnswers(Array(data.total).fill(null));
      setIndex(0);
      setPhase('test');
    } catch (err) {
      if (err?.name === 'AbortError' || controllerRef.current !== controller) return;
      setError(err.message || 'Erro ao gerar teste de nível');
      setPhase('error');
    } finally {
      if (controllerRef.current === controller) controllerRef.current = null;
    }
  }, [boardId, close, isDone, onboarding.profile, records, subject, ui]);

  const chooseAnswer = useCallback(
    (optionIndex) => {
      setAnswers((current) => {
        const next = [...current];
        next[index] = optionIndex;
        return next;
      });
    },
    [index]
  );

  const submit = useCallback(async () => {
    if (!test || answers.some((answer) => answer === null)) return;

    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    setPhase('loading');
    setError('');

    try {
      const data = await finishPlacement({
        token: test.token,
        answers,
        signal: controller.signal,
      });
      if (controllerRef.current !== controller) return;

      const updated = {
        ...records,
        [data.subject]: {
          level: data.level,
          score: data.score,
          total: data.total,
          version: data.version,
          maxLevel: placementMaxLevel(onboarding.profile),
          testedAt: new Date().toISOString(),
        },
      };
      storage.savePlacement(updated);
      setRecords(updated);
      setDismissed(null);
      ui.setBoardSubject(boardId, data.subject);
      ui.setLevel(data.subject, data.level);
      setResult(data);
      setPhase('result');
    } catch (err) {
      if (err?.name === 'AbortError' || controllerRef.current !== controller) return;
      setError(err.message || 'Erro ao calcular nível');
      setPhase('error');
    } finally {
      if (controllerRef.current === controller) controllerRef.current = null;
    }
  }, [answers, boardId, onboarding.profile, records, test, ui]);

  const next = useCallback(() => {
    if (answers[index] === null) return;
    if (index < answers.length - 1) setIndex((value) => value + 1);
    else submit();
  }, [answers, index, submit]);

  const previous = useCallback(() => {
    setIndex((value) => Math.max(0, value - 1));
  }, []);

  const retry = useCallback(() => {
    if (test && phase === 'error') submit();
    else begin();
  }, [begin, phase, submit, test]);

  const value = useMemo(
    () => ({
      visible,
      boardId,
      subject,
      phase,
      test,
      answers,
      index,
      result,
      error,
      dismissed,
      isDone,
      openFor,
      close,
      cancel,
      clearDismissed,
      selectSubject,
      begin,
      chooseAnswer,
      next,
      previous,
      retry,
    }),
    [
      visible,
      boardId,
      subject,
      phase,
      test,
      answers,
      index,
      result,
      error,
      dismissed,
      isDone,
      openFor,
      close,
      cancel,
      clearDismissed,
      selectSubject,
      begin,
      chooseAnswer,
      next,
      previous,
      retry,
    ]
  );

  return <PlacementContext.Provider value={value}>{children}</PlacementContext.Provider>;
}

export function usePlacement() {
  const context = useContext(PlacementContext);
  if (!context) throw new Error('usePlacement must be used inside PlacementProvider');
  return context;
}
