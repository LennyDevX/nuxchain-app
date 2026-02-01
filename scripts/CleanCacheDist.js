import fs from 'fs';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = dirname(__dirname);

console.log('🧹 Limpiando archivos de build...');

// Cambiar a directorio raíz del proyecto
process.chdir(projectRoot);

// Eliminar dist
if (fs.existsSync('dist')) {
  fs.rmSync('dist', { recursive: true, force: true });
  console.log('✓ Eliminado dist/');
}

// Eliminar caché de Vite
if (fs.existsSync('node_modules/.vite')) {
  fs.rmSync('node_modules/.vite', { recursive: true, force: true });
  console.log('✓ Eliminado node_modules/.vite/');
}

// Eliminar output de Vercel
if (fs.existsSync('.vercel/.output')) {
  fs.rmSync('.vercel/.output', { recursive: true, force: true });
  console.log('✓ Eliminado .vercel/.output/');
}

console.log('');
console.log('🔧 Reconstruyendo proyecto...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('');
  console.log('✅ Listo! Ahora ejecuta:');
  console.log('   npm run dev');
  console.log('');
  console.log('⚠️  Recuerda hacer Hard Refresh en el navegador:');
  console.log('   Ctrl + Shift + R  o  Ctrl + F5');
} catch (error) {
  console.error('❌ Error durante el build:', error.message);
  process.exit(1);
}