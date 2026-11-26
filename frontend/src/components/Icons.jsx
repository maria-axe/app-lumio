const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2.2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
};

export function BoardIcon({ kind, className = 'w-5 h-5' }) {
  const props = { ...base, className };

  if (kind === 'chat') {
    return (
      <svg {...props} viewBox="0 0 24 24">
        <path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 8.5 8.5 0 0 1-3.8-.9L3 21l1.9-5.2A8.4 8.4 0 0 1 4 11.5a8.4 8.4 0 0 1 8.5-8.4 8.4 8.4 0 0 1 8.5 8.4Z" />
      </svg>
    );
  }

  if (kind === 'quiz') {
    return (
      <svg {...props} viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="4.5" />
        <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
      </svg>
    );
  }

  if (kind === 'materias') {
    return (
      <svg {...props} viewBox="0 0 24 24">
        <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
      </svg>
    );
  }

  if (kind === 'curiosidades') {
    return (
      <svg {...props} viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3c2.5 2.7 3.7 5.7 3.7 9s-1.2 6.3-3.7 9c-2.5-2.7-3.7-5.7-3.7-9S9.5 5.7 12 3Z" />
      </svg>
    );
  }

  if (kind === 'memoria') {
    return (
      <svg {...props} viewBox="0 0 24 24">
        <rect x="3" y="4" width="12" height="14" rx="2.5" />
        <path d="M6.5 8h5M6.5 12h5" />
        <rect x="11" y="8" width="10" height="12" rx="2.5" />
        <path d="M14.5 12h3M14.5 16h3" />
      </svg>
    );
  }

  return (
    <svg {...props} viewBox="0 0 24 24">
      <rect x="3" y="3" width="12" height="9" rx="2.5" />
      <path d="M7 12v3l3.5-3" />
      <rect x="9" y="12" width="12" height="8" rx="2.5" />
      <path d="M13 20v3l3.5-3" />
    </svg>
  );
}

export function HomeIcon({ className = 'w-5 h-5' }) {
  return (
    <svg {...base} className={className} viewBox="0 0 24 24">
      <path d="m3 11 9-8 9 8" />
      <path d="M5 10v10h14V10" />
    </svg>
  );
}

export function ProfileIcon({ className = 'w-5 h-5' }) {
  return (
    <svg {...base} className={className} viewBox="0 0 24 24">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </svg>
  );
}

export function MenuIcon({ className = 'w-5 h-5' }) {
  return (
    <svg {...base} className={className} viewBox="0 0 24 24">
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

export function CloseIcon({ className = 'w-5 h-5' }) {
  return (
    <svg {...base} className={className} viewBox="0 0 24 24">
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  );
}

export function PanelOpenIcon({ className = 'w-5 h-5' }) {
  return (
    <svg {...base} className={className} viewBox="0 0 24 24">
      <path d="M4 4v16M8 12h11M15 8l4 4-4 4" />
    </svg>
  );
}

export function PanelCloseIcon({ className = 'w-5 h-5' }) {
  return (
    <svg {...base} className={className} viewBox="0 0 24 24">
      <path d="M20 4v16M16 12H5M9 8l-4 4 4 4" />
    </svg>
  );
}

export function SoundOnIcon({ className = 'w-4 h-4' }) {
  return (
    <svg {...base} className={className} viewBox="0 0 24 24">
      <path d="M11 5 6 9H2v6h4l5 4V5Z" />
      <path d="M15.5 8.5a5 5 0 0 1 0 7" />
      <path d="M18.5 5.5a9 9 0 0 0 0 13" />
    </svg>
  );
}

export function SoundOffIcon({ className = 'w-4 h-4' }) {
  return (
    <svg {...base} className={className} viewBox="0 0 24 24">
      <path d="M11 5 6 9H2v6h4l5 4V5Z" />
      <path d="m17 9 5 6M22 9l-5 6" />
    </svg>
  );
}

export function MoonIcon({ className = 'w-4 h-4' }) {
  return (
    <svg {...base} className={className} viewBox="0 0 24 24">
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
    </svg>
  );
}

export function SunIcon({ className = 'w-4 h-4' }) {
  return (
    <svg {...base} className={className} viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}

export function FlameIcon({ className = 'w-4 h-4' }) {
  return (
    <svg {...base} className={className} viewBox="0 0 24 24">
      <path d="M12 2s4 4 4 8a4 4 0 0 1-8 0c0-1 .5-2 .5-2S7 10 7 13a5 5 0 0 0 10 0c0-4-5-11-5-11Z" />
    </svg>
  );
}

export function BoltIcon({ className = 'w-4 h-4' }) {
  return (
    <svg {...base} className={className} viewBox="0 0 24 24">
      <path d="M13 2 4.5 13.5H11l-1 8.5 9-12h-6.5L13 2Z" />
    </svg>
  );
}

export function TrashIcon({ className = 'w-4 h-4' }) {
  return (
    <svg {...base} className={className} viewBox="0 0 24 24">
      <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  );
}

export function WarningIcon({ className = 'w-4 h-4' }) {
  return (
    <svg {...base} className={className} viewBox="0 0 24 24">
      <path d="M10.3 3.9 2.4 18a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
      <path d="M12 9v4M12 17h.01" />
    </svg>
  );
}
