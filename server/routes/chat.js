import { Router } from 'express';
import { generateReply, GeminiError } from '../services/gemini.js';
import { hasAiKey, missingAiKeyError } from '../services/ai-keys.js';
import { resolveLevel, resolveSubject } from '../prompts.js';

const router = Router();

router.post('/', async (req, res) => {
  const { messages } = req.body ?? {};

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'messages array required' });
  }

  if (!hasAiKey()) {
    return res.status(500).json({ error: missingAiKeyError() });
  }
  const apiKey = process.env.GEMINI_API_KEY;

  try {
    const reply = await generateReply({
      messages,
      level: resolveLevel(req.body?.level, req.body?.profile),
      subject: resolveSubject(req.body?.subject),
      profile: req.body?.profile,
      apiKey,
      signal: req.signal,
    });
    res.json({ reply });
  } catch (error) {
    if (error instanceof GeminiError) {
      console.error('Gemini error:', error.message);
      return res.status(502).json({ error: 'AI request failed', detail: error.message });
    }
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
