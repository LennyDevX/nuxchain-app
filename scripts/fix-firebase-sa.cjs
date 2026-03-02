const fs = require('fs');

const f = fs.readFileSync('.env.vercel.prod', 'utf8');
const lines = f.split('\n').filter(l => l.startsWith('FIREBASE_SERVICE_ACCOUNT='));
if (!lines.length) { console.log('NOT FOUND'); process.exit(1); }

const raw = lines[0].slice(lines[0].indexOf('=') + 1);
console.log('Raw length:', raw.length);
console.log('Starts with quote:', raw.startsWith('"'));
console.log('Ends with quote:', raw.endsWith('"'));

// Strategy 1: strip outer quotes, replace literal \n with actual newlines
const stripped = (raw.startsWith('"') && raw.endsWith('"')) ? raw.slice(1, -1) : raw;
const attempt1 = stripped.replace(/\\n/g, '\n');
try {
  const obj = JSON.parse(attempt1);
  console.log('\n✅ Strategy 1 WORKS! Keys:', Object.keys(obj).slice(0, 6));
  console.log('project_id:', obj.project_id);
  console.log('type:', obj.type);
  // Save the fixed value
  fs.writeFileSync('scripts/.firebase-sa-fixed.json', attempt1);
  console.log('\nFixed JSON saved to scripts/.firebase-sa-fixed.json');
  process.exit(0);
} catch(e) {
  console.log('Strategy 1 fail:', e.message.slice(0, 100));
}

// Strategy 2: use JSON.parse on the raw string itself (maybe it's a JSON string)
try {
  const obj = JSON.parse(raw);
  console.log('\nStrategy 2 (JSON.parse raw):', typeof obj, typeof obj === 'object' ? Object.keys(obj).slice(0, 6) : 'is a string');
  if (typeof obj === 'string') {
    const obj2 = JSON.parse(obj);
    console.log('Double-parse:', Object.keys(obj2).slice(0, 6));
    fs.writeFileSync('scripts/.firebase-sa-fixed.json', obj);
    console.log('Fixed JSON saved');
    process.exit(0);
  }
  fs.writeFileSync('scripts/.firebase-sa-fixed.json', raw);
  process.exit(0);
} catch(e) {
  console.log('Strategy 2 fail:', e.message.slice(0, 100));
}

console.log('\n❌ Cannot auto-fix - manual intervention required');
console.log('Sample of stored value (first 200 chars):');
console.log(raw.slice(0, 200));
