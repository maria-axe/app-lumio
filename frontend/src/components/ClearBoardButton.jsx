import { useEffect, useRef, useState } from 'react';
import { TrashIcon, WarningIcon } from './Icons.jsx';

const CONFIRM_TIMEOUT_MS = 5000;

export default function ClearBoardButton({ onClear }) {
  const [confirming, setConfirming] = useState(false);
  const timerRef = useRef(null);

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    []
  );

  const cancel = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setConfirming(false);
  };

  const ask = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setConfirming(true);
    timerRef.current = setTimeout(() => setConfirming(false), CONFIRM_TIMEOUT_MS);
  };

  const confirm = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setConfirming(false);
    onClear();
  };

  if (confirming) {
    return (
      <div
        role="group"
        aria-label="Confirmar limpeza deste quadro"
        className="flex items-center gap-1 rounded-xl border-2 border-duo-red/40 bg-duo-red/10 px-1.5 py-1"
      >
        <WarningIcon className="w-3.5 h-3.5 text-duo-red shrink-0" />
        <span className="hidden sm:inline text-xs font-extrabold text-duo-red">Limpar este quadro?</span>
        <button
          type="button"
          onClick={confirm}
          data-action="clear-board-confirm"
          className="btn-action rounded-lg bg-duo-red text-white text-xs font-extrabold uppercase tracking-wide px-2 py-1 border-b-2 border-red-700 hover:brightness-105 active:border-b-0 active:translate-y-0.5 transition"
        >
          Sim
        </button>
        <button
          type="button"
          onClick={cancel}
          className="rounded-lg border-2 border-duo-border dark:border-duo-border-dark text-xs font-extrabold uppercase tracking-wide text-duo-text/60 dark:text-duo-text-dark/60 px-2 py-1 hover:border-duo-text/30 transition"
        >
          Não
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={ask}
      data-action="clear-board"
      title="Limpar apenas este quadro"
      aria-label="Limpar apenas este quadro"
      className="btn-3d flex items-center gap-1.5 rounded-xl bg-white dark:bg-duo-bg-dark border-2 border-duo-border dark:border-duo-border-dark px-2.5 py-1.5 text-xs font-extrabold text-duo-text/70 dark:text-duo-text-dark/70 hover:border-duo-red/60 hover:text-duo-red transition-colors"
    >
      <TrashIcon className="w-4 h-4" />
      <span className="hidden sm:inline">Limpar quadro</span>
    </button>
  );
}
