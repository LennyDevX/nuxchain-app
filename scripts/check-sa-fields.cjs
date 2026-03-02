// Verify all SA fields are present and check key signing
const dotenv = require('dotenv');
const fs = require('fs');
const crypto = require('crypto');

dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local' });

let raw = process.env.FIREBASE_SERVICE_ACCOUNT?.trim();
if (raw.startsWith('"') && raw.endsWith('"')) raw = raw.slice(1, -1);

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

const REQUIRED_FIELDS = ['type','project_id','private_key_id','private_key','client_email','client_id','auth_uri','token_uri','auth_provider_x509_cert_url','client_x509_cert_url'];
for (const f of REQUIRED_FIELDS) {
  const v = sa[f];
  console.log(`${v ? '✅' : '❌'} ${f}: ${v ? v.slice(0, 40) : 'MISSING'}`);
}

// Test that the private key can actually be used for signing
console.log('\nTesting private key signing...');
try {
  const sign = crypto.createSign('SHA256');
  sign.update('test-message');
  const sig = sign.sign(sa.private_key, 'base64');
  console.log('✅ Private key CAN sign data. Signature length:', sig.length);
} catch(e) {
  console.error('❌ Private key CANNOT sign:', e.message);
}
