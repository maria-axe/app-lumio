import { Router } from 'express';
import { generateMaterias, MateriasError } from '../services/materias.js';
import { hasAiKey, missingAiKeyError } from '../services/ai-keys.js';
import { cleanList } from '../services/student-context.js';

const router = Router();

router.post('/', async (req, res) => {
  if (!hasAiKey()) {
    return res.status(500).json({ error: missingAiKeyError() });
  }
  const apiKey = process.env.GEMINI_API_KEY;

  try {
    const asked = cleanList(req.body?.asked, 20, 160);
    const quiz = await generateMaterias({
      subject: req.body?.subject,
      asked,
      profile: req.body?.profile,
      apiKey,
      signal: req.signal,
    });
    res.json(quiz);
  } catch (error) {
    if (error instanceof MateriasError) {
      console.error('Materias error:', error.message);
      return res.status(502).json({ error: 'AI request failed', detail: error.message });
    }
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
