export const AVATAR_GROUPS = [
  {
    id: 'body',
    label: 'Cor do tubarão',
    options: [
      { id: 'blue', label: 'Azul' },
      { id: 'green', label: 'Verde' },
      { id: 'purple', label: 'Roxo' },
      { id: 'pink', label: 'Rosa' },
      { id: 'orange', label: 'Laranja' },
    ],
  },
  {
    id: 'outfit',
    label: 'Roupa',
    options: [
      { id: 'none', label: 'Nenhuma' },
      { id: 'shirt', label: 'Camiseta' },
      { id: 'hoodie', label: 'Moletom' },
      { id: 'blazer', label: 'Blazer' },
    ],
  },
  {
    id: 'accessory',
    label: 'Acessório',
    options: [
      { id: 'none', label: 'Nenhum' },
      { id: 'glasses', label: 'Óculos' },
      { id: 'headphones', label: 'Fone de ouvido' },
      { id: 'cap', label: 'Boné' },
    ],
  },
];

const DEFAULTS = { body: 'blue', outfit: 'shirt', accessory: 'none' };
const OPTION_IDS = new Map(
  AVATAR_GROUPS.map((group) => [group.id, new Set(group.options.map((option) => option.id))])
);

const PALETTES = {
  blue: { light: '#8FD4F2', mid: '#5FB6E4', dark: '#4E9FCE', line: '#2F6E94' },
  green: { light: '#A7E8B4', mid: '#5FC98A', dark: '#3A9E68', line: '#276749' },
  purple: { light: '#D7C4FA', mid: '#9B7BDE', dark: '#7A5BC1', line: '#553C9A' },
  pink: { light: '#FFD0DF', mid: '#F58FB4', dark: '#D66A97', line: '#9B4070' },
  orange: { light: '#FFD9A8', mid: '#F5A65C', dark: '#D98032', line: '#A8531A' },
};

const SHAPES = {
  baby: {
    label: 'bebê',
    body: 'M24 70 C24 43 45 25 70 25 C95 25 114 43 116 68 C118 92 100 108 70 108 C42 108 25 93 24 70 Z',
    belly: 'M35 78 C45 96 61 102 76 101 C90 100 102 93 108 82 C98 96 82 102 65 99 C50 97 40 90 35 78 Z',
    tail: [
      'M22 78 C10 73 6 64 6 56 C16 60 24 65 29 72 Z',
      'M22 78 C12 86 10 95 12 102 C21 97 28 91 32 84 Z',
    ],
    fin: 'M62 29 C63 18 70 12 78 10 C78 20 74 27 70 31 Z',
  },
  teen: {
    label: 'adolescente',
    body: 'M25 66 C28 42 48 28 71 28 C96 28 113 45 115 67 C117 90 100 104 72 104 C45 104 27 90 25 66 Z',
    belly: 'M37 76 C47 93 62 98 76 97 C90 96 101 90 107 79 C97 93 82 99 65 96 C51 94 42 87 37 76 Z',
    tail: [
      'M20 74 C8 68 5 58 6 50 C15 55 23 61 28 68 Z',
      'M20 74 C11 82 10 91 13 98 C22 93 29 87 32 80 Z',
    ],
    fin: 'M60 30 C61 19 68 13 77 11 C76 21 72 27 68 31 Z',
  },
  adult: {
    label: 'adulto',
    body: 'M22 68 C24 43 44 28 66 27 C90 26 108 42 112 65 C116 88 100 104 72 105 C44 106 25 92 22 68 Z',
    belly: 'M34 76 C44 94 60 100 74 99 C88 98 101 91 107 79 C97 94 82 101 65 98 C51 96 41 88 34 76 Z',
    tail: [
      'M22 74 C11 69 7 60 7 52 C16 56 23 61 28 68 Z',
      'M22 74 C13 81 11 90 14 97 C22 92 29 86 32 79 Z',
    ],
    fin: 'M59 29 C60 17 68 10 77 8 C76 19 72 27 68 32 Z',
  },
};

