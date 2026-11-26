import { useOnboarding } from '../contexts/OnboardingContext.jsx';
import { useUi } from '../contexts/UiContext.jsx';
import { boardLabel } from '../lib/constants.js';
import { BoardIcon, PanelCloseIcon, PanelOpenIcon, ProfileIcon } from './Icons.jsx';

export default function Sidebar() {
  const ui = useUi();
  const onboarding = useOnboarding();

  return (
    <>
      <aside
        id="desktop-sidebar"
        aria-hidden={!ui.sidebarOpen}
        inert={ui.sidebarOpen ? undefined : ''}
        className={`hidden lg:flex sticky top-0 z-40 h-screen shrink-0 flex-col overflow-hidden bg-white/90 dark:bg-duo-surface-dark/90 backdrop-blur transition-[width] duration-300 ease-out ${
          ui.sidebarOpen
            ? 'w-64 border-r-2 border-duo-border dark:border-duo-border-dark'
            : 'w-0 border-r-0 pointer-events-none'
        }`}
      >
        <div className="flex h-full w-64 shrink-0 flex-col">
          <div className="flex items-center justify-between gap-2 px-4 py-4 border-b-2 border-duo-border dark:border-duo-border-dark">
            <button
              type="button"
              onClick={ui.closeBoard}
              title="Início"
              aria-label="Ir para o início"
              className="flex items-center gap-3 min-w-0 rounded-2xl p-1 hover:bg-duo-bg dark:hover:bg-duo-bg-dark transition-colors"
            >
              <img
                src="/img/app-icon.svg"
                alt=""
                width="40"
                height="40"
                className="w-10 h-10 rounded-xl border-2 border-duo-blue/30 shrink-0"
              />
              <span className="min-w-0 text-left">
                <span className="block text-[10px] font-extrabold uppercase tracking-widest text-duo-text/40 dark:text-duo-text-dark/40">
                  Lumio
                </span>
                <span className="block text-sm font-extrabold truncate">
                  {onboarding.profile.name || 'estudante'}
                </span>
              </span>
            </button>

            <button
              type="button"
              onClick={ui.closeSidebar}
              title="Fechar menu"
              aria-label="Fechar menu"
              className="btn-3d w-8 h-8 shrink-0 flex items-center justify-center rounded-xl bg-duo-blue/10 dark:bg-duo-blue/15 border-2 border-duo-blue/40 text-duo-blue hover:bg-duo-blue hover:text-white transition-colors"
            >
              <PanelCloseIcon />
            </button>
          </div>

          <nav className="flex-1 flex flex-col gap-1.5 px-3 py-4 overflow-y-auto scroll-area" aria-label="Quadros">
            <p className="px-3 pb-2 text-[10px] font-extrabold uppercase tracking-widest text-duo-text/40 dark:text-duo-text-dark/40">
              Quadros
            </p>
            {ui.boards.map((board) => {
              const active = ui.activeBoard?.id === board.id;
              return (
                <button
                  key={board.id}
                  type="button"
                  onClick={() => ui.openBoard(board)}
                  aria-current={active ? 'page' : undefined}
                  className={`w-full flex items-center gap-3 rounded-2xl border-2 px-3 py-2.5 text-left transition-all ${
                    active
                      ? 'bg-duo-blue text-white border-duo-blue shadow-[0_10px_24px_-12px_rgba(28,176,246,0.9)]'
                      : 'bg-duo-bg dark:bg-duo-bg-dark border-duo-border dark:border-duo-border-dark text-duo-text/70 dark:text-duo-text-dark/70 hover:border-duo-blue hover:text-duo-blue'
                  }`}
                >
                  <span
                    className={`w-9 h-9 shrink-0 rounded-xl border-2 flex items-center justify-center ${
                      active
                        ? 'border-white/30 bg-white/15 text-white'
                        : 'border-duo-border dark:border-duo-border-dark'
                    }`}
                  >
                    <BoardIcon kind={board.kind} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-extrabold truncate">{boardLabel(board.kind)}</span>
                    <span
                      className={`block text-[10px] font-bold uppercase tracking-wide truncate ${
                        active
                          ? 'text-white/60'
                          : 'text-duo-text/40 dark:text-duo-text-dark/40'
                      }`}
                    >
                      Quadro
                    </span>
                  </span>
                  {active && (
                    <span className="w-2 h-2 rounded-full bg-white shrink-0" aria-hidden="true" />
                  )}
                </button>
              );
            })}
          </nav>

          <div className="px-3 py-3 border-t-2 border-duo-border dark:border-duo-border-dark">
            <button
              type="button"
              onClick={onboarding.open}
              className="w-full flex items-center gap-3 rounded-2xl border-2 border-duo-border dark:border-duo-border-dark bg-duo-bg dark:bg-duo-bg-dark px-3 py-2.5 text-left text-duo-text/70 dark:text-duo-text-dark/70 hover:border-duo-blue hover:text-duo-blue transition-colors"
            >
              <span className="w-9 h-9 shrink-0 rounded-xl border-2 border-duo-border dark:border-duo-border-dark flex items-center justify-center">
                <ProfileIcon />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-extrabold truncate">Editar perfil</span>
                <span className="block text-[10px] font-bold uppercase tracking-wide text-duo-text/40 dark:text-duo-text-dark/40">
                  Nome e idade
                </span>
              </span>
            </button>
          </div>
        </div>
      </aside>
      {!ui.sidebarOpen && (
        <button
          type="button"
          onClick={ui.openSidebar}
          aria-controls="desktop-sidebar"
          aria-expanded={false}
          aria-label="Abrir sidebar"
          title="Abrir sidebar"
          className="hidden lg:flex fixed left-0 top-1/2 z-50 -translate-y-1/2 w-10 h-24 items-center justify-center rounded-r-2xl border-2 border-l-0 border-duo-blue/50 bg-sky-50 dark:bg-[#153A56] text-duo-blue shadow-[0_10px_28px_-10px_rgba(28,176,246,0.8)] backdrop-blur hover:bg-duo-blue hover:text-white hover:border-duo-blue transition-colors"
        >
          <span className="flex flex-col items-center gap-2">
            <PanelOpenIcon className="w-6 h-6" />
            <span className="[writing-mode:vertical-rl] text-[9px] font-extrabold uppercase tracking-widest">
              Menu
            </span>
          </span>
        </button>
      )}
    </>
  );
}
