export const AVATAR_GROUPS = [
  {
    id: 'body',
    label: 'Cor do vaga-lume',
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
  blue: { light: '#8FD4F2', mid: '#5FB6E4', dark: '#337FB2', line: '#255F85' },
  green: { light: '#A7E8B4', mid: '#5FC98A', dark: '#3A9E68', line: '#276749' },
  purple: { light: '#D7C4FA', mid: '#9B7BDE', dark: '#7A5BC1', line: '#553C9A' },
  pink: { light: '#FFD0DF', mid: '#F58FB4', dark: '#D66A97', line: '#9B4070' },
  orange: { light: '#FFD9A8', mid: '#F5A65C', dark: '#D98032', line: '#A8531A' },
};

const SHAPES = {
  baby: {
    label: 'bebê',
    body: { cx: 64, cy: 68, rx: 32, ry: 39 },
    wings: [
      { cx: 34, cy: 54, rx: 23, ry: 13, rotate: -26 },
      { cx: 94, cy: 54, rx: 23, ry: 13, rotate: 26 },
    ],
    glow: { cx: 64, cy: 96, rx: 14, ry: 8 },
    halo: { cx: 64, cy: 82, r: 40 },
    eyes: { left: 49, right: 79, y: 58, r: 13, pupil: 6 },
  },
  teen: {
    label: 'adolescente',
    body: { cx: 64, cy: 68, rx: 31, ry: 39 },
    wings: [
      { cx: 32, cy: 54, rx: 24, ry: 12, rotate: -24 },
      { cx: 96, cy: 54, rx: 24, ry: 12, rotate: 24 },
    ],
    glow: { cx: 64, cy: 96, rx: 13, ry: 8 },
    halo: { cx: 64, cy: 82, r: 39 },
    eyes: { left: 51, right: 77, y: 59, r: 11.5, pupil: 5.4 },
  },
  adult: {
    label: 'adulto',
    body: { cx: 64, cy: 68, rx: 33, ry: 40 },
    wings: [
      { cx: 30, cy: 55, rx: 25, ry: 13, rotate: -22 },
      { cx: 98, cy: 55, rx: 25, ry: 13, rotate: 22 },
    ],
    glow: { cx: 64, cy: 97, rx: 14, ry: 9 },
    halo: { cx: 64, cy: 82, r: 42 },
    eyes: { left: 51, right: 77, y: 58, r: 11.5, pupil: 5 },
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

function wingMarkup(wing, side, palette) {
  const rotate = wing.rotate;
  const keyframe = side === 'left' ? 'msc-wing-left' : 'msc-wing-right';
  return `<ellipse class="${keyframe}" cx="${wing.cx}" cy="${wing.cy}" rx="${wing.rx}" ry="${wing.ry}" transform="rotate(${rotate} ${wing.cx} ${wing.cy})" fill="url(#wingGrad)" stroke="${palette.light}" stroke-width="2"/>`;
}

function outfitFor(outfit, shell) {
  if (outfit === 'none') return '';

  const round = (value) => Math.round(value * 100) / 100;
  const { cx, cy, rx, ry } = shell;
  const top = cy + 13;
  const bottom = cy + ry - 2;
  const ratio = (top - cy) / ry;
  const halfTop = round(rx * Math.sqrt(Math.max(0, 1 - ratio * ratio)));
  const left = round(cx - halfTop + 1);
  const right = round(cx + halfTop - 1);
  const waistLeft = round(cx - rx * 0.5);
  const waistRight = round(cx + rx * 0.5);
  const neckY = top + 4;

  const base = (fill, stroke) => `<path d="M${left} ${top} C${left + 2} ${cy + ry - 12} ${waistLeft} ${bottom} ${cx} ${bottom} C${waistRight} ${bottom} ${right - 2} ${cy + ry - 12} ${right} ${top} Z" fill="${fill}" stroke="${stroke}" stroke-width="2"/>`;
  const collar = `<path d="M${cx - 9} ${neckY} C${cx - 4} ${neckY + 6} ${cx + 4} ${neckY + 6} ${cx + 9} ${neckY}" fill="none" stroke="#FFF3C4" stroke-width="3" stroke-linecap="round"/>`;

  if (outfit === 'shirt') return `${base('#FFD166', '#C77A00')}
  ${collar}`;

  if (outfit === 'hoodie') {
    const hoodTop = top - 8;

    return `${base('#FFD166', '#C77A00')}
  <path d="M${cx - 15} ${top - 1} C${cx - 11} ${hoodTop - 2} ${cx + 11} ${hoodTop - 2} ${cx + 15} ${top - 1} L${cx + 10} ${neckY + 6} C${cx + 4} ${neckY + 2} ${cx - 4} ${neckY + 2} ${cx - 10} ${neckY + 6} Z" fill="#FFD166" stroke="#C77A00" stroke-width="2"/>
  <path d="M${cx - 5} ${neckY + 1} V${neckY + 9} M${cx + 5} ${neckY + 1} V${neckY + 9}" stroke="#FFF3C4" stroke-width="2" stroke-linecap="round"/>`;
  }

  return `${base('#2F3E57', '#162033')}
  <path d="M${cx - 14} ${top - 2} L${cx} ${neckY + 9} L${cx - 6} ${bottom - 3} L${cx - 21} ${neckY + 2} Z" fill="#FFFFFF" opacity=".9"/>
  <path d="M${cx + 14} ${top - 2} L${cx} ${neckY + 9} L${cx + 6} ${bottom - 3} L${cx + 21} ${neckY + 2} Z" fill="#FFFFFF" opacity=".9"/>
  <path d="M${cx} ${neckY + 9} V${bottom}" stroke="#FFD166" stroke-width="2"/>`;
}

function faceFor(stage, palette, shape) {
  const { line } = palette;
  const { left, right, y, r, pupil } = shape.eyes;
  const shine = r * 0.18;

  let extra = '';

  if (stage === 'baby') {
    extra = `<ellipse cx="43" cy="74" rx="7" ry="5" fill="#FF9AA2" opacity=".72"/>
  <ellipse cx="85" cy="74" rx="7" ry="5" fill="#FF9AA2" opacity=".58"/>
  <path d="M55 81 C60 87 68 87 73 81" stroke="${line}" stroke-width="2.6" fill="none" stroke-linecap="round"/>
  <g class="msc-sparkle"><path d="M20 27 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2 Z" fill="#FFD34D"/></g>`;
  } else if (stage === 'teen') {
    extra = `<path d="M54 81 C59 86 69 86 74 81" stroke="${line}" stroke-width="2.4" fill="none" stroke-linecap="round"/>
  <path d="M73 83 l2 3 l2 -3 Z" fill="#FFFFFF"/>`;
  } else {
    extra = `<path d="M42 35 C48 32 54 32 59 35 M70 35 C76 32 82 32 87 35" stroke="${line}" stroke-width="2.2" fill="none" stroke-linecap="round"/>
  <path d="M55 81 C60 87 70 87 75 81" stroke="${line}" stroke-width="2.4" fill="none" stroke-linecap="round"/>
  <path d="M62 83 l2 3 l2 -3 Z M70 83 l2 3 l2 -3 Z" fill="#FFFFFF"/>`;
  }

  return `${extra}
  <g class="msc-eyes">
    <circle cx="${left}" cy="${y}" r="${r}" fill="#FFFFFF"/>
    <circle cx="${right}" cy="${y}" r="${r}" fill="#FFFFFF"/>
    <circle cx="${left + 2}" cy="${y + 1}" r="${pupil}" fill="#1B2A33"/>
    <circle cx="${right + 2}" cy="${y + 1}" r="${pupil}" fill="#1B2A33"/>
    <circle cx="${left + 4}" cy="${y - 2}" r="${shine}" fill="#FFFFFF"/>
    <circle cx="${right + 4}" cy="${y - 2}" r="${shine}" fill="#FFFFFF"/>
  </g>`;
}

function accessoryFor(accessory, shape, shell) {
  if (accessory === 'none') return '';
  const { left, right, y, r } = shape.eyes;

  if (accessory === 'glasses') {
    const lens = r + 2;
    const bridgeLeft = left + lens - 1;
    const bridgeRight = right - lens + 1;
    const bridgeY = y - 1;
    const bridgeMid = (bridgeLeft + bridgeRight) / 2;

    return `<g fill="none" stroke="#1B2A33" stroke-width="2.6">
    <circle cx="${left}" cy="${y}" r="${lens}"/>
    <circle cx="${right}" cy="${y}" r="${lens}"/>
    <path d="M${bridgeLeft} ${bridgeY} Q${bridgeMid} ${bridgeY - 4} ${bridgeRight} ${bridgeY}" stroke-linecap="round"/>
    <path d="M${left - lens} ${bridgeY} L${left - lens - 8} ${y - 5} M${right + lens} ${bridgeY} L${right + lens + 8} ${y - 5}" stroke-linecap="round"/>
  </g>`;
  }

  if (accessory === 'headphones') {
    const earLeft = left - r - 7;
    const earRight = right + r + 7;
    const top = shell.cy - shell.ry - 5;
    const earY = y - 1;

    return `<g>
    <path d="M${earLeft} ${earY} C${earLeft} ${top + 4} ${shell.cx - 14} ${top} ${shell.cx} ${top} C${shell.cx + 14} ${top} ${earRight} ${top + 4} ${earRight} ${earY}" fill="none" stroke="#CE82FF" stroke-width="5" stroke-linecap="round"/>
    <rect x="${earLeft - 6}" y="${earY - 6}" width="12" height="20" rx="5" fill="#CE82FF"/>
    <rect x="${earRight - 6}" y="${earY - 6}" width="12" height="20" rx="5" fill="#CE82FF"/>
    <rect x="${earLeft - 3}" y="${earY - 3}" width="6" height="14" rx="3" fill="#F3E6FF"/>
    <rect x="${earRight - 3}" y="${earY - 3}" width="6" height="14" rx="3" fill="#F3E6FF"/>
  </g>`;
  }

  const capLeft = shell.cx - shell.rx + 4;
  const capRight = shell.cx + shell.rx - 4;
  const capTop = shell.cy - shell.ry - 10;
  const capBase = shell.cy - shell.ry + 9;
  const brimLeft = capLeft - 4;
  const brimRight = Math.min(120, capRight + 12);

  return `<g>
    <path d="M${capLeft} ${capBase} C${capLeft + 6} ${capTop + 4} ${shell.cx - 12} ${capTop} ${shell.cx} ${capTop} C${shell.cx + 13} ${capTop} ${capRight - 5} ${capTop + 4} ${capRight} ${capBase} Z" fill="#EF476F" stroke="#B02A4E" stroke-width="2"/>
    <path d="M${brimLeft} ${capBase} C${shell.cx - 6} ${capBase - 4} ${brimRight - 6} ${capBase - 3} ${brimRight} ${capBase + 1} L${brimRight - 3} ${capBase + 6} C${shell.cx + 8} ${capBase + 3} ${brimLeft + 10} ${capBase + 4} ${brimLeft} ${capBase + 3} Z" fill="#FF6B81" stroke="#B02A4E" stroke-width="2"/>
    <circle cx="${shell.cx}" cy="${capTop}" r="2.5" fill="#FF6B81" stroke="#B02A4E" stroke-width="1.5"/>
  </g>`;
}

function svgFor({ age, body, outfit, accessory }) {
  const palette = PALETTES[body];
  const stage = stageForAge(age);
  const shape = SHAPES[stage];
  const aria = `Vaga-lume ${shape.label} ${LABELS.body[body]}, ${LABELS.outfit[outfit]} e ${LABELS.accessory[accessory]}`;
  const { glow, halo, body: shell } = shape;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128" role="img" aria-label="${aria}" data-body="${body}" data-outfit="${outfit}" data-accessory="${accessory}">
  <defs>
    <linearGradient id="bodyGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${palette.light}"/><stop offset="1" stop-color="${palette.mid}"/></linearGradient>
    <linearGradient id="wingGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF" stop-opacity=".95"/><stop offset="1" stop-color="#D7F1FC" stop-opacity=".6"/></linearGradient>
    <radialGradient id="glowGrad" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#FFF8C4"/><stop offset=".55" stop-color="#FFD34D"/><stop offset="1" stop-color="#FFD34D" stop-opacity="0"/></radialGradient>
  </defs>
  <style>
    @keyframes msc-wing-left{0%,100%{transform:rotate(-24deg) translateY(0)}50%{transform:rotate(-13deg) translateY(-3px)}}
    @keyframes msc-wing-right{0%,100%{transform:rotate(24deg) translateY(0)}50%{transform:rotate(13deg) translateY(-3px)}}
    @keyframes msc-glow{0%,100%{opacity:.72;transform:scale(.97)}50%{opacity:1;transform:scale(1.04)}}
    @keyframes msc-blink{0%,92%,100%{transform:scaleY(1)}95%{transform:scaleY(.12)}97%{transform:scaleY(1)}}
    @keyframes msc-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-2px)}}
    .msc-wing-left{transform-box:fill-box;transform-origin:90% 100%;animation:msc-wing-left 1.8s ease-in-out infinite}
    .msc-wing-right{transform-box:fill-box;transform-origin:10% 100%;animation:msc-wing-right 1.8s ease-in-out infinite}
    .msc-halo,.msc-glow{transform-box:fill-box;transform-origin:50% 50%;animation:msc-glow 2.2s ease-in-out infinite}
    .msc-eyes{transform-box:fill-box;transform-origin:50% 50%;animation:msc-blink 4.8s infinite}
    .msc-body{animation:msc-bob 2.6s ease-in-out infinite}
    @media (prefers-reduced-motion: reduce){.msc-wing-left,.msc-wing-right,.msc-halo,.msc-glow,.msc-eyes,.msc-body{animation:none}}
  </style>

  <circle class="msc-halo" cx="${halo.cx}" cy="${halo.cy}" r="${halo.r}" fill="url(#glowGrad)" opacity=".7"/>
  ${wingMarkup(shape.wings[0], 'left', palette)}
  ${wingMarkup(shape.wings[1], 'right', palette)}
  <path d="M51 36 C47 26 42 21 37 19 M77 36 C81 26 86 21 91 19" stroke="${palette.line}" stroke-width="2.4" fill="none" stroke-linecap="round"/>
  <circle cx="37" cy="19" r="4" fill="#FFD34D"/>
  <circle cx="91" cy="19" r="4" fill="#FFD34D"/>

  <g class="msc-body">
    <ellipse cx="${shell.cx}" cy="${shell.cy}" rx="${shell.rx}" ry="${shell.ry}" fill="url(#bodyGrad)" stroke="${palette.line}" stroke-width="2.6"/>
    ${outfitFor(outfit, shell)}
    <ellipse class="msc-glow" cx="${glow.cx}" cy="${glow.cy}" rx="${glow.rx}" ry="${glow.ry}" fill="#FFD34D"/>
    <ellipse cx="${glow.cx}" cy="${glow.cy}" rx="${glow.rx * 0.58}" ry="${glow.ry * 0.55}" fill="#FFF6C2" opacity=".9"/>
    ${faceFor(stage, palette, shape)}
    ${accessoryFor(accessory, shape, shell)}
  </g>
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
