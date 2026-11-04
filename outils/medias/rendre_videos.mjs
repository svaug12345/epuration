// Fabrique les vidéos image par image.
//
// 1. ffmpeg repère les pauses marquées dans la voix : on connaît ainsi le début et la fin
//    exacts de chaque scène, sans estimation.
// 2. Edge, sans fenêtre, dessine chaque image dans studio.html. Node l'envoie à ffmpeg.
// 3. ffmpeg ajoute la voix, un fond sonore très discret et un souffle à chaque transition.
//
// Usage : node outils/medias/rendre_videos.mjs [slug ...]
// Prérequis : outils/travail/voix/<slug>.mp3, le site servi sur http://localhost:8123,
// et, dans outils/travail/studio, le paquet playwright-core.
import { spawn, spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const RACINE = fileURLToPath(new URL('../../', import.meta.url));
const TRAVAIL = join(RACINE, 'outils/travail');
const require = createRequire(join(TRAVAIL, 'studio/'));
const { chromium } = require('playwright-core');

const MODULES = ['bases', 'boues-activees', 'lits-bacteriens', 'azote-phosphore', 'methanisation', 'lagunage', 'reglementation-procedes'];
const IPS = 30;
const INTRO = 3.6;
const FIN = 4.5;

// ffmpeg a été installé par winget, hors du chemin par défaut.
const base = join(homedir(), 'AppData/Local/Microsoft/WinGet/Packages');
const paquet = readdirSync(base).find((n) => n.startsWith('Gyan.FFmpeg'));
const version = readdirSync(join(base, paquet)).find((n) => n.startsWith('ffmpeg-'));
const FFMPEG = join(base, paquet, version, 'bin/ffmpeg.exe');
const FFPROBE = join(dirname(FFMPEG), 'ffprobe.exe');

function dureeAudio(fichier) {
  const r = spawnSync(FFPROBE, ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', fichier], { encoding: 'utf8' });
  return Number(r.stdout.trim());
}

/** Liste les silences d'un fichier : [[début, fin], ...]. */
function silences(fichier, duree) {
  const r = spawnSync(FFMPEG, ['-hide_banner', '-i', fichier, '-af', `silencedetect=noise=-40dB:d=${duree}`, '-f', 'null', '-'], { encoding: 'utf8' });
  return [...r.stderr.matchAll(/silence_start: ([\d.]+)[\s\S]*?silence_end: ([\d.]+)/g)].map((m) => [Number(m[1]), Number(m[2])]);
}

/**
 * Resserre la voix pour un rythme plus vif : 0,4 s au plus entre deux phrases, 1 s entre deux scènes.
 * Une pause naturelle pouvant être aussi longue qu'une pause de scène, on repère les changements
 * de scène par leur position attendue, d'après la longueur du texte déjà lu.
 * Le fichier obtenu a alors des pauses de scène sans ambiguïté, que caler() retrouve exactement.
 */
function resserrer(voix, scenes) {
  const duree = dureeAudio(voix);
  const tous = silences(voix, 0.4).filter(([, fin]) => fin < duree - 0.2);
  const longs = tous.filter(([a, b]) => b - a >= 1.3);
  const total = scenes.reduce((s, x) => s + x.narration.length, 0);
  let cumul = 0;
  const bornes = new Set();
  for (const scene of scenes.slice(0, -1)) {
    cumul += scene.narration.length;
    const attendu = (duree * cumul) / total;
    const proche = longs.reduce((m, s) => (Math.abs(s[0] - attendu) < Math.abs(m[0] - attendu) ? s : m));
    if (Math.abs(proche[0] - attendu) > 9 || bornes.has(proche)) throw new Error(`${voix} : pause de scène introuvable vers ${attendu.toFixed(0)} s`);
    bornes.add(proche);
  }
  // On retire le surplus de chaque silence, en gardant le milieu de la respiration.
  const coupes = tous.map((s) => {
    const garder = bornes.has(s) ? 1.0 : 0.4;
    const surplus = s[1] - s[0] - garder;
    return surplus > 0.02 ? [s[0] + garder / 2, s[0] + garder / 2 + surplus] : null;
  }).filter(Boolean);
  const condition = coupes.map(([a, b]) => `between(t,${a.toFixed(3)},${b.toFixed(3)})`).join('+');
  const sortie = voix.replace(/\.mp3$/, '-vif.wav');
  const r = spawnSync(FFMPEG, ['-y', '-loglevel', 'error', '-i', voix, '-af', `aselect='not(${condition})',asetpts=N/SR/TB`, sortie], { encoding: 'utf8' });
  if (r.status !== 0) throw new Error(`Resserrage : ${r.stderr}`);
  console.log(`${voix.split(/[\\/]/).pop()} : ${duree.toFixed(0)} s → ${dureeAudio(sortie).toFixed(0)} s`);
  return sortie;
}

/** Renvoie [[début, fin], ...] de chaque scène, d'après les pauses de la voix. */
function caler(fichier, nbScenes) {
  const r = spawnSync(FFMPEG, ['-hide_banner', '-i', fichier, '-af', 'silencedetect=noise=-40dB:d=0.8', '-f', 'null', '-'], { encoding: 'utf8' });
  const pauses = [...r.stderr.matchAll(/silence_start: ([\d.]+)[\s\S]*?silence_end: ([\d.]+)/g)].map((m) => [Number(m[1]), Number(m[2])]);
  const duree = dureeAudio(fichier);
  // Le silence éventuel de toute fin de fichier n'est pas une pause entre deux scènes.
  const utiles = pauses.filter(([, fin]) => fin < duree - 0.2);
  if (utiles.length !== nbScenes - 1) {
    throw new Error(`${fichier} : ${utiles.length} pauses trouvées pour ${nbScenes} scènes`);
  }
  const calage = [];
  let debut = 0;
  for (const [a, b] of utiles) { calage.push([debut, a]); debut = b; }
  calage.push([debut, duree]);
  // Les pauses plus courtes, entre deux phrases, servent à caler les sous-titres.
  const fines = spawnSync(FFMPEG, ['-hide_banner', '-i', fichier, '-af', 'silencedetect=noise=-40dB:d=0.2', '-f', 'null', '-'], { encoding: 'utf8' });
  const fins = [...fines.stderr.matchAll(/silence_start: ([\d.]+)[\s\S]*?silence_end: ([\d.]+)/g)].map((m) => (Number(m[1]) + Number(m[2])) / 2);
  return { calage, duree, pauses: fins };
}

/** Fond sonore : un accord très doux, et un souffle bref à chaque changement de scène. */
function construireSon(voix, sortie, calage, total) {
  const attaques = [INTRO, ...calage.slice(1).map(([d]) => INTRO + d - 0.25)];
  const souffles = attaques.map((t, i) => `anoisesrc=d=0.5:c=pink:a=0.5:r=44100,highpass=f=500,lowpass=f=4500,afade=t=in:d=0.22,afade=t=out:st=0.22:d=0.28,adelay=${Math.round(t * 1000)}|${Math.round(t * 1000)},volume=0.16[s${i}]`);
  const nappe = [110, 164.81, 220, 277.18]
    .map((f, i) => `sine=f=${f}:d=${total}:r=44100,volume=${[0.5, 0.32, 0.25, 0.14][i]}[n${i}]`);
  const graphe = [
    ...nappe,
    `[n0][n1][n2][n3]amix=inputs=4:normalize=0,tremolo=f=0.12:d=0.35,lowpass=f=900,afade=t=in:d=2.5,afade=t=out:st=${total - 3}:d=3,volume=0.05,aformat=channel_layouts=stereo[nappe]`,
    `[0:a]adelay=${Math.round(INTRO * 1000)}|${Math.round(INTRO * 1000)},aformat=channel_layouts=stereo[voix]`,
    ...souffles,
    `[nappe][voix]${attaques.map((_, i) => `[s${i}]`).join('')}amix=inputs=${attaques.length + 2}:normalize=0:duration=longest,loudnorm=I=-16:TP=-1.5:LRA=11:linear=true,aresample=44100[sortie]`,
  ].join(';');
  const r = spawnSync(FFMPEG, ['-y', '-loglevel', 'error', '-i', voix, '-filter_complex', graphe, '-map', '[sortie]', '-t', String(total), '-c:a', 'aac', '-b:a', '128k', sortie], { encoding: 'utf8' });
  if (r.status !== 0) throw new Error(`Son : ${r.stderr}`);
}

async function rendre(page, slug) {
  const module_ = JSON.parse(readFileSync(join(RACINE, `data/modules/${slug}.json`), 'utf8'));
  const source = join(TRAVAIL, `voix/${slug}.mp3`);
  if (!existsSync(source)) { console.log(`Voix absente : ${slug}`); return; }
  const voix = resserrer(source, module_.scenes);
  const { calage, duree, pauses } = caler(voix, module_.scenes.length);
  const total = await page.evaluate(([s, c, d, q]) => window.preparer(s, c, d, q), [slug, calage, duree, pauses]);
  const nbImages = Math.ceil(total * IPS);

  const son = join(TRAVAIL, `voix/${slug}-mix.m4a`);
  construireSon(voix, son, calage, total);

  const sortie = join(RACINE, `medias/${slug}.mp4`);
  const ffmpeg = spawn(FFMPEG, ['-y', '-loglevel', 'error',
    '-f', 'image2pipe', '-framerate', String(IPS), '-c:v', 'mjpeg', '-i', '-',
    '-i', son, '-map', '0:v', '-map', '1:a',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '25', '-pix_fmt', 'yuv420p',
    '-c:a', 'copy', '-shortest', '-movflags', '+faststart', sortie], { stdio: ['pipe', 'inherit', 'inherit'] });

  const debut = Date.now();
  for (let i = 0; i < nbImages; i += 1) {
    const donnees = await page.evaluate((t) => window.image(t, 0.92), i / IPS);
    if (!ffmpeg.stdin.write(Buffer.from(donnees, 'base64'))) {
      await new Promise((ok) => ffmpeg.stdin.once('drain', ok));
    }
  }
  ffmpeg.stdin.end();
  await new Promise((ok, ko) => ffmpeg.on('close', (c) => (c === 0 ? ok() : ko(new Error(`ffmpeg ${c}`)))));

  // Vignette d'attente : l'instant du générique où le titre est posé.
  const vignette = await page.evaluate(() => window.image(2.8, 0.85));
  writeFileSync(join(RACINE, `medias/${slug}.jpg`), Buffer.from(vignette, 'base64'));
  console.log(`${slug} : ${total.toFixed(1)} s, ${nbImages} images en ${((Date.now() - debut) / 1000).toFixed(0)} s`);
}

mkdirSync(join(RACINE, 'medias'), { recursive: true });
const navigateur = await chromium.launch({ channel: 'msedge', headless: true });
const page = await navigateur.newPage({ viewport: { width: 1920, height: 1080 } });
await page.goto('http://localhost:8123/outils/medias/studio.html');
await page.waitForFunction('window.studioPret === true');
for (const slug of (process.argv.slice(2).length ? process.argv.slice(2) : MODULES)) await rendre(page, slug);
await navigateur.close();
