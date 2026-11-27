import { useCallback, useEffect, useRef, useState } from 'react';
import { sendChat } from '../lib/api.js';
import { storage } from '../lib/storage.js';
import { useOnboarding } from '../contexts/OnboardingContext.jsx';
import { useProgress } from '../contexts/ProgressContext.jsx';
import { useUi } from '../contexts/UiContext.jsx';
import { TrashIcon, WarningIcon } from './Icons.jsx';

export default function ChatBoard({ subject: initialSubject, clearSignal = 0 }) {
  const onboarding = useOnboarding();
  const ui = useUi();
  const progress = useProgress();

  const [subject, setSubject] = useState(initialSubject);
  const [messages, setMessages] = useState(() => storage.loadHistory(initialSubject));
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmingClear, setConfirmingClear] = useState(false);

  const messagesRef = useRef(messages);
  const scrollRef = useRef(null);
  const controllerRef = useRef(null);
  const clearTimerRef = useRef(null);
  const resetChatRef = useRef(null);
  const levelsRef = useRef({ [initialSubject]: ui.level(initialSubject) });

  const currentLevel = ui.level(subject);
  const subjectMeta = ui.subject(subject);

  const scrollToBottom = useCallback(() => {
    const element = scrollRef.current;
    if (element) element.scrollTop = element.scrollHeight;
  }, []);

  const resetChat = useCallback((nextSubject = subject) => {
    controllerRef.current?.abort();
    controllerRef.current = null;
    setMessages([]);
    setError('');
    setConfirmingClear(false);
    setLoading(false);
    storage.saveHistory(nextSubject, []);
    scrollToBottom();
  }, [scrollToBottom, subject]);
  resetChatRef.current = resetChat;

  useEffect(() => {
    setSubject(initialSubject);
  }, [initialSubject]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    messagesRef.current = storage.loadHistory(subject);
    setMessages(messagesRef.current);
    setInput('');
    setError('');
    setConfirmingClear(false);
    scrollToBottom();
    return () => controllerRef.current?.abort();
  }, [subject, scrollToBottom]);

  useEffect(() => {
    const previous = levelsRef.current[subject];
    if (previous !== undefined && previous !== currentLevel) resetChat(subject);
    levelsRef.current[subject] = currentLevel;
  }, [currentLevel, subject, resetChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading, error, scrollToBottom]);

  useEffect(() => () => {
    if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
  }, []);

  useEffect(() => {
    if (clearSignal > 0) resetChatRef.current?.();
  }, [clearSignal]);

  const askClear = () => {
    if (loading) return;
    setConfirmingClear(true);
    if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
    clearTimerRef.current = setTimeout(() => setConfirmingClear(false), 4000);
  };

  const cancelClear = () => {
    if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
    setConfirmingClear(false);
  };

  const clear = () => {
    if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
    resetChat();
  };

  const send = async (event) => {
    event.preventDefault();
    const content = input.trim();
    if (!content || loading) return;

    const controller = new AbortController();
    controllerRef.current = controller;
    const next = [...messagesRef.current, { role: 'user', content }];
    messagesRef.current = next;

    setMessages(next);
    setInput('');
    setError('');
    setConfirmingClear(false);
    setLoading(true);
    storage.saveHistory(subject, next);
    scrollToBottom();

    try {
      const reply = await sendChat({
        messages: next,
        level: currentLevel,
        subject,
        profile: onboarding.profile,
        signal: controller.signal,
      });
      if (controllerRef.current !== controller) return;
      const withReply = [...messagesRef.current, { role: 'assistant', content: reply }];
      messagesRef.current = withReply;
      setMessages(withReply);
      progress.registerPractice(subject);
    } catch (err) {
      if (err?.name === 'AbortError' || controllerRef.current !== controller) return;
      setError(err.message || 'Erro ao enviar mensagem');
    } finally {
      if (controllerRef.current === controller) {
        controllerRef.current = null;
        setLoading(false);
        storage.saveHistory(subject, messagesRef.current);
        scrollToBottom();
      }
    }
  };

  return (
    <div className="flex flex-col min-h-0 flex-1">
      <div ref={scrollRef} className="flex-1 overflow-y-auto scroll-area px-4 sm:px-5 py-4 space-y-4 bg-[#FCFCFC] dark:bg-duo-bg-dark transition-colors">
        <div className="mx-auto w-full max-w-3xl space-y-4">
          {messages.length === 0 && !loading && (
            <div className="min-h-[42vh] flex flex-col items-center justify-center text-center gap-3 px-6">
              <img src={onboarding.mascot} alt="" width="56" height="56" className="w-14 h-14 mascot mascot-loading" />
              <p className="font-extrabold text-base">Vamos praticar {subjectMeta.label}!</p>
              <p className="text-sm font-semibold text-duo-text/50 dark:text-duo-text-dark/50 max-w-xs">
                Diga <span className="font-extrabold text-duo-green">&quot;{subjectMeta.greeting}&quot;</span> para começar.
              </p>
            </div>
          )}

          {messages.map((message, index) => (
            <div
              key={`${index}-${message.role}`}
              className={`flex items-end gap-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.role !== 'user' && (
                <div className="w-9 h-9 rounded-xl bg-duo-blue/15 border-2 border-duo-blue/30 flex items-center justify-center overflow-hidden shrink-0" aria-hidden="true">
                  <img src={onboarding.mascot} alt="" width="36" height="36" className="w-7 h-7 mascot" />
                </div>
              )}
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap font-semibold ${
                  message.role === 'user'
                    ? 'bg-duo-blue text-white rounded-br-md border-b-4 border-duo-blue-dark'
                    : 'bg-duo-bg dark:bg-[#26373F] text-duo-text dark:text-duo-text-dark rounded-bl-md border-2 border-duo-border dark:border-duo-border-dark'
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-end gap-2 justify-start">
              <div className="w-9 h-9 rounded-xl bg-duo-blue/15 border-2 border-duo-blue/30 flex items-center justify-center overflow-hidden shrink-0" aria-hidden="true">
                <img src={onboarding.mascot} alt="" width="36" height="36" className="w-7 h-7 mascot" />
              </div>
              <div className="bg-duo-bg dark:bg-[#26373F] border-2 border-duo-border dark:border-duo-border-dark rounded-2xl rounded-bl-md px-4 py-3">
                <span className="flex gap-1" role="status" aria-label="Digitando">
                  <span className="w-2 h-2 bg-duo-blue rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-duo-blue rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-duo-blue rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </span>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-duo-red/10 border-2 border-duo-red/40 text-duo-red rounded-2xl px-4 py-3 text-sm font-extrabold" role="alert">
              {error}
            </div>
          )}
        </div>
      </div>

      <form onSubmit={send} className="px-4 sm:px-5 py-3 border-t-2 border-duo-border dark:border-duo-border-dark bg-white dark:bg-duo-surface-dark transition-colors">
        <div className="mx-auto w-full max-w-3xl">
          {confirmingClear && (
            <div className="mb-2 flex items-center gap-2 rounded-2xl border-2 border-duo-red/40 bg-duo-red/10 px-3 py-2">
              <WarningIcon className="w-4 h-4 text-duo-red shrink-0" />
              <span className="text-xs font-extrabold text-duo-red flex-1">Apagar toda a conversa?</span>
              <button type="button" onClick={clear} className="btn-action text-xs font-extrabold uppercase tracking-wide text-white bg-duo-red rounded-xl px-3 py-1.5 border-b-2 border-red-700 hover:brightness-105 active:border-b-0 active:translate-y-0.5 transition">
                Limpar
              </button>
              <button type="button" onClick={cancelClear} className="text-xs font-extrabold uppercase tracking-wide text-duo-text/60 dark:text-duo-text-dark/60 rounded-xl px-3 py-1.5 border-2 border-duo-border dark:border-duo-border-dark hover:border-duo-text/30 transition">
                Cancelar
              </button>
            </div>
          )}

          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              disabled={loading}
              placeholder={`Digite em ${subjectMeta.label}...`}
              autoComplete="off"
              aria-label="Mensagem"
              className="flex-1 min-w-0 bg-duo-bg dark:bg-duo-bg-dark border-2 border-duo-border dark:border-duo-border-dark rounded-2xl px-4 py-2.5 text-sm font-semibold placeholder:text-duo-text/40 dark:placeholder:text-duo-text-dark/40 focus:border-duo-blue disabled:opacity-50 transition-colors"
            />
            {messages.length > 0 && (
              <button
                type="button"
                onClick={askClear}
                disabled={loading}
                title="Limpar conversa"
                aria-label="Limpar conversa"
                className="btn-3d icon-btn w-11 h-11 flex items-center justify-center rounded-2xl bg-white dark:bg-duo-bg-dark border-2 border-duo-border dark:border-duo-border-dark text-duo-text/50 dark:text-duo-text-dark/50 hover:border-duo-red/50 hover:text-duo-red transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <TrashIcon />
              </button>
            )}
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="btn-action bg-duo-blue text-white font-extrabold uppercase tracking-wide text-xs rounded-2xl border-b-4 border-duo-blue-dark px-4 py-2.5 hover:brightness-105 active:border-b-0 active:translate-y-1 transition disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:brightness-100 disabled:active:translate-y-0"
            >
              Enviar
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
