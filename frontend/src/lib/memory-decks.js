import { LEVEL_ORDER } from './constants.js';

export const MEMORY_PAIR_COUNTS = {
  A1: 6,
  A2: 6,
  B1: 8,
  B2: 8,
  C1: 8,
  C2: 8,
};

const PAIRS = {
  english: {
    A1: [
      { term: 'tree', translation: 'árvore' },
      { term: 'book', translation: 'livro' },
      { term: 'water', translation: 'água' },
      { term: 'house', translation: 'casa' },
      { term: 'dog', translation: 'cachorro' },
      { term: 'cat', translation: 'gato' },
      { term: 'star', translation: 'estrela' },
      { term: 'fish', translation: 'peixe' },
      { term: 'apple', translation: 'maçã' },
      { term: 'milk', translation: 'leite' },
      { term: 'sun', translation: 'sol' },
      { term: 'moon', translation: 'lua' },
    ],
    A2: [
      { term: 'river', translation: 'rio' },
      { term: 'window', translation: 'janela' },
      { term: 'bread', translation: 'pão' },
      { term: 'friend', translation: 'amigo' },
      { term: 'yellow', translation: 'amarelo' },
      { term: 'shoe', translation: 'sapato' },
      { term: 'clock', translation: 'relógio' },
      { term: 'key', translation: 'chave' },
      { term: 'chair', translation: 'cadeira' },
      { term: 'cup', translation: 'xícara' },
      { term: 'ball', translation: 'bola' },
      { term: 'bag', translation: 'bolsa' },
    ],
    B1: [
      { term: 'forest', translation: 'floresta' },
      { term: 'journey', translation: 'viagem' },
      { term: 'library', translation: 'biblioteca' },
      { term: 'bridge', translation: 'ponte' },
      { term: 'weather', translation: 'clima' },
      { term: 'bicycle', translation: 'bicicleta' },
      { term: 'mountain', translation: 'montanha' },
      { term: 'market', translation: 'mercado' },
      { term: 'letter', translation: 'carta' },
    ],
    B2: [
      { term: 'advice', translation: 'conselho' },
      { term: 'effort', translation: 'esforço' },
      { term: 'opportunity', translation: 'oportunidade' },
      { term: 'challenge', translation: 'desafio' },
      { term: 'memory', translation: 'memória' },
      { term: 'peace', translation: 'paz' },
      { term: 'patience', translation: 'paciência' },
    ],
    C1: [
      { term: 'subtle', translation: 'sutil' },
      { term: 'inevitable', translation: 'inevitável' },
      { term: 'thorough', translation: 'minucioso' },
      { term: 'resilience', translation: 'resiliência' },
      { term: 'ambiguity', translation: 'ambiguidade' },
      { term: 'precise', translation: 'exato' },
      { term: 'fragile', translation: 'quebradiço' },
      { term: 'clarity', translation: 'clareza' },
    ],
    C2: [
      { term: 'perspective', translation: 'perspectiva' },
      { term: 'sophisticated', translation: 'sofisticado' },
      { term: 'nuance', translation: 'matiz' },
      { term: 'paradox', translation: 'paradoxo' },
      { term: 'concise', translation: 'conciso' },
      { term: 'eloquent', translation: 'eloquente' },
      { term: 'profound', translation: 'profundo' },
      { term: 'lucid', translation: 'claro' },
      { term: 'vivid', translation: 'vívido' },
      { term: 'dense', translation: 'denso' },
      { term: 'hollow', translation: 'oco' },
      { term: 'eternal', translation: 'eterno' },
      { term: 'delicate', translation: 'delicado' },
      { term: 'steady', translation: 'estável' },
      { term: 'gentle', translation: 'suave' },
      { term: 'random', translation: 'aleatório' },
    ],
  },
  spanish: {
    A1: [
      { term: 'árbol', translation: 'árvore' },
      { term: 'libro', translation: 'livro' },
      { term: 'agua', translation: 'água' },
      { term: 'perro', translation: 'cachorro' },
      { term: 'pan', translation: 'pão' },
      { term: 'mano', translation: 'mão' },
      { term: 'estrella', translation: 'estrela' },
      { term: 'pez', translation: 'peixe' },
      { term: 'manzana', translation: 'maçã' },
      { term: 'leche', translation: 'leite' },
      { term: 'luna', translation: 'lua' },
      { term: 'día', translation: 'dia' },
      { term: 'taza', translation: 'xícara' },
    ],
    A2: [
      { term: 'río', translation: 'rio' },
      { term: 'ventana', translation: 'janela' },
      { term: 'jardín', translation: 'jardim' },
      { term: 'ciudad', translation: 'cidade' },
      { term: 'coche', translation: 'carro' },
      { term: 'zapato', translation: 'sapato' },
      { term: 'reloj', translation: 'relógio' },
      { term: 'llave', translation: 'chave' },
      { term: 'silla', translation: 'cadeira' },
      { term: 'pelota', translation: 'bola' },
      { term: 'maleta', translation: 'mala' },
      { term: 'lámpara', translation: 'lâmpada' },
    ],
    B1: [
      { term: 'bosque', translation: 'floresta' },
      { term: 'viaje', translation: 'viagem' },
      { term: 'puente', translation: 'ponte' },
      { term: 'desayuno', translation: 'café da manhã' },
      { term: 'vecino', translation: 'vizinho' },
      { term: 'bici', translation: 'bicicleta' },
      { term: 'montaña', translation: 'montanha' },
      { term: 'mercado', translation: 'feira' },
      { term: 'carta', translation: 'mensagem escrita' },
    ],
    B2: [
      { term: 'consejo', translation: 'conselho' },
      { term: 'esfuerzo', translation: 'esforço' },
      { term: 'oportunidad', translation: 'oportunidade' },
      { term: 'desafío', translation: 'desafio' },
      { term: 'recuerdo', translation: 'lembrança' },
      { term: 'paz', translation: 'tranquilidade' },
      { term: 'paciencia', translation: 'paciência' },
    ],
    C1: [
      { term: 'sutil', translation: 'delicado' },
      { term: 'inevitable', translation: 'inevitável' },
      { term: 'minucioso', translation: 'detalhista' },
      { term: 'resiliencia', translation: 'resiliência' },
      { term: 'ambigüedad', translation: 'ambiguidade' },
      { term: 'preciso', translation: 'exato' },
      { term: 'frágil', translation: 'quebradiço' },
      { term: 'claridad', translation: 'clareza' },
    ],
    C2: [
      { term: 'perspectiva', translation: 'ponto de vista' },
      { term: 'sofisticado', translation: 'elaborado' },
      { term: 'matiz', translation: 'gradação' },
      { term: 'paradoja', translation: 'paradoxo' },
      { term: 'conciso', translation: 'breve' },
      { term: 'elocuente', translation: 'eloquente' },
      { term: 'profundo', translation: 'fundo' },
      { term: 'lúcido', translation: 'claro' },
      { term: 'vívido', translation: 'intenso' },
      { term: 'denso', translation: 'compacto' },
      { term: 'hueco', translation: 'oco' },
      { term: 'eterno', translation: 'perdurável' },
      { term: 'delgado', translation: 'fino' },
      { term: 'firme', translation: 'estável' },
      { term: 'suave', translation: 'macio' },
      { term: 'aleatorio', translation: 'imprevisto' },
    ],
  },
  french: {
    A1: [
      { term: 'arbre', translation: 'árvore' },
      { term: 'livre', translation: 'livro' },
      { term: 'eau', translation: 'água' },
      { term: 'chien', translation: 'cachorro' },
      { term: 'pain', translation: 'pão' },
      { term: 'chat', translation: 'gato' },
      { term: 'étoile', translation: 'estrela' },
      { term: 'poisson', translation: 'peixe' },
      { term: 'pomme', translation: 'maçã' },
      { term: 'lait', translation: 'leite' },
      { term: 'soleil', translation: 'sol' },
      { term: 'lune', translation: 'lua' },
    ],
    A2: [
      { term: 'rivière', translation: 'rio' },
      { term: 'fenêtre', translation: 'janela' },
      { term: 'jardin', translation: 'jardim' },
      { term: 'ville', translation: 'cidade' },
      { term: 'ami', translation: 'amigo' },
      { term: 'chaussure', translation: 'sapato' },
      { term: 'horloge', translation: 'relógio' },
      { term: 'clé', translation: 'chave' },
      { term: 'chaise', translation: 'cadeira' },
      { term: 'tasse', translation: 'xícara' },
      { term: 'ballon', translation: 'bola' },
      { term: 'sac', translation: 'bolsa' },
    ],
    B1: [
      { term: 'forêt', translation: 'floresta' },
      { term: 'voyage', translation: 'viagem' },
      { term: 'pont', translation: 'ponte' },
      { term: 'petit-déjeuner', translation: 'café da manhã' },
      { term: 'voisin', translation: 'vizinho' },
      { term: 'vélo', translation: 'bicicleta' },
      { term: 'montagne', translation: 'montanha' },
      { term: 'marché', translation: 'mercado' },
      { term: 'lettre', translation: 'carta' },
    ],
    B2: [
      { term: 'conseil', translation: 'conselho' },
      { term: 'effort', translation: 'esforço' },
      { term: 'opportunité', translation: 'oportunidade' },
      { term: 'défi', translation: 'desafio' },
      { term: 'souvenir', translation: 'lembrança' },
      { term: 'paix', translation: 'tranquilidade' },
      { term: 'patience', translation: 'paciência' },
    ],
    C1: [
      { term: 'subtil', translation: 'sutil' },
      { term: 'inévitable', translation: 'inevitável' },
      { term: 'minutieux', translation: 'minucioso' },
      { term: 'résilience', translation: 'resiliência' },
      { term: 'ambiguïté', translation: 'ambiguidade' },
      { term: 'précis', translation: 'exato' },
      { term: 'fragile', translation: 'quebradiço' },
      { term: 'clarté', translation: 'clareza' },
    ],
    C2: [
      { term: 'perspective', translation: 'perspectiva' },
      { term: 'sophistiqué', translation: 'sofisticado' },
      { term: 'nuance', translation: 'matiz' },
      { term: 'paradoxe', translation: 'paradoxo' },
      { term: 'concis', translation: 'conciso' },
      { term: 'éloquent', translation: 'eloquente' },
      { term: 'profond', translation: 'fundo' },
      { term: 'lucide', translation: 'clair' },
      { term: 'vif', translation: 'intense' },
      { term: 'dense', translation: 'compact' },
      { term: 'creux', translation: 'oco' },
      { term: 'éternel', translation: 'durável' },
      { term: 'fin', translation: 'fino' },
      { term: 'ferme', translation: 'estável' },
      { term: 'doux', translation: 'macio' },
      { term: 'aléatoire', translation: 'imprevisto' },
    ],
  },
};

