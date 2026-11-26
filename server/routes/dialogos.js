import { Router } from 'express';
import { generateDialogo, DialogosError, DIALOG_SUBJECTS } from '../services/dialogos.js';
import { hasAiKey, missingAiKeyError } from '../services/ai-keys.js';
import { resolveLevel } from '../prompts.js';
import { cleanList } from '../services/student-context.js';

const router = Router();

function clean(value, max = 80) {
  return typeof value === 'string' ? value.trim().replace(/\s+/g, ' ').slice(0, max) : '';
}

router.post('/', async (req, res) => {
  if (!hasAiKey()) {
    return res.status(500).json({ error: missingAiKeyError() });
  }
  const apiKey = process.env.GEMINI_API_KEY;

  try {
    const rawSubject = req.body?.subject;
    const subject = Object.hasOwn(DIALOG_SUBJECTS, rawSubject) ? rawSubject : 'english';
    const level = resolveLevel(clean(req.body?.level, 20) || 'B1', req.body?.profile);
    const used = cleanList(req.body?.used ?? req.body?.asked, 12, 80);

    const dialogo = await generateDialogo({ subject, level, used, profile: req.body?.profile, apiKey, signal: req.signal });
    res.json(dialogo);
  } catch (error) {
    if (error instanceof DialogosError) {
      console.error('Dialogos error:', error.message);
      return res.status(502).json({ error: 'AI request failed', detail: error.message });
    }
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
