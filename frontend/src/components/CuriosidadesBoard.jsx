import { useCallback, useEffect, useRef, useState } from 'react';
import { sendCuriosidade } from '../lib/api.js';
import { playCorrect, playWrong, playWin } from '../lib/sound.js';
import { XP_PER_CORRECT } from '../contexts/ProgressContext.jsx';
import { useOnboarding } from '../contexts/OnboardingContext.jsx';
import { useProgress } from '../contexts/ProgressContext.jsx';
import { useUi } from '../contexts/UiContext.jsx';
import {
  ErrorState,
  Feedback,
  LoadingState,
  MascotBubble,
  Options,
  RoundResult,
} from './BoardUi.jsx';

const ROUND_SIZE = 10;
const SUBJECT = 'curiosidades';

export default function CuriosidadesBoard({ clearSignal = 0 }) {
  const onboarding = useOnboarding();
  const progress = useProgress();
  const ui = useUi();

  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState([]);
  const [correctIndex, setCorrectIndex] = useState(-1);
  const [explanation, setExplanation] = useState('');
  const [category, setCategory] = useState('');
  const [selected, setSelected] = useState(null);
  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(0);
  const [roundXp, setRoundXp] = useState(0);
  const [xpGain, setXpGain] = useState(0);
  const [finished, setFinished] = useState(false);

  const askedRef = useRef([]);
  const controllerRef = useRef(null);
  const startRoundRef = useRef(null);

  const isCorrect = selected === correctIndex;
  const accuracy = answered ? Math.round((score / answered) * 100) : 0;

  const load = useCallback(async () => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    setLoading(true);
    setError('');
    setChecked(false);
    setSelected(null);
    setXpGain(0);
    setQuestion('');
    setOptions([]);
    setCorrectIndex(-1);
    setExplanation('');
    setCategory('');

    try {
      const data = await sendCuriosidade({
        asked: askedRef.current.slice(-20),
        profile: onboarding.profile,
        signal: controller.signal,
      });
      if (controllerRef.current !== controller) return;

      setQuestion(data.question || '');
      setOptions(Array.isArray(data.options) ? data.options : []);
      setCorrectIndex(Number.isInteger(data.correctIndex) ? data.correctIndex : -1);
      setExplanation(data.explanation || '');
      setCategory(data.category || '');
      if (data.question) askedRef.current = [...askedRef.current, data.question].slice(-20);
      setCurrent((value) => value + 1);
    } catch (err) {
      if (err?.name === 'AbortError' || controllerRef.current !== controller) return;
      setError(err.message || 'Erro ao gerar curiosidade');
    } finally {
      if (controllerRef.current === controller) {
        controllerRef.current = null;
        setLoading(false);
      }
    }
  }, [onboarding.profile]);

  const startRound = useCallback(() => {
    setCurrent(0);
    setScore(0);
    setAnswered(0);
    setXpGain(0);
    setRoundXp(0);
    setFinished(false);
    askedRef.current = [];
    load();
  }, [load]);
  startRoundRef.current = startRound;

  useEffect(() => {
    startRoundRef.current?.();
  }, []);

  useEffect(() => {
    if (clearSignal > 0) startRoundRef.current?.();
  }, [clearSignal]);

  useEffect(() => () => controllerRef.current?.abort(), []);

  const check = () => {
    if (selected === null || checked || loading || finished) return;
    setChecked(true);
    setAnswered((value) => value + 1);
    setXpGain(0);
    progress.registerPractice(SUBJECT);
    if (isCorrect) {
      setScore((value) => value + 1);
      setXpGain(XP_PER_CORRECT);
      setRoundXp((value) => value + XP_PER_CORRECT);
      progress.addXp(SUBJECT, XP_PER_CORRECT);
      playCorrect(ui.sound);
    } else {
      playWrong(ui.sound);
    }
  };

  const next = async () => {
    if (!checked || loading || finished) return;
    if (current >= ROUND_SIZE) {
      setFinished(true);
      playWin(ui.sound);
      return;
    }
    await load();
  };

  return (
    <div className="flex flex-col min-h-0 flex-1">
      <main className="flex-1 overflow-y-auto scroll-area px-4 sm:px-5 py-4 bg-[#FCFCFC] dark:bg-duo-bg-dark transition-colors">
        <div className="mx-auto w-full max-w-3xl space-y-4">
          {!finished && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                {category && (
                  <span className="text-xs font-extrabold uppercase tracking-wide text-duo-blue">{category}</span>
                )}
                <span className="text-xs font-bold text-duo-text/50 dark:text-duo-text-dark/50 ml-auto">
                  {answered}/{ROUND_SIZE} respondidas · {score} acertos
                </span>
              </div>
              <div
                className="h-3.5 rounded-full bg-duo-border dark:bg-duo-border-dark overflow-hidden transition-shadow duration-300"
                role="progressbar"
                aria-label="Progresso de curiosidades"
                aria-valuemin={0}
                aria-valuemax={ROUND_SIZE}
                aria-valuenow={answered}
              >
                <div
                  className={`bar-fill h-full rounded-full transition-[width,background-color] duration-500 ease-out ${answered > 0 ? 'bg-duo-green' : 'bg-duo-blue'}`}
                  style={{ width: `${(answered / ROUND_SIZE) * 100}%` }}
                />
              </div>
            </div>
          )}

          {!finished && loading && (
            <LoadingState
              mascot={onboarding.mascot}
              title="Buscando uma curiosidade..."
              hint="Pode levar alguns segundos."
            />
          )}

          {!finished && !loading && error && <ErrorState error={error} onRetry={load} />}

          {!finished && !loading && !error && question && (
            <div className="space-y-4">
              <MascotBubble mascot={onboarding.mascot}>{question}</MascotBubble>
              <Options
                options={options}
                selected={selected}
                checked={checked}
                correctIndex={correctIndex}
                onChoose={(index) => {
                  if (loading || checked || finished) return;
                  setSelected(index);
                }}
              />
            </div>
          )}

          {finished && (
            <RoundResult
              score={score}
              total={ROUND_SIZE}
              roundXp={roundXp}
              subject={SUBJECT}
              accuracy={accuracy}
              variant="accuracy"
              onRestart={startRound}
            />
          )}
        </div>
      </main>

      {!finished && !loading && !error && question && (
        <Feedback
          checked={checked}
          isCorrect={isCorrect}
          explanation={explanation}
          noteLabel="A curiosidade"
          xpGain={xpGain}
          checkDisabled={selected === null}
          onCheck={check}
          onNext={next}
          nextLabel={current >= ROUND_SIZE ? 'Ver resultado' : 'Próxima pergunta'}
          noteBlock
        />
      )}
    </div>
  );
}
