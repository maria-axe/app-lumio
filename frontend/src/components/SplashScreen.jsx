import { useEffect, useState } from 'react';

const MESSAGES = [
  'Acendendo o Lumi...',
  'Preparando seus quadros...',
  'Ajustando o brilho...',
  'Vamos lá!',
];

const CONFETTI = [
  { left: '12%', color: '#58CC02', delay: '0ms', duration: '1500ms' },
  { left: '24%', color: '#1CB0F6', delay: '180ms', duration: '1700ms' },
  { left: '38%', color: '#FFC800', delay: '80ms', duration: '1600ms' },
  { left: '62%', color: '#CE82FF', delay: '260ms', duration: '1800ms' },
  { left: '76%', color: '#FF4B4B', delay: '120ms', duration: '1550ms' },
  { left: '88%', color: '#00A6A6', delay: '320ms', duration: '1750ms' },
];

export default function SplashScreen({ onDone }) {
  const [step, setStep] = useState(0);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    let alive = true;
    let delayTimer;
    let leaveTimer;

    const messageTimer = window.setInterval(() => {
      setStep((current) => Math.min(current + 1, MESSAGES.length - 1));
    }, 380);

    const fontsReady = document.fonts?.ready ?? Promise.resolve();
    const minDelay = new Promise((resolve) => {
      delayTimer = window.setTimeout(resolve, 950);
    });

    Promise.all([fontsReady, minDelay]).then(() => {
      if (!alive) return;
      setLeaving(true);
      leaveTimer = window.setTimeout(onDone, 380);
    });

    return () => {
      alive = false;
      window.clearInterval(messageTimer);
      window.clearTimeout(delayTimer);
      window.clearTimeout(leaveTimer);
    };
  }, [onDone]);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Carregando Lumio"
      className={`fixed inset-0 z-[100] overflow-hidden bg-gradient-to-br from-[#EAF8FF] via-white to-[#F0FFF0] transition-opacity duration-300 ${leaving ? 'pointer-events-none opacity-0' : 'opacity-100'}`}
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <span className="splash-blob absolute -left-16 top-10 h-56 w-56 rounded-full bg-duo-blue/25 blur-3xl" />
        <span className="splash-blob absolute -right-14 top-1/3 h-64 w-64 rounded-full bg-duo-green/20 blur-3xl [animation-delay:700ms]" />
        <span className="splash-blob absolute bottom-[-4rem] left-1/3 h-56 w-56 rounded-full bg-duo-yellow/25 blur-3xl [animation-delay:1300ms]" />
      </div>

      <div className="relative flex h-full w-full flex-col items-center justify-center px-6 text-center">
        <div className="relative">
          {CONFETTI.map((piece) => (
            <span
              key={piece.left}
              className="confetti-piece"
              aria-hidden="true"
              style={{
                left: piece.left,
                backgroundColor: piece.color,
                animationDelay: piece.delay,
                animationDuration: piece.duration,
              }}
            />
          ))}
          <img
            src="/img/mascot.svg"
            alt=""
            width="144"
            height="144"
            className="splash-pop mascot mascot-loading h-28 w-28 sm:h-36 sm:w-36"
          />
        </div>

        <img
          src="/img/logo.svg"
          alt="Lumio"
          className="splash-pop mt-4 h-12 w-auto sm:h-14"
          style={{ animationDelay: '140ms' }}
        />

        <p className="mt-2 text-sm font-extrabold text-duo-blue dark:text-duo-blue">
          Aprenda se divertindo, um quadro por vez.
        </p>

        <div className="mt-8 w-full max-w-xs">
          <div className="h-3 overflow-hidden rounded-full border-2 border-duo-blue/20 bg-white/80 shadow-[0_8px_20px_-12px_rgba(28,176,246,0.9)]">
            <div className="splash-bar relative h-full w-full rounded-full bg-gradient-to-r from-duo-blue via-duo-green to-duo-yellow">
              <span className="splash-shine absolute inset-y-0 w-1/3 bg-white/60 blur-sm" />
            </div>
          </div>
          <p className="mt-3 text-xs font-extrabold tracking-wide text-duo-text/50">
            {MESSAGES[step]}
          </p>
        </div>
      </div>
    </div>
  );
}
