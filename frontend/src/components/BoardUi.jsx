import { useEffect, useRef } from 'react';
import { useProgress } from '../contexts/ProgressContext.jsx';

const CONFETTI = Array.from({ length: 28 }, (_, index) => ({
  left: (index * 37) % 100,
  delay: (index % 7) * 90,
  duration: 1200 + (index % 5) * 250,
  rotate: (index * 47) % 360,
  color: ['#58CC02', '#1CB0F6', '#FFC800', '#FF4B4B', '#CE82FF'][index % 5],
}));

const OPTION_ACCENTS = {
  blue: {
    selected: 'border-duo-blue bg-duo-blue/10',
    badge: 'border-duo-blue bg-duo-blue text-white',
    hover: 'hover:border-duo-blue',
  },
  teal: {
    selected: 'border-[#00A6A6] bg-[#00A6A6]/10',
    badge: 'border-[#00A6A6] bg-[#00A6A6] text-white',
    hover: 'hover:border-[#00A6A6]',
  },
};

export const primaryButton =
  'btn-action w-full bg-duo-blue text-white font-extrabold uppercase tracking-wide text-sm rounded-2xl border-b-4 border-duo-blue-dark px-6 py-3 hover:brightness-105 active:border-b-0 active:translate-y-1 transition disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:brightness-100 disabled:active:translate-y-0';

export const tealButton =
  'btn-action w-full bg-[#00A6A6] text-white font-extrabold uppercase tracking-wide text-sm rounded-2xl border-b-4 border-[#007F7F] px-6 py-3 hover:brightness-105 active:border-b-0 active:translate-y-1 transition disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:brightness-100 disabled:active:translate-y-0';

export function LoadingState({ mascot, title, hint }) {
  return (
    <div className="py-16 flex flex-col items-center justify-center gap-3 text-center" role="status">
      <img src={mascot} alt="" width="56" height="56" className="w-14 h-14 mascot mascot-loading" />
      <p className="font-extrabold">{title}</p>
      {hint && <p className="text-xs font-semibold text-duo-text/50 dark:text-duo-text-dark/50">{hint}</p>}
    </div>
  );
}

export function ErrorState({ error, onRetry, teal = false }) {
  return (
    <div className="py-16 flex flex-col items-center justify-center gap-3 text-center">
      <div className="bg-duo-red/10 border-2 border-duo-red/40 text-duo-red rounded-2xl px-4 py-3 text-sm font-extrabold max-w-sm" role="alert">
        {error}
      </div>
      <button type="button" onClick={onRetry} data-action="retry" className={teal ? tealButton : primaryButton}>
        Tentar novamente
      </button>
    </div>
  );
}

export function MascotBubble({ mascot, children }) {
  return (
    <div className="flex items-start gap-2">
      <div className="w-9 h-9 rounded-xl bg-duo-blue/15 border-2 border-duo-blue/30 flex items-center justify-center overflow-hidden shrink-0" aria-hidden="true">
        <img src={mascot} alt="" width="36" height="36" className="w-7 h-7 mascot" />
      </div>
      <div className="bg-duo-bg dark:bg-[#26373F] border-2 border-duo-border dark:border-duo-border-dark rounded-2xl rounded-bl-md px-4 py-3 text-sm font-bold leading-relaxed transition-colors">
        {children}
      </div>
    </div>
  );
}

export function RoundProgress({ subject, answered = 0, total, label, barClass = 'bg-duo-blue' }) {
  const progress = useProgress();
  const barRef = useRef(null);
  const goalReached = progress.subjectGoalReached(subject);
  const state = progress.state(subject);
  const done = Math.min(answered, total);

  useEffect(() => {
    const element = barRef.current;
    if (!element) return;
    element.classList.remove('bar-pop');
    void element.offsetWidth;
    element.classList.add('bar-pop');
  }, [done]);

  return (
    <div className="px-4 sm:px-5 py-2.5 border-b-2 border-duo-border dark:border-duo-border-dark transition-colors">
      <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wide text-duo-text/50 dark:text-duo-text-dark/50 mb-1.5">
        <span className={goalReached ? 'text-duo-green' : ''} title={`Meta diária de ${label}`}>
          Meta {state.todayXp}/{state.dailyGoal} XP
        </span>
        <span>{done} / {total}</span>
      </div>
      <div
        className={`h-3.5 rounded-full bg-duo-border dark:bg-duo-border-dark overflow-hidden transition-shadow duration-300 ${goalReached ? 'bar-goal-glow' : ''}`}
        role="progressbar"
        aria-label={`Progresso de ${label}`}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={done}
      >
        <div
          ref={barRef}
          className={`bar-fill h-full rounded-full transition-[width,background-color] duration-500 ease-out ${done > 0 || goalReached ? 'bg-duo-green' : barClass}`}
          style={{ width: `${(done / total) * 100}%` }}
        />
      </div>
    </div>
  );
}

