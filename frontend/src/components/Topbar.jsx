import { useOnboarding } from '../contexts/OnboardingContext.jsx';
import { useProgress } from '../contexts/ProgressContext.jsx';
import { useUi } from '../contexts/UiContext.jsx';
import {
  BoltIcon,
  CloseIcon,
  FlameIcon,
  MenuIcon,
  MoonIcon,
  ProfileIcon,
  SoundOffIcon,
  SoundOnIcon,
  SunIcon,
} from './Icons.jsx';

export default function Topbar() {
  const ui = useUi();
  const onboarding = useOnboarding();
  const progress = useProgress();

  return (
    <header className="sticky top-0 z-50 w-full h-16 bg-gradient-to-r from-sky-50 via-blue-50 to-cyan-50 dark:from-[#14304A] dark:via-[#153A56] dark:to-[#12324A] border-b-2 border-duo-blue/40 shadow-[0_10px_30px_-18px_rgba(28,176,246,0.55)] transition-colors">
      <div className="h-full w-full max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            type="button"
            onClick={ui.toggleMobileMenu}
            aria-controls="mobile-menu"
            aria-expanded={ui.mobileMenuOpen}
            aria-label={ui.mobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
            className="btn-3d icon-btn w-9 h-9 shrink-0 flex items-center justify-center rounded-xl bg-white dark:bg-duo-surface-dark border-2 border-duo-border dark:border-duo-border-dark lg:hidden"
          >
            {ui.mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
          <img
            src="/img/app-icon.svg"
            alt=""
            width="36"
            height="36"
            className="hidden sm:block w-9 h-9 rounded-xl lg:hidden"
          />
          <div className="min-w-0">
            <p className="text-[10px] font-extrabold uppercase tracking-wide text-duo-text/40 dark:text-duo-text-dark/40">
              Bem-vindo de volta
            </p>
            <h1 className="font-extrabold text-base leading-tight truncate">
              Olá, {onboarding.profile.name || 'estudante'}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden sm:flex items-center gap-1.5 rounded-xl bg-white/70 dark:bg-white/5 border-2 border-duo-blue/25 px-2.5 py-1.5" title="Meta diária">
            <span className="text-[10px] font-extrabold uppercase tracking-wide text-duo-text/50 dark:text-duo-text-dark/50">Meta</span>
            <span className="text-xs font-extrabold">
              {progress.todayXp}/{progress.dailyGoal}
            </span>
            <span className="w-12 h-1.5 rounded-full bg-duo-border dark:bg-duo-border-dark overflow-hidden">
              <span
                className="block h-full rounded-full bg-duo-green transition-[width] duration-500"
                style={{ width: `${progress.goalProgress}%` }}
              />
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 rounded-xl bg-white/70 dark:bg-white/5 border-2 border-duo-blue/25 px-2.5 py-1.5" title="Ofensiva">
            <FlameIcon className="w-4 h-4 text-duo-blue" />
            <span className="font-extrabold text-xs">{progress.streak}</span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 rounded-xl bg-white/70 dark:bg-white/5 border-2 border-duo-blue/25 px-2.5 py-1.5" title="XP total">
            <BoltIcon className="w-4 h-4 text-duo-blue" />
            <span className="font-extrabold text-xs">{progress.xp} XP</span>
          </div>
          <button
            type="button"
            onClick={onboarding.open}
            title="Editar perfil"
            aria-label="Editar perfil"
            className="btn-3d icon-btn w-9 h-9 hidden sm:flex lg:hidden items-center justify-center rounded-xl bg-white dark:bg-duo-surface-dark border-2 border-duo-border dark:border-duo-border-dark"
          >
            <ProfileIcon className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={ui.toggleSound}
            title={ui.sound ? 'Desativar som' : 'Ativar som'}
            aria-label={ui.sound ? 'Desativar som' : 'Ativar som'}
            className="btn-3d icon-btn w-9 h-9 hidden sm:flex items-center justify-center rounded-xl bg-white dark:bg-duo-surface-dark border-2 border-duo-border dark:border-duo-border-dark"
          >
            {ui.sound ? <SoundOnIcon /> : <SoundOffIcon />}
          </button>
          <button
            type="button"
            onClick={ui.toggleTheme}
            title={ui.theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
            aria-label={ui.theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'}
            className="btn-3d icon-btn w-9 h-9 hidden sm:flex items-center justify-center rounded-xl bg-white dark:bg-duo-surface-dark border-2 border-duo-border dark:border-duo-border-dark"
          >
            {ui.theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>
        </div>
      </div>
    </header>
  );
}
