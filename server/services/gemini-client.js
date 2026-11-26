import { generateWithGroq } from './groq-client.js';

const ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models';

// Ordem de preferência. Se um modelo responder 503/429/500 (indisponível ou
// sobrecarga) ou retornar vazio, tenta o próximo.
export const MODEL_FALLBACKS = [
  'gemini-3.5-flash-lite',
  'gemini-3.5-flash',
  'gemini-3.6-flash',
  'gemini-flash-lite-latest',
  'gemini-flash-latest',
];

// Erros de infraestrutura/sobrecarga que valem uma nova tentativa com outro modelo.
const RETRYABLE_STATUS = new Set([429, 500, 502, 503, 504]);
const RETRY_DELAY_MS = 400;
// Tempo máximo por tentativa. Se um modelo "travar" (sem responder), avançamos
// para o próximo em vez de esperar indefinidamente.
const REQUEST_TIMEOUT_MS = 12000;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Quando o Gemini estoura a cota diária, evita repetir 5 chamadas 429 seguidas.
// O cooldown é em memória; reinicia com o processo.
let geminiCooldownUntil = 0;

function cooldownMsFromMessage(message) {
  const match = /retry in (?:(\d+)h)?\s*(?:(\d+)m)?\s*(?:(\d+(?:\.\d+)?)s)?/i.exec(message ?? '');
  if (!match) return 30 * 60 * 1000;

  const hours = Number(match[1] ?? 0);
  const minutes = Number(match[2] ?? 0);
  const seconds = Number(match[3] ?? 0);
  const ms = (hours * 3600 + minutes * 60 + seconds) * 1000;

  return Math.min(24 * 3600 * 1000, Math.max(5 * 60 * 1000, ms));
}

function enterGeminiCooldown(message) {
  geminiCooldownUntil = Date.now() + cooldownMsFromMessage(message);
  const minutes = Math.ceil((geminiCooldownUntil - Date.now()) / 60000);
  console.error(`[ai] Gemini em cooldown por ~${minutes} min; usando Groq`);
}

export function extractText(data) {
  return data?.candidates?.[0]?.content?.parts?.map((part) => part.text).join('') ?? '';
}

function toError(message, status) {
  const error = new Error(message);
  error.status = status;
  return error;
}

async function callModel({ model, apiKey, systemInstruction, contents, generationConfig, signal }) {
  const timeoutSignal = AbortSignal.timeout(REQUEST_TIMEOUT_MS);
  const combined = signal ? AbortSignal.any([signal, timeoutSignal]) : timeoutSignal;

  const response = await fetch(`${ENDPOINT}/${model}:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    signal: combined,
    body: JSON.stringify({ systemInstruction, contents, generationConfig }),
  });

  const data = await response.json().catch(() => ({}));
  return { response, data };
}

/**
 * Chama generateContent com fallback entre modelos.
 * Lança um Error com `.status` quando todos falham.
 */
export async function generateContent({ apiKey, systemInstruction, contents, generationConfig, signal, parse }) {
  const groqKey = process.env.GROQ_API_KEY;
  if (!apiKey && !groqKey) {
    throw toError('No AI API key configured. Add GEMINI_API_KEY or GROQ_API_KEY to .env', 500);
  }

  const useGemini = Boolean(apiKey) && Date.now() >= geminiCooldownUntil;
  const models = useGemini ? MODEL_FALLBACKS : [];
  if (apiKey && !useGemini) console.error('[ai] Gemini em cooldown; usando Groq');
  let lastError = toError('AI request failed', 502);

  for (let index = 0; index < models.length; index += 1) {
    const model = models[index];
    try {
      const { response, data } = await callModel({
        model,
        apiKey,
        systemInstruction,
        contents,
        generationConfig,
        signal,
      });

      if (response.ok) {
        const text = extractText(data);
        if (!text) {
          lastError = toError('Empty AI response', 502);
          console.error(`[gemini] ${model} -> resposta vazia, tentando próximo modelo`);
          if (index < models.length - 1) await sleep(RETRY_DELAY_MS);
          continue;
        }

        if (parse) {
          try {
            return parse(text);
          } catch (parseError) {
            lastError = parseError;
            console.error(`[gemini] ${model} -> conteúdo inválido, tentando próximo modelo`);
            if (index < models.length - 1) await sleep(RETRY_DELAY_MS);
            continue;
          }
        }

        return text;
      }

      const message = data?.error?.message ?? 'AI request failed';
      lastError = toError(message, response.status);

      if (response.status === 429 && groqKey) {
        enterGeminiCooldown(message);
        break;
      }

      if (!RETRYABLE_STATUS.has(response.status)) {
        throw lastError;
      }
      console.error(`[gemini] ${model} -> ${response.status}, tentando próximo modelo`);
    } catch (error) {
      // Abort do próprio cliente (cancelou a requisição): não faz sentido tentar outro modelo.
      if (signal?.aborted) throw error;
      // Timeout interno ou falha de rede: tenta o próximo modelo.
      lastError = error;
      console.error(`[gemini] ${model} falhou: ${error.message}`);
    }

    if (index < models.length - 1) await sleep(RETRY_DELAY_MS);
  }

  if (signal?.aborted) throw signal.reason ?? new Error('Aborted');

  if (groqKey) {
    if (apiKey) console.error('[ai] Gemini falhou; tentando Groq');
    try {
      return await generateWithGroq({
        apiKey: groqKey,
        systemInstruction,
        contents,
        generationConfig,
        signal,
        parse,
      });
    } catch (error) {
      if (signal?.aborted) throw error;
      lastError = error;
    }
  }

  throw lastError;
}
