import { useCallback, useEffect, useRef, useState } from 'react';
import { useOnboarding } from '../contexts/OnboardingContext.jsx';
import { XP_PER_CORRECT, XP_ROUND_BONUS } from '../contexts/ProgressContext.jsx';
import { useProgress } from '../contexts/ProgressContext.jsx';
import { useUi } from '../contexts/UiContext.jsx';
import {
  buildMemoryRound,
  MEMORY_PAIR_COUNTS,
  memoryBestKey,
} from '../lib/memory-decks.js';
import { playCorrect, playWin, playWrong, speak, stopSpeaking } from '../lib/sound.js';
import { storage } from '../lib/storage.js';
import { Confetti, primaryButton, RoundProgress } from './BoardUi.jsx';
import WordArt from './WordArt.jsx';

const FLIP_BACK_MS = 750;

function formatTime(value) {
  const minutes = String(Math.floor(value / 60)).padStart(2, '0');
  const seconds = String(value % 60).padStart(2, '0');
  return `${minutes}:${seconds}`;
}

function createRound(subject, level, key) {
  const records = storage.loadMemorySeen();
  const seen = Array.isArray(records[key]) ? records[key] : [];
  const round = buildMemoryRound(subject, level, seen);

  storage.saveMemorySeen({ ...records, [key]: round.seenPairIds });
  return round.deck;
}

function MemoryResult({ attempts, seconds, roundXp, best, totalPairs, onRestart }) {
  return (
    <div className="relative py-8 flex flex-col items-center justify-center gap-4 text-center">
      <Confetti />
      <p className="font-extrabold text-xl">Jogo concluído!</p>
      <p className="font-bold text-sm text-duo-text/60 dark:text-duo-text-dark/60">
        Você encontrou {totalPairs} pares em {attempts} tentativas.
      </p>
      <div className="grid grid-cols-3 gap-2 w-full max-w-sm">
        <div className="rounded-2xl border-2 border-duo-border dark:border-duo-border-dark bg-duo-bg dark:bg-duo-bg-dark px-2 py-2">
          <p className="text-[10px] font-extrabold uppercase tracking-wide text-duo-text/40 dark:text-duo-text-dark/40">Tempo</p>
          <p className="font-extrabold text-duo-blue">{formatTime(seconds)}</p>
        </div>
        <div className="rounded-2xl border-2 border-duo-border dark:border-duo-border-dark bg-duo-bg dark:bg-duo-bg-dark px-2 py-2">
          <p className="text-[10px] font-extrabold uppercase tracking-wide text-duo-text/40 dark:text-duo-text-dark/40">Tentativas</p>
          <p className="font-extrabold text-duo-green">{attempts}</p>
        </div>
        <div className="rounded-2xl border-2 border-duo-border dark:border-duo-border-dark bg-duo-bg dark:bg-duo-bg-dark px-2 py-2">
          <p className="text-[10px] font-extrabold uppercase tracking-wide text-duo-text/40 dark:text-duo-text-dark/40">XP</p>
          <p className="font-extrabold text-duo-blue">+{roundXp}</p>
        </div>
      </div>
      {best && (
        <p className="text-xs font-bold text-duo-text/50 dark:text-duo-text-dark/50">
          Melhor: {best.attempts} tentativas · {formatTime(best.seconds)}
        </p>
      )}
      <button type="button" onClick={onRestart} data-action="restart" className={`${primaryButton} max-w-xs`}>
        Jogar de novo
      </button>
    </div>
  );
}

