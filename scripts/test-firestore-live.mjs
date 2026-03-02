// Standalone test: parse SA from .env.local and make a live Firestore call
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '../');

dotenv.config({ path: join(rootDir, '.env') });
dotenv.config({ path: join(rootDir, '.env.local') });

let raw = process.env.FIREBASE_SERVICE_ACCOUNT?.trim();
if (!raw) { console.error('FIREBASE_SERVICE_ACCOUNT not set'); process.exit(1); }

if (raw.startsWith('"') && raw.endsWith('"')) raw = raw.slice(1, -1);

// Char-by-char repair
let inString = false, wasBackslash = false, fixed = '';
for (const ch of raw) {
  if (wasBackslash) { fixed += ch; wasBackslash = false; }
  else if (ch === '\\' && inString) { fixed += ch; wasBackslash = true; }
  else if (ch === '"') { inString = !inString; fixed += ch; }
  else if (inString && ch === '\n') { fixed += '\\n'; }
  else if (inString && ch === '\r') {}
  else { fixed += ch; }
}

const sa = JSON.parse(fixed);
console.log('✅ SA parsed. project_id:', sa.project_id, '| email:', sa.client_email);

initializeApp({ credential: cert(sa) });
const db = getFirestore();

console.log('Making test Firestore query...');
try {
  const snap = await db.collection('nuxchainAirdropRegistrations').limit(1).get();
  console.log('✅ Firestore query SUCCESS. docs found:', snap.size);
  process.exit(0);
} catch(e) {
  console.error('❌ Firestore query FAILED:', e.code, e.message?.slice(0, 200));
  process.exit(1);
}
