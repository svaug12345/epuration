"""Fabrique une présentation PowerPoint par module, à partir de data/modules/*.json.

Chaque diapositive reprend une scène : titre, points clés, schéma éventuel.
Le texte de la voix off va dans les notes du présentateur, prêt à être lu.
Usage : python outils/medias/construire_presentations.py
"""
from pptx import Presentation
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE
from pptx.enum.text import MSO_ANCHOR
from pptx.util import Inches, Pt

from commun import ANTHRACITE, FOND, MEDIAS, MODULES, ORANGE, SIGNATURE, TAUPE, TRAVAIL, lire_module

LARGEUR, HAUTEUR = Inches(13.333), Inches(7.5)  # format 16:9
POLICE = "Arial"


def couleur(code):
    return RGBColor.from_string(code)


def texte(diapo, x, y, l, h, contenu, taille, gras=False, teinte=ANTHRACITE):
    """Ajoute une zone de texte simple et la renvoie."""
    zone = diapo.shapes.add_textbox(x, y, l, h)
    cadre = zone.text_frame
    cadre.word_wrap = True
    cadre.text = contenu
    run = cadre.paragraphs[0].runs[0]
    run.font.size, run.font.bold, run.font.name = Pt(taille), gras, POLICE
    run.font.color.rgb = couleur(teinte)
    return zone


def fond_et_signature(diapo, numero=None):
    """Fond clair, filet orange discret et signature en bas à droite, sans logo."""
    fond = diapo.background.fill
    fond.solid()
    fond.fore_color.rgb = couleur(FOND)
    filet = diapo.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, LARGEUR, Inches(0.12))
    filet.fill.solid()
    filet.fill.fore_color.rgb = couleur(ORANGE)
    filet.line.fill.background()
    pied = "Outil pédagogique · " + SIGNATURE + (f" · {numero}" if numero else "")
    texte(diapo, Inches(8.3), Inches(6.98), Inches(4.7), Inches(0.4), pied, 11, teinte=TAUPE)\
        .text_frame.paragraphs[0].alignment = 3  # alignement à droite


def diapo_titre(prs, module):
    d = prs.slides.add_slide(prs.slide_layouts[6])
    fond_et_signature(d)
    texte(d, Inches(0.9), Inches(1.9), Inches(11.5), Inches(0.5), f"Module {module['numero']} sur 7", 20, teinte=TAUPE)
    texte(d, Inches(0.9), Inches(2.4), Inches(11.5), Inches(1.6), module["titre"], 44, gras=True)
    texte(d, Inches(0.9), Inches(4.2), Inches(11), Inches(1.2), module["accroche"], 22, teinte=TAUPE)


def diapo_scene(prs, scene, numero):
    d = prs.slides.add_slide(prs.slide_layouts[6])
    fond_et_signature(d, numero)
    texte(d, Inches(0.7), Inches(0.45), Inches(12), Inches(1), scene["titre"], 32, gras=True)

    avec_schema = bool(scene.get("schema"))
    largeur_points = Inches(4.9) if avec_schema else Inches(11.5)
    zone = d.shapes.add_textbox(Inches(0.7), Inches(1.75), largeur_points, Inches(4.8))
    cadre = zone.text_frame
    cadre.word_wrap = True
    cadre.vertical_anchor = MSO_ANCHOR.TOP
    for i, point in enumerate(scene["points"]):
        p = cadre.paragraphs[0] if i == 0 else cadre.add_paragraph()
        p.text = f"•  {point}"
        p.space_after = Pt(16)
        run = p.runs[0]
        run.font.size, run.font.name = Pt(22 if avec_schema else 26), POLICE
        run.font.color.rgb = couleur(ANTHRACITE)

    if avec_schema:
        image = TRAVAIL / "schemas" / f"{scene['schema']}.png"
        d.shapes.add_picture(str(image), Inches(5.85), Inches(1.7), width=Inches(7.0))
    d.notes_slide.notes_text_frame.text = scene["narration"]


def diapo_liste(prs, titre, lignes, taille=20):
    d = prs.slides.add_slide(prs.slide_layouts[6])
    fond_et_signature(d)
    texte(d, Inches(0.7), Inches(0.45), Inches(12), Inches(1), titre, 32, gras=True)
    zone = d.shapes.add_textbox(Inches(0.7), Inches(1.6), Inches(11.9), Inches(5.2))
    cadre = zone.text_frame
    cadre.word_wrap = True
    for i, ligne in enumerate(lignes):
        p = cadre.paragraphs[0] if i == 0 else cadre.add_paragraph()
        p.text = f"•  {ligne}"
        p.space_after = Pt(9)
        run = p.runs[0]
        run.font.size, run.font.name = Pt(taille), POLICE
        run.font.color.rgb = couleur(ANTHRACITE)


def construire(slug):
    module = lire_module(slug)
    prs = Presentation()
    prs.slide_width, prs.slide_height = LARGEUR, HAUTEUR
    prs.core_properties.title = module["titre"]
    prs.core_properties.author = SIGNATURE
    prs.core_properties.language = "fr-FR"

    diapo_titre(prs, module)
    for i, scene in enumerate(module["scenes"], start=2):
        diapo_scene(prs, scene, i)
    diapo_liste(prs, "Fiche mémo", module["memo"])
    diapo_liste(prs, module["cas"]["titre"], [module["cas"]["enonce"], "Solution : " + module["cas"]["solution"]], 22)
    diapo_liste(prs, "Sources", module["sources"] + [
        "Outil pédagogique : il ne remplace pas une étude de dimensionnement.",
        "Projet personnel indépendant, sans lien avec une entreprise.",
    ], 18)

    sortie = MEDIAS / f"{slug}.pptx"
    prs.save(sortie)
    print(sortie.name, sortie.stat().st_size, "octets,", len(prs.slides), "diapositives")


if __name__ == "__main__":
    MEDIAS.mkdir(exist_ok=True)
    for slug in MODULES:
        construire(slug)
