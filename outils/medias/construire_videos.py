"""Monte une vidéo par module : diapositives animées + voix off.

Principe :
1. On connaît la durée totale de la voix (ffprobe) et la longueur du texte de chaque scène.
   Le débit de parole étant régulier, chaque scène reçoit une durée proportionnelle à son texte.
2. Chaque scène est dessinée en images fixes : les points clés apparaissent l'un après l'autre,
   avec un court fondu. Pas besoin d'une image par instant : seules les transitions en demandent.
3. ffmpeg assemble ces images, chacune avec sa durée, et ajoute le son.

Usage : python outils/medias/construire_videos.py [slug ...]
Il faut d'abord déposer les voix dans outils/travail/voix/<slug>.mp3.
"""
import json
import shutil
import subprocess
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

from commun import ANTHRACITE, MEDIAS, MODULES, ORANGE, SIGNATURE, TAUPE, TRAVAIL, lire_module, texte_pour_la_voix

L, H = 1280, 720
IPS = 25                # images par seconde de la vidéo
FONDU_S = 0.4           # durée d'un fondu entre deux états
INTRO_S = 3.0           # titre seul, avant la voix
FIN_S = 3.5             # carte de fin signée, après la voix
POLICE = r"C:\Windows\Fonts\arial.ttf"
POLICE_GRAS = r"C:\Windows\Fonts\arialbd.ttf"

ffmpeg = shutil.which("ffmpeg") or next(
    (Path.home() / "AppData/Local/Microsoft/WinGet/Packages").glob("Gyan.FFmpeg*/ffmpeg-*/bin/ffmpeg.exe"))
ffprobe = str(Path(ffmpeg).with_name("ffprobe.exe"))


def rgb(code):
    return tuple(int(code[i:i + 2], 16) for i in (0, 2, 4))


def police(taille, gras=False):
    return ImageFont.truetype(POLICE_GRAS if gras else POLICE, taille)


def couper(dessin, texte, fonte, largeur):
    """Coupe un texte en lignes qui tiennent dans la largeur donnée."""
    lignes, ligne = [], ""
    for mot in texte.split():
        essai = f"{ligne} {mot}".strip()
        if dessin.textlength(essai, font=fonte) <= largeur:
            ligne = essai
        else:
            lignes.append(ligne)
            ligne = mot
    lignes.append(ligne)
    return lignes


def cadre():
    """Fond commun : filet orange et signature discrète, sans logo."""
    image = Image.new("RGB", (L, H), rgb("F6F7F8"))
    dessin = ImageDraw.Draw(image)
    dessin.rectangle([0, 0, L, 9], fill=rgb(ORANGE))
    largeur = dessin.textlength(SIGNATURE, font=police(20))
    dessin.text((L - 40 - largeur, H - 42), SIGNATURE, font=police(20), fill=rgb(TAUPE))
    return image, dessin


def dessiner_titre(module):
    image, d = cadre()
    d.text((80, 210), f"Module {module['numero']} sur 7", font=police(30), fill=rgb(TAUPE))
    y = 262
    for ligne in couper(d, module["titre"], police(62, True), L - 160):
        d.text((80, y), ligne, font=police(62, True), fill=rgb(ANTHRACITE))
        y += 76
    y += 18
    for ligne in couper(d, module["accroche"], police(30), L - 160):
        d.text((80, y), ligne, font=police(30), fill=rgb(TAUPE))
        y += 42
    return image


def dessiner_scene(scene, nb_points):
    """Dessine une scène avec ses nb_points premiers points visibles."""
    image, d = cadre()
    y = 44
    for ligne in couper(d, scene["titre"], police(44, True), L - 120):
        d.text((60, y), ligne, font=police(44, True), fill=rgb(ANTHRACITE))
        y += 54

    schema = scene.get("schema")
    largeur_points = 470 if schema else L - 150
    taille = 30 if schema else 38
    y = max(y + 36, 170)
    for point in scene["points"][:nb_points]:
        lignes = couper(d, point, police(taille), largeur_points)
        d.ellipse([60, y + taille * 0.34, 74, y + taille * 0.34 + 14], fill=rgb(ORANGE))
        for ligne in lignes:
            d.text((92, y), ligne, font=police(taille), fill=rgb(ANTHRACITE))
            y += int(taille * 1.3)
        y += 26

    if schema:
        png = Image.open(TRAVAIL / "schemas" / f"{schema}.png").convert("RGB").resize((680, 382), Image.LANCZOS)
        image.paste(png, (570, 170))
        d.rectangle([570, 170, 1250, 552], outline=rgb("D8D8D8"), width=2)
    return image


