export const DEFAULT_LEVEL = 'B1';
export const DEFAULT_SUBJECT = 'english';

export const LEVEL_GUIDES = {
  A1: 'CEFR A1 (Beginner): use present simple, basic vocabulary (greetings, family, food, numbers). Very short sentences (3-6 words). Speak slowly and clearly. Avoid any complex grammar.',
  A2: 'CEFR A2 (Elementary): use present simple and past simple, common daily vocabulary. Short sentences (5-10 words). Can use "and", "but", "because". Avoid perfect tenses and conditionals.',
  B1: 'CEFR B1 (Intermediate): use present, past, future, and present perfect. Everyday topics (work, travel, hobbies). Can express opinions simply. Introduce occasional new vocabulary with context.',
  B2: 'CEFR B2 (Upper-Intermediate): use all common tenses including conditionals and passive voice. Discuss abstract topics (opinions, news, culture). Use more natural, conversational English with idioms occasionally.',
  C1: 'CEFR C1 (Advanced): use nuanced language, phrasal verbs, idioms, and register shifts. Discuss complex topics (politics, science, humor). Vary sentence structure. Correct subtle errors with explanation.',
  C2: 'CEFR C2 (Proficiency): speak with near-native fluency and precision. Use advanced vocabulary, collocations, and stylistic variation. Discuss nuance, irony, and specialized topics. Focus on fine-tuning, not basics.',
};

const LEVEL_ORDER = Object.keys(LEVEL_GUIDES);

function safeLevel(level) {
  return Object.hasOwn(LEVEL_GUIDES, level) ? level : DEFAULT_LEVEL;
}

export function maxLevelForAge(age) {
  if (age === null || age === undefined || age === '') return 'C2';
  const value = Number(age);
  if (!Number.isInteger(value)) return 'C2';
  if (value >= 3 && value <= 5) return 'A1';
  if (value >= 6 && value <= 10) return 'A2';
  if (value >= 11 && value <= 14) return 'B1';
  if (value >= 15 && value <= 17) return 'B2';
  return 'C2';
}

// Registry de matérias. Cada matéria declara o idioma-alvo (`language`) usado
// para montar os prompts. Novas matérias entram aqui — o resto do app já é
// dirigido por `subject` (nível, XP, histórico e quadros são por matéria).
export const SUBJECTS = {
  english: { label: 'Inglês', language: 'English', endonym: 'English' },
  spanish: { label: 'Espanhol', language: 'Spanish', endonym: 'Español' },
  french: { label: 'Francês', language: 'French', endonym: 'Français' },
};

function buildChatPrompt(language) {
  return `You are a friendly ${language} teacher for Brazilian Portuguese speakers.
Rules:
- Always reply in ${language}, matching the student's level.
- After your ${language} reply, add a short section "PT-BR:" with a brief translation/feedback in Portuguese.
- If the student makes a grammar or vocabulary mistake, gently correct it in the "PT-BR:" section.
- Keep replies short (2-4 sentences) so the student can practice.
- Start conversations with a question to keep the student talking.`;
}

