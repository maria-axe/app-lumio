export default function Footer() {
  return (
    <footer className="w-full min-h-10 shrink-0 z-50 bg-gradient-to-r from-sky-50 via-blue-50 to-cyan-50 dark:from-[#14304A] dark:via-[#153A56] dark:to-[#12324A] border-t-2 border-duo-blue/40">
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-2 sm:py-1.5 flex flex-wrap items-center justify-center sm:justify-between gap-x-3 gap-y-1 text-center sm:text-left text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wide text-duo-text/40 dark:text-duo-text-dark/40">
        <span className="flex items-center gap-2 whitespace-nowrap">
          <img src="/img/app-icon.svg" alt="" width="16" height="16" className="w-4 h-4 rounded shrink-0" />
          © {new Date().getFullYear()} Lumio
        </span>
        <span className="leading-snug">Aprenda praticando, um quadro por vez</span>
      </div>
    </footer>
  );
}
