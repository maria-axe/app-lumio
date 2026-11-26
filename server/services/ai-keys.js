export function hasAiKey(env = process.env) {
  return Boolean(env.GEMINI_API_KEY || env.GROQ_API_KEY);
}

export function missingAiKeyError() {
  return 'AI API key not set. Add GEMINI_API_KEY or GROQ_API_KEY to .env';
}