def dessiner_fin(module):
    image, d = cadre()
    y = 250
    for ligne in couper(d, "Pour aller plus loin : le cours, le quiz et les calculateurs sont en ligne.", police(38, True), L - 200):
        d.text((100, y), ligne, font=police(38, True), fill=rgb(ANTHRACITE))
        y += 50
    d.text((100, y + 22), "baiji.fr/epuration", font=police(34), fill=rgb("C2540A"))
    d.text((100, 590), "Outil pédagogique : il ne remplace pas une étude de dimensionnement.", font=police(24), fill=rgb(TAUPE))
    d.text((100, 622), "Projet personnel indépendant, sans lien avec une entreprise.", font=police(24), fill=rgb(TAUPE))
    return image


def duree(fichier):
    sortie = subprocess.run(
        [ffprobe, "-v", "error", "-show_entries", "format=duration", "-of", "json", str(fichier)],
        check=True, capture_output=True, text=True).stdout
    return float(json.loads(sortie)["format"]["duration"])


class Sequence:
    """Liste d'images avec leur durée, au format attendu par l'assembleur de ffmpeg."""

    def __init__(self, dossier):
        self.dossier, self.lignes, self.compteur, self.total, self.precedente = dossier, [], 0, 0.0, None

    def _ecrire(self, image, secondes):
        chemin = self.dossier / f"{self.compteur:05d}.png"
        image.save(chemin, compress_level=1)
        self.compteur += 1
        self.lignes += [f"file '{chemin.as_posix()}'", f"duration {secondes:.4f}"]
        self.total += secondes

    def montrer(self, image, secondes):
        """Affiche une image après un fondu depuis la précédente. Le fondu compte dans la durée."""
        reste = secondes
        if self.precedente is not None:
            pas = max(1, int(FONDU_S * IPS))
            for i in range(1, pas + 1):
                self._ecrire(Image.blend(self.precedente, image, i / pas), 1 / IPS)
            reste -= pas / IPS
        self._ecrire(image, max(reste, 1 / IPS))
        self.precedente = image

    def terminer(self):
        # ffmpeg ignore la durée de la dernière entrée s'il n'y a pas d'image après elle.
        dernier = self.lignes[-2]
        fichier = self.dossier / "liste.txt"
        fichier.write_text("\n".join(self.lignes + [dernier]) + "\n", encoding="utf-8")
        return fichier


def construire(slug):
    module = lire_module(slug)
    voix = TRAVAIL / "voix" / f"{slug}.mp3"
    if not voix.exists():
        print("Voix absente, module ignoré :", slug)
        return
    duree_voix = duree(voix)

    dossier = TRAVAIL / "images" / slug
    shutil.rmtree(dossier, ignore_errors=True)
    dossier.mkdir(parents=True)
    seq = Sequence(dossier)
    titre = dessiner_titre(module)
    seq.montrer(titre, INTRO_S)

    # La durée de chaque scène suit la longueur de son texte lu à voix haute.
    longueurs = [len(texte_pour_la_voix(s["narration"])) for s in module["scenes"]]
    somme = sum(longueurs)
    for scene, longueur in zip(module["scenes"], longueurs):
        duree_scene = duree_voix * longueur / somme
        # Les points apparaissent à intervalles réguliers, et le premier est là dès le début.
        n = len(scene["points"])
        for k in range(1, n + 1):
            seq.montrer(dessiner_scene(scene, k), duree_scene / n)

    seq.montrer(dessiner_fin(module), FIN_S)
    seq.montrer(dessiner_fin(module), 0.04)  # image de garde
    liste = seq.terminer()

    MEDIAS.mkdir(exist_ok=True)
    sortie = MEDIAS / f"{slug}.mp4"
    subprocess.run(
        [ffmpeg, "-y", "-loglevel", "error",
         "-f", "concat", "-safe", "0", "-i", str(liste),
         "-itsoffset", str(INTRO_S), "-i", str(voix),
         "-map", "0:v", "-map", "1:a",
         "-vf", f"fps={IPS},format=yuv420p",
         "-c:v", "libx264", "-preset", "medium", "-crf", "24", "-tune", "stillimage",
         "-c:a", "aac", "-b:a", "96k",
         "-af", "apad", "-shortest",
         "-movflags", "+faststart", str(sortie)],
        check=True)
    # Image d'attente affichée sur le site avant la lecture.
    titre.resize((960, 540), Image.LANCZOS).save(MEDIAS / f"{slug}.png", optimize=True)
    print(f"{sortie.name} : {duree(sortie):.1f} s (voix {duree_voix:.1f} s), {sortie.stat().st_size / 1e6:.1f} Mo")
    shutil.rmtree(dossier, ignore_errors=True)


if __name__ == "__main__":
    for s in (sys.argv[1:] or MODULES):
        construire(s)