const LABELS = {
  body: { blue: 'azul', green: 'verde', purple: 'roxo', pink: 'rosa', orange: 'laranja' },
  outfit: { none: 'sem roupa', shirt: 'de camiseta', hoodie: 'de moletom', blazer: 'de blazer' },
  accessory: {
    none: 'sem acessório',
    glasses: 'com óculos',
    headphones: 'com fone de ouvido',
    cap: 'com boné',
  },
};

export function normalizeAvatar(input) {
  const source = input && typeof input === 'object' ? input : {};
  const result = {};

  for (const group of AVATAR_GROUPS) {
    const key = group.id;
    const own = Object.prototype.hasOwnProperty.call(source, key);
    const value = own ? source[key] : undefined;
    result[key] =
      own && typeof value === 'string' && OPTION_IDS.get(key).has(value)
        ? value
        : DEFAULTS[key];
  }

  return result;
}

function stageForAge(age) {
  if (age === null || age === undefined || age === '') return 'adult';
  const value = Number(age);
  if (!Number.isFinite(value)) return 'adult';
  if (value <= 10) return 'baby';
  if (value <= 17) return 'teen';
  return 'adult';
}

function outfitFor(outfit) {
  if (outfit === 'none') return '';

  const shirt = `<path d="M39 84 C48 94 59 99 72 99 C85 99 96 94 104 84 C102 94 90 103 72 103 C54 103 42 94 39 84 Z" fill="#FFD166" stroke="#C77A00" stroke-width="2"/>
  <path d="M54 83 C59 90 65 93 72 93 C79 93 85 90 90 83" fill="none" stroke="#FFF3C4" stroke-width="3" stroke-linecap="round"/>`;

  if (outfit === 'shirt') return shirt;

  if (outfit === 'hoodie') {
    return `${shirt}
  <path d="M50 82 C54 75 62 72 72 72 C82 72 90 75 94 82 L89 91 C81 86 63 86 55 91 Z" fill="#FFD166" stroke="#C77A00" stroke-width="2"/>
  <path d="M66 84 V92 M78 84 V92" stroke="#FFF3C4" stroke-width="2" stroke-linecap="round"/>`;
  }

  return `<path d="M39 84 C48 94 59 100 72 100 C85 100 96 94 104 84 C101 95 90 104 72 104 C54 104 43 95 39 84 Z" fill="#2F3E57" stroke="#162033" stroke-width="2"/>
  <path d="M52 79 L64 92 L58 100 L45 86 Z" fill="#FFFFFF" opacity=".9"/>
  <path d="M92 79 L80 92 L86 100 L99 86 Z" fill="#FFFFFF" opacity=".9"/>
  <path d="M72 93 V103" stroke="#FFD166" stroke-width="2"/>`;
}