function normalize(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase();
}

function memoryPairId(subject, pair) {
  return `${subject}:${normalize(pair.term)}`;
}

function shuffled(items) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function memoryTiers(level) {
  const index = LEVEL_ORDER.indexOf(String(level ?? '').toUpperCase());
  return LEVEL_ORDER.slice(index < 0 ? 0 : index);
}

function collectPairs(subject, level, count, seenPairIds) {
  const picked = [];
  const usedIds = new Set();
  const usedTerms = new Set();
  const usedTranslations = new Set();

  for (const tier of memoryTiers(level)) {
    const pool = shuffled(PAIRS[subject]?.[tier] ?? []);
    for (const pair of pool) {
      if (picked.length >= count) break;

      const id = memoryPairId(subject, pair);
      const termKey = normalize(pair.term);
      const translationKey = normalize(pair.translation);
      if (seenPairIds.has(id) || usedIds.has(id)) continue;
      if (usedTerms.has(termKey) || usedTranslations.has(translationKey)) continue;

      usedIds.add(id);
      usedTerms.add(termKey);
      usedTranslations.add(translationKey);
      picked.push({ ...pair, pairId: id });
    }
    if (picked.length >= count) break;
  }

  return picked;
}

export function buildMemoryRound(subject, level, seenPairIds = []) {
  const count = MEMORY_PAIR_COUNTS[String(level ?? '').toUpperCase()] ?? MEMORY_PAIR_COUNTS.A1;
  const seen = new Set(seenPairIds.map((id) => String(id)));

  let picked = collectPairs(subject, level, count, seen);
  let rotated = false;

  if (picked.length < count) {
    picked = collectPairs(subject, level, count, new Set());
    rotated = true;
  }

  const selected = [...new Set(picked.map((pair) => pair.pairId))];
  const nextSeen = rotated ? selected : [...new Set([...seen, ...selected])];

  const cards = picked.flatMap((pair) => [
    {
      id: `${pair.pairId}-term`,
      pairId: pair.pairId,
      side: 'term',
      text: pair.term,
      matchText: pair.translation,
    },
    {
      id: `${pair.pairId}-translation`,
      pairId: pair.pairId,
      side: 'translation',
      text: pair.translation,
      matchText: pair.term,
    },
  ]);

  return { deck: shuffled(cards), seenPairIds: nextSeen, rotated };
}

export function memoryBestKey(subject, level) {
  return `${subject}:${level}`;
}
