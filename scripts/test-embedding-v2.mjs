/**
 * Test: Gemini Embedding 2 Migration
 * Verifica que el nuevo modelo funciona correctamente antes de subir a producción.
 *
 * Uso:
 *   node scripts/test-embedding-v2.mjs
 *
 * Requiere:
 *   GEMINI_API_KEY en .env o variable de entorno
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ─── Cargar .env manual (sin dotenv dependency) ───────────────────────────────
function loadEnv() {
  try {
    const envPath = resolve(__dirname, '../.env');
    const raw = readFileSync(envPath, 'utf-8');
    for (const line of raw.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq === -1) continue;
      const key = trimmed.substring(0, eq).trim();
      const val = trimmed.substring(eq + 1).trim().replace(/^["']|["']$/g, '');
      if (!process.env[key]) process.env[key] = val;
    }
  } catch {
    // .env no existe — usar variables de sistema directamente
  }
}
loadEnv();

// ─── Config ───────────────────────────────────────────────────────────────────
const API_KEY           = process.env.GEMINI_API_KEY;
const EMBEDDING_MODEL   = process.env.GEMINI_EMBEDDING_MODEL   || 'gemini-embedding-2-preview';
const EXPECTED_DIM      = parseInt(process.env.GEMINI_EMBEDDING_DIMENSIONS || '3072', 10);

// ─── Helpers ─────────────────────────────────────────────────────────────────
function cosineSimilarity(a, b) {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na  += a[i] * a[i];
    nb  += b[i] * b[i];
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

async function generateEmbedding(text, label = '') {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${EMBEDDING_MODEL}:embedContent?key=${API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: { parts: [{ text }] },
        taskType: 'RETRIEVAL_QUERY',
        outputDimensionality: EXPECTED_DIM
      })
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: { message: res.statusText } }));
    throw new Error(`API error ${res.status}: ${err?.error?.message || res.statusText}`);
  }

  const data = await res.json();
  const values = data?.embedding?.values;
  if (!values || !Array.isArray(values)) {
    throw new Error(`Respuesta inválida: ${JSON.stringify(data)}`);
  }

  if (label) process.stdout.write(`  📐 "${label}" → ${values.length}D\n`);
  return values;
}

function pass(msg) { console.log(`  ✅ ${msg}`); }
function fail(msg) { console.log(`  ❌ ${msg}`); }
function section(title) {
  console.log('\n' + '─'.repeat(56));
  console.log(`  ${title}`);
  console.log('─'.repeat(56));
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n╔══════════════════════════════════════════════════════╗');
  console.log('║   TEST: Gemini Embedding 2 — Nuxbee AI KB Search     ║');
  console.log('╚══════════════════════════════════════════════════════╝');
  console.log(`  Modelo:      ${EMBEDDING_MODEL}`);
  console.log(`  Dimensiones: ${EXPECTED_DIM}D`);
  console.log(`  API Key:     ${API_KEY ? `${API_KEY.substring(0, 8)}...` : '❌ FALTA'}`);

  let passed = 0;
  let failed = 0;

  // ── TEST 1: API Key presente ────────────────────────────────────────────────
  section('TEST 1: Configuración');
  if (!API_KEY) {
    fail('GEMINI_API_KEY no está configurada. Agrega en .env');
    console.log('\n❌ ABORTANDO — sin API key no se puede continuar.\n');
    process.exit(1);
  }
  pass('GEMINI_API_KEY presente');
  passed++;

  // ── TEST 2: Generar embedding básico ───────────────────────────────────────
  section('TEST 2: Generación de Embedding');
  let testEmbedding;
  try {
    testEmbedding = await generateEmbedding('staking rewards APY nuxchain', 'test query');
    pass(`Embedding generado correctamente`);
    passed++;
  } catch (e) {
    fail(`No se pudo generar embedding: ${e.message}`);
    failed++;
    console.log('\n❌ Tests abortados — el modelo no está disponible.\n');
    console.log('  Sugerencia: ejecuta rollback → .\\scripts\\rollback-embedding.ps1 -ToV1\n');
    process.exit(1);
  }

  // ── TEST 3: Verificar dimensiones 3072D ────────────────────────────────────
  section('TEST 3: Dimensiones del Vector');
  if (testEmbedding.length === EXPECTED_DIM) {
    pass(`Dimensiones correctas: ${testEmbedding.length}D (esperadas: ${EXPECTED_DIM}D)`);
    passed++;
  } else if (testEmbedding.length === 1536) {
    fail(`Dimensiones 1536D → aún usando gemini-embedding-001. Revisa GEMINI_EMBEDDING_MODEL en .env`);
    failed++;
  } else {
    fail(`Dimensiones inesperadas: ${testEmbedding.length}D (esperadas: ${EXPECTED_DIM}D)`);
    failed++;
  }

  // ── TEST 4: Similitud semántica (queries relacionadas) ─────────────────────
  section('TEST 4: Similitud Semántica (Español + Inglés)');
  try {
    const [e1, e2, e3] = await Promise.all([
      generateEmbedding('¿Cuál es el APY de staking?',       'staking APY (ES)'),
      generateEmbedding('What is the staking yield?',         'staking yield (EN)'),
      generateEmbedding('¿Cuándo llega el próximo airdrop?', 'airdrop (ES)')
    ]);

    const simRelated   = cosineSimilarity(e1, e2);
    const simUnrelated = cosineSimilarity(e1, e3);

    console.log(`  Similitud staking-ES vs staking-EN:  ${simRelated.toFixed(4)}`);
    console.log(`  Similitud staking-ES vs airdrop-ES:  ${simUnrelated.toFixed(4)}`);

    if (simRelated > simUnrelated) {
      pass(`Búsqueda semántica funciona: queries relacionadas más similares que no relacionadas`);
      passed++;
    } else {
      fail(`Similitud semántica inesperada — el modelo puede no estar funcionando bien`);
      failed++;
    }
  } catch (e) {
    fail(`Error en test semántico: ${e.message}`);
    failed++;
  }

  // ── TEST 5: Matryoshka — verificar 768D (truncado) ────────────────────────
  section('TEST 5: Matryoshka Representation Learning (768D)');
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${EMBEDDING_MODEL}:embedContent?key=${API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: { parts: [{ text: 'nuxchain staking' }] },
          taskType: 'RETRIEVAL_QUERY',
          outputDimensionality: 768
        })
      }
    );
    const data = await res.json();
    const dim  = data?.embedding?.values?.length;
    if (dim === 768) {
      pass(`MRL funciona: 768D obtenidos (útil para reducir costos si es necesario)`);
      passed++;
    } else {
      fail(`MRL inesperado: obtuvo ${dim ?? 'null'}D en lugar de 768D`);
      failed++;
    }
  } catch (e) {
    fail(`Error en test MRL: ${e.message}`);
    failed++;
  }

  // ── Resumen ────────────────────────────────────────────────────────────────
  const total  = passed + failed;
  const status = failed === 0 ? '🚀 LISTO PARA PRODUCCIÓN' : '⚠️  HAY FALLOS';
  const color  = failed === 0 ? '\x1b[32m' : '\x1b[33m';
  const reset  = '\x1b[0m';

  console.log('\n╔══════════════════════════════════════════════════════╗');
  console.log(`║  ${color}${status.padEnd(52)}${reset}║`);
  console.log(`║  Tests: ${String(passed).padStart(2)} pasados / ${String(failed).padStart(2)} fallados / ${String(total).padStart(2)} total         ║`);
  console.log('╚══════════════════════════════════════════════════════╝');

  if (failed > 0) {
    console.log('\n  Para hacer rollback:');
    console.log('  .\\scripts\\rollback-embedding.ps1 -ToV1\n');
  } else {
    console.log('\n  Para subir a Vercel:');
    console.log('  .\\scripts\\rollback-embedding.ps1 -ToV2 -Vercel\n');
  }

  process.exit(failed > 0 ? 1 : 0);
}

main().catch(err => {
  console.error('\n❌ Error inesperado:', err.message);
  process.exit(1);
});