function faceFor(stage, palette) {
  const { line, dark } = palette;

  if (stage === 'baby') {
    return `<ellipse cx="46" cy="72" rx="7" ry="5" fill="#FF9AA2" opacity=".72"/>
  <ellipse cx="96" cy="72" rx="7" ry="5" fill="#FF9AA2" opacity=".58"/>
  <g class="msc-eyes">
    <circle cx="88" cy="57" r="17" fill="#FFFFFF"/>
    <circle cx="90" cy="58" r="8" fill="#1B2A33"/>
    <circle cx="93" cy="54" r="2.6" fill="#FFFFFF"/>
    <circle cx="88" cy="57" r="19" fill="none" stroke="#1B2A33" stroke-width="2.4"/>
  </g>
  <path d="M78 37 C84 33 92 33 98 37" stroke="${line}" stroke-width="2.2" fill="none" stroke-linecap="round"/>
  <path d="M55 80 C63 87 76 87 84 80" stroke="${line}" stroke-width="2.2" fill="none" stroke-linecap="round"/>
  <path d="M64 82 l2 3 l2 -3 Z" fill="#FFFFFF"/>
  <g class="msc-bubble">
    <path d="M98 27 C110 24 118 29 118 38 C118 46 110 51 101 49 L94 54 L95 46 C90 43 88 38 91 33 C93 29 95 28 98 27 Z" fill="#FFFFFF" opacity=".95"/>
    <path d="M99 37 C104 34 109 34 113 37" stroke="${palette.mid}" stroke-width="2" fill="none" stroke-linecap="round"/>
  </g>`;
  }

  if (stage === 'teen') {
    return `<g class="msc-eyes">
    <circle cx="87" cy="56" r="13" fill="#FFFFFF"/>
    <circle cx="89" cy="57" r="6" fill="#1B2A33"/>
    <circle cx="91.5" cy="54" r="2" fill="#FFFFFF"/>
    <circle cx="87" cy="56" r="15" fill="none" stroke="#1B2A33" stroke-width="2.4"/>
  </g>
  <path d="M76 38 C82 34 91 34 97 38" stroke="${line}" stroke-width="2.4" fill="none" stroke-linecap="round"/>
  <path d="M56 79 C64 86 75 86 83 79" stroke="${line}" stroke-width="2.4" fill="none" stroke-linecap="round"/>
  <path d="M74 81 l2 3 l2 -3 Z" fill="#FFFFFF"/>`;
  }

  return `<path d="M41 61 C44 66 44 72 41 77 M48 61 C51 66 51 72 48 77" stroke="${dark}" stroke-width="2" fill="none" stroke-linecap="round"/>
  <g class="msc-eyes">
    <circle cx="55" cy="55" r="12" fill="#FFFFFF"/>
    <circle cx="85" cy="55" r="12" fill="#FFFFFF"/>
    <circle cx="57" cy="56" r="5" fill="#1B2A33"/>
    <circle cx="87" cy="56" r="5" fill="#1B2A33"/>
    <circle cx="59" cy="53.5" r="1.6" fill="#FFFFFF"/>
    <circle cx="89" cy="53.5" r="1.6" fill="#FFFFFF"/>
  </g>
  <path d="M45 35 C50 32 56 32 61 35 M76 35 C81 32 87 32 92 35" stroke="${line}" stroke-width="2.2" fill="none" stroke-linecap="round"/>
  <path d="M57 76 C66 83 82 83 91 76" stroke="${line}" stroke-width="2.4" fill="none" stroke-linecap="round"/>
  <path d="M66 78 l2 3 l2 -3 Z M78 78 l2 3 l2 -3 Z" fill="#FFFFFF"/>
  <g class="msc-book">
    <rect x="39" y="92" width="50" height="22" rx="3" fill="url(#bookGrad)"/>
    <rect x="39" y="92" width="50" height="22" rx="3" fill="none" stroke="#3E8F00" stroke-width="2"/>
    <path d="M64 92 V114" stroke="#3E8F00" stroke-width="2"/>
    <path d="M45 98 H58 M45 103 H55 M70 98 H83 M70 103 H80" stroke="#FFFFFF" stroke-width="2.2" stroke-linecap="round"/>
  </g>
  <path d="M34 88 C31 95 33 101 39 104 C45 101 48 96 47 91 Z M94 88 C97 95 95 101 89 104 C83 101 80 96 81 91 Z" fill="${dark}"/>`;
}

function accessoryFor(accessory, stage) {
  if (accessory === 'none') return '';

  if (accessory === 'glasses' && stage === 'adult') {
    return `<g fill="none" stroke="#1B2A33" stroke-width="2.6">
    <circle cx="55" cy="55" r="14"/>
    <circle cx="85" cy="55" r="14"/>
    <path d="M69 54 C71 52 73 52 75 54" stroke-linecap="round"/>
    <path d="M41 53 L34 50 M99 53 L106 50" stroke-linecap="round"/>
  </g>`;
  }

  if (accessory === 'glasses') {
    return `<g fill="none" stroke="#1B2A33" stroke-width="2.6">
    <circle cx="88" cy="57" r="19"/>
    <circle cx="52" cy="59" r="9"/>
    <path d="M69 57 C74 54 79 54 83 56" stroke-linecap="round"/>
    <path d="M43 59 L37 56 M107 57 L114 54" stroke-linecap="round"/>
  </g>`;
  }

  if (accessory === 'headphones') {
    return `<g>
    <path d="M48 56 C48 34 62 23 79 23 C96 23 108 34 108 56" fill="none" stroke="#CE82FF" stroke-width="5" stroke-linecap="round"/>
    <rect x="42" y="50" width="12" height="20" rx="5" fill="#CE82FF"/>
    <rect x="104" y="50" width="12" height="20" rx="5" fill="#CE82FF"/>
    <rect x="45" y="53" width="6" height="14" rx="3" fill="#F3E6FF"/>
    <rect x="106" y="53" width="6" height="14" rx="3" fill="#F3E6FF"/>
  </g>`;
  }

  return `<g>
    <path d="M48 40 C55 26 69 19 83 20 C96 21 106 29 109 40 Z" fill="#EF476F" stroke="#B02A4E" stroke-width="2"/>
    <path d="M44 40 C58 36 77 36 108 41 C108 46 99 48 88 46 L48 45 Z" fill="#FF6B81" stroke="#B02A4E" stroke-width="2"/>
  </g>`;
}

