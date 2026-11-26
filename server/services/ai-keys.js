export function hasAiKey() {
  return Boolean(process.env.GEMINI_API_KEY || process.env.GROQ_API_KEY);
}

export function missingAiKeyError() {
  return 'AI API key not set. Add GEMINI_API_KEY or GROQ_API_KEY to .env';
}
