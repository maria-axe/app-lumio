import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { sendDialogo } from '../lib/api.js';
import { canSpeak, playCorrect, playWrong, playWin, speak, stopSpeaking } from '../lib/sound.js';
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
  RoundProgress,
  RoundResult,
  tealButton,
} from './BoardUi.jsx';

const ROUND_SIZE = 2;
const LOCALES = {
  english: 'en-US',
  spanish: 'es-ES',
  french: 'fr-FR',
};

export default function DialogosBoard({ subject: initialSubject, clearSignal = 0 }) {
  const onboarding = useOnboarding();
  const ui = useUi();
  const progress = useProgress();

  const subject = initialSubject;
  const level = ui.level(subject);
  const subjectMeta = ui.subject(subject);
  const locale = LOCALES[subject] || LOCALES.english;
  const audioSupported = canSpeak();

  const [title, setTitle] = useState('');
  const [speakers, setSpeakers] = useState([]);
  const [turns, setTurns] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [question, setQuestionText] = useState('');
  const [options, setOptions] = useState([]);
  const [correctIndex, setCorrectIndex] = useState(-1);
  const [explanation, setExplanation] = useState('');
  const [selected, setSelected] = useState(null);
  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [current, setCurrent] = useState(1);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(0);
  const [roundXp, setRoundXp] = useState(0);
  const [xpGain, setXpGain] = useState(0);
  const [finished, setFinished] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [showTranslation, setShowTranslation] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [playingAll, setPlayingAll] = useState(false);

  const controllerRef = useRef(null);
  const usedRef = useRef([]);
  const speechTimerRef = useRef(null);
  const speakingRef = useRef(false);
  const playingAllRef = useRef(false);
  const activeStepRef = useRef(0);
  const subjectRef = useRef(subject);
  const playCurrentRef = useRef(null);
  const startRoundRef = useRef(null);

  const sequence = useMemo(
    () =>
      (Array.isArray(turns) ? turns : []).map((turn, index) => ({
        ...turn,
        speakerName: speakerName(speakers, turn.speaker),
        pitch: turn.speaker === 0 ? 0.95 : 1.12,
        index,
      })),
    [speakers, turns]
  );
  const sequenceRef = useRef(sequence);
  const currentStep = sequence[activeStep] || {};
  const hasPrevStep = activeStep > 0;
  const hasNextStep = activeStep < sequence.length - 1;
  const isCorrect = selected === correctIndex;
  const accuracy = answered ? Math.round((score / answered) * 100) : 0;

  useEffect(() => {
    sequenceRef.current = sequence;
    activeStepRef.current = Math.min(activeStepRef.current, Math.max(sequence.length - 1, 0));
  }, [sequence]);

  const stopSpeech = useCallback(() => {
    if (speechTimerRef.current) {
      clearTimeout(speechTimerRef.current);
      speechTimerRef.current = null;
    }
    stopSpeaking();
    speakingRef.current = false;
    playingAllRef.current = false;
    setSpeaking(false);
    setPlayingAll(false);
  }, []);

  const playCurrent = useCallback(
    (autoAdvance = false) => {
      const step = sequenceRef.current[activeStepRef.current];
      if (!step || !audioSupported || ui.sound === false) {
        playingAllRef.current = false;
        speakingRef.current = false;
        setSpeaking(false);
        setPlayingAll(false);
        return;
      }

      if (speechTimerRef.current) clearTimeout(speechTimerRef.current);
      speakingRef.current = true;
      setSpeaking(true);
      let done = false;

      const finish = () => {
        if (done) return;
        done = true;
        if (speechTimerRef.current) {
          clearTimeout(speechTimerRef.current);
          speechTimerRef.current = null;
        }
        speakingRef.current = false;
        setSpeaking(false);
        if (!autoAdvance || !playingAllRef.current) return;

        if (activeStepRef.current < sequenceRef.current.length - 1) {
          speechTimerRef.current = setTimeout(() => {
            if (!playingAllRef.current) return;
            activeStepRef.current += 1;
            setActiveStep(activeStepRef.current);
            playCurrentRef.current?.(true);
          }, 180);
        } else {
          playingAllRef.current = false;
          setPlayingAll(false);
        }
      };

      const started = speak(step.text, locale, ui.sound, 0.95, finish, step.pitch);
      if (!started) {
        finish();
        return;
      }

      const wordCount = String(step.text || '').trim().split(/\s+/).filter(Boolean).length;
      speechTimerRef.current = setTimeout(finish, Math.max(1400, wordCount * 520));
    },
    [audioSupported, locale, ui.sound]
  );
  playCurrentRef.current = playCurrent;

  const setStep = useCallback(
    (index) => {
      if (!Number.isInteger(index) || index < 0 || index >= sequenceRef.current.length) return;
      stopSpeech();
      activeStepRef.current = index;
      setActiveStep(index);
    },
    [stopSpeech]
  );

  const applyQuestion = useCallback((index, sourceQuestions = questions) => {
    const item = sourceQuestions[index];
    if (!item) return;
    setQuestionText(item.question || '');
    setOptions(Array.isArray(item.options) ? item.options : []);
    setCorrectIndex(Number.isInteger(item.correctIndex) ? item.correctIndex : -1);
    setExplanation(item.explanation || '');
    setSelected(null);
    setChecked(false);
    setXpGain(0);
  }, [questions]);

  const load = useCallback(async () => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    setLoading(true);
    setError('');
    setChecked(false);
    setSelected(null);
    setXpGain(0);
    setTitle('');
    setSpeakers([]);
    setTurns([]);
    setQuestions([]);
    setQuestionText('');
    setOptions([]);
    setCorrectIndex(-1);
    setExplanation('');
    activeStepRef.current = 0;
    setActiveStep(0);
    setShowTranslation(false);
    stopSpeech();

    try {
      const data = await sendDialogo({
        subject,
        level,
        used: usedRef.current.slice(-12),
        profile: onboarding.profile,
        signal: controller.signal,
      });
      if (controllerRef.current !== controller) return;

      const nextQuestions = Array.isArray(data.questions) ? data.questions : [];
      setTitle(data.title || '');
      setSpeakers(Array.isArray(data.speakers) ? data.speakers : []);
      setTurns(Array.isArray(data.turns) ? data.turns : []);
      setQuestions(nextQuestions);
      if (data.title) usedRef.current = [...usedRef.current, data.title].slice(-12);
      applyQuestion(0, nextQuestions);
    } catch (err) {
      if (err?.name === 'AbortError' || controllerRef.current !== controller) return;
      setError(err.message || 'Erro ao gerar diálogo');
    } finally {
      if (controllerRef.current === controller) {
        controllerRef.current = null;
        setLoading(false);
      }
    }
  }, [applyQuestion, level, onboarding.profile, stopSpeech, subject]);

  const startRound = useCallback(() => {
    stopSpeech();
    setCurrent(1);
    setScore(0);
    setAnswered(0);
    setRoundXp(0);
    setXpGain(0);
    setFinished(false);
    load();
  }, [load, stopSpeech]);
  startRoundRef.current = startRound;

  useEffect(() => {
    startRoundRef.current?.();
  }, []);

  useEffect(() => {
    if (clearSignal > 0) {
      usedRef.current = [];
      startRoundRef.current?.();
    }
  }, [clearSignal]);

  useEffect(() => {
    if (subjectRef.current !== subject) {
      subjectRef.current = subject;
      usedRef.current = [];
      startRound();
    }
  }, [startRound, subject]);

  useEffect(
    () => () => {
      controllerRef.current?.abort();
      stopSpeech();
    },
    [stopSpeech]
  );

  const playAll = () => {
    if (!audioSupported || ui.sound === false) return;
    stopSpeech();
    activeStepRef.current = 0;
    setActiveStep(0);
    playingAllRef.current = true;
    setPlayingAll(true);
    playCurrent(true);
  };

  const check = () => {
    if (selected === null || checked || loading || finished) return;
    setChecked(true);
    setAnswered((value) => value + 1);
    setXpGain(0);
    stopSpeech();
    progress.registerPractice('dialogos');
    if (isCorrect) {
      setScore((value) => value + 1);
      setXpGain(XP_PER_CORRECT);
      setRoundXp((value) => value + XP_PER_CORRECT);
      progress.addXp('dialogos', XP_PER_CORRECT);
      playCorrect(ui.sound);
    } else {
      playWrong(ui.sound);
    }
  };

  const next = () => {
    if (!checked || loading || finished) return;
    if (current >= ROUND_SIZE) {
      setFinished(true);
      stopSpeech();
      playWin(ui.sound);
      return;
    }
    setCurrent((value) => value + 1);
    applyQuestion(current);
  };

  const speakerClass = (index) => (index === 0 ? 'speaker-a' : 'speaker-b');
  const speakerLabelClass = (index) =>
    index === 0 ? 'text-[#007F7F] dark:text-[#2DD4BF]' : 'text-[#0E8FD1] dark:text-[#7DD3FC]';

  return (
    <div className="flex flex-col min-h-0 flex-1">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-3 sm:px-5 py-3 border-b-2 border-duo-border dark:border-duo-border-dark">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-[#00A6A6]/15 border-2 border-[#00A6A6]/40 flex items-center justify-center overflow-hidden shrink-0">
            <img src={onboarding.mascot} alt="" width="36" height="36" className="w-7 h-7 mascot" />
          </div>
          <div className="min-w-0">
            <p className="font-extrabold leading-tight truncate">Diálogos · conversa guiada</p>
            <p className="text-xs font-semibold text-duo-text/50 dark:text-duo-text-dark/50">
              {subjectMeta.flag} {subjectMeta.label}
              <span className="opacity-40"> · </span>
              {level}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto min-w-0">
          <span className="rounded-lg border-2 border-[#00A6A6]/40 bg-[#00A6A6]/10 text-[#007F7F] dark:text-[#2DD4BF] px-2 py-1 text-[10px] font-extrabold uppercase tracking-wide">
            2 pessoas · 6 falas
          </span>
          <button
            type="button"
            onClick={() => setShowTranslation((value) => !value)}
            aria-pressed={showTranslation}
            className="rounded-lg border-2 border-duo-border dark:border-duo-border-dark px-2 py-1 text-[11px] font-extrabold hover:border-[#00A6A6] transition-colors"
          >
            {showTranslation ? 'Ocultar tradução' : 'Ver tradução'}
          </button>
          <button type="button" onClick={ui.closeBoard} title="Voltar aos quadros" aria-label="Voltar aos quadros" className="btn-3d icon-btn w-9 h-9 ml-auto sm:ml-0 flex items-center justify-center rounded-xl border-2 border-duo-border dark:border-duo-border-dark hover:text-duo-red hover:border-duo-red/60">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      </header>

      <RoundProgress subject="dialogos" current={current} answered={answered} total={ROUND_SIZE} label={subjectMeta.label} barClass="bg-[#00A6A6]" />

      <main className="flex-1 overflow-y-auto scroll-area px-4 sm:px-5 py-4 bg-[#FCFCFC] dark:bg-duo-bg-dark transition-colors">
        <div className="mx-auto w-full max-w-3xl space-y-4">
          {loading && (
            <LoadingState
              mascot={onboarding.mascot}
              title="Preparando a conversa..."
              hint="Duas pessoas, seis falas e duas perguntas sobre o diálogo."
            />
          )}

          {!loading && error && <ErrorState error={error} onRetry={load} teal />}

          {!loading && !error && finished && (
            <RoundResult
              score={score}
              total={ROUND_SIZE}
              roundXp={roundXp}
              subject="dialogos"
              accuracy={accuracy}
              variant="accuracy"
              title="Diálogo concluído!"
              restartLabel="Nova conversa"
              onRestart={startRound}
              buttonClass={tealButton}
            />
          )}

          {!loading && !error && !finished && title && (
            <>
              <div className="rounded-2xl border-2 border-[#00A6A6]/35 bg-[#00A6A6]/5 dark:bg-[#00A6A6]/10 p-4 sm:p-5 space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-extrabold text-sm sm:text-base">{title}</p>
                  <div className="flex shrink-0 gap-1.5">
                    {[0, 1].map((index) => (
                      <span key={index} role="img" title={speakerName(speakers, index)} aria-label={speakerName(speakers, index)} className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center text-[10px] font-extrabold ${speakerClass(index)}`}>
                        {speakerInitial(speakers, index)}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border-2 border-duo-border dark:border-duo-border-dark bg-white dark:bg-duo-surface-dark px-4 py-4 sm:py-5 transition-colors">
                  <div className="mb-3 flex items-center gap-2">
                    <span className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center text-[10px] font-extrabold ${speakerClass(currentStep.speaker)}`}>
                      {speakerInitial(speakers, currentStep.speaker)}
                    </span>
                    <span className={`text-[11px] font-extrabold ${speakerLabelClass(currentStep.speaker)}`}>
                      {currentStep.speakerName}
                    </span>
                    <span className="ml-auto text-[10px] font-bold text-duo-text/50 dark:text-duo-text-dark/50">
                      Fala {activeStep + 1}/{sequence.length}
                    </span>
                  </div>
                  <p className="text-lg sm:text-2xl font-extrabold leading-snug break-words">{currentStep.text}</p>
                  {showTranslation && (
                    <p className="mt-2 text-xs sm:text-sm font-semibold text-duo-text/50 dark:text-duo-text-dark/50 break-words">
                      {currentStep.translation}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setStep(activeStep - 1)}
                    disabled={!hasPrevStep}
                    className="btn-3d rounded-xl border-2 border-duo-border dark:border-duo-border-dark px-3 py-2 text-[11px] font-extrabold disabled:opacity-40"
                  >
                    Anterior
                  </button>
                  {audioSupported && (
                    <button
                      type="button"
                      onClick={() => playCurrent(false)}
                      disabled={speaking || playingAll}
                      className="btn-3d rounded-xl border-2 border-[#00A6A6]/50 bg-[#00A6A6]/10 text-[#007F7F] dark:text-[#2DD4BF] px-3 py-2 text-[11px] font-extrabold disabled:opacity-50"
                    >
                      {speaking ? 'Ouvindo...' : 'Ouvir fala'}
                    </button>
                  )}
                  {audioSupported && (
                    <button
                      type="button"
                      onClick={playAll}
                      disabled={!ui.sound || playingAll}
                      title={ui.sound ? 'Ouvir a conversa completa' : 'Ative o som para ouvir'}
                      className="btn-3d rounded-xl border-2 border-[#00A6A6]/50 bg-[#00A6A6] text-white px-3 py-2 text-[11px] font-extrabold disabled:opacity-40"
                    >
                      {playingAll ? 'Ouvindo conversa...' : 'Ouvir conversa'}
                    </button>
                  )}
                  {(speaking || playingAll) && (
                    <button type="button" onClick={stopSpeech} className="btn-3d rounded-xl border-2 border-duo-red/50 text-duo-red px-3 py-2 text-[11px] font-extrabold">
                      Parar
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setStep(activeStep + 1)}
                    disabled={!hasNextStep}
                    className="btn-3d rounded-xl border-2 border-[#00A6A6]/50 bg-[#00A6A6] text-white px-3 py-2 text-[11px] font-extrabold disabled:opacity-40"
                  >
                    Próxima fala
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {sequence.map((step, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setStep(index)}
                      aria-current={index === activeStep ? 'step' : undefined}
                      title={step.speakerName}
                      className={`w-8 h-8 rounded-lg border-2 text-xs font-extrabold transition-colors ${
                        index === activeStep ? 'border-[#00A6A6] bg-[#00A6A6] text-white' : speakerClass(step.speaker)
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-extrabold uppercase tracking-wide text-duo-text/40 dark:text-duo-text-dark/40">
                  Conversa completa
                </p>
                {sequence.map((step, index) => (
                  <div key={index} className={`flex ${step.speaker === 1 ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[88%] rounded-2xl border-2 px-3 py-2 ${speakerClass(step.speaker)} ${index === activeStep ? 'ring-2 ring-[#00A6A6]/40' : ''}`}>
                      <p className="text-[10px] font-extrabold uppercase mb-0.5">{step.speakerName}</p>
                      <p className="text-sm font-semibold break-words">{step.text}</p>
                      {showTranslation && (
                        <p className="mt-1 text-[11px] font-semibold text-duo-text/50 dark:text-duo-text-dark/50 break-words">
                          {step.translation}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wide text-[#007F7F] dark:text-[#2DD4BF]">
                  {current === 1 ? 'Pergunta 1/2 · Detalhe' : 'Pergunta 2/2 · Interpretação'}
                </span>
                <span className="text-[11px] font-bold text-duo-text/50 dark:text-duo-text-dark/50">{score} acertos</span>
              </div>
              <MascotBubble mascot={onboarding.mascot}>{question}</MascotBubble>
              <Options
                options={options}
                selected={selected}
                checked={checked}
                correctIndex={correctIndex}
                accent="teal"
                onChoose={(index) => {
                  if (loading || checked || finished) return;
                  setSelected(index);
                }}
              />
            </>
          )}
        </div>
      </main>

      {!loading && !error && !finished && title && (
        <Feedback
          checked={checked}
          isCorrect={isCorrect}
          explanation={explanation}
          noteLabel="Explicação"
          xpGain={xpGain}
          checkDisabled={selected === null}
          onCheck={check}
          onNext={next}
          nextLabel={current >= ROUND_SIZE ? 'Ver resultado' : 'Próxima pergunta'}
          buttonClass={tealButton}
          noteBlock
        />
      )}
    </div>
  );
}

function speakerName(speakers, index) {
  return (Array.isArray(speakers) ? speakers[index] : '') || `Pessoa ${index + 1}`;
}

function speakerInitial(speakers, index) {
  return speakerName(speakers, index).charAt(0).toUpperCase();
}
