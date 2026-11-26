import { SUBJECTS, resolveLevel, resolveSubject } from '../server/prompts.js';
import { hasAiKey, missingAiKeyError } from '../server/services/ai-keys.js';
import { cleanList } from '../server/services/student-context.js';
import { generateReply, GeminiError } from '../server/services/gemini.js';
import { generateQuiz, QuizError } from '../server/services/quiz.js';
import { generateMaterias, MateriasError } from '../server/services/materias.js';
import { generateCuriosidade, CuriosidadesError } from '../server/services/curiosidades.js';
import {
  DIALOG_SUBJECTS,
  generateDialogo,
  DialogosError,
} from '../server/services/dialogos.js';
import {
  generatePlacement,
  gradePlacement,
  PlacementError,
} from '../server/services/placement.js';
import { HttpError, json, readJson } from './http.js';

function clean(value, max = 80) {
  return typeof value === 'string' ? value.trim().replace(/\s+/g, ' ').slice(0, max) : '';
}

function missingKey(env) {
  return hasAiKey(env) ? null : json({ error: missingAiKeyError() }, 500);
}

function aiFailure(label, error) {
  console.error(`${label} error:`, error.message);
  return json({ error: 'AI request failed', detail: error.message }, 502);
}

function serverFailure(error) {
  console.error(error);
  return json({ error: 'Server error' }, 500);
}

async function chat(body, env, signal) {
  const { messages } = body ?? {};
  if (!Array.isArray(messages) || messages.length === 0) {
    return json({ error: 'messages array required' }, 400);
  }

  const missing = missingKey(env);
  if (missing) return missing;

  try {
    const reply = await generateReply({
      messages,
      level: resolveLevel(body.level, body.profile),
      subject: resolveSubject(body.subject),
      profile: body.profile,
      apiKey: env.GEMINI_API_KEY,
      signal,
      env,
    });
    return json({ reply });
  } catch (error) {
    if (error instanceof GeminiError) return aiFailure('Gemini', error);
    return serverFailure(error);
  }
}

async function quiz(body, env, signal) {
  const missing = missingKey(env);
  if (missing) return missing;

  try {
    const result = await generateQuiz({
      level: resolveLevel(body.level, body.profile),
      subject: resolveSubject(body.subject),
      asked: cleanList(body.asked, 20, 160),
      profile: body.profile,
      apiKey: env.GEMINI_API_KEY,
      signal,
      env,
    });
    return json(result);
  } catch (error) {
    if (error instanceof QuizError) return aiFailure('Quiz', error);
    return serverFailure(error);
  }
}

async function materias(body, env, signal) {
  const missing = missingKey(env);
  if (missing) return missing;

  try {
    const result = await generateMaterias({
      subject: body.subject,
      asked: cleanList(body.asked, 20, 160),
      profile: body.profile,
      apiKey: env.GEMINI_API_KEY,
      signal,
      env,
    });
    return json(result);
  } catch (error) {
    if (error instanceof MateriasError) return aiFailure('Materias', error);
    return serverFailure(error);
  }
}

async function curiosidades(body, env, signal) {
  const missing = missingKey(env);
  if (missing) return missing;

  try {
    const result = await generateCuriosidade({
      asked: cleanList(body.asked ?? body.seen, 20, 160),
      profile: body.profile,
      apiKey: env.GEMINI_API_KEY,
      signal,
      env,
    });
    return json(result);
  } catch (error) {
    if (error instanceof CuriosidadesError) return aiFailure('Curiosidades', error);
    return serverFailure(error);
  }
}

async function dialogos(body, env, signal) {
  const missing = missingKey(env);
  if (missing) return missing;

  try {
    const rawSubject = body.subject;
    const subject = Object.hasOwn(DIALOG_SUBJECTS, rawSubject) ? rawSubject : 'english';
    const level = resolveLevel(clean(body.level, 20) || 'B1', body.profile);

    const result = await generateDialogo({
      subject,
      level,
      used: cleanList(body.used ?? body.asked, 12, 80),
      profile: body.profile,
      apiKey: env.GEMINI_API_KEY,
      signal,
      env,
    });
    return json(result);
  } catch (error) {
    if (error instanceof DialogosError) return aiFailure('Dialogos', error);
    return serverFailure(error);
  }
}

async function placementStart(body, env, signal) {
  const missing = missingKey(env);
  if (missing) return missing;

  if (!Object.hasOwn(SUBJECTS, body.subject)) {
    return json({ error: 'valid subject required' }, 400);
  }

  try {
    const result = await generatePlacement({
      subject: body.subject,
      profile: body.profile,
      apiKey: env.GEMINI_API_KEY,
      signal,
      env,
    });
    return json(result);
  } catch (error) {
    if (error instanceof PlacementError) {
      console.error('Placement start error:', error.message);
      return json({ error: error.message }, error.status);
    }
    return aiFailure('Placement start', error);
  }
}

async function placementFinish(body, env) {
  try {
    const result = await gradePlacement({
      token: body.token,
      answers: body.answers,
      env,
    });
    return json(result);
  } catch (error) {
    if (error instanceof PlacementError) {
      return json({ error: error.message }, error.status);
    }
    return serverFailure(error);
  }
}

export async function handleApi(request, env) {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  let body;
  try {
    body = await readJson(request);
  } catch (error) {
    if (error instanceof HttpError) return json({ error: error.message }, error.status);
    throw error;
  }

  switch (new URL(request.url).pathname) {
    case '/api/chat':
      return chat(body, env, request.signal);
    case '/api/quiz':
      return quiz(body, env, request.signal);
    case '/api/materias':
      return materias(body, env, request.signal);
    case '/api/curiosidades':
      return curiosidades(body, env, request.signal);
    case '/api/dialogos':
      return dialogos(body, env, request.signal);
    case '/api/placement/start':
      return placementStart(body, env, request.signal);
    case '/api/placement/finish':
      return placementFinish(body, env);
    default:
      return json({ error: 'Not found' }, 404);
  }
}
