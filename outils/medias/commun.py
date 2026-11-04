"""Éléments partagés par les scripts qui produisent présentations et vidéos.

Les textes viennent tous de data/modules/*.json : la page web, le PowerPoint et la vidéo
disent la même chose. Ces scripts ne tournent que sur le PC de travail, jamais sur le site.
"""
import json
import re
from pathlib import Path

RACINE = Path(__file__).resolve().parents[2]
MODULES = ["bases", "boues-activees", "lits-bacteriens", "azote-phosphore",
           "methanisation", "lagunage", "reglementation-procedes"]
TRAVAIL = RACINE / "outils" / "travail"   # fichiers temporaires, ignorés par git
MEDIAS = RACINE / "medias"                # fichiers publiés

# Palette du site
ORANGE = "EB690B"
ANTHRACITE = "2C2A29"
TAUPE = "897879"
FOND = "F6F7F8"
SIGNATURE = "JM T."

# Ce que la voix de synthèse lit mal est réécrit pour elle. L'ordre compte : le plus long d'abord.
PRONONCIATION = [
    ("ASM1 à ASM3", "A S M 1 à A S M 3"),
    ("DBO5", "D B O 5"),
    ("DCO", "D C O"),
    ("SVI", "S V I"),
    ("AGV", "A G V"),
    ("EPNAC", "Epnac"),
    ("IWA", "I W A"),
    ("DERU 2", "Déru 2"),
    ("notée Cb", "notée C B"),
    ("Ks", "K S"),
    ("split-phase", "split phase"),
]


def lire_module(slug):
    return json.loads((RACINE / "data" / "modules" / f"{slug}.json").read_text(encoding="utf-8"))


def texte_pour_la_voix(texte):
    """Applique les réécritures de prononciation à un texte."""
    for ecrit, dit in PRONONCIATION:
        texte = texte.replace(ecrit, dit)
    return texte


def narration_complete(module):
    """Tout le texte d'une vidéo, une scène par paragraphe."""
    return "\n\n".join(texte_pour_la_voix(s["narration"]) for s in module["scenes"])


def symboles_suspects(texte):
    """Repère ce qu'une voix lirait mal : unités abrégées et indices."""
    return re.findall(r"mg/l|kg/|m²|m³|µ|θ|₂|₃|₄|%|\bCb\b|\bCv\b|\bEH\b", texte)
