import { useCallback, useEffect, useRef, useState } from 'react';
import { sendMaterias } from '../lib/api.js';
import { playCorrect, playWrong, playWin } from '../lib/sound.js';
import { XP_PER_CORRECT, XP_ROUND_BONUS } from '../contexts/ProgressContext.jsx';
import { useOnboarding } from '../contexts/OnboardingContext.jsx';
import { useProgress } from '../contexts/ProgressContext.jsx';
import { useUi } from '../contexts/UiContext.jsx';
import {
  ErrorState,
  Feedback,
  LoadingState,
  MascotBubble,
  Options,
  RoundProgress,
  RoundResult,
} from './BoardUi.jsx';

const ROUND_SIZE = 5;

export default function MateriasBoard({ subject: initialSubject, clearSignal = 0 }) {
  const onboarding = useOnboarding();
  const ui = useUi();
  const progress = useProgress();

  const subject = initialSubject;
  const materiaMeta = ui.materia(subject);

  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState([]);
  const [correctIndex, setCorrectIndex] = useState(-1);
  const [translation, setTranslation] = useState('');
  const [explanation, setExplanation] = useState('');
  const [selected, setSelected] = useState(null);
  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [current, setCurrent] = useState(0);
  const [answered, setAnswered] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [roundXp, setRoundXp] = useState(0);
  const [xpGain, setXpGain] = useState(0);

  const askedRef = useRef([]);
  const controllerRef = useRef(null);
  const startRoundRef = useRef(null);
  const subjectRef = useRef(subject);

  const isCorrect = selected === correctIndex;
  const accuracy = Math.round((score / ROUND_SIZE) * 100);

  const loadQuestion = useCallback(async () => {
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
    setTranslation('');
    setExplanation('');

    try {
      const data = await sendMaterias({
        subject,
        asked: askedRef.current.slice(-20),
        profile: onboarding.profile,
        signal: controller.signal,
      });
      if (controllerRef.current !== controller) return;

      setQuestion(data.question || '');
      setOptions(Array.isArray(data.options) ? data.options : []);
      setCorrectIndex(Number.isInteger(data.correctIndex) ? data.correctIndex : -1);
      setTranslation(data.translation || '');
      setExplanation(data.explanation || '');
      if (data.question) askedRef.current = [...askedRef.current, data.question].slice(-20);
      setCurrent((value) => value + 1);
    } catch (err) {
      if (err?.name === 'AbortError' || controllerRef.current !== controller) return;
      setError(err.message || 'Erro ao gerar exercício');
    } finally {
      if (controllerRef.current === controller) {
        controllerRef.current = null;
        setLoading(false);
      }
    }
  }, [onboarding.profile, subject]);

  const startRound = useCallback(() => {
    setCurrent(0);
    setAnswered(0);
    setScore(0);
    setRoundXp(0);
    setXpGain(0);
    setFinished(false);
    askedRef.current = [];
    loadQuestion();
  }, [loadQuestion]);
  startRoundRef.current = startRound;

  useEffect(() => {
    startRoundRef.current?.();
  }, []);

  useEffect(() => {
    if (clearSignal > 0) startRoundRef.current?.();
  }, [clearSignal]);

  useEffect(() => {
    if (subjectRef.current !== subject) {
      subjectRef.current = subject;
      startRound();
    }
  }, [subject, startRound]);

  useEffect(() => () => controllerRef.current?.abort(), []);

  const check = () => {
    if (selected === null || checked || loading) return;
    setChecked(true);
    setAnswered((value) => value + 1);
    if (isCorrect) {
      setScore((value) => value + 1);
      setRoundXp((value) => value + XP_PER_CORRECT);
      setXpGain(XP_PER_CORRECT);
      progress.addXp(subject, XP_PER_CORRECT);
      playCorrect(ui.sound);
    } else {
      playWrong(ui.sound);
    }
  };

  const next = async () => {
    if (finished) return;
    if (current >= ROUND_SIZE) {
      setRoundXp((value) => value + XP_ROUND_BONUS);
      progress.addXp(subject, XP_ROUND_BONUS);
      progress.registerPractice(subject);
      setFinished(true);
      playWin(ui.sound);
      return;
    }
    await loadQuestion();
  };

  return (
    <div className="flex flex-col min-h-0 flex-1">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-3 sm:px-5 py-3 border-b-2 border-duo-border dark:border-duo-border-dark">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-duo-blue/15 border-2 border-duo-blue/30 flex items-center justify-center overflow-hidden shrink-0">
            <img src={onboarding.mascot} alt="" width="36" height="36" className="w-7 h-7 mascot" />
          </div>
          <div className="min-w-0">
            <p className="font-extrabold leading-tight">Matérias · {materiaMeta.label}</p>
            <p className="text-xs font-semibold text-duo-text/50 dark:text-duo-text-dark/50">Ensino fundamental</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto min-w-0">
          <div className="flex flex-wrap justify-start sm:justify-end gap-1 flex-1 min-w-0 rounded-xl border-2 border-duo-border dark:border-duo-border-dark bg-white/60 dark:bg-duo-surface-dark/60 p-1" role="group" aria-label="Matéria">
            {ui.materias.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => ui.setBoardSubject(ui.activeBoard, item.id)}
                aria-pressed={subject === item.id}
                title={item.label}
                className={`px-2 py-1 rounded-lg text-[11px] font-extrabold leading-none transition-colors ${
                  subject === item.id
                    ? 'bg-duo-blue text-white'
                    : 'text-duo-text/60 dark:text-duo-text-dark/60 hover:text-duo-blue'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <button type="button" onClick={ui.closeBoard} title="Voltar aos quadros" aria-label="Voltar aos quadros" className="btn-3d icon-btn w-9 h-9 ml-auto sm:ml-0 flex items-center justify-center rounded-xl border-2 border-duo-border dark:border-duo-border-dark text-duo-text dark:text-duo-text-dark hover:text-duo-red hover:border-duo-red/60">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      </header>

      <RoundProgress subject={subject} current={current} answered={answered} total={ROUND_SIZE} label={materiaMeta.label} />

      <main className="flex-1 overflow-y-auto scroll-area px-4 sm:px-5 py-4 bg-[#FCFCFC] dark:bg-duo-bg-dark transition-colors">
        <div className="mx-auto w-full max-w-3xl h-full flex flex-col">
          {loading && (
            <LoadingState
              mascot={onboarding.mascot}
              title="Gerando exercício..."
              hint={`Preparando questões de ${materiaMeta.label}.`}
            />
          )}

          {!loading && error && <ErrorState error={error} onRetry={loadQuestion} />}

          {!loading && !error && finished && (
            <RoundResult
              score={score}
              total={ROUND_SIZE}
              roundXp={roundXp}
              subject={subject}
              accuracy={accuracy}
              onRestart={startRound}
            />
          )}

          {!loading && !error && !finished && question && (
            <div className="space-y-4">
              <MascotBubble mascot={onboarding.mascot}>{question}</MascotBubble>
              <Options
                options={options}
                selected={selected}
                checked={checked}
                correctIndex={correctIndex}
                onChoose={(index) => {
                  if (loading || checked) return;
                  setSelected(index);
                }}
              />
            </div>
          )}
        </div>
      </main>

      {!loading && !error && !finished && question && (
        <Feedback
          checked={checked}
          isCorrect={isCorrect}
          explanation={explanation}
          noteLabel="Observação"
          note={translation}
          xpGain={xpGain}
          checkDisabled={selected === null}
          onCheck={check}
          onNext={next}
          nextLabel={current >= ROUND_SIZE ? 'Ver resultado' : 'Continuar'}
        />
      )}
    </div>
  );
}
