// Helper: repair & compact a Firebase Service Account JSON that has raw newlines in private_key
const fs = require('fs');
const inputFile = process.argv[2];
const raw = fs.readFileSync(inputFile, 'utf8').trim();

// Walk char-by-char tracking JSON string context to escape bare newlines inside strings
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
    fixed += '\\n'; // escape bare newline inside string value
  } else if (inString && ch === '\r') {
    // skip bare \r
  } else {
    fixed += ch;
  }
}

const obj = JSON.parse(fixed);
process.stdout.write(JSON.stringify(obj)); // compact single-line output
