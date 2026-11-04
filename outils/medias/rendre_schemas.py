"""Convertit les schémas SVG en images PNG, pour les présentations et les vidéos.

On passe par Microsoft Edge sans fenêtre : il sait afficher le SVG tel qu'il sera vu sur le site.
Usage : python outils/medias/rendre_schemas.py
"""
import subprocess
import tempfile
from pathlib import Path

from commun import RACINE, TRAVAIL

EDGE = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
LARGEUR, HAUTEUR = 1280, 720  # même rapport que le viewBox 640 × 360, à l'échelle 2


def rendre(svg: Path, sortie: Path, profil: str):
    page = (
        "<!doctype html><meta charset=utf-8>"
        "<style>html,body{margin:0;background:#fff}img{display:block;width:100vw;height:100vh}</style>"
        f'<img src="{svg.as_uri()}">'
    )
    with tempfile.NamedTemporaryFile("w", suffix=".html", delete=False, encoding="utf-8") as f:
        f.write(page)
    subprocess.run(
        [EDGE, "--headless=new", "--disable-gpu", "--hide-scrollbars", f"--user-data-dir={profil}",
         f"--window-size={LARGEUR},{HAUTEUR}", f"--screenshot={sortie}", Path(f.name).as_uri()],
        check=True, capture_output=True, timeout=120,
    )
    Path(f.name).unlink()


if __name__ == "__main__":
    dossier = TRAVAIL / "schemas"
    dossier.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory() as profil:  # profil vide, sans rapport avec le navigateur habituel
        for svg in sorted((RACINE / "img" / "schemas").glob("*.svg")):
            sortie = dossier / f"{svg.stem}.png"
            rendre(svg, sortie, profil)
            print(sortie.name, sortie.stat().st_size)
