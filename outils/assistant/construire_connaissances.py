"""Construit la base de connaissances de l'assistant vocal à partir des données du site.

Pourquoi un script ?
  L'assistant vocal (agent ElevenLabs) doit savoir exactement ce que le site enseigne,
  ni plus ni moins. Plutôt que de recopier les leçons à la main (et d'oublier de les
  mettre à jour), on relit les fichiers JSON du site et on les transforme en texte
  simple, découpé en sections avec des titres : c'est le format le plus facile à
  retrouver pour le moteur de recherche de l'agent (« RAG »).

  Tout le contenu de data/ est déjà rédigé avec nos propres mots (règle 1 de CLAUDE.md) :
  on peut donc l'envoyer à ElevenLabs sans risque pour les droits d'auteur du livre.

Utilisation (depuis la racine du dépôt) :
    python3 outils/assistant/construire_connaissances.py
  → écrit un fichier .md par sujet dans outils/assistant/connaissances/
  Il faut ensuite remplacer les documents de l'agent (voir outils/assistant/LISEZMOI.md).
"""
import json
from pathlib import Path

RACINE = Path(__file__).resolve().parents[2]       # racine du dépôt (deux dossiers au-dessus)
DATA = RACINE / "data"
SORTIE = Path(__file__).resolve().parent / "connaissances"


def lire(chemin):
    """Lit un fichier JSON en UTF-8 (accents compris)."""
    return json.loads(chemin.read_text(encoding="utf-8"))


def puces(liste):
    """Transforme une liste de phrases en lignes à puces."""
    return "\n".join(f"- {x}" for x in liste if x)


def texte_valeur(valeur):
    """Une règle peut valoir un nombre, une liste de nombres ou un tableau d'objets.
    On en fait une phrase lisible, sans chercher la perfection : l'agent lit, il n'affiche pas."""
    if isinstance(valeur, list):
        morceaux = []
        for v in valeur:
            if isinstance(v, dict):
                morceaux.append("; ".join(f"{k} = {w}" for k, w in v.items()))
            else:
                morceaux.append(str(v))
        return "\n  - " + "\n  - ".join(morceaux)
    if isinstance(valeur, dict):
        return "; ".join(f"{k} = {w}" for k, w in valeur.items())
    return str(valeur)


def module_en_texte(m):
    """Un module = accroche + scènes (narration) + pour approfondir + mémo + étude de cas + quiz."""
    lignes = [f"# Module {m['numero']} : {m['titre']}", "", m.get("accroche", ""), ""]

    lignes.append("## Comprendre (leçon pas à pas)")
    for s in m.get("scenes", []):
        lignes += ["", f"### {s['titre']}", s.get("narration", "")]
        if s.get("points"):
            lignes.append(puces(s["points"]))

    if m.get("approfondir"):
        lignes += ["", "## Approfondir (formules)"]
        for a in m["approfondir"]:
            lignes += ["", f"### {a['titre']}"]
            lignes += a.get("paragraphes", [])
            lignes += [f"Formule : {f}" for f in a.get("formules", [])]
            if a.get("source"):
                lignes.append(f"Source : {a['source']}")

    if m.get("memo"):
        lignes += ["", "## À retenir", puces(m["memo"])]

    cas = m.get("cas")
    if cas:
        lignes += ["", f"## {cas['titre']}", f"Énoncé : {cas['enonce']}", f"Solution : {cas.get('solution', '')}"]

    if m.get("quiz"):
        lignes += ["", "## Questions du quiz et leurs réponses"]
        for q in m["quiz"]:
            bonne = q["choix"][q["bonne"]] if "choix" in q else ""
            lignes.append(f"- Question : {q['question']} Réponse : {bonne}. {q.get('explication', '')}")

    if m.get("sources"):
        lignes += ["", "## Sources du module", puces(m["sources"])]
    return "\n".join(lignes).strip() + "\n"


def regles_en_texte(r):
    """Les valeurs chiffrées des calculateurs, avec leur page dans le livre.
    On ne garde que les règles vérifiées sur la page (verifie: true), comme les calculateurs."""
    lignes = ["# Valeurs chiffrées et règles utilisées par les outils du site", ""]
    for regle in r["regles"]:
        if not regle.get("verifie"):
            continue
        src = regle.get("source", {})
        ref = f"{src.get('ouvrage', '')}, p. {src.get('page', '?')}" + (f", {src['ref']}" if src.get("ref") else "")
        lignes.append(f"## {regle['libelle']}")
        lignes.append(f"Valeur : {texte_valeur(regle['valeur'])} {regle.get('unite', '')}".rstrip())
        if regle.get("remarque"):
            lignes.append(f"Remarque : {regle['remarque']}")
        lignes += [f"Source : {ref}", ""]
    return "\n".join(lignes)


def glossaire_en_texte(g):
    lignes = ["# Glossaire : sigles et notions", ""]
    for t in g["termes"]:
        unite = f" (unité : {t['unite']})" if t.get("unite") else ""
        lignes.append(f"- **{t['terme']}** ({t.get('nom', '')}) : {t['definition']}{unite}")
    return "\n".join(lignes) + "\n"


def diagnostic_en_texte(d):
    """L'arbre du Docteur STEP : on le déroule en questions → réponses → suite,
    pour que l'agent puisse raisonner comme l'outil (symptôme → cause → remède)."""
    noeuds = d["noeuds"]
    lignes = ["# Docteur STEP : arbre de diagnostic (symptôme → cause probable → remède)", ""]
    lignes.append("## Symptômes de départ")
    for s in d["symptomes"]:
        lignes.append(f"- {s['titre']} : {s.get('description', '')} (départ : {s['depart']})")
    lignes += ["", "## Étapes du diagnostic"]
    for cle, n in noeuds.items():
        lignes.append(f"### Étape « {cle} »")
        for champ, valeur in n.items():
            if champ == "reponses":
                for rep in valeur:
                    lignes.append(f"- Si « {rep['texte']} » → étape « {rep['suivant']} »")
            elif isinstance(valeur, (str, int, float)):
                lignes.append(f"{champ} : {valeur}")
            elif isinstance(valeur, list):
                lignes.append(f"{champ} :\n{puces(str(v) if not isinstance(v, dict) else '; '.join(f'{a} = {b}' for a, b in v.items()) for v in valeur)}")
        lignes.append("")
    if d.get("aVenir"):
        lignes += ["## Pas encore couvert par l'outil", puces(d["aVenir"])]
    return "\n".join(lignes)


def main():
    SORTIE.mkdir(exist_ok=True)
    fichiers = {}
    for chemin in sorted((DATA / "modules").glob("*.json")):
        m = lire(chemin)
        fichiers[f"module-{m['numero']}-{m['slug']}.md"] = module_en_texte(m)
    fichiers["regles-chiffrees.md"] = regles_en_texte(lire(DATA / "regles.json"))
    fichiers["glossaire.md"] = glossaire_en_texte(lire(DATA / "glossaire.json"))
    fichiers["docteur-step.md"] = diagnostic_en_texte(lire(DATA / "diagnostic.json"))

    for nom, texte in fichiers.items():
        (SORTIE / nom).write_text(texte, encoding="utf-8")
        print(f"{nom:45} {len(texte):6} caractères")


if __name__ == "__main__":
    main()
