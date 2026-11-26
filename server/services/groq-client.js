const ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';

// Modelos gratuitos atuais do Groq. Sobrescreva com GROQ_MODELS se necessário.
export const GROQ_MODELS = ['openai/gpt-oss-120b', 'openai/gpt-oss-20b'];

const RETRYABLE_STATUS = new Set([429, 500, 502, 503, 504]);
const RETRY_DELAY_MS = 400;
const REQUEST_TIMEOUT_MS = 12000;

const TYPE_MAP = {
  STRING: 'string',
  INTEGER: 'integer',
  NUMBER: 'number',
  BOOLEAN: 'boolean',
  ARRAY: 'array',
  OBJECT: 'object',
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function toError(message, status) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function mapType(type) {
  if (typeof type !== 'string') return type;
  return TYPE_MAP[type] ?? type.toLowerCase();
}

function toJsonSchema(node) {
  if (!node || typeof node !== 'object') return node;

  const converted = {};
  for (const [key, value] of Object.entries(node)) {
    if (key === 'type') {
      converted[key] = Array.isArray(value) ? value.map(mapType) : mapType(value);
    } else if (key === 'properties' && value && typeof value === 'object') {
      converted[key] = Object.fromEntries(
        Object.entries(value).map(([name, schema]) => [name, toJsonSchema(schema)])
      );
    } else if (key === 'items') {
      converted[key] = toJsonSchema(value);
    } else {
      converted[key] = value;
    }
  }
  return converted;
}

function partsToText(parts) {
  if (!Array.isArray(parts)) return '';
  return parts
    .map((part) => (typeof part?.text === 'string' ? part.text : ''))
    .join('\n')
    .trim();
}

function toGroqMessages({ systemInstruction, contents }) {
  const messages = [];
  const system = partsToText(systemInstruction?.parts);
  if (system) messages.push({ role: 'system', content: system });

  for (const item of contents ?? []) {
    const content = partsToText(item?.parts);
    if (!content) continue;

    const role = item.role === 'model' ? 'assistant' : item.role === 'system' ? 'system' : 'user';
    messages.push({ role, content });
  }

  return messages;
}

function toResponseFormat(responseSchema) {
  if (!responseSchema) return undefined;
  return {
    type: 'json_schema',
    json_schema: {
      name: 'lumio_response',
      strict: false,
      schema: toJsonSchema(responseSchema),
    },
  };
}

function configuredModels() {
  const configured = process.env.GROQ_MODELS
    ?.split(',')
    .map((model) => model.trim())
    .filter(Boolean);
  return configured?.length ? configured : GROQ_MODELS;
}

export function extractGroqText(data) {
  const content = data?.choices?.[0]?.message?.content;
  return typeof content === 'string' ? content : '';
}

async function callGroq({ model, apiKey, systemInstruction, contents, generationConfig, signal }) {
  const timeoutSignal = AbortSignal.timeout(REQUEST_TIMEOUT_MS);
  const combined = signal ? AbortSignal.any([signal, timeoutSignal]) : timeoutSignal;

  const body = {
    model,
    messages: toGroqMessages({ systemInstruction, contents }),
    max_completion_tokens: generationConfig?.maxOutputTokens ?? 1024,
    temperature: generationConfig?.temperature ?? 0.8,
    top_p: generationConfig?.topP ?? 0.95,
  };

  const responseFormat = toResponseFormat(generationConfig?.responseSchema);
  if (responseFormat) body.response_format = responseFormat;

  // gpt-oss usa reasoning tokens; "low" evita consumir o limite de saída.
  if (model.startsWith('openai/gpt-oss-')) body.reasoning_effort = 'low';

  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    signal: combined,
    body: JSON.stringify(body),
  });

  const data = await response.json().catch(() => ({}));
  return { response, data, text: extractGroqText(data) };
}

/**
 * Chama o Groq com fallback entre modelos.
 * Lança um Error com `.status` quando todos falham.
 */
export async function generateWithGroq({ apiKey, systemInstruction, contents, generationConfig, signal, parse }) {
  if (!apiKey) throw toError('GROQ_API_KEY not set', 500);

  const models = configuredModels();
  let lastError = toError('AI request failed', 502);

  for (let index = 0; index < models.length; index += 1) {
    const model = models[index];
    try {
      const { response, data, text } = await callGroq({
        model,
        apiKey,
        systemInstruction,
        contents,
        generationConfig,
        signal,
      });

      if (response.ok) {
        if (!text) {
          lastError = toError('Empty AI response', 502);
          console.error(`[groq] ${model} -> resposta vazia, tentando próximo modelo`);
          if (index < models.length - 1) await sleep(RETRY_DELAY_MS);
          continue;
        }

        if (parse) {
          try {
            return parse(text);
          } catch (parseError) {
            lastError = parseError;
            console.error(`[groq] ${model} -> conteúdo inválido, tentando próximo modelo`);
            if (index < models.length - 1) await sleep(RETRY_DELAY_MS);
            continue;
          }
        }

        return text;
      }

      const message = data?.error?.message ?? data?.message ?? 'AI request failed';
      lastError = toError(message, response.status);

      if (!RETRYABLE_STATUS.has(response.status)) {
        throw lastError;
      }
      console.error(`[groq] ${model} -> ${response.status}, tentando próximo modelo`);
    } catch (error) {
      if (signal?.aborted) throw error;
      lastError = error;
      console.error(`[groq] ${model} falhou: ${error.message}`);
    }

    if (index < models.length - 1) await sleep(RETRY_DELAY_MS);
  }

  throw lastError;
}
