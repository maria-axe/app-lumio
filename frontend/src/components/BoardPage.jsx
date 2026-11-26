import { useEffect, useRef, useState } from 'react';
import { useProgress } from '../contexts/ProgressContext.jsx';
import { useUi } from '../contexts/UiContext.jsx';
import { boardClass, boardLabel } from '../lib/constants.js';
import ChatBoard from './ChatBoard.jsx';
import ClearBoardButton from './ClearBoardButton.jsx';
import CuriosidadesBoard from './CuriosidadesBoard.jsx';
import DialogosBoard from './DialogosBoard.jsx';
import { BoltIcon, BoardIcon, FlameIcon } from './Icons.jsx';
import MateriasBoard from './MateriasBoard.jsx';
import MemoriaBoard from './MemoriaBoard.jsx';
import QuizBoard from './QuizBoard.jsx';

function renderBoard(board, clearSignal) {
  switch (board.kind) {
    case 'chat':
      return <ChatBoard subject={board.subject} clearSignal={clearSignal} />;
    case 'quiz':
      return <QuizBoard subject={board.subject} clearSignal={clearSignal} />;
    case 'materias':
      return <MateriasBoard subject={board.subject} clearSignal={clearSignal} />;
    case 'curiosidades':
      return <CuriosidadesBoard clearSignal={clearSignal} />;
    case 'dialogos':
      return <DialogosBoard subject={board.subject} clearSignal={clearSignal} />;
    case 'memoria':
      return <MemoriaBoard subject={board.subject} clearSignal={clearSignal} />;
    default:
      return null;
  }
}

export default function BoardPage() {
  const ui = useUi();
  const progress = useProgress();
  const panelRef = useRef(null);
  const [clearSignal, setClearSignal] = useState(0);
  const board = ui.activeBoard;

  useEffect(() => {
    panelRef.current?.focus();
  }, [board?.id]);

  if (!board) return null;

  const state = progress.state(board.subject);
  const currentSubject = ui.subject(board.subject);
  const subtitle =
    board.kind === 'materias'
      ? ui.materia(board.subject).label
      : board.kind === 'curiosidades'
        ? 'Mundo'
        : `${currentSubject.flag} ${currentSubject.label}`;

  return (
    <section
      ref={panelRef}
      tabIndex={-1}
      className="w-full focus:outline-none"
      role="region"
      aria-label={boardLabel(board.kind)}
    >
      <div className="w-full max-w-6xl mx-auto p-3 sm:p-4 pb-6 lg:pb-4">
        <div
          className={`h-[calc(100vh-8.75rem)] lg:h-[calc(100vh-8.5rem)] rounded-3xl border-2 border-duo-border dark:border-duo-border-dark bg-white dark:bg-duo-surface-dark shadow-[0_24px_60px_-12px_rgba(0,0,0,0.4)] flex flex-col overflow-hidden transition-colors ${boardClass(board.kind)}`}
        >
          <div className="px-4 sm:px-5 py-3.5 border-b-2 border-duo-border dark:border-duo-border-dark bg-gradient-to-r from-sky-50 to-white dark:from-[#1E3138] dark:to-duo-surface-dark flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <span className="w-10 h-10 shrink-0 rounded-xl border-2 flex items-center justify-center board-icon">
                <BoardIcon kind={board.kind} />
              </span>
              <div className="min-w-0">
                <h2 className="font-extrabold text-base leading-tight truncate board-accent">{boardLabel(board.kind)}</h2>
                <p className="text-[10px] font-extrabold uppercase tracking-wide text-duo-text/40 dark:text-duo-text-dark/40 truncate">
                  {subtitle}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {board.kind !== 'materias' && (
                <>
                  <span className="flex items-center gap-1 text-[11px] font-extrabold text-duo-text/60 dark:text-duo-text-dark/60" title="Ofensiva">
                    <FlameIcon className="w-3.5 h-3.5 text-duo-blue" />
                    {state.streak}
                  </span>
                  <span className="flex items-center gap-1 text-[11px] font-extrabold text-duo-text/60 dark:text-duo-text-dark/60" title="XP do quadro">
                    <BoltIcon className="w-3.5 h-3.5 text-duo-blue" />
                    {state.xp}
                  </span>
                </>
              )}
              <ClearBoardButton onClear={() => setClearSignal((value) => value + 1)} />
              <button
                type="button"
                onClick={ui.closeBoard}
                title="Voltar aos quadros"
                aria-label="Voltar aos quadros"
                className="btn-3d flex items-center gap-1.5 rounded-xl bg-white dark:bg-duo-bg-dark border-2 border-duo-border dark:border-duo-border-dark px-2.5 py-1.5 text-[11px] font-extrabold text-duo-text/70 dark:text-duo-text-dark/70 hover:border-duo-blue hover:text-duo-blue transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                <span className="hidden sm:inline">Voltar aos quadros</span>
              </button>
            </div>
          </div>

          <div key={board.id} className="flex flex-col min-h-0 flex-1">
            {renderBoard(board, clearSignal)}
          </div>
        </div>
      </div>
    </section>
  );
}
