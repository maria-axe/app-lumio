import { useCallback, useEffect, useRef, useState } from 'react';
import { sendQuiz } from '../lib/api.js';
import { canSpeak, playCorrect, playWrong, playWin, speak, stopSpeaking } from '../lib/sound.js';
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

export default function QuizBoard({ subject: initialSubject, clearSignal = 0 }) {
  const onboarding = useOnboarding();
  const ui = useUi();
  const progress = useProgress();

  const subject = initialSubject;
  const level = ui.level(subject);
  const subjectMeta = ui.subject(subject);
  const audioSupported = canSpeak();
  const isListening = subjectMeta.type !== 'general';

  const [question, setQuestion] = useState('');
  const [audio, setAudio] = useState('');
  const [options, setOptions] = useState([]);
  const [correctIndex, setCorrectIndex] = useState(-1);
  const [translation, setTranslation] = useState('');
  const [explanation, setExplanation] = useState('');
  const [selected, setSelected] = useState(null);
  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [roundXp, setRoundXp] = useState(0);
  const [xpGain, setXpGain] = useState(0);

  const askedRef = useRef([]);
  const controllerRef = useRef(null);
  const startedRef = useRef(false);
  const startRoundRef = useRef(null);
  const levelRef = useRef(level);
  const subjectRef = useRef(subject);

  const isCorrect = selected === correctIndex;
  const accuracy = Math.round((score / ROUND_SIZE) * 100);

  const speakAudio = useCallback(
    (text = audio) => {
      if (!isListening || !text || !audioSupported) return;
      speak(text, subjectMeta.speechLang || 'en-US', ui.sound);
    },
    [audio, audioSupported, isListening, subjectMeta.speechLang, ui.sound]
  );

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
    setAudio('');
    setOptions([]);
    setCorrectIndex(-1);
    setTranslation('');
    setExplanation('');
    stopSpeaking();

    try {
      const data = await sendQuiz({
        level,
        subject,
        asked: askedRef.current.slice(-20),
        profile: onboarding.profile,
        signal: controller.signal,
      });
      if (controllerRef.current !== controller) return;

      setQuestion(data.question || '');
      setAudio(data.audio || '');
      setOptions(Array.isArray(data.options) ? data.options : []);
      setCorrectIndex(Number.isInteger(data.correctIndex) ? data.correctIndex : -1);
      setTranslation(data.translation || '');
      setExplanation(data.explanation || '');
      if (data.question) askedRef.current = [...askedRef.current, data.question].slice(-20);
      setCurrent((value) => value + 1);
      if (isListening && data.audio) speakAudio(data.audio);
    } catch (err) {
      if (err?.name === 'AbortError' || controllerRef.current !== controller) return;
      setError(err.message || 'Erro ao gerar desafio');
    } finally {
      if (controllerRef.current === controller) {
        controllerRef.current = null;
        setLoading(false);
      }
    }
  }, [isListening, level, onboarding.profile, speakAudio, subject]);

  const startRound = useCallback(() => {
    setCurrent(0);
    setScore(0);
    setRoundXp(0);
    setXpGain(0);
    setFinished(false);
    loadQuestion();
  }, [loadQuestion]);
  startRoundRef.current = startRound;

  useEffect(() => {
    startedRef.current = true;
    startRoundRef.current?.();
  }, []);

  useEffect(() => {
    if (clearSignal > 0) {
      askedRef.current = [];
      startRoundRef.current?.();
    }
  }, [clearSignal]);

  useEffect(() => {
    if (levelRef.current !== level) {
      levelRef.current = level;
      if (startedRef.current) startRound();
    }
  }, [level, startRound]);

  useEffect(() => {
    if (subjectRef.current !== subject) {
      subjectRef.current = subject;
      askedRef.current = [];
      stopSpeaking();
      if (startedRef.current) startRound();
    }
  }, [subject, startRound]);

  useEffect(
    () => () => {
      controllerRef.current?.abort();
      stopSpeaking();
    },
    []
  );

  const check = () => {
    if (selected === null || checked || loading) return;
    setChecked(true);
    stopSpeaking();
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
            <p className="font-extrabold leading-tight">Idiomas · {subjectMeta.label}</p>
            <p className="text-xs font-semibold text-duo-text/50 dark:text-duo-text-dark/50">Nível: {level}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto min-w-0">
          {isListening && (
            <div className="relative flex-1 sm:flex-none min-w-[7rem]">
              <select
                value={level}
                onChange={(event) => ui.setLevel(subject, event.target.value)}
                aria-label="Nível"
                className="w-full sm:w-auto appearance-none bg-white dark:bg-duo-surface-dark border-2 border-duo-border dark:border-duo-border-dark rounded-xl px-2.5 py-1.5 pr-7 text-xs font-extrabold uppercase tracking-wide"
              >
                {ui.levelOptions.map((option) => (
                  <option key={option.id} value={option.id} disabled={!option.allowed}>
                    {option.label}
                  </option>
                ))}
              </select>
              <svg className="absolute right-1.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="m6 9 6 6 6-6" />
              </svg>
            </div>
          )}
          {isListening && (
            <div className="flex items-center gap-1 p-1 rounded-xl border-2 border-duo-border dark:border-duo-border-dark bg-white/60 dark:bg-duo-surface-dark/60">
              {ui.subjects.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => ui.setBoardSubject(ui.activeBoard, item.id)}
                  title={item.label}
                  aria-label={item.label}
                  aria-pressed={subject === item.id}
                  disabled={item.type === 'general'}
                  className={`flex items-center gap-1 px-1.5 py-1 rounded-lg border border-transparent hover:border-duo-blue/40 transition disabled:opacity-40 ${
                    subject === item.id ? 'bg-duo-blue/15 border-duo-blue/50' : ''
                  }`}
                >
                  <span>{item.flag || ''}</span>
                </button>
              ))}
            </div>
          )}
          <button type="button" onClick={ui.closeBoard} title="Voltar aos quadros" aria-label="Voltar aos quadros" className="btn-3d icon-btn w-9 h-9 flex items-center justify-center rounded-xl border-2 border-duo-border dark:border-duo-border-dark text-duo-text dark:text-duo-text-dark hover:text-duo-red hover:border-duo-red/60">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      </header>

      <RoundProgress subject={subject} current={current} total={ROUND_SIZE} label={subjectMeta.label} />

      <main className="flex-1 overflow-y-auto scroll-area px-4 sm:px-5 py-4 bg-[#FCFCFC] dark:bg-duo-bg-dark transition-colors">
        <div className="mx-auto w-full max-w-3xl h-full flex flex-col">
          {loading && (
            <LoadingState
              mascot={onboarding.mascot}
              title="Gerando desafio..."
              hint="O mascote está preparando uma pergunta."
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
              showConfetti={score === ROUND_SIZE || progress.subjectGoalReached(subject)}
            />
          )}

          {!loading && !error && !finished && question && (
            <div className="space-y-4">
              <MascotBubble mascot={onboarding.mascot}>{question}</MascotBubble>

              {audio && (
                <button
                  type="button"
                  onClick={() => speakAudio()}
                  disabled={!audioSupported}
                  data-action="speak"
                  title={audioSupported ? 'Ouvir novamente' : 'Áudio não disponível neste navegador'}
                  aria-label="Ouvir a frase"
                  className="btn-action w-full flex items-center justify-center gap-3 rounded-2xl bg-duo-blue text-white border-b-4 border-duo-blue-dark px-6 py-4 hover:brightness-105 active:border-b-0 active:translate-y-1 transition disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:brightness-100 disabled:active:translate-y-0"
                >
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M11 5 6 9H2v6h4l5 4V5Z" />
                    <path d="M15.5 8.5a5 5 0 0 1 0 7" />
                    <path d="M18.5 5.5a9 9 0 0 0 0 13" />
                  </svg>
                  <span className="font-extrabold uppercase tracking-wide text-sm">
                    {audioSupported ? 'Ouvir' : 'Áudio indisponível'}
                  </span>
                </button>
              )}

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
          noteLabel="Tradução"
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
