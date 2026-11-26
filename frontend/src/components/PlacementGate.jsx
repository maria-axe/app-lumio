import { useEffect, useRef } from 'react';
import { useOnboarding } from '../contexts/OnboardingContext.jsx';
import { usePlacement } from '../contexts/PlacementContext.jsx';
import { useUi } from '../contexts/UiContext.jsx';
import { isLanguageBoard } from '../lib/placement.js';
import { primaryButton } from './BoardUi.jsx';
import { WarningIcon } from './Icons.jsx';

export default function PlacementGate() {
  const ui = useUi();
  const onboarding = useOnboarding();
  const placement = usePlacement();
  const panelRef = useRef(null);

  const activeId = ui.activeBoard?.id;
  const activeSubject = ui.activeBoard?.subject;

  useEffect(() => {
    if (onboarding.visible) {
      if (placement.visible) placement.close();
      return;
    }

    if (ui.route !== 'board' || !activeId || !isLanguageBoard(activeId)) {
      if (placement.visible) placement.close();
      if (placement.dismissed) placement.clearDismissed();
      return;
    }

    if (placement.isDone(activeSubject)) {
      if (placement.visible && placement.phase !== 'result') placement.close();
      return;
    }

    if (
      placement.dismissed?.boardId === activeId &&
      placement.dismissed?.subject === activeSubject
    ) {
      return;
    }

    if (!placement.visible || placement.boardId !== activeId) {
      placement.openFor(activeId, activeSubject);
    }
  }, [
    activeId,
    activeSubject,
    onboarding.visible,
    placement.boardId,
    placement.clearDismissed,
    placement.close,
    placement.dismissed,
    placement.isDone,
    placement.visible,
    placement.openFor,
    placement.phase,
    ui.route,
  ]);

  useEffect(() => {
    if (placement.visible) panelRef.current?.focus();
  }, [placement.visible]);

  if (!placement.visible || onboarding.visible) return null;

  const currentQuestion = placement.test?.questions?.[placement.index];
  const currentAnswer = placement.answers?.[placement.index];
  const answeredAll = placement.answers.length > 0 && placement.answers.every((answer) => answer !== null);
  const alreadyTested = placement.isDone(placement.subject);

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 p-3 sm:p-5" role="presentation">
      <section
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label="Teste de nivelamento"
        className="w-full max-w-lg max-h-full overflow-y-auto scroll-area rounded-3xl border-2 border-duo-border dark:border-duo-border-dark bg-white dark:bg-duo-surface-dark shadow-[0_24px_80px_-12px_rgba(0,0,0,0.65)] focus:outline-none"
      >
        <header className="flex items-center gap-3 px-4 sm:px-5 py-4 border-b-2 border-duo-border dark:border-duo-border-dark">
          <img src={onboarding.mascot} alt="" width="44" height="44" className="w-11 h-11 mascot shrink-0" />
          <div className="min-w-0">
            <h2 className="font-extrabold text-base leading-tight">Teste de nivelamento</h2>
            <p className="text-xs font-semibold text-duo-text/50 dark:text-duo-text-dark/50">
              {placement.subject ? ui.subject(placement.subject).label : 'Escolha um idioma'}
            </p>
          </div>
        </header>

        <div className="px-4 sm:px-5 py-5">
          {placement.phase === 'language' && (
            <div className="space-y-5">
              <div>
                <p className="font-extrabold">Qual idioma você quer praticar?</p>
                <p className="mt-1 text-sm font-semibold text-duo-text/50 dark:text-duo-text-dark/50">
                  {alreadyTested
                    ? 'Você já fez o teste deste idioma. Pode entrar direto.'
                    : 'Vamos aplicar um teste rápido para definir seu nível.'}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2" role="group" aria-label="Idioma">
                {ui.subjects.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => placement.selectSubject(item.id)}
                    aria-pressed={placement.subject === item.id}
                    className={`flex flex-col items-center gap-1 rounded-2xl border-2 px-2 py-3 text-xs font-extrabold transition ${
                      placement.subject === item.id
                        ? 'border-duo-blue bg-duo-blue/10 text-duo-blue'
                        : 'border-duo-border dark:border-duo-border-dark hover:border-duo-blue/60'
                    }`}
                  >
                    <span className="text-xl leading-none" aria-hidden="true">{item.flag}</span>
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <button type="button" onClick={placement.cancel} className="btn-3d flex-1 rounded-2xl border-2 border-duo-border dark:border-duo-border-dark px-4 py-3 text-xs font-extrabold uppercase tracking-wide">
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={placement.begin}
                  disabled={!placement.subject}
                  className={`${primaryButton} flex-1`}
                >
                  Continuar
                </button>
              </div>
            </div>
          )}

          {placement.phase === 'loading' && (
            <div className="py-10 flex flex-col items-center gap-3 text-center">
              <img src={onboarding.mascot} alt="" width="56" height="56" className="w-14 h-14 mascot mascot-loading" />
              <p className="font-extrabold">
                {placement.test ? 'Calculando seu nível...' : 'Preparando teste...'}
              </p>
              <p className="text-xs font-semibold text-duo-text/50 dark:text-duo-text-dark/50">
                Isso leva alguns segundos.
              </p>
            </div>
          )}

          {placement.phase === 'test' && currentQuestion && (
            <div className="space-y-5">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-extrabold uppercase tracking-wide text-duo-text/50 dark:text-duo-text-dark/50">
                  <span>Pergunta {placement.index + 1}/{placement.test.questions.length}</span>
                  <span>{ui.subject(placement.subject).label}</span>
                </div>
                <div className="h-3 rounded-full bg-duo-border dark:bg-duo-border-dark overflow-hidden">
                  <div
                    className="h-full rounded-full bg-duo-blue transition-[width] duration-300"
                    style={{ width: `${((placement.index + 1) / placement.test.questions.length) * 100}%` }}
                  />
                </div>
              </div>

              <p className="rounded-2xl border-2 border-duo-border dark:border-duo-border-dark bg-duo-bg dark:bg-duo-bg-dark px-4 py-4 text-sm font-bold leading-relaxed">
                {currentQuestion.question}
              </p>

              <div className="space-y-2">
                {currentQuestion.options.map((option, optionIndex) => (
                  <button
                    key={optionIndex}
                    type="button"
                    onClick={() => placement.chooseAnswer(optionIndex)}
                    aria-pressed={currentAnswer === optionIndex}
                    className={`w-full flex items-center gap-3 rounded-2xl border-2 px-3 py-3 text-left text-sm font-bold transition ${
                      currentAnswer === optionIndex
                        ? 'border-duo-blue bg-duo-blue/10 text-duo-blue'
                        : 'border-duo-border dark:border-duo-border-dark bg-white dark:bg-duo-surface-dark hover:border-duo-blue/60'
                    }`}
                  >
                    <span className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center text-xs font-extrabold shrink-0 ${
                      currentAnswer === optionIndex
                        ? 'border-duo-blue bg-duo-blue text-white'
                        : 'border-duo-border dark:border-duo-border-dark text-duo-text/60 dark:text-duo-text-dark/60'
                    }`}>
                      {optionIndex + 1}
                    </span>
                    {option}
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={placement.previous}
                  disabled={placement.index === 0}
                  className="btn-3d rounded-2xl border-2 border-duo-border dark:border-duo-border-dark px-4 py-3 text-xs font-extrabold uppercase tracking-wide disabled:opacity-40"
                >
                  Anterior
                </button>
                <button
                  type="button"
                  onClick={placement.next}
                  disabled={currentAnswer === null || (placement.index === placement.test.questions.length - 1 && !answeredAll)}
                  className={primaryButton}
                >
                  {placement.index === placement.test.questions.length - 1 ? 'Ver resultado' : 'Próxima'}
                </button>
              </div>
            </div>
          )}

          {placement.phase === 'result' && placement.result && (
            <div className="py-6 flex flex-col items-center gap-4 text-center">
              <div className="w-16 h-16 rounded-2xl border-2 border-duo-green bg-duo-green/10 flex items-center justify-center text-2xl font-extrabold text-duo-green">
                {placement.result.level}
              </div>
              <div>
                <p className="font-extrabold text-lg">Nível definido!</p>
                <p className="mt-1 text-sm font-semibold text-duo-text/50 dark:text-duo-text-dark/50">
                  Você acertou {placement.result.score} de {placement.result.total} perguntas.
                </p>
              </div>
              <button type="button" onClick={placement.close} className={primaryButton}>
                Começar prática
              </button>
            </div>
          )}

          {placement.phase === 'error' && (
            <div className="space-y-4">
              <div className="flex items-start gap-2 rounded-2xl border-2 border-duo-red/40 bg-duo-red/10 px-4 py-3 text-sm font-extrabold text-duo-red" role="alert">
                <WarningIcon className="w-5 h-5 shrink-0" />
                <span>{placement.error}</span>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={placement.cancel} className="btn-3d flex-1 rounded-2xl border-2 border-duo-border dark:border-duo-border-dark px-4 py-3 text-xs font-extrabold uppercase tracking-wide">
                  Cancelar
                </button>
                <button type="button" onClick={placement.retry} className={primaryButton}>
                  Tentar novamente
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
