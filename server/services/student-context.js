const AGE_BANDS = [
  { max: 5, label: 'criança pequena' },
  { max: 10, label: 'criança' },
  { max: 14, label: 'pré-adolescente' },
  { max: 17, label: 'adolescente' },
  { max: 59, label: 'adulto' },
  { max: Infinity, label: 'pessoa idosa' },
];

const OBJECTIVE_LABELS = {
  idiomas: 'aprender idiomas',
  escolar: 'reforço escolar',
  curiosidades: 'explorar curiosidades',
  geral: 'praticar um pouco de tudo',
};

const SCHOOLING_LABELS = {
  infantil: 'educação infantil',
  fundamental: 'ensino fundamental',
  medio: 'ensino médio',
  superior: 'ensino superior',
  autodidato: 'estudo por conta própria',
};

const INTEREST_LABELS = {
  ciencia: 'Ciência',
  espaco: 'Espaço',
  natureza: 'Natureza',
  historia: 'História',
  tecnologia: 'Tecnologia',
  cultura: 'Cultura',
};

function clean(value, max = 80) {
  return typeof value === 'string'
    ? value.trim().replace(/\s+/g, ' ').slice(0, max)
    : '';
}

export function cleanList(input, maxItems = 20, maxChars = 160) {
  if (!Array.isArray(input)) return [];
  return input.map((item) => clean(item, maxChars)).filter(Boolean).slice(-maxItems);
}

function ageLabel(age) {
  return AGE_BANDS.find((band) => age <= band.max)?.label ?? 'adulto';
}

export function normalizeStudentProfile(input) {
  const raw = input && typeof input === 'object' ? input : {};
  const age = Number(raw.age);
  const interests = Array.isArray(raw.interests)
    ? raw.interests.map((id) => INTEREST_LABELS[id]).filter(Boolean).slice(0, 3)
    : [];

  return {
    name: clean(raw.name, 60),
    age: Number.isInteger(age) && age >= 3 && age <= 100 ? age : null,
    objective: OBJECTIVE_LABELS[raw.objective] ?? null,
    schooling: SCHOOLING_LABELS[raw.schooling] ?? null,
    interests,
  };
}

export function buildStudentContext(input) {
  const profile = normalizeStudentProfile(input);
  const lines = [];

  if (profile.name) lines.push(`- Nome: ${profile.name}`);
  if (profile.age) lines.push(`- Idade: ${profile.age} anos (${ageLabel(profile.age)})`);
  if (profile.objective) lines.push(`- Objetivo no app: ${profile.objective}`);
  if (profile.schooling) lines.push(`- Escolaridade: ${profile.schooling}`);
  if (profile.interests.length) lines.push(`- Temas preferidos: ${profile.interests.join(', ')}`);

  if (!lines.length) return '';

  return `CONTEXTO DO ESTUDANTE — ADAPTE TODO O CONTEÚDO A ELE:
${lines.join('\n')}
REGRAS DE ADAPTAÇÃO:
- Use vocabulário, exemplos e complexidade adequados à idade e escolaridade informadas.
- Para 3 a 5 anos: frases muito curtas, palavras concretas, sem temas assustadores.
- Para 6 a 10 anos: linguagem simples e exemplos do cotidiano escolar.
- Para 11 a 17 anos: linguagem natural, sem infantilizar.
- Para adultos e idosos: tom respeitoso, sem infantilizar; exemplos de mundo real.
- Se houver temas preferidos, priorize-os quando fizer sentido para o quadro.
- Use os nomes dos temas preferidos sempre em português: "Natureza", nunca "nature".
- Nunca mencione que recebeu estes dados ou repita o nome do estudante à toa.`;
}

export function appendStudentContext(systemInstruction, profile) {
  const context = buildStudentContext(profile);
  if (!context || !systemInstruction?.parts?.length) return systemInstruction;

  return {
    ...systemInstruction,
    parts: [
      { text: `${systemInstruction.parts[0].text}\n\n${context}` },
      ...systemInstruction.parts.slice(1),
    ],
  };
}
