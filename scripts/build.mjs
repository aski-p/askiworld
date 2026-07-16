import { promises as fs } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../', import.meta.url));
const DIST = join(ROOT, 'dist');
const PUBLIC_FILES = [
  'index.html',
  'styles.css',
  'app.js',
  'atlas.js',
  'favicon.svg',
  'assets/dragon-breath.webp',
  'assets/dragon-flight.webp',
  'assets/house-flame.webp',
  'assets/roof-fire.webp',
  'assets/village.png',
  'assets/village-hd.webp',
  'assets/village-uhd.webp',
  'assets/village-night.png',
  'assets/village-night-hd.webp',
  'assets/village-night-uhd.webp',
  'assets/character-back.png',
  'assets/character-front.png',
  'assets/character-side.png',
];

await fs.rm(DIST, { recursive: true, force: true });
await fs.mkdir(DIST, { recursive: true });

for (const relative of PUBLIC_FILES) {
  const destination = join(DIST, relative);
  await fs.mkdir(dirname(destination), { recursive: true });
  await fs.copyFile(join(ROOT, relative), destination);
}

console.log(`Built ${PUBLIC_FILES.length} public files in ${DIST}`);
