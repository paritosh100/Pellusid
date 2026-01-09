const fs = require('fs');
const path = require('path');

// Read the current .env.local file
const envPath = path.join(__dirname, '.env.local');
const content = fs.readFileSync(envPath, 'utf8');

console.log('Current .env.local content:');
console.log('---START---');
console.log(content);
console.log('---END---');
console.log('\nFile length:', content.length, 'bytes');
console.log('Number of lines:', content.split('\n').length);

// Parse and fix the content
const lines = content.split('\n').map(line => line.trim()).filter(line => line);
console.log('\nParsed lines:');
lines.forEach((line, i) => {
  console.log(`Line ${i + 1}: "${line}"`);
});

// Check if API key is split
const apiKeyLines = lines.filter(line => 
  line.startsWith('OPENAI_API_KEY=') || 
  (!line.includes('=') && line.length > 20)
);

if (apiKeyLines.length > 1) {
  console.log('\n⚠️  WARNING: API key appears to be split across multiple lines!');
  console.log('This will cause the error you\'re seeing.');
  console.log('\nTo fix: Edit .env.local and put the entire API key on ONE line.');
}
