import { buildSystemInstruction, subjectEndonym } from '../prompts.js';
import { generateContent } from './gemini-client.js';
import { appendStudentContext } from './student-context.js';

const MAX_HISTORY = 10;
const MAX_MESSAGE_CHARS = 2000;
const MAX_OUTPUT_TOKENS = 1024;

// Par few-shot inicial, no idioma-alvo, para a IA entender o formato.
function buildSeedExchange(subject) {
  const endonym = subjectEndonym(subject);
  return [
    { role: 'user', parts: [{ text: 'Follow the teacher rules for this level. Greet the student and ask a simple question.' }] },
    { role: 'model', parts: [{ text: `Hello! 👋 I'm your ${endonym} teacher. Let's practice! How are you today?` }] },
  ];
}

function toGeminiRole(role) {
  return role === 'assistant' ? 'model' : 'user';
}

function toContents(messages) {
  return messages.slice(-MAX_HISTORY).map((message) => ({
    role: toGeminiRole(message.role),
    parts: [{ text: String(message.content ?? '').slice(0, MAX_MESSAGE_CHARS) }],
  }));
}

export class GeminiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'GeminiError';
    this.status = status;
  }
}

export async function generateReply({ messages, level, subject, profile, apiKey, signal }) {
  try {
    return await generateContent({
      apiKey,
      signal,
      systemInstruction: appendStudentContext(buildSystemInstruction(level, subject), profile),
      contents: [...buildSeedExchange(subject), ...toContents(messages)],
      generationConfig: { maxOutputTokens: MAX_OUTPUT_TOKENS },
    });
  } catch (error) {
    throw new GeminiError(error.message, error.status ?? 502);
  }
}
