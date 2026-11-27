import { useOnboarding } from '../contexts/OnboardingContext.jsx';
import { useProgress } from '../contexts/ProgressContext.jsx';
import { useUi } from '../contexts/UiContext.jsx';
import { boardClass, boardDescription, boardLabel } from '../lib/constants.js';
import { BoardIcon } from './Icons.jsx';

export default function HomePage() {
  const onboarding = useOnboarding();
  const ui = useUi();
  const progress = useProgress();

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-4 p-3 sm:p-4 pb-6 lg:pb-4">
      <section className="rounded-3xl border-2 border-duo-border dark:border-duo-border-dark bg-gradient-to-br from-sky-50 via-blue-50 to-cyan-50 dark:from-[#14304A] dark:via-[#153A56] dark:to-[#12324A] p-3.5 sm:p-5 shadow-[0_16px_40px_-20px_rgba(28,176,246,0.55)]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0 w-full sm:w-auto sm:flex-1">
            <img
              src={onboarding.mascot}
              alt=""
              width="56"
              height="56"
              className="w-11 h-11 sm:w-14 sm:h-14 shrink-0 mascot"
            />
            <div className="min-w-0">
              <h2 className="font-extrabold text-base sm:text-xl leading-snug break-words">
                Pronto para continuar, {onboarding.profile.name || 'estudante'}?
              </h2>
              <p className="text-xs sm:text-sm font-semibold text-duo-text/60 dark:text-duo-text-dark/60 leading-snug">
                Um quadro por vez. Suas perguntas acompanham seu perfil.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => ui.openBoard(ui.continueBoard)}
            className="btn-action w-full sm:w-auto shrink-0 whitespace-nowrap bg-duo-blue text-white font-extrabold uppercase tracking-wide text-xs sm:text-sm rounded-2xl border-b-4 border-duo-blue-dark px-5 sm:px-6 py-2.5 sm:py-3 hover:brightness-105 active:border-b-0 active:translate-y-1 transition"
          >
            Continuar de onde parou
          </button>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <div className="flex-1 h-3 rounded-full bg-white/70 dark:bg-white/10 border-2 border-duo-border dark:border-duo-border-dark overflow-hidden">
            <div
              className="h-full rounded-full bg-duo-green transition-[width] duration-500"
              style={{ width: `${progress.goalProgress}%` }}
            />
          </div>
          <span
            className={`text-xs font-extrabold whitespace-nowrap ${
              progress.goalReached
                ? 'text-duo-green'
                : 'text-duo-text/60 dark:text-duo-text-dark/60'
            }`}
          >
            Meta {progress.todayXp}/{progress.dailyGoal} XP
          </span>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 items-stretch">
        {ui.boards.map((board) => (
          <section
            key={board.id}
            className={`group relative h-full rounded-3xl border-2 border-duo-border dark:border-duo-border-dark bg-white dark:bg-duo-surface-dark shadow-[0_12px_40px_-12px_rgba(0,0,0,0.15)] flex flex-col overflow-hidden board-hover ${boardClass(board.kind)}`}
          >
            <div className="absolute inset-x-0 top-0 h-1 board-strip" aria-hidden="true" />
            <div className="px-4 sm:px-5 py-3 border-b-2 border-duo-border dark:border-duo-border-dark">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="w-9 h-9 shrink-0 rounded-xl border-2 flex items-center justify-center board-icon">
                  <BoardIcon kind={board.kind} className="w-4 h-4" />
                </span>
                <div className="min-w-0">
                  <h3 className="font-extrabold text-sm sm:text-base leading-tight truncate board-accent">
                    {boardLabel(board.kind)}
                  </h3>
                  <p className="text-xs font-semibold text-duo-text/50 dark:text-duo-text-dark/50 leading-snug">
                    {boardDescription(board.kind)}
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between gap-4">
              <div className="rounded-2xl border-2 border-duo-border dark:border-duo-border-dark bg-duo-bg dark:bg-duo-bg-dark p-3 board-cover">
                <p className="text-xs font-bold text-duo-text/60 dark:text-duo-text-dark/60">
                  Pronto para praticar? Este quadro acompanha seu perfil e seu nível atual.
                </p>
              </div>
              <button
                type="button"
                onClick={() => ui.openBoard(board)}
                className="btn-action w-full rounded-2xl border-b-4 border-duo-blue-dark bg-duo-blue text-white font-extrabold uppercase tracking-wide text-xs sm:text-sm px-6 py-2.5 sm:py-3 hover:brightness-105 active:border-b-0 active:translate-y-1 transition"
              >
                Praticar
              </button>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
