const OUTLINE = '#1B2A33';

function ArtSvg({ className, children }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={`word-art ${className ?? ''}`}
      aria-hidden="true"
      focusable="false"
      fill="none"
      stroke={OUTLINE}
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

function Tree({ className }) {
  return (
    <ArtSvg className={className}>
      <path d="M32 38v18" stroke="#8A5A2B" strokeWidth="5" />
      <path d="M23 56h18" stroke="#8A5A2B" strokeWidth="4" />
      <path d="M32 8c10 0 17 7 17 16 0 7-4 12-9 15H24c-5-3-9-8-9-15C15 15 22 8 32 8Z" fill="#58CC02" />
      <path d="m22 39 10-15 10 15Z" fill="#4BA800" />
      <circle cx="25" cy="20" r="3" fill="#A8F06A" stroke="none" />
    </ArtSvg>
  );
}

function Book({ className }) {
  return (
    <ArtSvg className={className}>
      <path d="M32 15c-6-4-13-5-21-3v32c8-2 15-1 21 3" fill="#FFFFFF" />
      <path d="M32 15c6-4 13-5 21-3v32c-8-2-15-1-21 3" fill="#FFFFFF" />
      <path d="M32 15v32" stroke="#1CB0F6" strokeWidth="3" />
      <path d="M15 18v27" stroke="#1CB0F6" />
      <path d="M49 18v27" stroke="#1CB0F6" />
      <path d="M19 24h8M19 30h8M37 24h8M37 30h8" stroke="#B8D4E3" strokeWidth="2" />
    </ArtSvg>
  );
}

function Water({ className }) {
  return (
    <ArtSvg className={className}>
      <path d="M32 5c7 11 16 20 16 31a16 16 0 0 1-32 0C16 25 25 16 32 5Z" fill="#1CB0F6" />
      <path d="M23 35c0 6 4 10 9 12" stroke="#8DDCFF" strokeWidth="4" />
      <circle cx="27" cy="28" r="3" fill="#FFFFFF" stroke="none" opacity="0.8" />
    </ArtSvg>
  );
}

function House({ className }) {
  return (
    <ArtSvg className={className}>
      <path d="M8 28 32 9l24 19" fill="#FF8A00" />
      <path d="M14 25v28h36V25" fill="#FFF4DB" />
      <path d="M26 53V38h12v15" fill="#1CB0F6" />
      <path d="M20 32h7v7h-7zM37 32h7v7h-7z" fill="#8DDCFF" />
      <circle cx="35" cy="45" r="1.6" fill="#1B2A33" stroke="none" />
    </ArtSvg>
  );
}

function Dog({ className }) {
  return (
    <ArtSvg className={className}>
      <path d="M18 20 11 10l12 4" fill="#A96C3D" />
      <path d="M46 20 53 10l-12 4" fill="#A96C3D" />
      <path d="M18 20a14 14 0 0 1 28 0v12a14 14 0 0 1-28 0V20Z" fill="#D89A5B" />
      <path d="M25 29c4-3 10-3 14 0 0 5-3 8-7 8s-7-3-7-8Z" fill="#FFF1D6" />
      <circle cx="25" cy="24" r="2.4" fill="#1B2A33" stroke="none" />
      <circle cx="39" cy="24" r="2.4" fill="#1B2A33" stroke="none" />
      <path d="M30 31h4" stroke="#1B2A33" />
      <path d="M32 34c2 2 4 2 6 0" stroke="#1B2A33" />
    </ArtSvg>
  );
}

function Cat({ className }) {
  return (
    <ArtSvg className={className}>
      <path d="m18 20-3-11 10 6" fill="#FF8A00" />
      <path d="m46 20 3-11-10 6" fill="#FF8A00" />
      <path d="M18 20a14 14 0 0 1 28 0v12a14 14 0 0 1-28 0V20Z" fill="#FFA53D" />
      <path d="M25 27h.01M39 27h.01" strokeWidth="4" />
      <path d="m29 33 3 2 3-2" />
      <path d="M20 35 12 32M20 39l-8 3M44 35l8-3M44 39l8 3" stroke="#FF8A00" />
      <path d="M27 15v6M37 15v6" stroke="#FF8A00" />
    </ArtSvg>
  );
}

function Hand({ className }) {
  return (
    <ArtSvg className={className}>
      <path d="M20 26V12a4 4 0 0 1 8 0v13" fill="#FFD0A6" />
      <path d="M28 25v-5a4 4 0 0 1 8 0v7" fill="#FFD0A6" />
      <path d="M36 27v-3a4 4 0 0 1 8 0v14a14 14 0 0 1-14 14h-3a14 14 0 0 1-12-7l-6-10a4 4 0 0 1 6-4l6 8" fill="#FFD0A6" />
      <path d="M20 18v8M28 16v9M36 21v6" stroke="#E8A878" strokeWidth="1.8" />
    </ArtSvg>
  );
}

function River({ className }) {
  return (
    <ArtSvg className={className}>
      <path d="M10 5c8 0 8 8 16 8s8-8 16-8 8 8 12 8" stroke="#1CB0F6" strokeWidth="7" />
      <path d="M10 22c8 0 8 8 16 8s8-8 16-8 8 8 12 8" stroke="#1CB0F6" strokeWidth="7" />
      <path d="M10 39c8 0 8 8 16 8s8-8 16-8 8 8 12 8" stroke="#1CB0F6" strokeWidth="7" />
      <path d="M10 5c8 0 8 8 16 8s8-8 16-8 8 8 12 8" stroke="#8DDCFF" strokeWidth="2" />
      <path d="M10 22c8 0 8 8 16 8s8-8 16-8 8 8 12 8" stroke="#8DDCFF" strokeWidth="2" />
    </ArtSvg>
  );
}

function Window({ className }) {
  return (
    <ArtSvg className={className}>
      <rect x="10" y="7" width="44" height="50" rx="5" fill="#FFFFFF" />
      <rect x="15" y="12" width="15" height="18" rx="2" fill="#8DDCFF" />
      <rect x="34" y="12" width="15" height="18" rx="2" fill="#8DDCFF" />
      <rect x="15" y="34" width="15" height="18" rx="2" fill="#8DDCFF" />
      <rect x="34" y="34" width="15" height="18" rx="2" fill="#8DDCFF" />
      <path d="M32 7v50M10 32h44" stroke="#FFFFFF" strokeWidth="4" />
    </ArtSvg>
  );
}

function Bread({ className }) {
  return (
    <ArtSvg className={className}>
      <path d="M9 25c0-8 9-14 23-14s23 6 23 14v15a8 8 0 0 1-8 8H17a8 8 0 0 1-8-8V25Z" fill="#F2B84B" />
      <path d="M18 17 22 26M29 15l4 10M40 17l4 9" stroke="#C9862A" strokeWidth="3" />
      <path d="M13 35c8 5 30 5 38 0" stroke="#FFD98A" strokeWidth="3" />
    </ArtSvg>
  );
}

function Friend({ className }) {
  return (
    <ArtSvg className={className}>
      <circle cx="23" cy="20" r="8" fill="#FFD0A6" />
      <circle cx="43" cy="23" r="7" fill="#FFD0A6" />
      <path d="M7 54c0-10 7-17 16-17s16 7 16 17" fill="#1CB0F6" />
      <path d="M39 44c7 0 13 4 16 10" fill="#CE82FF" />
      <path d="M19 18h.01M27 18h.01" strokeWidth="3.4" />
      <path d="M20 23c2 2 4 2 6 0" strokeWidth="1.8" />
    </ArtSvg>
  );
}

function Sun({ className }) {
  return (
    <ArtSvg className={className}>
      <circle cx="32" cy="32" r="13" fill="#FFC800" />
      <path d="M32 6v7M32 51v7M6 32h7M51 32h7M14 14l5 5M45 45l5 5M50 14l-5 5M19 45l-5 5" stroke="#FFB900" strokeWidth="4" />
      <circle cx="27" cy="27" r="3" fill="#FFE98A" stroke="none" />
    </ArtSvg>
  );
}

function Forest({ className }) {
  return (
    <ArtSvg className={className}>
      <path d="M19 38v17M45 36v19" stroke="#8A5A2B" strokeWidth="5" />
      <path d="m19 8 10 16H9l10-16ZM19 23l12 17H7l12-17Z" fill="#58CC02" />
      <path d="m45 12 8 14h-16l8-14ZM45 24l10 14H35l10-14Z" fill="#4BA800" />
      <path d="M8 55h48" stroke="#8A5A2B" strokeWidth="3" />
    </ArtSvg>
  );
}

function Bridge({ className }) {
  return (
    <ArtSvg className={className}>
      <path d="M5 42c9-22 45-22 54 0" stroke="#D89A00" strokeWidth="7" />
      <path d="M5 50h54" stroke="#8A5A2B" strokeWidth="5" />
      <path d="M14 36v14M32 30v20M50 36v14" stroke="#FFB900" strokeWidth="4" />
      <path d="M5 55c8-4 13-4 20 0s12 4 18 0 11-4 16 0" stroke="#1CB0F6" strokeWidth="3" />
    </ArtSvg>
  );
}

function Library({ className }) {
  return (
    <ArtSvg className={className}>
      <rect x="10" y="10" width="38" height="10" rx="2" fill="#1CB0F6" />
      <rect x="10" y="23" width="34" height="10" rx="2" fill="#58CC02" />
      <rect x="10" y="36" width="42" height="12" rx="2" fill="#CE82FF" />
      <path d="M20 10v10M27 23v10M36 36v12M45 10v10" stroke="#FFFFFF" strokeWidth="2" />
    </ArtSvg>
  );
}

function Weather({ className }) {
  return (
    <ArtSvg className={className}>
      <circle cx="20" cy="19" r="9" fill="#FFC800" />
      <path d="M20 5v4M20 29v4M6 19h4M30 19h4M10 9l3 3M30 29l3 3" stroke="#FFB900" strokeWidth="3" />
      <path d="M22 51h25a9 9 0 0 0-3-18 13 13 0 0 0-24 5 7 7 0 0 0 2 13Z" fill="#DDEEF6" />
    </ArtSvg>
  );
}

function Journey({ className }) {
  return (
    <ArtSvg className={className}>
      <rect x="8" y="20" width="48" height="32" rx="6" fill="#00A6A6" />
      <path d="M23 20v-5a5 5 0 0 1 5-5h8a5 5 0 0 1 5 5v5" stroke="#007F7F" strokeWidth="4" />
      <path d="M8 33h48" stroke="#FFFFFF" strokeWidth="3" />
      <rect x="28" y="29" width="8" height="8" rx="2" fill="#FFC800" />
    </ArtSvg>
  );
}

function Star({ className }) {
  return (
    <ArtSvg className={className}>
      <path d="m32 6 7 15 17 2-13 11 4 17-15-9-15 9 4-17L8 23l17-2 7-15Z" fill="#FFC800" />
      <path d="m32 14 4 9 10 1-8 7 2 10-8-5-8 5 2-10-8-7 10-1 4-9Z" fill="#FFE98A" stroke="none" />
    </ArtSvg>
  );
}

function Fish({ className }) {
  return (
    <ArtSvg className={className}>
      <path d="M9 32c9-14 29-17 42 0-13 17-33 14-42 0Z" fill="#1CB0F6" />
      <path d="m51 32 9-10v20l-9-10Z" fill="#0E8FD1" />
      <circle cx="20" cy="29" r="2.4" fill="#1B2A33" stroke="none" />
      <path d="M30 23c4 6 4 12 0 18M38 24c4 5 4 11 0 16" stroke="#8DDCFF" />
    </ArtSvg>
  );
}

function Apple({ className }) {
  return (
    <ArtSvg className={className}>
      <path d="M32 20c-8-7-23-2-23 13 0 13 11 23 18 23 3 0 4-2 5-2s2 2 5 2c7 0 18-10 18-23 0-15-15-20-23-13Z" fill="#FF4B4B" />
      <path d="M32 20c0-7 3-12 8-15" stroke="#8A5A2B" strokeWidth="4" />
      <path d="M40 9c7-3 12 0 13 5-6 3-11 2-13-5Z" fill="#58CC02" />
      <circle cx="22" cy="28" r="4" fill="#FF9B9B" stroke="none" />
    </ArtSvg>
  );
}

function Milk({ className }) {
  return (
    <ArtSvg className={className}>
      <path d="M20 17h24l4 36H16l4-36Z" fill="#FFFFFF" />
      <path d="M20 17 32 7l12 10" fill="#DDEEF6" />
      <path d="M20 31h24l2 22H18l2-22Z" fill="#1CB0F6" />
      <circle cx="32" cy="42" r="7" fill="#FFFFFF" />
    </ArtSvg>
  );
}

function Shoe({ className }) {
  return (
    <ArtSvg className={className}>
      <path d="M8 43c0-8 7-10 14-13l8-10 10 6 16 8v9H8Z" fill="#FF8A00" />
      <path d="M8 43h48v6H12a4 4 0 0 1-4-4v-2Z" fill="#FFFFFF" />
      <path d="m30 30 8 5M26 34l8 5" stroke="#FFD08A" strokeWidth="3" />
    </ArtSvg>
  );
}

function Clock({ className }) {
  return (
    <ArtSvg className={className}>
      <circle cx="32" cy="32" r="23" fill="#FFFFFF" />
      <circle cx="32" cy="32" r="18" fill="#DDEEF6" />
      <path d="M32 19v14l9 6" stroke="#1CB0F6" strokeWidth="4" />
      <circle cx="32" cy="32" r="2.5" fill="#1B2A33" stroke="none" />
    </ArtSvg>
  );
}

function Key({ className }) {
  return (
    <ArtSvg className={className}>
      <circle cx="21" cy="21" r="11" fill="#FFC800" />
      <circle cx="21" cy="21" r="4" fill="#FFFFFF" />
      <path d="m29 29 21 21M42 42l7-7M48 48l6-6" stroke="#D89A00" strokeWidth="6" />
    </ArtSvg>
  );
}

function Chair({ className }) {
  return (
    <ArtSvg className={className}>
      <rect x="16" y="8" width="32" height="25" rx="5" fill="#CE82FF" />
      <rect x="12" y="33" width="40" height="9" rx="4" fill="#A560D6" />
      <path d="M18 42v13M46 42v13" stroke="#8A5A2B" strokeWidth="5" />
    </ArtSvg>
  );
}

function Bicycle({ className }) {
  return (
    <ArtSvg className={className}>
      <circle cx="17" cy="43" r="10" />
      <circle cx="47" cy="43" r="10" />
      <path d="M17 43 27 24h12l8 19M27 24l-4-7h8M39 24l5-8" stroke="#00A6A6" strokeWidth="4" />
      <path d="M21 43h11l7-12" stroke="#00A6A6" strokeWidth="4" />
    </ArtSvg>
  );
}

function Mountain({ className }) {
  return (
    <ArtSvg className={className}>
      <path d="M5 52 27 15l11 18 6-9 15 28H5Z" fill="#8AA0A8" />
      <path d="m27 15 7 12-7-3-7 3 7-12ZM44 24l5 8-5-3-5 3 5-8Z" fill="#FFFFFF" />
      <path d="M5 52h54" stroke="#58CC02" strokeWidth="4" />
    </ArtSvg>
  );
}

function Market({ className }) {
  return (
    <ArtSvg className={className}>
      <path d="M10 25h44l-5 26H15l-5-26Z" fill="#D89A00" />
      <path d="M17 25c0-9 6-15 15-15s15 6 15 15" stroke="#8A5A2B" strokeWidth="4" />
      <path d="M18 34h28M20 42h24" stroke="#FFD98A" strokeWidth="3" />
    </ArtSvg>
  );
}

function Letter({ className }) {
  return (
    <ArtSvg className={className}>
      <rect x="8" y="15" width="48" height="34" rx="5" fill="#FFFFFF" />
      <path d="m8 18 24 18 24-18" stroke="#1CB0F6" strokeWidth="3" />
      <path d="m8 49 18-17M56 49 38 32" stroke="#DDEEF6" strokeWidth="3" />
    </ArtSvg>
  );
}

function Peace({ className }) {
  return (
    <ArtSvg className={className}>
      <path d="M32 54C17 44 8 36 8 25a12 12 0 0 1 24-4 12 12 0 0 1 24 4c0 11-9 19-24 29Z" fill="#FF4B4B" />
      <path d="M32 50c-11-8-18-15-18-24" stroke="#FF9B9B" strokeWidth="4" />
    </ArtSvg>
  );
}

function Patience({ className }) {
  return (
    <ArtSvg className={className}>
      <path d="M17 8h30M17 56h30" stroke="#8A5A2B" strokeWidth="5" />
      <path d="M21 9c0 10 11 12 11 23S21 45 21 55M43 9c0 10-11 12-11 23s11 12 11 23" fill="#DDEEF6" />
      <path d="m26 45 6 6 6-6" fill="#FFC800" />
    </ArtSvg>
  );
}

function Precise({ className }) {
  return (
    <ArtSvg className={className}>
      <circle cx="32" cy="32" r="22" fill="#FFFFFF" />
      <circle cx="32" cy="32" r="14" fill="#FF4B4B" />
      <circle cx="32" cy="32" r="6" fill="#FFFFFF" />
      <circle cx="32" cy="32" r="2" fill="#1B2A33" stroke="none" />
    </ArtSvg>
  );
}

function Fragile({ className }) {
  return (
    <ArtSvg className={className}>
      <path d="M24 10h16l-3 8c8 5 11 12 9 20-2 9-8 14-14 14s-12-5-14-14c-2-8 1-15 9-20l-3-8Z" fill="#CE82FF" />
      <path d="M23 34c6 4 12 4 18 0" stroke="#FFFFFF" strokeWidth="3" />
      <path d="M24 10h16" stroke="#8A5A2B" strokeWidth="4" />
    </ArtSvg>
  );
}

function Eloquent({ className }) {
  return (
    <ArtSvg className={className}>
      <path d="M10 14h44a5 5 0 0 1 5 5v24a5 5 0 0 1-5 5H29l-12 10V48h-7a5 5 0 0 1-5-5V19a5 5 0 0 1 5-5Z" fill="#1CB0F6" />
      <path d="M18 26h28M18 35h20" stroke="#FFFFFF" strokeWidth="4" />
    </ArtSvg>
  );
}

function Profound({ className }) {
  return (
    <ArtSvg className={className}>
      <ellipse cx="32" cy="18" rx="23" ry="8" fill="#00A6A6" />
      <path d="M9 18c0 16 10 30 23 30s23-14 23-30" fill="#DDEEF6" />
      <path d="M17 27c8 5 22 5 30 0M20 37c7 4 17 4 24 0" stroke="#00A6A6" strokeWidth="3" />
    </ArtSvg>
  );
}

function Ball({ className }) {
  return (
    <ArtSvg className={className}>
      <circle cx="32" cy="32" r="21" fill="#FF4B4B" />
      <path d="M32 11c-9 7-9 35 0 42M11 32h42M17 17c9 8 21 8 30 0M17 47c9-8 21-8 30 0" stroke="#FFFFFF" strokeWidth="3" />
    </ArtSvg>
  );
}

function Cup({ className }) {
  return (
    <ArtSvg className={className}>
      <path d="M15 16h30l-4 34H19l-4-34Z" fill="#FFFFFF" />
      <path d="M45 23h5a8 8 0 0 1 0 16h-5" stroke="#1CB0F6" strokeWidth="4" />
      <path d="M18 28h24" stroke="#1CB0F6" strokeWidth="4" />
      <path d="M22 38h16" stroke="#DDEEF6" strokeWidth="3" />
    </ArtSvg>
  );
}

function Bag({ className }) {
  return (
    <ArtSvg className={className}>
      <path d="M12 24h40l-4 29H16l-4-29Z" fill="#CE82FF" />
      <path d="M21 24v-6a11 11 0 0 1 22 0v6" stroke="#8A5A2B" strokeWidth="4" />
      <path d="M20 36h24" stroke="#FFFFFF" strokeWidth="3" />
    </ArtSvg>
  );
}

function Moon({ className }) {
  return (
    <ArtSvg className={className}>
      <path d="M39 9a23 23 0 1 0 16 39A25 25 0 0 1 39 9Z" fill="#FFC800" />
      <circle cx="22" cy="22" r="3" fill="#FFE98A" stroke="none" />
      <circle cx="18" cy="36" r="2" fill="#FFE98A" stroke="none" />
    </ArtSvg>
  );
}

function Car({ className }) {
  return (
    <ArtSvg className={className}>
      <path d="M10 38 15 25a6 6 0 0 1 6-4h22a6 6 0 0 1 6 4l5 13v9H10v-9Z" fill="#1CB0F6" />
      <path d="M18 25h28" stroke="#FFFFFF" strokeWidth="3" />
      <circle cx="20" cy="47" r="5" fill="#1B2A33" />
      <circle cx="44" cy="47" r="5" fill="#1B2A33" />
    </ArtSvg>
  );
}

function Lamp({ className }) {
  return (
    <ArtSvg className={className}>
      <path d="M20 26h24l-5-15H25l-5 15Z" fill="#FFC800" />
      <path d="M32 26v20" stroke="#8A5A2B" strokeWidth="4" />
      <path d="M20 50h24" stroke="#8A5A2B" strokeWidth="4" />
      <path d="M26 37h12" stroke="#FFE98A" strokeWidth="3" />
    </ArtSvg>
  );
}

const ART = {
  tree: Tree,
  arbol: Tree,
  arbre: Tree,
  book: Book,
  libro: Book,
  livre: Book,
  water: Water,
  agua: Water,
  eau: Water,
  house: House,
  casa: House,
  maison: House,
  dog: Dog,
  perro: Dog,
  chien: Dog,
  cat: Cat,
  gato: Cat,
  chat: Cat,
  hand: Hand,
  mano: Hand,
  river: River,
  rio: River,
  riviere: River,
  window: Window,
  ventana: Window,
  fenetre: Window,
  bread: Bread,
  pan: Bread,
  pain: Bread,
  friend: Friend,
  ami: Friend,
  yellow: Sun,
  sun: Sun,
  sol: Sun,
  dia: Sun,
  forest: Forest,
  bosque: Forest,
  foret: Forest,
  bridge: Bridge,
  puente: Bridge,
  pont: Bridge,
  library: Library,
  biblioteca: Library,
  weather: Weather,
  clima: Weather,
  journey: Journey,
  viaje: Journey,
  voyage: Journey,
  star: Star,
  estrella: Star,
  etoile: Star,
  fish: Fish,
  pez: Fish,
  poisson: Fish,
  apple: Apple,
  manzana: Apple,
  pomme: Apple,
  milk: Milk,
  leche: Milk,
  lait: Milk,
  shoe: Shoe,
  zapato: Shoe,
  chaussure: Shoe,
  clock: Clock,
  reloj: Clock,
  horloge: Clock,
  key: Key,
  llave: Key,
  cle: Key,
  chair: Chair,
  silla: Chair,
  chaise: Chair,
  bicycle: Bicycle,
  bicicleta: Bicycle,
  bici: Bicycle,
  velo: Bicycle,
  mountain: Mountain,
  montana: Mountain,
  montagne: Mountain,
  market: Market,
  mercado: Market,
  marche: Market,
  letter: Letter,
  carta: Letter,
  lettre: Letter,
  peace: Peace,
  paz: Peace,
  paix: Peace,
  patience: Patience,
  paciencia: Patience,
  precise: Precise,
  precis: Precise,
  preciso: Precise,
  fragile: Fragile,
  fragil: Fragile,
  eloquent: Eloquent,
  elocuente: Eloquent,
  eloque: Eloquent,
  profound: Profound,
  profundo: Profound,
  profond: Profound,

  moon: Moon,
  luna: Moon,
  lune: Moon,
  ball: Ball,
  bola: Ball,
  pelota: Ball,
  ballon: Ball,
  cup: Cup,
  xicara: Cup,
  taza: Cup,
  tasse: Cup,
  bag: Bag,
  bolsa: Bag,
  maleta: Bag,
  sac: Bag,
  soleil: Sun,
  clarity: Sun,
  clareza: Sun,
  claridad: Sun,
  clarte: Sun,
  clair: Sun,
  lucid: Sun,
  lucido: Sun,
  lucide: Sun,
  claro: Sun,
  vivid: Sun,
  vivido: Sun,
  vif: Sun,
  intenso: Sun,
  intense: Sun,
  dense: Profound,
  compacto: Profound,
  compact: Profound,
  hollow: Profound,
  oco: Profound,
  hueco: Profound,
  eternal: Sun,
  eternel: Sun,
  eterno: Sun,
  perduravel: Sun,
  duravel: Sun,
  delicate: Fragile,
  delgado: Fragile,
  fino: Fragile,
  fin: Fragile,
  steady: Bridge,
  estavel: Bridge,
  firme: Bridge,
  gentle: Peace,
  suave: Peace,
  macio: Peace,
  doux: Peace,
  random: Star,
  aleatorio: Star,
  aleatoire: Star,
  imprevisto: Star,

  advice: Eloquent,
  consejo: Eloquent,
  conseil: Eloquent,
  effort: Patience,
  esfuerzo: Patience,
  opportunity: Key,
  oportunidad: Key,
  opportunite: Key,
  challenge: Mountain,
  desafio: Mountain,
  defi: Mountain,
  memory: Book,
  recuerdo: Book,
  souvenir: Book,
  subtle: River,
  sutil: River,
  subtil: River,
  inevitable: Clock,
  thorough: Precise,
  minucioso: Precise,
  minutieux: Precise,
  resilience: Bridge,
  resiliencia: Bridge,
  ambiguity: River,
  ambiguedad: River,
  ambiguite: River,
  perspective: Window,
  perspectiva: Window,
  sophisticated: Library,
  sofisticado: Library,
  sophistique: Library,
  nuance: River,
  matiz: River,
  paradox: Eloquent,
  paradoja: Eloquent,
  paradoxe: Eloquent,
  concise: Letter,
  conciso: Letter,
  breve: Letter,
  concis: Letter,
  jardin: Forest,
  ciudad: House,
  ville: House,
  coche: Car,
  carro: Car,
  lampara: Lamp,
  desayuno: Bread,
  'petit-dejeuner': Bread,
  vecino: Friend,
  voisin: Friend,
  denso: Profound,
  creux: Profound,
  ferme: Bridge,

  arvore: Tree,
  livro: Book,
  cachorro: Dog,
  estrela: Star,
  peixe: Fish,
  maca: Apple,
  leite: Milk,
  lua: Moon,
  janela: Window,
  pao: Bread,
  amigo: Friend,
  amarelo: Sun,
  sapato: Shoe,
  relogio: Clock,
  chave: Key,
  cadeira: Chair,
  floresta: Forest,
  viagem: Journey,
  ponte: Bridge,
  montanha: Mountain,
  conselho: Eloquent,
  esforco: Patience,
  oportunidade: Key,
  memoria: Book,
  inevitavel: Clock,
  ambiguidade: River,
  exato: Precise,
  quebradico: Fragile,
  paradoxo: Eloquent,
  eloquente: Eloquent,
  delicado: Fragile,
  mao: Hand,
  jardim: Forest,
  cidade: House,
  mala: Bag,
  lampada: Lamp,
  'cafe da manha': Bread,
  vizinho: Friend,
  feira: Market,
  'mensagem escrita': Letter,
  lembranca: Book,
  tranquilidade: Peace,
  detalhista: Precise,
  'ponto de vista': Window,
  elaborado: Library,
  gradacao: River,
  fundo: Profound,
};

function artKey(term) {
  return String(term ?? '')
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase();
}

export default function WordArt({ term, className = 'w-10 h-10' }) {
  const Art = ART[artKey(term)];
  return Art ? <Art className={className} /> : null;
}
