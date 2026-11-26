import { useEffect, useRef } from 'react';
import { useOnboarding } from '../contexts/OnboardingContext.jsx';
import { useUi } from '../contexts/UiContext.jsx';
import { boardClass, boardDescription, boardLabel } from '../lib/constants.js';
import { primaryButton } from './BoardUi.jsx';
import { BoardIcon } from './Icons.jsx';

const STEP_LABELS = ['Seu perfil', 'Avatar', 'Quadro', 'Praticar'];
const DISPLAY_STEPS = [1, 2, 3];

export default function OnboardingOverlay() {
  const onboarding = useOnboarding();
  const ui = useUi();
  const firstFieldRef = useRef(null);

  useEffect(() => {
    if (onboarding.visible && onboarding.step === 1) firstFieldRef.current?.focus();
  }, [onboarding.visible, onboarding.step]);

  if (!onboarding.visible) return null;

  const { step, form } = onboarding;

  const optionClass = (selected) =>
    selected
      ? 'border-duo-blue bg-duo-blue/10 text-duo-blue'
      : 'border-duo-border dark:border-duo-border-dark hover:border-duo-blue/50';

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-6 bg-duo-bg dark:bg-duo-bg-dark"
      role="dialog"
      aria-modal="true"
      aria-label="Configuração inicial"
    >
      <div className="w-full max-w-2xl max-h-[94vh] overflow-y-auto scroll-area rounded-3xl border-2 border-duo-border dark:border-duo-border-dark bg-white dark:bg-duo-surface-dark shadow-[0_24px_60px_-12px_rgba(0,0,0,0.4)]">
        <div className="px-5 sm:px-6 py-4 border-b-2 border-duo-border dark:border-duo-border-dark bg-sky-50 dark:bg-[#1E3138]">
          <div className="hidden sm:flex items-center justify-between gap-2">
            <StepLabel index={1} current={step} label="1. Seu perfil" />
            <StepBar value={(step - 1) * 33.333} />
            <StepLabel index={2} current={step} label="2. Avatar" />
            <StepBar value={(step - 2) * 50} />
            <StepLabel index={3} current={step} label="3. Quadro" />
            <StepBar value={(step - 3) * 100} />
            <StepLabel index={4} current={step} label="4. Praticar" />
          </div>
          <div className="sm:hidden">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[11px] font-extrabold uppercase tracking-wide text-duo-blue">
                Etapa {step} de 4
              </span>
              <span className="text-[11px] font-extrabold uppercase tracking-wide text-duo-text/50 dark:text-duo-text-dark/50">
                {STEP_LABELS[step - 1]}
              </span>
            </div>
            <div className="mt-2 h-1.5 rounded-full bg-duo-border dark:bg-duo-border-dark overflow-hidden">
              <div
                className="h-full rounded-full bg-duo-blue transition-[width] duration-500"
                style={{ width: `${step * 25}%` }}
              />
            </div>
          </div>
        </div>

        {step === 1 && (
          <form onSubmit={(event) => {
            event.preventDefault();
            onboarding.submit();
          }} className="p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-3">
              <img src={onboarding.formMascot} alt="" width="56" height="56" className="w-14 h-14 mascot shrink-0" />
              <div className="min-w-0">
                <h1 className="font-extrabold text-xl sm:text-2xl leading-tight">Vamos conhecer você</h1>
                <p className="text-xs sm:text-sm font-semibold text-duo-text/50 dark:text-duo-text-dark/50 leading-snug">
                  Suas respostas ajustam as perguntas à sua idade e ao seu objetivo.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="block">
                <FieldLabel>Nome</FieldLabel>
                <input
                  ref={firstFieldRef}
                  type="text"
                  maxLength={60}
                  autoComplete="given-name"
                  placeholder="Como podemos chamar você?"
                  value={form.name}
                  onChange={(event) => onboarding.updateForm({ name: event.target.value })}
                  className={inputClass}
                />
              </label>
              <label className="block">
                <FieldLabel>Idade</FieldLabel>
                <input
                  type="number"
                  min="3"
                  max="100"
                  placeholder="Ex.: 10"
                  value={form.age ?? ''}
                  onChange={(event) => {
                    const raw = event.target.value;
                    onboarding.updateForm({
                      age: raw === '' ? '' : Number(raw),
                    });
                    onboarding.updateSchoolingSuggestion();
                  }}
                  className={inputClass}
                />
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="block">
                <FieldLabel>Objetivo no app</FieldLabel>
                <select
                  value={form.objective}
                  onChange={(event) => onboarding.updateForm({ objective: event.target.value })}
                  className={`${inputClass} select-arrow appearance-none pr-10`}
                >
                  {onboarding.objectives.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <FieldLabel>
                  Escolaridade <span className="font-bold normal-case tracking-normal opacity-60">(sugerida pela idade)</span>
                </FieldLabel>
                <select
                  value={form.schooling}
                  onChange={(event) =>
                    onboarding.updateForm({ schooling: event.target.value, schoolingTouched: true })
                  }
                  className={`${inputClass} select-arrow appearance-none pr-10`}
                >
                  {onboarding.schoolingOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <fieldset>
              <legend className="text-xs font-extrabold uppercase tracking-wide text-duo-text/50 dark:text-duo-text-dark/50 mb-2">
                Temas preferidos <span className="font-bold normal-case tracking-normal opacity-60">(até 3, opcional)</span>
              </legend>
              <div className="flex flex-wrap gap-2">
                {onboarding.interestOptions.map((interest) => {
                  const selected = form.interests.includes(interest.id);
                  return (
                    <button
                      key={interest.id}
                      type="button"
                      onClick={() => onboarding.toggleInterest(interest.id)}
                      aria-pressed={selected}
                      className={`px-3 py-1.5 rounded-xl border-2 text-xs font-extrabold transition-colors ${optionClass(selected)}`}
                    >
                      {interest.label}
                    </button>
                  );
                })}
              </div>
            </fieldset>

            {onboarding.error && (
              <div className="rounded-2xl border-2 border-duo-red/40 bg-duo-red/10 text-duo-red px-4 py-3 text-sm font-extrabold">
                {onboarding.error}
              </div>
            )}

            <button type="submit" className={primaryButton}>
              Continuar
            </button>
          </form>
        )}

        {step === 2 && (
          <div className="p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-4">
              <img src={onboarding.avatarPreview || onboarding.formMascot} alt="Prévia do seu vaga-lume" width="112" height="112" className="w-28 h-28 shrink-0 mascot" />
              <div className="min-w-0">
                <h1 className="font-extrabold text-xl sm:text-2xl leading-tight">Crie seu vaga-lume</h1>
                <p className="text-xs sm:text-sm font-semibold text-duo-text/50 dark:text-duo-text-dark/50 leading-snug">
                  Roupas e acessórios mudam só o seu avatar: não alteram seu nível nem o conteúdo dos desafios.
                </p>
              </div>
            </div>

            {onboarding.avatarOptions.map((group) => (
              <fieldset key={group.id}>
                <legend className="text-xs font-extrabold uppercase tracking-wide text-duo-text/50 dark:text-duo-text-dark/50 mb-2">
                  {group.label}
                </legend>
                <div className="flex flex-wrap gap-2">
                  {group.options.map((option) => {
                    const selected = form.avatar[group.id] === option.id;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => onboarding.setAvatar(group.id, option.id)}
                        aria-pressed={selected}
                        className={`px-3 py-1.5 rounded-xl border-2 text-xs font-extrabold transition-colors ${optionClass(selected)}`}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            ))}

            <div className="flex flex-col sm:flex-row gap-3">
              <button type="button" onClick={onboarding.backToProfile} className={secondaryButton}>
                Voltar
              </button>
              <button type="button" onClick={onboarding.confirmAvatar} className={`${primaryButton} flex-1`}>
                Continuar
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="p-5 sm:p-6 space-y-4">
            <div>
              <h1 className="font-extrabold text-xl sm:text-2xl leading-tight">Qual quadro vamos começar?</h1>
              <p className="text-sm font-semibold text-duo-text/50 dark:text-duo-text-dark/50">Você poderá trocar depois.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {ui.boards.map((board) => (
                <button
                  key={board.id}
                  type="button"
                  onClick={() => {
                    onboarding.choose();
                    ui.openBoard(board);
                  }}
                  className={`flex items-center gap-3 text-left rounded-2xl border-2 border-duo-border dark:border-duo-border-dark bg-duo-bg dark:bg-duo-bg-dark p-4 board-hover ${boardClass(board.kind)}`}
                >
                  <span className="w-10 h-10 shrink-0 rounded-xl border-2 flex items-center justify-center board-icon">
                    <BoardIcon kind={board.kind} />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-extrabold">{boardLabel(board.kind)}</span>
                    <span className="block text-xs font-semibold text-duo-text/50 dark:text-duo-text-dark/50">
                      {boardDescription(board.kind)}
                    </span>
                  </span>
                </button>
              ))}
            </div>
            <button type="button" onClick={onboarding.backToAvatar} className={secondaryButton}>
              Voltar
            </button>
          </div>
        )}

        {DISPLAY_STEPS.includes(step) && (
          <div className="px-5 sm:px-6 pb-5 text-center text-[10px] font-extrabold uppercase tracking-wide text-duo-text/40 dark:text-duo-text-dark/40">
            Etapa {step} de 4
          </div>
        )}
      </div>
    </div>
  );
}

const inputClass =
  'w-full rounded-2xl border-2 border-duo-border dark:border-duo-border-dark bg-duo-bg dark:bg-duo-bg-dark px-4 py-3 text-sm font-bold focus:outline-none focus:border-duo-blue';

const secondaryButton =
  'w-full sm:w-auto rounded-2xl border-2 border-duo-border dark:border-duo-border-dark px-6 py-3 text-sm font-extrabold hover:border-duo-blue transition-colors';

function FieldLabel({ children }) {
  return (
    <span className="block text-xs font-extrabold uppercase tracking-wide text-duo-text/50 dark:text-duo-text-dark/50 mb-1">
      {children}
    </span>
  );
}

function StepLabel({ index, current, label }) {
  return (
    <span
      className={`text-[11px] font-extrabold uppercase tracking-wide ${
        current >= index ? 'text-duo-blue' : 'text-duo-text/40'
      }`}
    >
      {label}
    </span>
  );
}

function StepBar({ value }) {
  return (
    <span className="flex-1 h-1 rounded-full bg-duo-border dark:bg-duo-border-dark overflow-hidden">
      <span
        className="block h-full bg-duo-blue transition-[width] duration-500"
        style={{ width: `${value}%` }}
      />
    </span>
  );
}