function svgFor({ age, body, outfit, accessory }) {
  const palette = PALETTES[body];
  const stage = stageForAge(age);
  const shape = SHAPES[stage];
  const aria = `Tubarão ${shape.label} ${LABELS.body[body]}, ${LABELS.outfit[outfit]} e ${LABELS.accessory[accessory]}`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128" role="img" aria-label="${aria}" data-body="${body}" data-outfit="${outfit}" data-accessory="${accessory}">
  <defs>
    <linearGradient id="bodyGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${palette.light}"/><stop offset="1" stop-color="${palette.mid}"/></linearGradient>
    <linearGradient id="bellyGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#EAF7FD"/></linearGradient>
    <linearGradient id="bookGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6EDB0B"/><stop offset="1" stop-color="#4BA800"/></linearGradient>
  </defs>
  <style>
    @keyframes msc-tail-wag{0%,100%{transform:rotate(0deg)}50%{transform:rotate(-8deg)}}
    @keyframes msc-fin-wave{0%,100%{transform:rotate(0deg)}50%{transform:rotate(9deg)}}
    @keyframes msc-blink{0%,92%,100%{transform:scaleY(1)}95%{transform:scaleY(.12)}97%{transform:scaleY(1)}}
    @keyframes msc-bubble-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}
    @keyframes msc-book-tilt{0%,100%{transform:rotate(0deg)}50%{transform:rotate(-3deg)}}
    .msc-tail{transform-box:fill-box;transform-origin:100% 50%;animation:msc-tail-wag 1.9s ease-in-out infinite}
    .msc-fin{transform-box:fill-box;transform-origin:50% 100%;animation:msc-fin-wave 1.5s ease-in-out infinite}
    .msc-eyes{transform-box:fill-box;transform-origin:50% 50%;animation:msc-blink 4.8s infinite}
    .msc-bubble{animation:msc-bubble-bob 2.3s ease-in-out infinite}
    .msc-book{transform-box:fill-box;transform-origin:50% 100%;animation:msc-book-tilt 2.4s ease-in-out infinite}
    @media (prefers-reduced-motion: reduce){.msc-tail,.msc-fin,.msc-eyes,.msc-bubble,.msc-book{animation:none}}
  </style>
  <g class="msc-tail">
    <path d="${shape.tail[0]}" fill="${palette.dark}"/>
    <path d="${shape.tail[1]}" fill="${palette.dark}"/>
  </g>
  <path d="${shape.body}" fill="url(#bodyGrad)"/>
  <path d="${shape.belly}" fill="url(#bellyGrad)"/>
  <path class="msc-fin" d="${shape.fin}" fill="${palette.dark}"/>
  ${outfitFor(outfit)}
  ${faceFor(stage, palette)}
  ${accessoryFor(accessory, stage)}
</svg>`;
}

export function avatarFor(profile) {
  const avatar = profile == null ? undefined : profile.avatar;
  if (avatar === null || typeof avatar !== 'object') return null;

  const options = normalizeAvatar(avatar);
  const source = profile && typeof profile === 'object' ? profile : {};

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
    svgFor({ age: source.age, ...options })
  )}`;
}
