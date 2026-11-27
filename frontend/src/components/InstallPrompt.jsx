import { useEffect, useSyncExternalStore } from 'react';
import {
  dismissInstallPrompt,
  getInstallPromptSnapshot,
  isStandalone,
  promptInstall,
  subscribeInstallPrompt,
  wasInstallDismissedRecently,
} from '../lib/installPrompt.js';

export default function InstallPrompt({ enabled = true }) {
  const state = useSyncExternalStore(subscribeInstallPrompt, getInstallPromptSnapshot, getInstallPromptSnapshot);
  const visible = enabled
    && state.canInstall
    && !state.installed
    && !isStandalone()
    && !wasInstallDismissedRecently();

  useEffect(() => {
    if (!visible) return undefined;

    const onKeyDown = (event) => {
      if (event.key !== 'Escape') return;
      event.stopPropagation();
      dismissInstallPrompt();
    };

    window.addEventListener('keydown', onKeyDown, true);
    return () => window.removeEventListener('keydown', onKeyDown, true);
  }, [visible]);

  if (!visible) return null;

  const handleInstall = async () => {
    try {
      await promptInstall();
    } catch {
      dismissInstallPrompt();
    }
  };

  return (
    <div className="fixed inset-x-0 top-0 z-[85] p-2 sm:p-3">
      <aside
        role="region"
        aria-labelledby="install-banner-title"
        className="mx-auto flex max-w-3xl flex-col gap-2 rounded-2xl border-2 border-duo-blue/40 bg-white/95 p-2.5 shadow-[0_14px_34px_-14px_rgba(28,176,246,0.85)] backdrop-blur dark:border-duo-blue/40 dark:bg-duo-surface-dark/95 sm:flex-row sm:items-center sm:gap-3 sm:p-2"
      >
        <div className="flex min-w-0 flex-1 items-center gap-2.5">
          <img
            src="/img/icon-192.png"
            alt=""
            width="36"
            height="36"
            className="h-9 w-9 shrink-0 rounded-xl border border-duo-blue/30"
          />
          <div className="min-w-0">
            <p id="install-banner-title" className="truncate text-sm font-extrabold text-duo-text dark:text-duo-text-dark">
              Instale o Lumio
            </p>
            <p className="truncate text-xs font-semibold text-duo-text/60 dark:text-duo-text-dark/60">
              Tela inicial, sem Play Store · volta em 7 dias se recusar
            </p>
          </div>
        </div>

        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={handleInstall}
            className="rounded-xl border-2 border-b-4 border-duo-green-dark bg-duo-green px-3 py-1.5 text-xs font-extrabold uppercase tracking-wide text-white shadow-[0_8px_18px_-10px_rgba(88,204,2,0.9)] transition hover:brightness-105 active:translate-y-0.5 active:border-b-2"
          >
            Instalar
          </button>
          <button
            type="button"
            onClick={dismissInstallPrompt}
            className="rounded-xl border-2 border-duo-border bg-white px-3 py-1.5 text-xs font-extrabold uppercase tracking-wide text-duo-text/60 transition hover:bg-duo-bg dark:border-duo-border-dark dark:bg-duo-surface-dark dark:text-duo-text-dark/60 dark:hover:bg-white/5"
          >
            Agora não
          </button>
        </div>
      </aside>
    </div>
  );
}
