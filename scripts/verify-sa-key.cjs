// Verify the private_key integrity after all parsing layers
const dotenv = require('dotenv');
const fs = require('fs');

const result = dotenv.parse(fs.readFileSync('.env.local', 'utf8'));
let raw = result['FIREBASE_SERVICE_ACCOUNT'];
if (!raw) { console.error('FIREBASE_SERVICE_ACCOUNT not found in .env.local'); process.exit(1); }

raw = raw.trim();
if (raw.startsWith('"') && raw.endsWith('"')) {
  raw = raw.slice(1, -1);
}

// Char-by-char repair (same as server code)
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

let obj;
try {
  obj = JSON.parse(fixed);
} catch(e) {
  console.error('PARSE FAILED:', e.message);
  process.exit(1);
}

const pk = obj.private_key;
console.log('project_id:', obj.project_id);
console.log('client_email:', obj.client_email);
console.log('private_key starts with:', pk.slice(0, 40));
console.log('private_key ends with:', pk.slice(-40).replace(/\n/g, '\\n'));
console.log('Has actual newlines in pk:', pk.includes('\n'));
console.log('pk line count (split by \\n):', pk.split('\n').length);
console.log('pk begins with BEGIN:', pk.includes('BEGIN PRIVATE KEY') || pk.includes('BEGIN RSA PRIVATE KEY'));
