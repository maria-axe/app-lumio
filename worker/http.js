export class HttpError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
  }
}

const MAX_BODY_BYTES = 100 * 1024;

export function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

export async function readJson(request) {
  const declared = Number(request.headers.get('content-length') ?? 0);
  if (Number.isFinite(declared) && declared > MAX_BODY_BYTES) {
    throw new HttpError('Payload too large', 413);
  }

  const text = await request.text();
  if (text.length > MAX_BODY_BYTES) {
    throw new HttpError('Payload too large', 413);
  }

  if (!text.trim()) return {};

  try {
    const data = JSON.parse(text);
    return data && typeof data === 'object' && !Array.isArray(data) ? data : {};
  } catch {
    throw new HttpError('Invalid JSON', 400);
  }
}
