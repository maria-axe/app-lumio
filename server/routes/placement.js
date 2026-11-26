import { Router } from 'express';
import { SUBJECTS } from '../prompts.js';
import {
  generatePlacement,
  gradePlacement,
  PlacementError,
} from '../services/placement.js';
import { hasAiKey, missingAiKeyError } from '../services/ai-keys.js';

const router = Router();

router.post('/start', async (req, res) => {
  if (!hasAiKey()) {
    return res.status(500).json({ error: missingAiKeyError() });
  }
  const apiKey = process.env.GEMINI_API_KEY;

  const subject = req.body?.subject;
  if (!Object.hasOwn(SUBJECTS, subject)) {
    return res.status(400).json({ error: 'valid subject required' });
  }

  try {
    const result = await generatePlacement({
      subject,
      profile: req.body?.profile,
      apiKey,
      signal: req.signal,
    });
    res.json(result);
  } catch (error) {
    if (error instanceof PlacementError) {
      console.error('Placement start error:', error.message);
      return res.status(error.status).json({ error: error.message });
    }
    console.error(error);
    res.status(502).json({ error: 'AI request failed', detail: error.message });
  }
});

router.post('/finish', async (req, res) => {
  try {
    const result = await gradePlacement({
      token: req.body?.token,
      answers: req.body?.answers,
    });
    res.json(result);
  } catch (error) {
    if (error instanceof PlacementError) {
      return res.status(error.status).json({ error: error.message });
    }
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