export default function MemoriaBoard({ subject: initialSubject, clearSignal = 0 }) {
  const onboarding = useOnboarding();
  const progress = useProgress();
  const ui = useUi();

  const subject = initialSubject;
  const level = ui.level(subject);
  const subjectMeta = ui.subject(subject);
  const key = memoryBestKey(subject, level);
  const totalPairs = MEMORY_PAIR_COUNTS[level] ?? MEMORY_PAIR_COUNTS.B1;

  const [cards, setCards] = useState(() => createRound(subject, level, key));
  const [selectedIds, setSelectedIds] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [attempts, setAttempts] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [finished, setFinished] = useState(false);
  const [roundXp, setRoundXp] = useState(0);
  const [best, setBest] = useState(() => storage.loadMemoryBest()[key] ?? null);
  const [gameId, setGameId] = useState(0);

  const selectionRef = useRef([]);
  const matchedRef = useRef([]);
  const attemptsRef = useRef(0);
  const secondsRef = useRef(0);
  const flipTimeoutRef = useRef(null);
  const awardedRef = useRef(false);
  const mountedRef = useRef(false);

  const startGame = useCallback(() => {
    if (flipTimeoutRef.current) clearTimeout(flipTimeoutRef.current);
    flipTimeoutRef.current = null;
    stopSpeaking();

    selectionRef.current = [];
    matchedRef.current = [];
    attemptsRef.current = 0;
    secondsRef.current = 0;
    awardedRef.current = false;

    setCards(createRound(subject, level, key));
    setSelectedIds([]);
    setMatchedPairs([]);
    setAttempts(0);
    setSeconds(0);
    setFinished(false);
    setRoundXp(0);
    setBest(storage.loadMemoryBest()[key] ?? null);
    setGameId((value) => value + 1);
  }, [key, level, subject]);

  useEffect(() => {
    if (!mountedRef.current && clearSignal === 0) {
      mountedRef.current = true;
      return;
    }
    mountedRef.current = true;
    startGame();
  }, [clearSignal, startGame]);

  useEffect(
    () => () => {
      if (flipTimeoutRef.current) clearTimeout(flipTimeoutRef.current);
      stopSpeaking();
    },
    []
  );

  useEffect(() => {
    if (finished) return undefined;
    const timer = setInterval(() => {
      setSeconds((current) => {
        const next = current + 1;
        secondsRef.current = next;
        return next;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [finished, gameId]);

  const finishGame = useCallback(() => {
    if (awardedRef.current) return;
    awardedRef.current = true;

    if (flipTimeoutRef.current) clearTimeout(flipTimeoutRef.current);
    flipTimeoutRef.current = null;
    stopSpeaking();

    const xp = XP_PER_CORRECT * totalPairs + XP_ROUND_BONUS;
    setRoundXp(xp);
    setFinished(true);
    progress.addXp(subject, xp);
    progress.registerPractice(subject);
    playWin(ui.sound);

    const records = storage.loadMemoryBest();
    const previous = records[key];
    const finalAttempts = attemptsRef.current;
    const finalSeconds = secondsRef.current;
    const isBetter =
      !previous ||
      finalAttempts < previous.attempts ||
      (finalAttempts === previous.attempts && finalSeconds < previous.seconds);

    if (isBetter) {
      const record = { attempts: finalAttempts, seconds: finalSeconds };
      const nextRecords = { ...records, [key]: record };
      storage.saveMemoryBest(nextRecords);
      setBest(record);
    } else {
      setBest(previous ?? null);
    }
  }, [key, progress, subject, totalPairs, ui.sound]);

  const handleFlip = useCallback(
    (card) => {
      if (
        finished ||
        selectionRef.current.includes(card.id) ||
        matchedRef.current.includes(card.pairId) ||
        selectionRef.current.length >= 2
      ) {
        return;
      }

      if (card.side === 'term') {
        speak(card.text, subjectMeta.speechLang || 'en-US', ui.sound);
      }

      const firstId = selectionRef.current[0];
      const nextSelection = [...selectionRef.current, card.id];
      selectionRef.current = nextSelection;
      setSelectedIds(nextSelection);

      if (!firstId) return;

      const firstCard = cards.find((item) => item.id === firstId);
      if (!firstCard) return;

      const newAttempts = attemptsRef.current + 1;
      attemptsRef.current = newAttempts;
      setAttempts(newAttempts);

      if (firstCard.pairId === card.pairId) {
        playCorrect(ui.sound);
        const nextMatched = [...matchedRef.current, firstCard.pairId];
        matchedRef.current = nextMatched;
        setMatchedPairs(nextMatched);
        selectionRef.current = [];
        setSelectedIds([]);
        if (nextMatched.length === totalPairs) finishGame();
        return;
      }

      playWrong(ui.sound);
      flipTimeoutRef.current = setTimeout(() => {
        selectionRef.current = [];
        setSelectedIds([]);
        flipTimeoutRef.current = null;
      }, FLIP_BACK_MS);
    },
    [cards, finishGame, finished, subjectMeta.speechLang, totalPairs, ui.sound]
  );

  return (
    <div className="flex flex-col min-h-0 flex-1">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-3 sm:px-5 py-3 border-b-2 border-duo-border dark:border-duo-border-dark">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-duo-blue/15 border-2 border-duo-blue/30 flex items-center justify-center overflow-hidden shrink-0">
            <img src={onboarding.mascot} alt="" width="36" height="36" className="w-7 h-7 mascot" />
          </div>
          <div className="min-w-0">
            <p className="font-extrabold leading-tight">Memória · {subjectMeta.label}</p>
            <p className="text-xs font-semibold text-duo-text/50 dark:text-duo-text-dark/50">
              Nível: {level} · {totalPairs} pares
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto min-w-0">
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
          <button type="button" onClick={ui.closeBoard} title="Voltar aos quadros" aria-label="Voltar aos quadros" className="btn-3d icon-btn w-9 h-9 flex items-center justify-center rounded-xl border-2 border-duo-border dark:border-duo-border-dark text-duo-text dark:text-duo-text-dark hover:text-duo-red hover:border-duo-red/60">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
        </div>
      </header>

      <RoundProgress subject={subject} current={matchedPairs.length} answered={matchedPairs.length} total={totalPairs} label={subjectMeta.label} />

      <main className="flex-1 overflow-y-auto scroll-area px-4 sm:px-5 py-4 bg-[#FCFCFC] dark:bg-duo-bg-dark transition-colors">
        <div className="mx-auto w-full max-w-3xl">
          {finished ? (
            <MemoryResult
              attempts={attempts}
              seconds={seconds}
              roundXp={roundXp}
              best={best}
              totalPairs={totalPairs}
              onRestart={startGame}
            />
          ) : (
            <>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-[11px] font-extrabold text-duo-text/50 dark:text-duo-text-dark/50">
                <span>{matchedPairs.length} / {totalPairs} pares</span>
                <span>{attempts} tentativas · {formatTime(seconds)}</span>
                {best && <span>Melhor: {best.attempts} tentativas · {formatTime(best.seconds)}</span>}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 justify-items-center">
                {cards.map((card) => {
                  const matched = matchedRef.current.includes(card.pairId);
                  const revealed = selectedIds.includes(card.id) || matched;
                  const label = revealed ? card.text : 'Carta virada';

                  return (
                    <button
                      key={card.id}
                      type="button"
                      onClick={() => handleFlip(card)}
                      disabled={revealed || finished || selectionRef.current.length >= 2}
                      aria-label={label}
                      aria-pressed={revealed}
                      className={`btn-3d relative w-full min-h-[116px] sm:min-h-[136px] rounded-2xl border-2 border-b-4 px-2 py-3 text-center text-xs sm:text-sm font-extrabold break-words transition ${
                        matched
                          ? 'border-duo-green bg-duo-green/10 text-duo-green border-b-duo-green'
                          : revealed
                            ? 'border-duo-blue bg-duo-blue/10 text-duo-blue border-b-duo-blue'
                            : 'border-duo-border dark:border-duo-border-dark border-b-duo-border dark:border-b-duo-border-dark bg-white dark:bg-duo-surface-dark text-duo-text/30 dark:text-duo-text-dark/30 hover:border-duo-blue hover:text-duo-blue'
                      } disabled:cursor-default`}
                    >
                      {revealed ? (
                        <span className="flex flex-col items-center justify-center gap-1.5 w-full">
                          <WordArt
                            term={card.side === 'term' ? card.text : card.matchText}
                            className="w-11 h-11 sm:w-14 sm:h-14 shrink-0"
                          />
                          <span>{card.text}</span>
                        </span>
                      ) : (
                        <span className="text-2xl font-black">?</span>
                      )}
                    </button>
                  );
                })}
              </div>
              <p className="mt-3 text-center text-xs font-bold text-duo-text/50 dark:text-duo-text-dark/50">
                Toque em duas cartas para encontrar o par. Ao virar uma palavra, o app a pronuncia se o som estiver ativo.
              </p>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