function buildQuizPrompt(language) {
  return `You create ${language} multiple-choice exercises for Brazilian Portuguese speakers.
Rules:
- Produce exactly 3 options, only one correct.
- The question must test ${language} grammar or vocabulary appropriate to the student's level. The whole exercise MUST stay within the student's CEFR level — never use grammar or vocabulary above it.
- LANGUAGE OF THE QUESTION ("question" field): the INSTRUCTION/TASK is ALWAYS in Brazilian Portuguese (the student may be a beginner and must understand what to do). Keep the language being tested (${language}) in the content. Format: a short instruction in Portuguese followed by the ${language} content when relevant. Examples:
  - "Complete a frase com o verbo correto: I ___ to Paris last year."
  - "Escolha a frase gramaticalmente correta."
  - "Qual é a tradução de 'book'?"
  - "Escolha a resposta correta para o diálogo: — How are you? — ___"
- LANGUAGE OF THE OPTIONS: options stay in the language the task requires. For fill-in-the-blank and "choose the correct sentence/dialogue" tasks the options are in ${language}. For "what is the translation of X" tasks the options are in Portuguese.
- VARY the task type between calls. Do not always use fill-in-the-blank. Rotate between: (a) fill-in-the-blank, (b) choose the correct translation of a word/phrase, (c) pick the grammatically correct sentence, (d) choose the right word to match a definition, (e) choose the correct response to a short dialogue, (f) LISTENING comprehension, (g) SPEAKING/PRONUNCIATION (repeat aloud).
- LISTENING tasks (type f): a short, natural ${language} sentence/line is spoken aloud by the app (text-to-speech), and the student must answer without reading it. For these:
  - "audio" MUST contain ONLY the ${language} sentence that will be spoken (no instruction, no translation). Keep it one sentence within the student's level.
  - "question" MUST NOT reveal the spoken sentence. Ask in Portuguese what was heard or what it means, e.g. "O que você ouviu?" / "O que a frase significa?" / "Ouça e escolha a tradução correta."
  - The 3 options are in Portuguese (translations/meanings), only one correct.
- SPEAKING tasks (type g): the student must SPEAK the ${language} sentence aloud (no audio file to listen to first). For these:
  - DO NOT include "audio" field, or set it to empty string.
  - "question" MUST be in Portuguese and MUST clearly show the target sentence for the student to repeat. Use this exact style: "Repita em voz alta esta frase:" and put the ${language} sentence right after. Example: "Repita em voz alta esta frase: I have a blue car."
  - The sentence after the prefix is the ONLY target. The app captures the student's microphone and compares the spoken words to that sentence; no multiple-choice option is shown.
  - Still fill the required "options" array for the response schema: put the target sentence at correctIndex and make the other two plausible WRONG versions. These options are internal only.
  - The instruction must make it clear this is about reproducing/pronouncing that sentence.
  - "explanation" gives a short tip in Portuguese (pronunciation/grammar).
- For NON-listening tasks, OMIT the "audio" field entirely (or send an empty string).
- Keep options short, plausible and free of numbering or letters.
- "translation" is the Portuguese translation of the correct option (or of the whole correct sentence when the option is a sentence).
- "explanation" is a short explanation in Portuguese of why the answer is correct.
- For accent questions, ask for ONE accent type and make exactly one option match it: acute (á é í ó ú), grave (à), circumflex (â ê ô), or tilde (ã õ). "pão" has a tilde, not an acute accent.
- Keep the Portuguese instruction fully in Portuguese; write "natureza", never "nature".
- For fill-in-the-blank questions, use "___" for the gap; never use "..." or "…".`;
}

export function resolveLevel(level, profile) {
  const resolved = safeLevel(level);
  const max = maxLevelForAge(profile?.age);
  return LEVEL_ORDER.indexOf(resolved) > LEVEL_ORDER.indexOf(max) ? max : resolved;
}

export function resolveSubject(subject) {
  return Object.hasOwn(SUBJECTS, subject) ? subject : DEFAULT_SUBJECT;
}

export function subjectLabel(subject) {
  return SUBJECTS[resolveSubject(subject)].label;
}

export function subjectEndonym(subject) {
  return SUBJECTS[resolveSubject(subject)].endonym;
}

export function buildSystemInstruction(level, subject) {
  const { language } = SUBJECTS[resolveSubject(subject)];
  return { parts: [{ text: `${buildChatPrompt(language)}\n\nLevel guide: ${LEVEL_GUIDES[safeLevel(level)]}` }] };
}

// Tópicos sorteados por chamada para empurrar variação (Gemini não aceita seed).
const QUIZ_TOPICS = [
  'daily routine', 'work and office', 'travel and airports', 'food and restaurants',
  'hobbies and free time', 'health and the body', 'technology and devices',
  'feelings and emotions', 'shopping and money', 'weather and seasons',
  'family and friends', 'school and study', 'sports', 'movies and books',
  'housing and furniture', 'transportation', 'nature and animals', 'dates and time',
];

function pickTopic() {
  return QUIZ_TOPICS[Math.floor(Math.random() * QUIZ_TOPICS.length)];
}

export function buildQuizSystemInstruction(level, subject, asked = []) {
  const { language } = SUBJECTS[resolveSubject(subject)];
  const parts = [
    `${buildQuizPrompt(language)}\n\nLevel guide: ${LEVEL_GUIDES[safeLevel(level)]}`,
    `Suggested topic for THIS question: ${pickTopic()}. You may pick another topic if needed, but keep it different from previous questions.`,
  ];
  if (asked.length > 0) {
    const list = asked.map((q, i) => `${i + 1}. ${q}`).join('\n');
    parts.push(
      `ALREADY ASKED (do NOT repeat or rephrase these; same question, same sentence or same correct answer is forbidden):\n${list}`,
    );
  }
  return { parts: [{ text: parts.join('\n\n') }] };
}
