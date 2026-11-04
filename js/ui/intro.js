// Animation d'entrée du site, d'après l'exemple intro-jmt.html.
// Script classique, et non module : il s'exécute tout de suite, avant le premier affichage,
// donc on ne voit jamais la page apparaître puis disparaître derrière l'intro.
(function () {
  // Une fois par visite seulement : la revoir à chaque retour sur l'accueil deviendrait pénible.
  // Le stockage peut être bloqué (navigation privée) : on joue alors l'intro, sans gravité.
  try {
    if (sessionStorage.getItem('intro-vue')) return;
    sessionStorage.setItem('intro-vue', '1');
  } catch (e) { /* on continue */ }

  // Deux mises en page : en largeur comme dans l'exemple, en hauteur pour un téléphone.
  var portrait = innerHeight > innerWidth;
  var m = portrait
    ? { boite: '0 0 1000 1500', ix: 500, iy: 760, gx: 280, gy: 200, gs: 2.2, tx: 240, y0: 885, t0: 46, y: [1005, 1125, 1245], t: 124, vagueY: 1295 }
    : { boite: '0 0 1920 1080', ix: 730, iy: 730, gx: 570, gy: 330, gs: 1.6, tx: 970, y0: 440, t0: 40, y: [540, 636, 732], t: 96, vagueY: 772 };

  // La vague de soulignement est calculée pour commencer au début du texte.
  var vague = 'M' + (m.tx + 2) + ' ' + m.vagueY + ' q 25 -14 50 0';
  for (var i = 0; i < 7; i += 1) vague += ' t 50 0';

  var calque = document.createElement('div');
  calque.id = 'intro';
  calque.setAttribute('aria-hidden', 'true');
  calque.style.setProperty('--ix', m.ix + 'px');
  calque.style.setProperty('--iy', m.iy + 'px');
  calque.style.setProperty('--gx', m.gx + 'px');
  calque.style.setProperty('--gy', m.gy + 'px');
  calque.style.setProperty('--gs', m.gs);
  calque.innerHTML =
    '<svg viewBox="' + m.boite + '" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">' +
      '<g fill="none" stroke="#E36C1F" stroke-width="4">' +
        '<ellipse class="onde o1" cx="' + m.ix + '" cy="' + m.iy + '" rx="230" ry="34"></ellipse>' +
        '<ellipse class="onde o2" cx="' + m.ix + '" cy="' + m.iy + '" rx="300" ry="44"></ellipse>' +
        '<ellipse class="onde o3" cx="' + m.ix + '" cy="' + m.iy + '" rx="370" ry="54"></ellipse>' +
      '</g>' +
      '<g transform="translate(' + (m.ix - 730) + ' ' + (m.iy - 730) + ')">' +
        '<path id="chute" d="M730 682 C 730 682 716 702 716 712 A 14 14 0 0 0 744 712 C 744 702 730 682 730 682 Z" fill="#E36C1F"></path>' +
      '</g>' +
      '<g id="goutte">' +
        '<path d="M100 8 C 100 8, 18 112, 18 168 A 82 82 0 0 0 182 168 C 182 112, 100 8, 100 8 Z" fill="#E36C1F"></path>' +
        '<path id="reflet" d="M52 150 C 52 128, 64 110, 76 96" fill="none" stroke="#FFFFFF" stroke-width="8" stroke-linecap="round" opacity="0.55"></path>' +
        '<text id="lettres" x="100" y="200" text-anchor="middle" font-weight="900" font-size="66" letter-spacing="-2" fill="#FFFFFF">JMT</text>' +
      '</g>' +
      '<text class="ligne l0" x="' + m.tx + '" y="' + m.y0 + '" font-size="' + m.t0 + '" fill="#555555">Avec moi, l’eau n’est</text>' +
      '<text class="ligne l1" x="' + m.tx + '" y="' + m.y[0] + '" font-size="' + m.t + '" font-weight="900" fill="#222222"><tspan fill="#E36C1F">J</tspan>amais</text>' +
      '<text class="ligne l2" x="' + m.tx + '" y="' + m.y[1] + '" font-size="' + m.t + '" font-weight="900" fill="#222222"><tspan fill="#E36C1F">M</tspan>al</text>' +
      '<text class="ligne l3" x="' + m.tx + '" y="' + m.y[2] + '" font-size="' + m.t + '" font-weight="900" fill="#222222"><tspan fill="#E36C1F">T</tspan>raitée.</text>' +
      '<path id="souligne" d="' + vague + '" fill="none" stroke="#E36C1F" stroke-width="6" stroke-linecap="round"></path>' +
    '</svg>';
  document.body.prepend(calque);
  document.documentElement.style.overflow = 'hidden';

  // On retire le calque à la fin de son animation, ou dès qu'on touche l'écran ou le clavier.
  function retirer() {
    calque.remove();
    document.documentElement.style.overflow = '';
    removeEventListener('keydown', passer);
  }
  function passer() {
    calque.classList.add('passee');
    setTimeout(retirer, 260);
  }
  calque.addEventListener('animationend', function (e) { if (e.target === calque) retirer(); });
  calque.addEventListener('click', passer);
  addEventListener('keydown', passer);
}());
