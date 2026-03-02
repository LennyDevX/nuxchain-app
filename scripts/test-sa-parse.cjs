// Test FIREBASE_SERVICE_ACCOUNT parsing exactly as the server does
const fs = require('fs');
const dotenv = require('dotenv');

const content = fs.readFileSync('.env.local', 'utf8');
const result = dotenv.parse(content);
const sa = result['FIREBASE_SERVICE_ACCOUNT'];

if (!sa) { console.log('NOT FOUND in .env.local'); process.exit(1); }

console.log('Raw length from dotenv:', sa.length);
console.log('First 80 chars:', JSON.stringify(sa.slice(0, 80)));
console.log('Has real newlines:', /\n/.test(sa));
console.log('Has literal \\n:', sa.includes('\\n'));

let raw = sa.trim();
if (raw.startsWith('"') && raw.endsWith('"')) {
  console.log('Stripping outer double quotes');
  raw = raw.slice(1, -1);
}
console.log('After strip, first 80:', JSON.stringify(raw.slice(0, 80)));
console.log('After strip, real newlines:', /\n/.test(raw));
console.log('After strip, literal \\n:', raw.includes('\\n'));

// Try direct parse
try {
  const obj = JSON.parse(raw);
  console.log('DIRECT PARSE SUCCESS! project_id:', obj.project_id);
  process.exit(0);
} catch(e) {
  console.log('Direct parse fail:', e.message);
}

// Char-by-char repairer
let inString = false, wasBackslash = false, fixed = '';
for (const ch of raw) {
  if (wasBackslash) {
    fixed += ch;
    wasBackslash = false;
  } else if (ch === '\\' && inString) {
    fixed += ch;
    wasBackslash = true;
  } else if (ch === '"') {
    inString = !inString;
    fixed += ch;
  } else if (inString && ch === '\n') {
    fixed += '\\n';
  } else if (inString && ch === '\r') {
    // skip
  } else {
    fixed += ch;
  }
}

console.log('After repair, real newlines:', /\n/.test(fixed));
try {
  const obj = JSON.parse(fixed);
  console.log('REPAIRED PARSE SUCCESS! project_id:', obj.project_id);
} catch(e) {
  console.log('Repaired parse fail:', e.message);
  // Find the bad position
  const pos = parseInt(e.message.match(/position (\d+)/)?.[1] || '0');
  console.log('Context around position', pos, ':', JSON.stringify(fixed.slice(Math.max(0,pos-20), pos+20)));
}
