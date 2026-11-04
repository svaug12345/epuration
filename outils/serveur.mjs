// Mini serveur local, sans dépendance, pour tester le site : node outils/serveur.mjs
// Les modules JavaScript ne se chargent pas depuis un fichier ouvert directement,
// il faut donc passer par http://localhost, même en local.
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const RACINE = fileURLToPath(new URL('..', import.meta.url));
const PORT = Number(process.env.PORT ?? 8123);
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.webmanifest': 'application/manifest+json',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.mp4': 'video/mp4', '.vtt': 'text/vtt; charset=utf-8',
  '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
};

createServer(async (requete, reponse) => {
  try {
    let chemin = decodeURIComponent(new URL(requete.url, 'http://x').pathname);
    // normalize + contrôle du préfixe : on refuse de sortir du dossier du site.
    chemin = normalize(join(RACINE, chemin));
    if (!chemin.startsWith(RACINE.replace(/[\\/]$/, '') + sep) && chemin !== RACINE) throw new Error('interdit');
    // Par sécurité, même en local, le dossier privé n'est jamais servi.
    if (chemin.includes(`${sep}sources${sep}`)) throw new Error('interdit');
    if ((await stat(chemin)).isDirectory()) chemin = join(chemin, 'index.html');
    const contenu = await readFile(chemin);
    reponse.writeHead(200, { 'Content-Type': TYPES[extname(chemin)] ?? 'application/octet-stream', 'Cache-Control': 'no-store' });
    reponse.end(contenu);
  } catch {
    reponse.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    reponse.end('Page introuvable');
  }
}).listen(PORT, () => console.log(`Site disponible sur http://localhost:${PORT}/`));
