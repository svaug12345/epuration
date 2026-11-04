// Fait tourner une scène en direct dans un <canvas> de la page.
// La boucle ne tourne que si le canvas est visible, pour ménager la batterie du téléphone.
// Si le système demande moins d'animations, on affiche simplement l'état final de la scène.
import { L, H, fond, C } from './moteur.js';
import { dessinerVisuel } from './scenes.js';

export function lancerVisuel(canvas, visuel, { duree = 12, boucle = true, avecFond = true, teinte = C.orange } = {}) {
  const x = canvas.getContext('2d');
  const reduit = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let depart = null;
  let raf = 0;
  let visible = false;
  let echelle = 1;

  const adapter = () => {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const largeur = canvas.clientWidth || L;
    canvas.width = Math.round(largeur * dpr);
    canvas.height = Math.round((largeur * H) / L * dpr);
    echelle = canvas.width / L;
  };

  const dessiner = (t) => {
    x.setTransform(echelle, 0, 0, echelle, 0, 0);
    if (avecFond) fond(x, t, { teinte });
    dessinerVisuel(x, visuel, t, duree);
  };

  const image = (maintenant) => {
    if (!visible) return;
    if (depart === null) depart = maintenant;
    let t = (maintenant - depart) / 1000;
    // On laisse la fin de scène affichée un moment avant de recommencer.
    if (boucle && t > duree + 3) { depart = maintenant; t = 0; }
    dessiner(Math.min(t, duree + 3));
    raf = requestAnimationFrame(image);
  };

  const observateur = new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    cancelAnimationFrame(raf);
    if (visible && !reduit) raf = requestAnimationFrame(image);
  }, { threshold: 0.05 });

  adapter();
  addEventListener('resize', adapter);
  if (reduit) dessiner(duree); else observateur.observe(canvas);
  document.fonts?.ready.then(() => { if (reduit) dessiner(duree); });

  // Fonction d'arrêt, à appeler quand la scène quitte la page.
  return () => {
    visible = false;
    cancelAnimationFrame(raf);
    observateur.disconnect();
    removeEventListener('resize', adapter);
  };
}
