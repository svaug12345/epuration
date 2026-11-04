// Exporte une image fixe de chaque scène, pour les présentations PowerPoint.
// Usage : node outils/medias/rendre_diapos.mjs (le site doit être servi sur http://localhost:8123)
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const RACINE = fileURLToPath(new URL('../../', import.meta.url));
const TRAVAIL = join(RACINE, 'outils/travail');
const { chromium } = createRequire(join(TRAVAIL, 'studio/'))('playwright-core');
const MODULES = ['bases', 'boues-activees', 'lits-bacteriens', 'azote-phosphore', 'methanisation', 'lagunage', 'reglementation-procedes'];

mkdirSync(join(TRAVAIL, 'diapos'), { recursive: true });
const navigateur = await chromium.launch({ channel: 'msedge', headless: true });
const page = await navigateur.newPage({ viewport: { width: 1920, height: 1080 } });
await page.goto('http://localhost:8123/outils/medias/studio.html');
await page.waitForFunction('window.studioPret === true');
for (const slug of MODULES) {
  const { scenes } = JSON.parse(readFileSync(join(RACINE, `data/modules/${slug}.json`), 'utf8'));
  for (let i = 0; i < scenes.length; i += 1) {
    const donnees = await page.evaluate(([s, n]) => window.imageScene(s, n), [slug, i]);
    writeFileSync(join(TRAVAIL, `diapos/${slug}-${i}.jpg`), Buffer.from(donnees, 'base64'));
  }
  console.log(slug, scenes.length);
}
await navigateur.close();
