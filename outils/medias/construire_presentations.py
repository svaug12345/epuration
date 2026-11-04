"""Fabrique une présentation PowerPoint par module, à partir de data/modules/*.json.

Chaque scène devient une diapositive en pleine image, avec le même visuel que la vidéo.
Le texte de la voix off va dans les notes du présentateur, prêt à être lu.
Il faut d'abord exporter les images : node outils/medias/rendre_diapos.mjs
Usage : python outils/medias/construire_presentations.py
"""
from pptx import Presentation
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE
from pptx.enum.text import PP_ALIGN
from pptx.util import Inches, Pt

from commun import MEDIAS, MODULES, ORANGE, SIGNATURE, TRAVAIL, lire_module

LARGEUR, HAUTEUR = Inches(13.333), Inches(7.5)  # format 16:9
TITRE, CORPS = "Plus Jakarta Sans", "Arial"
SOMBRE, BLANC, DOUX, ORANGE_CLAIR = "17151A", "FFFFFF", "D9D3D2", "F7A25F"


def couleur(code):
    return RGBColor.from_string(code)


def texte(diapo, x, y, l, h, contenu, taille, gras=False, teinte=BLANC, police=CORPS, centre=False):
    zone = diapo.shapes.add_textbox(x, y, l, h)
    cadre = zone.text_frame
    cadre.word_wrap = True
    cadre.text = contenu
    p = cadre.paragraphs[0]
    if centre:
        p.alignment = PP_ALIGN.CENTER
    run = p.runs[0]
    run.font.size, run.font.bold, run.font.name = Pt(taille), gras, police
    run.font.color.rgb = couleur(teinte)
    return zone


def fond_sombre(diapo):
    fond = diapo.background.fill
    fond.solid()
    fond.fore_color.rgb = couleur(SOMBRE)


def signature(diapo, numero=None):
    pied = SIGNATURE + (f" · {numero}" if numero else "")
    zone = texte(diapo, Inches(10.3), Inches(7.02), Inches(2.8), Inches(0.36), pied, 11, teinte=DOUX)
    zone.text_frame.paragraphs[0].alignment = PP_ALIGN.RIGHT


def diapo_titre(prs, module):
    d = prs.slides.add_slide(prs.slide_layouts[6])
    fond_sombre(d)
    halo = d.shapes.add_shape(MSO_SHAPE.OVAL, Inches(9.2), Inches(-2), Inches(7), Inches(7))
    halo.fill.solid()
    halo.fill.fore_color.rgb = couleur(ORANGE)
    halo.line.fill.background()
    # Disque orange seulement décoratif : on le signale aux lecteurs d'écran.
    halo._element.nvSpPr.cNvPr.set("descr", "")
    texte(d, Inches(0.9), Inches(2.0), Inches(9), Inches(0.5), f"Module {module['numero']} sur 7", 22, True, ORANGE_CLAIR, TITRE)
    texte(d, Inches(0.9), Inches(2.55), Inches(10.5), Inches(1.8), module["titre"], 50, True, BLANC, TITRE)
    texte(d, Inches(0.9), Inches(4.7), Inches(10), Inches(1.2), module["accroche"], 22, False, DOUX)
    signature(d)


def diapo_scene(prs, slug, index, scene, numero):
    d = prs.slides.add_slide(prs.slide_layouts[6])
    fond_sombre(d)
    image = d.shapes.add_picture(str(TRAVAIL / "diapos" / f"{slug}-{index}.jpg"), 0, 0, width=LARGEUR, height=HAUTEUR)
    # Texte de remplacement, pour l'accessibilité.
    image._element.nvPicPr.cNvPr.set("descr", f"{scene['titre']} : {' ; '.join(scene['points'])}")
    d.notes_slide.notes_text_frame.text = scene["narration"]
    signature(d, numero)


def diapo_liste(prs, titre, lignes, taille=20):
    d = prs.slides.add_slide(prs.slide_layouts[6])
    fond_sombre(d)
    filet = d.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.7), Inches(1.3), Inches(1.2), Inches(0.07))
    filet.fill.solid()
    filet.fill.fore_color.rgb = couleur(ORANGE)
    filet.line.fill.background()
    texte(d, Inches(0.7), Inches(0.42), Inches(12), Inches(0.9), titre, 34, True, BLANC, TITRE)
    zone = d.shapes.add_textbox(Inches(0.7), Inches(1.6), Inches(11.9), Inches(5.2))
    cadre = zone.text_frame
    cadre.word_wrap = True
    for i, ligne in enumerate(lignes):
        p = cadre.paragraphs[0] if i == 0 else cadre.add_paragraph()
        p.text = f"•  {ligne}"
        p.space_after = Pt(10)
        run = p.runs[0]
        run.font.size, run.font.name = Pt(taille), CORPS
        run.font.color.rgb = couleur(BLANC)
    signature(d)


def construire(slug):
    module = lire_module(slug)
    prs = Presentation()
    prs.slide_width, prs.slide_height = LARGEUR, HAUTEUR
    prs.core_properties.title = module["titre"]
    prs.core_properties.author = SIGNATURE
    prs.core_properties.language = "fr-FR"

    diapo_titre(prs, module)
    for i, scene in enumerate(module["scenes"]):
        diapo_scene(prs, slug, i, scene, i + 2)
    diapo_liste(prs, "Fiche mémo", module["memo"])
    diapo_liste(prs, module["cas"]["titre"], [module["cas"]["enonce"], "Solution : " + module["cas"]["solution"]], 22)
    diapo_liste(prs, "Sources", module["sources"] + [
        "Outil pédagogique : il ne remplace pas une étude de dimensionnement.",
        "Projet personnel indépendant, sans lien avec une entreprise.",
    ], 18)

    sortie = MEDIAS / f"{slug}.pptx"
    prs.save(sortie)
    print(sortie.name, round(sortie.stat().st_size / 1e6, 1), "Mo,", len(prs.slides), "diapositives")


if __name__ == "__main__":
    MEDIAS.mkdir(exist_ok=True)
    for slug in MODULES:
        construire(slug)
