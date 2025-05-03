import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// Get constants.prod.js content
const prodConstants = readFileSync(join(rootDir, 'src/utils/constants.prod.js'), 'utf8');

// Backup original constants.js
const originalConstants = readFileSync(join(rootDir, 'src/utils/constants.js'), 'utf8');
writeFileSync(join(rootDir, 'src/utils/constants.js.bak'), originalConstants);

// Replace constants.js with production version
writeFileSync(join(rootDir, 'src/utils/constants.js'), prodConstants);

console.log('✅ Replaced constants.js with production values for build'); 