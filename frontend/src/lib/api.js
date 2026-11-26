async function post(path, body, fallbackMessage, signal) {
  const response = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || fallbackMessage);
  return data;
}

export async function sendChat({ messages, level, subject = 'english', profile, signal }) {
  const data = await post(
    '/api/chat',
    { messages, level, subject, profile },
    'Erro no servidor',
    signal
  );
  return data.reply;
}

export async function sendQuiz({ level, subject = 'english', asked = [], profile, signal }) {
  return post(
    '/api/quiz',
    { level, subject, asked, profile },
    'Erro ao gerar desafio',
    signal
  );
}

export async function sendMaterias({ subject, asked = [], profile, signal }) {
  return post(
    '/api/materias',
    { subject, asked, profile },
    'Erro ao gerar exercício',
    signal
  );
}

export async function sendCuriosidade({ asked = [], profile, signal }) {
  return post(
    '/api/curiosidades',
    { asked, profile },
    'Erro ao gerar curiosidade',
    signal
  );
}

export async function sendDialogo({ subject, level, used = [], profile, signal }) {
  return post(
    '/api/dialogos',
    { subject, level, used, profile },
    'Erro ao gerar diálogo',
    signal
  );
}

export async function startPlacement({ subject, profile, signal }) {
  return post(
    '/api/placement/start',
    { subject, profile },
    'Erro ao gerar teste de nível',
    signal
  );
}

export async function finishPlacement({ token, answers, signal }) {
  return post(
    '/api/placement/finish',
    { token, answers },
    'Erro ao calcular nível',
    signal
  );
}
