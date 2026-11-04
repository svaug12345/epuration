// Affiche le glossaire et le filtre pendant la frappe.
const liste = document.querySelector('#liste');
const recherche = document.querySelector('#recherche');
const compteur = document.querySelector('#compteur');

const reponse = await fetch(new URL('../../data/glossaire.json', import.meta.url));
const { termes } = await reponse.json();
termes.sort((a, b) => a.terme.localeCompare(b.terme, 'fr'));

// On retire les accents pour que « methanisation » trouve « méthanisation ».
const simplifier = (texte) => texte.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();

function afficher() {
  const cherche = simplifier(recherche.value.trim());
  const retenus = termes.filter((t) => simplifier(`${t.terme} ${t.nom} ${t.definition}`).includes(cherche));

  liste.replaceChildren(...retenus.map((t) => {
    const bloc = document.createElement('article');
    bloc.className = 'carte';
    bloc.style.marginBottom = '.6rem';

    const titre = document.createElement('h2');
    titre.textContent = t.nom && t.nom !== t.terme ? `${t.terme} : ${t.nom}` : t.terme;
    titre.style.margin = '0 0 .3rem';
    titre.style.fontSize = '1.05rem';

    const definition = document.createElement('p');
    definition.textContent = t.definition;
    definition.style.margin = '0';
    bloc.append(titre, definition);

    if (t.unite) {
      const unite = document.createElement('p');
      unite.className = 'discret';
      unite.textContent = `Unité : ${t.unite}`;
      unite.style.margin = '.2rem 0 0';
      bloc.append(unite);
    }
    return bloc;
  }));
  compteur.textContent = `${retenus.length} terme${retenus.length > 1 ? 's' : ''}`;
}

recherche.addEventListener('input', afficher);
afficher();
