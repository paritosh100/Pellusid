// Simple environment check for Next.js
console.log('\n=== Environment Variable Check ===');
console.log('OPENAI_API_KEY exists:', !!process.env.OPENAI_API_KEY);
console.log('OPENAI_API_KEY length:', process.env.OPENAI_API_KEY?.length || 0);
console.log('OPENAI_API_KEY preview:', process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.substring(0, 10) + '...' : 'NOT SET');
console.log('OPENAI_MODEL:', process.env.OPENAI_MODEL || 'not set (will use default)');
console.log('================================\n');

if (!process.env.OPENAI_API_KEY) {
  console.error('❌ OPENAI_API_KEY is not set!');
  console.log('\nTroubleshooting steps:');
  console.log('1. Check that .env.local exists in the project root');
  console.log('2. Make sure it contains: OPENAI_API_KEY=sk-your-key');
  console.log('3. No quotes around the value');
  console.log('4. No spaces around the = sign');
  console.log('5. Save the file and restart the dev server');
  process.exit(1);
} else if (!process.env.OPENAI_API_KEY.startsWith('sk-')) {
  console.error('❌ OPENAI_API_KEY does not look valid (should start with sk-)');
  console.log('Current value starts with:', process.env.OPENAI_API_KEY.substring(0, 5));
  process.exit(1);
} else {
  console.log('✅ OPENAI_API_KEY appears to be set correctly!');
  console.log('✅ You can now use the application');
}
