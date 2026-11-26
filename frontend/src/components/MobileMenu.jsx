import { useEffect, useRef } from 'react';
import { useOnboarding } from '../contexts/OnboardingContext.jsx';
import { useUi } from '../contexts/UiContext.jsx';
import { boardLabel } from '../lib/constants.js';
import {
  BoardIcon,
  CloseIcon,
  HomeIcon,
  MoonIcon,
  ProfileIcon,
  SoundOffIcon,
  SoundOnIcon,
  SunIcon,
} from './Icons.jsx';

export default function MobileMenu() {
  const ui = useUi();
  const onboarding = useOnboarding();
  const closeRef = useRef(null);

  useEffect(() => {
    if (!ui.mobileMenuOpen) return undefined;
    closeRef.current?.focus();
    document.body.classList.add('overflow-hidden');

    const onKeyDown = (event) => {
      if (event.key === 'Escape') ui.closeMobileMenu();
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.classList.remove('overflow-hidden');
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [ui.mobileMenuOpen, ui.closeMobileMenu]);

  if (!ui.mobileMenuOpen) return null;

  return (
    <div id="mobile-menu" className="lg:hidden fixed inset-0 z-[60]">
      <button
        type="button"
        onClick={ui.closeMobileMenu}
        aria-label="Fechar menu"
        className="absolute inset-0 w-full h-full bg-slate-950/45 backdrop-blur-sm"
      />
      <aside
        className="relative h-full w-[min(19rem,86vw)] max-w-full bg-white dark:bg-duo-surface-dark border-r-2 border-duo-border dark:border-duo-border-dark shadow-2xl flex flex-col overflow-y-auto scroll-area"
        role="dialog"
        aria-modal="true"
        aria-label="Menu de navegação"
      >
        <div className="flex items-center justify-between gap-3 px-4 py-4 border-b-2 border-duo-border dark:border-duo-border-dark">
          <div className="flex items-center gap-3 min-w-0">
            <img src="/img/app-icon.svg" alt="" width="40" height="40" className="w-10 h-10 rounded-xl shrink-0" />
            <div className="min-w-0">
              <p className="text-[10px] font-extrabold uppercase tracking-wide text-duo-text/50 dark:text-duo-text-dark/50">
                Lumio
              </p>
              <p className="text-sm font-extrabold truncate">{onboarding.profile.name || 'estudante'}</p>
            </div>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={ui.closeMobileMenu}
            aria-label="Fechar menu"
            className="w-9 h-9 shrink-0 rounded-xl border-2 border-duo-border dark:border-duo-border-dark bg-duo-bg dark:bg-duo-bg-dark flex items-center justify-center hover:border-duo-blue hover:text-duo-blue transition-colors"
          >
            <CloseIcon className="w-4 h-4" />
          </button>
        </div>

        <nav className="p-3 flex flex-col gap-1.5" aria-label="Quadros">
          <button
            type="button"
            onClick={ui.closeBoard}
            className={`w-full rounded-2xl border-2 border-transparent px-3 py-3 flex items-center gap-3 text-left font-extrabold text-sm hover:border-duo-blue hover:text-duo-blue transition-colors ${
              ui.route === 'home'
                ? 'border-duo-blue/30 bg-duo-blue/10 text-duo-blue'
                : 'text-duo-text/70 dark:text-duo-text-dark/70'
            }`}
          >
            <HomeIcon />
            Início
          </button>
          {ui.boards.map((board) => {
            const active = ui.activeBoard?.id === board.id;
            return (
              <button
                key={board.id}
                type="button"
                onClick={() => ui.openBoard(board)}
                className={`w-full rounded-2xl border-2 border-transparent px-3 py-3 flex items-center gap-3 text-left font-extrabold text-sm hover:border-duo-blue hover:text-duo-blue transition-colors ${
                  active
                    ? 'border-duo-blue/30 bg-duo-blue/10 text-duo-blue'
                    : 'text-duo-text/70 dark:text-duo-text-dark/70'
                }`}
              >
                <BoardIcon kind={board.kind} />
                <span className="truncate">{boardLabel(board.kind)}</span>
              </button>
            );
          })}
        </nav>

        <div className="mt-auto p-3 border-t-2 border-duo-border dark:border-duo-border-dark flex flex-col gap-1.5">
          <button
            type="button"
            onClick={() => {
              onboarding.open();
              ui.closeMobileMenu();
            }}
            className="w-full rounded-2xl border-2 border-transparent px-3 py-3 flex items-center gap-3 text-left font-extrabold text-sm text-duo-text/70 dark:text-duo-text-dark/70 hover:border-duo-blue hover:text-duo-blue transition-colors"
          >
            <ProfileIcon />
            Editar perfil
          </button>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={ui.toggleSound}
              className="rounded-2xl border-2 border-duo-border dark:border-duo-border-dark bg-duo-bg dark:bg-duo-bg-dark px-2 py-2.5 flex flex-col items-center justify-center gap-1 text-[11px] font-extrabold hover:border-duo-blue hover:text-duo-blue transition-colors"
            >
              {ui.sound ? <SoundOnIcon /> : <SoundOffIcon />}
              Som
            </button>
            <button
              type="button"
              onClick={ui.toggleTheme}
              className="rounded-2xl border-2 border-duo-border dark:border-duo-border-dark bg-duo-bg dark:bg-duo-bg-dark px-2 py-2.5 flex flex-col items-center justify-center gap-1 text-[11px] font-extrabold hover:border-duo-blue hover:text-duo-blue transition-colors"
            >
              {ui.theme === 'dark' ? <SunIcon /> : <MoonIcon />}
              Tema
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}
