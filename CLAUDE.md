# Guide d'Utilisation - Presentation Team

Ce projet utilise Claude Code pour créer des présentations PowerPoint professionnelles à partir de données et documents.

## Prérequis

```bash
cd research-and-presentation-team
npm install
```

## Workflow de Création de Présentation

### Vue d'Ensemble

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   DONNÉES   │────▶│  ANALYSE    │────▶│  STRUCTURE  │────▶│    PPTX     │
│  Excel/CSV  │     │  Insights   │     │  Storytelling│    │   Final     │
│  PDF/Docs   │     │  Graphiques │     │  Slides     │     │             │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
```

## Commandes pour Claude

### 1. Analyser des Données (Excel/CSV)

```
Lis le fichier data.xlsx et donne-moi :
- Un aperçu des données (colonnes, types, qualité)
- Les statistiques descriptives
- Les corrélations intéressantes
- Les tendances si il y a des dates
```

```
Analyse le fichier ventes.csv :
- Identifie les KPIs principaux
- Trouve les insights les plus importants
- Suggère des visualisations pertinentes
```

### 2. Comprendre un Domaine (PDF/Documents)

```
Lis le document rapport-annuel.pdf et extrais :
- Les points clés à communiquer
- Les chiffres importants
- Les tendances et conclusions
```

```
Analyse ces documents sur [sujet] et prépare un résumé
structuré pour une présentation de 15 minutes.
```

### 3. Créer une Présentation

#### Option A : Présentation complète guidée

```
Crée une présentation PowerPoint sur [sujet] en utilisant :
- Les données du fichier data.xlsx
- Une durée de 20 minutes
- Une audience de dirigeants

La présentation doit :
- Commencer par un hook accrocheur
- Présenter 3 insights clés avec visualisations
- Conclure avec des recommandations actionnables
```

#### Option B : Étape par étape

```
1. "Analyse les données de data.xlsx et identifie les 5 insights principaux"

2. "Propose une structure de présentation de 15 slides basée sur ces insights"

3. "Crée les graphiques pour illustrer chaque insight"

4. "Génère le fichier PowerPoint final"
```

### 4. Personnaliser le Style

```
Utilise un thème professionnel bleu corporate pour la présentation.
```

```
Crée une présentation avec le style suivant :
- Palette : bleu foncé (#1E3A5F) et orange (#EE6C4D)
- Police : Arial
- Style : minimaliste, peu de texte, beaucoup de visuels
```

## Exemples de Prompts par Cas d'Usage

### Rapport Mensuel / Trimestriel

```
J'ai un fichier Excel avec les KPIs du mois (kpis-novembre.xlsx).
Crée une présentation de revue mensuelle pour le comité de direction :
- 10-12 slides
- Focus sur : performance vs objectifs, tendances, alertes
- Inclure des graphiques de comparaison avec le mois précédent
- Terminer par les priorités du mois prochain
```

### Pitch Commercial / Investisseurs

```
À partir du fichier business-plan.xlsx et du document market-study.pdf,
crée un pitch deck de 10 slides pour des investisseurs :
- Hook avec le problème marché
- Notre solution et différenciation
- Traction et métriques clés
- Projection financière
- L'ask (montant recherché)
```

### Formation / Workshop

```
Crée une présentation de formation sur [sujet] :
- 30 minutes de contenu
- Alternance théorie/exercices
- Slides visuels avec peu de texte
- Inclure des diagrammes explicatifs
- Quiz récapitulatif à la fin
```

### Analyse de Données Exploratoire

```
Voici un dataset (data.csv) que je ne connais pas bien.
1. Explore les données et dis-moi ce qu'elles contiennent
2. Identifie les patterns et anomalies intéressantes
3. Crée une présentation de 10 slides résumant tes découvertes
   avec les visualisations appropriées
```

## Formats de Fichiers Supportés

### Données Structurées
| Format | Extension | Usage |
|--------|-----------|-------|
| Excel | .xlsx, .xls | Données tabulaires, multi-feuilles |
| CSV | .csv | Données simples, export de systèmes |
| TSV | .tsv | Données avec tabulations |
| JSON | .json | Données structurées, APIs |

### Documents
| Format | Extension | Usage |
|--------|-----------|-------|
| PDF | .pdf | Rapports, études, documents |
| Word | .docx | Documents texte |
| Markdown | .md | Documentation |
| Texte | .txt | Notes, logs |

## Structure de Sortie

### Fichier PowerPoint (.pptx)
Le fichier généré sera placé dans le dossier `output/`.

### Graphiques
Les graphiques sont générés en PNG haute résolution dans `output/charts/`.

### Diagrammes
Les diagrammes Mermaid/PlantUML sont générés dans `output/diagrams/`.

## Tips pour de Meilleurs Résultats

### 1. Soyez Spécifique sur l'Audience

```
❌ "Crée une présentation sur les ventes"
✅ "Crée une présentation des ventes Q4 pour le comité de direction,
    focus sur la croissance et les défis, 15 minutes max"
```

### 2. Indiquez le Niveau de Détail

```
❌ "Analyse ce fichier"
✅ "Analyse ce fichier et donne-moi :
    - 3 insights principaux avec chiffres
    - Les anomalies à investiguer
    - Une recommandation d'action"
```

### 3. Précisez le Style Visuel

```
❌ "Fais des graphiques"
✅ "Crée des graphiques épurés style Tufte :
    - Pas de grilles lourdes
    - Couleurs sobres
    - Annotations sur les points clés"
```

### 4. Demandez des Itérations

```
"Montre-moi d'abord la structure proposée avant de générer les slides"

"Propose 3 variantes de graphique pour ce data et je choisirai"

"Ajuste le slide 5 pour mettre plus en avant le chiffre de croissance"
```

## Commandes CLI Disponibles

```bash
# Lire et analyser des données
npx tsx src/cli/data-read.ts --file data.xlsx --schema --preview

# Analyse statistique
npx tsx src/cli/data-analyze.ts --file data.csv --describe --correlations

# Générer un graphique
npx tsx src/cli/chart-render.ts --config chart.json --output chart.png

# Générer un diagramme
npx tsx src/cli/diagram-render.ts --type mermaid --input flow.mmd --output flow.png

# Construire la présentation
npx tsx src/cli/pptx-build.ts --spec presentation.json --output slides.pptx
```

## Résolution de Problèmes

### "Le fichier Excel ne se lit pas bien"
```
Précise la feuille : "Lis la feuille 'Données' du fichier data.xlsx"
Ou : "Ignore les 2 premières lignes qui sont des en-têtes"
```

### "Les graphiques ne sont pas assez clairs"
```
"Simplifie le graphique : garde seulement les 5 catégories principales,
 ajoute les valeurs sur les barres, utilise une seule couleur avec
 la catégorie clé en couleur d'accent"
```

### "La présentation est trop longue"
```
"Condense la présentation en 10 slides max :
 - Fusionne les slides similaires
 - Garde uniquement les 3 messages clés
 - Mets les détails en annexe"
```

## Skills Utilisés

Ce projet utilise 8 skills spécialisés :

1. **data-reader** - Lecture de fichiers de données
2. **data-analyst** - Analyse statistique
3. **data-storytelling** - Transformation en narratif
4. **chart-generator** - Création de graphiques
5. **diagram-generator** - Création de diagrammes
6. **presentation-architect** - Structure de présentation
7. **theme-designer** - Design visuel
8. **pptx-builder** - Génération PowerPoint

Chaque skill est documenté dans `skills/[nom]/SKILL.md`.