export function Options({ options, selected, checked, correctIndex, onChoose, accent = 'blue' }) {
  const styles = OPTION_ACCENTS[accent] ?? OPTION_ACCENTS.blue;

  const optionClass = (index) => {
    if (checked) {
      if (index === correctIndex) return 'border-duo-green bg-duo-green/10 text-duo-green';
      if (index === selected) return 'border-duo-red bg-duo-red/10 text-duo-red';
      return 'border-duo-border dark:border-duo-border-dark bg-white dark:bg-duo-surface-dark opacity-60';
    }
    if (index === selected) return `border-2 ${styles.selected}`;
    return `border-2 border-duo-border dark:border-duo-border-dark bg-white dark:bg-duo-surface-dark ${styles.hover}`;
  };

  const badgeClass = (index) => {
    if (checked && index === correctIndex) return 'border-duo-green bg-duo-green text-white';
    if (checked && index === selected) return 'border-duo-red bg-duo-red text-white';
    if (index === selected) return `border-2 ${styles.badge}`;
    return 'border-duo-border dark:border-duo-border-dark text-duo-text/60 dark:text-duo-text-dark/60';
  };

  return (
    <div className="space-y-2.5">
      {options.map((option, index) => (
        <button
          key={index}
          type="button"
          onClick={() => onChoose(index)}
          disabled={checked}
          data-option
          className={`w-full flex items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left text-sm font-bold transition disabled:cursor-default ${optionClass(index)}`}
        >
          <span className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center text-xs font-extrabold shrink-0 transition-colors ${badgeClass(index)}`}>
            {index + 1}
          </span>
          <span>{option}</span>
        </button>
      ))}
    </div>
  );
}

export function Feedback({
  checked,
  isCorrect,
  explanation,
  noteLabel = '',
  note = '',
  xpGain = 0,
  onCheck,
  checkDisabled = false,
  onNext,
  nextLabel,
  buttonClass = primaryButton,
  noteBlock = false,
}) {
  return (
    <div
      className={`px-4 sm:px-5 py-3 border-t-2 transition-colors ${
        checked
          ? isCorrect
            ? 'bg-duo-green/10 border-duo-green/40'
            : 'bg-duo-red/10 border-duo-red/40'
          : 'bg-white dark:bg-duo-surface-dark border-duo-border dark:border-duo-border-dark'
      }`}
    >
      <div className="mx-auto w-full max-w-3xl space-y-2">
        {!checked ? (
          <button
            type="button"
            onClick={onCheck}
            disabled={checkDisabled}
            data-action="check"
            className={buttonClass}
          >
            Verificar
          </button>
        ) : (
          <>
            <div className={`flex items-center gap-2 font-extrabold ${isCorrect ? 'text-duo-green' : 'text-duo-red'}`}>
              <FeedbackIcon correct={isCorrect} />
              <span>{isCorrect ? 'Correto!' : 'Quase!'}</span>
            </div>
            {isCorrect && xpGain > 0 && (
              <span className="inline-block text-[11px] font-extrabold text-duo-green bg-duo-green/10 border-2 border-duo-green/40 rounded-full px-2 py-0.5 xp-pop">
                +{xpGain} XP
              </span>
            )}
            {noteBlock ? (
              <div className="rounded-2xl bg-white/70 dark:bg-duo-surface-dark/70 border-2 border-duo-border dark:border-duo-border-dark px-4 py-3">
                {noteLabel && (
                  <p className="text-[10px] font-extrabold uppercase tracking-wide text-duo-text/40 dark:text-duo-text-dark/40 mb-1">
                    {noteLabel}
                  </p>
                )}
                <p className="text-sm font-semibold leading-relaxed">{explanation}</p>
              </div>
            ) : (
              <>
                <p className="text-sm font-semibold">{explanation}</p>
                {note && (
                  <p className="text-xs font-bold text-duo-text/50 dark:text-duo-text-dark/50">
                    {noteLabel}: {note}
                  </p>
                )}
              </>
            )}
            <button type="button" onClick={onNext} data-action="next" className={`${buttonClass} mt-1`}>
              {nextLabel}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export function Confetti() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {CONFETTI.map((piece, index) => (
        <span
          key={index}
          className="confetti-piece"
          style={{
            left: `${piece.left}%`,
            background: piece.color,
            animationDelay: `${piece.delay}ms`,
            animationDuration: `${piece.duration}ms`,
            transform: `rotate(${piece.rotate}deg)`,
          }}
        />
      ))}
    </div>
  );
}

export function RoundResult({
  score,
  total,
  roundXp,
  subject,
  title = 'Rodada concluída!',
  accuracy,
  variant = 'xp',
  onRestart,
  restartLabel = 'Jogar de novo',
  buttonClass = primaryButton,
  showConfetti = false,
}) {
  const progress = useProgress();
  const state = progress.state(subject);
  const goalReached = progress.subjectGoalReached(subject);

  return (
    <div className="relative py-10 flex flex-col items-center justify-center gap-4 text-center">
      {showConfetti && <Confetti />}
      <TrophyIcon />
      <div>
        <p className="font-extrabold text-xl">{title}</p>
        <p className="font-bold text-duo-text/60 dark:text-duo-text-dark/60">
          {variant === 'xp' ? (
            <>
              Você acertou <span className="text-duo-green">{score}</span> de {total}
              <span className="opacity-40"> · </span>
              <span>{accuracy}%</span>
            </>
          ) : (
            <>Você acertou {score} de {total} perguntas</>
          )}
        </p>
      </div>
      <div className="grid grid-cols-3 gap-2 w-full max-w-sm">
        {variant === 'xp' ? (
          <>
            <Stat label="XP" value={`+${roundXp}`} valueClass="text-duo-green" />
            <Stat label="Ofensiva" value={state.streak} valueClass="flex items-center justify-center gap-1" withFlame />
            <Stat
              label="Meta"
              value={goalReached ? 'Feita' : `${state.todayXp}/${state.dailyGoal}`}
              valueClass={goalReached ? 'text-duo-green' : 'text-duo-blue'}
            />
          </>
        ) : (
          <>
            <Stat label="Acertos" value={score} valueClass="text-duo-green" />
            <Stat label="Erros" value={total - score} valueClass="text-duo-red" />
            <Stat label="Aproveitamento" value={`${accuracy}%`} valueClass="text-duo-blue" />
          </>
        )}
      </div>
      <p className="text-xs font-extrabold text-duo-green">+{roundXp} XP nesta rodada</p>
      <button type="button" onClick={onRestart} data-action="restart" className={`${buttonClass} max-w-xs`}>
        {restartLabel}
      </button>
    </div>
  );
}

function FeedbackIcon({ correct }) {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {correct ? <path d="M20 6 9 17l-5-5" /> : <path d="M18 6 6 18M6 6l12 12" />}
    </svg>
  );
}

function TrophyIcon() {
  return (
    <svg className="w-16 h-16 text-duo-blue animate-bounce" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M6 3h12v6a6 6 0 0 1-12 0V3Z" />
      <path d="M9 15.5a4 4 0 0 1-1 3.5h8a4 4 0 0 1-1-3.5M7 21h10" />
    </svg>
  );
}

function Stat({ label, value, valueClass = '', withFlame = false }) {
  return (
    <div className="min-w-0 rounded-2xl border-2 border-duo-border dark:border-duo-border-dark bg-duo-bg dark:bg-duo-bg-dark px-2 py-2">
      <p className="text-[10px] font-extrabold uppercase leading-tight tracking-wide text-duo-text/40 dark:text-duo-text-dark/40 break-words">{label}</p>
      <p className={`font-extrabold ${valueClass}`}>
        {withFlame && (
          <svg className="w-4 h-4 text-duo-blue" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 2s4 4 4 8a4 4 0 0 1-8 0c0-1 .5-2 .5-2S7 10 7 13a5 5 0 0 0 10 0c0-4-5-11-5-11Z" />
          </svg>
        )}
        {value}
      </p>
    </div>
  );
}
