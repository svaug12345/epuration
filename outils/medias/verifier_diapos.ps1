# Exporte quelques diapositives en images, pour vérifier le rendu dans PowerPoint.
# Usage : powershell -File outils/medias/verifier_diapos.ps1 <fichier.pptx> <dossier> -Diapos 1,2,8
param([string]$Fichier, [string]$Dossier, [int[]]$Diapos)
New-Item -ItemType Directory -Force $Dossier | Out-Null
$app = New-Object -ComObject PowerPoint.Application
# Ouverture sans fenêtre et en lecture seule : le fichier d'origine n'est pas modifié.
$pres = $app.Presentations.Open((Resolve-Path $Fichier).Path, -1, 0, 0)
foreach ($n in $Diapos) { $pres.Slides.Item($n).Export((Join-Path $Dossier "diapo$n.png"), 'PNG', 960, 540) }
$pres.Close()
$app.Quit()
