import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import chatRouter from './routes/chat.js';
import quizRouter from './routes/quiz.js';
import materiasRouter from './routes/materias.js';
import curiosidadesRouter from './routes/curiosidades.js';
import dialogosRouter from './routes/dialogos.js';
import placementRouter from './routes/placement.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, '..', 'frontend', 'dist');
const indexFile = path.join(distDir, 'index.html');

if (!existsSync(indexFile)) {
  console.error('Build React não encontrado. Rode `npm run frontend:build` antes de `npm start`.');
  process.exit(1);
}

const PORT = process.env.PORT || 3000;

const app = express();

app.use(express.json({ limit: '100kb' }));
app.use(express.static(distDir));
app.use('/api/chat', chatRouter);
app.use('/api/quiz', quizRouter);
app.use('/api/materias', materiasRouter);
app.use('/api/curiosidades', curiosidadesRouter);
app.use('/api/dialogos', dialogosRouter);
app.use('/api/placement', placementRouter);

app.get('/board/:id', (_req, res) => {
  res.sendFile(indexFile);
});

app.listen(PORT, () => {
  console.log(`Lumio running at http://localhost:${PORT}`);
  console.log(
    `AI providers: gemini=${Boolean(process.env.GEMINI_API_KEY)} groq=${Boolean(process.env.GROQ_API_KEY)}`
  );
});
