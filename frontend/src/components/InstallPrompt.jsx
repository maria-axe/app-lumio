import { useEffect, useState, useSyncExternalStore } from 'react';
import {
  dismissInstallPrompt,
  getInstallPromptSnapshot,
  isStandalone,
  promptInstall,
  subscribeInstallPrompt,
} from '../lib/installPrompt.js';

export default function InstallPrompt({ enabled = true }) {
  const state = useSyncExternalStore(subscribeInstallPrompt, getInstallPromptSnapshot, getInstallPromptSnapshot);
  const [closed, setClosed] = useState(false);
  const [waited, setWaited] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setWaited(true), 1200);
    return () => window.clearTimeout(timer);
  }, []);

  const visible = enabled
    && !closed
    && !state.installed
    && !isStandalone()
    && (state.canInstall || waited);

  useEffect(() => {
    if (!visible) return undefined;

    const onKeyDown = (event) => {
      if (event.key !== 'Escape') return;
      event.stopPropagation();
      setClosed(true);
      dismissInstallPrompt();
    };

    window.addEventListener('keydown', onKeyDown, true);
    return () => window.removeEventListener('keydown', onKeyDown, true);
  }, [visible]);

  if (!visible) return null;

  const canInstallNow = state.canInstall;

  const handleClose = () => {
    setClosed(true);
    dismissInstallPrompt();
  };

  const handleInstall = async () => {
    try {
      const outcome = await promptInstall();
      if (outcome === 'dismissed') setClosed(true);
    } catch {
      handleClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[85] flex items-start justify-center bg-black/50 p-3 pt-16 sm:pt-20" role="presentation">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="install-title"
        className="w-full max-w-sm rounded-3xl border-2 border-duo-blue/40 bg-white p-5 shadow-[0_24px_60px_-20px_rgba(28,176,246,0.85)] dark:border-duo-blue/40 dark:bg-duo-surface-dark"
      >
        <div className="flex items-start gap-3">
          <img
            src="/img/icon-192.png"
            alt=""
            width="56"
            height="56"
            className="h-14 w-14 shrink-0 rounded-2xl border-2 border-duo-blue/30"
          />
          <div className="min-w-0">
            <h2 id="install-title" className="text-lg font-extrabold text-duo-text dark:text-duo-text-dark">
              Leve o Lumio com você
            </h2>
            <p className="mt-1 text-sm font-semibold text-duo-text/70 dark:text-duo-text-dark/70">
              {canInstallNow
                ? 'Instale na tela inicial e abra sem precisar do link. Sem Play Store.'
                : 'Toque no menu ⋮ do Chrome e escolha Instalar app.'}
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          {canInstallNow && (
            <button
              type="button"
              onClick={handleInstall}
              className="flex-1 rounded-2xl border-2 border-b-4 border-duo-green-dark bg-duo-green px-4 py-3 text-sm font-extrabold uppercase tracking-wide text-white shadow-[0_10px_24px_-12px_rgba(88,204,2,0.9)] transition hover:brightness-105 active:translate-y-0.5 active:border-b-2"
            >
              Instalar app
            </button>
          )}
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 rounded-2xl border-2 border-duo-border bg-white px-4 py-3 text-sm font-extrabold uppercase tracking-wide text-duo-text/60 transition hover:bg-duo-bg dark:border-duo-border-dark dark:bg-duo-surface-dark dark:text-duo-text-dark/60 dark:hover:bg-white/5"
          >
            {canInstallNow ? 'Agora não' : 'Entendi'}
          </button>
        </div>

        <p className="mt-3 text-center text-[11px] font-bold text-duo-text/40 dark:text-duo-text-dark/40">
          Aparece de novo na próxima visita.
        </p>
      </section>
    </div>
  );
}
