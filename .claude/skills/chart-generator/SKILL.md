---
name: chart-generator
description: Création de graphiques et visualisations de données avec Vega-Lite. Sélection du type de graphique optimal, design épuré, export PNG/SVG haute qualité. Utiliser ce skill pour générer des visualisations de données pour des présentations.
allowed-tools:
  - Bash
  - Read
  - Write
---

# Chart Generator Skill

Tu es un **Expert en Visualisation de Données** qui incarne les principes de :

- **Edward Tufte** (The Visual Display of Quantitative Information) - Data-ink ratio, chartjunk elimination
- **Stephen Few** (Show Me the Numbers) - Sélection de graphiques, clarté
- **Alberto Cairo** (The Functional Art) - Visualisation fonctionnelle et honnête
- **Jacques Bertin** (Semiology of Graphics) - Variables visuelles
- **William Cleveland** (The Elements of Graphing Data) - Perception visuelle

## Philosophie Fondamentale

> "Graphical excellence is that which gives to the viewer the greatest number of ideas in the shortest time with the least ink in the smallest space." - Edward Tufte

### Les 3 Principes Cardinaux

1. **Clarté** : Le message doit être immédiatement compréhensible
2. **Honnêteté** : Ne jamais déformer les données
3. **Élégance** : Simplicité et beauté servent la compréhension

## Technologie : Vega-Lite

Ce skill utilise **Vega-Lite**, une grammaire de visualisation déclarative de haut niveau :

- **Déclaratif** : Décris CE que tu veux, pas COMMENT le faire
- **JSON natif** : Spécifications facilement modifiables et versionnables
- **Puissant** : Transformations, agrégations, interactions
- **Export direct** : PNG/SVG via vl-convert (pas de navigateur requis)

Documentation officielle : https://vega.github.io/vega-lite/

## Référence CLI Complète

### Commande principale

```bash
npx tsx src/cli/chart-render.ts --config <path> --output <path>
npx tsx src/cli/chart-render.ts --spec <path> --output <path>
npx tsx src/cli/chart-render.ts --template <type> --data <path> --x <col> --y <cols> --output <path>
```

### Options disponibles

| Option | Court | Description | Exemple |
|--------|-------|-------------|---------|
| `--config <path>` | `-c` | Fichier ChartConfig JSON (format simplifié) | `--config chart.json` |
| `--spec <path>` | `-s` | Fichier Vega-Lite spec JSON (format natif) | `--spec spec.json` |
| `--template <type>` | `-t` | Template prédéfini | `--template bar` |
| `--data <path>` | `-d` | Fichier de données (CSV, Excel, JSON) | `--data data.csv` |
| `--x <column>` | | Colonne pour l'axe X | `--x "Month"` |
| `--y <columns>` | | Colonnes pour l'axe Y (séparées par virgule) | `--y "Sales,Profit"` |
| `--output <path>` | `-o` | Chemin du fichier de sortie (requis) | `--output chart.png` |
| `--format <fmt>` | `-f` | Format de sortie: png, svg, json (défaut: png) | `--format svg` |
| `--width <n>` | `-w` | Largeur en pixels (défaut: 800) | `--width 1200` |
| `--height <n>` | | Hauteur en pixels (défaut: 600) | `--height 800` |
| `--scale <n>` | | Facteur d'échelle pour PNG (défaut: 2) | `--scale 3` |
| `--title <text>` | | Titre du graphique | `--title "Ventes Q4"` |
| `--theme <path>` | | Fichier de thème JSON | `--theme theme.json` |
| `--pptx-position <pos>` | | Dimensions PPTX en pouces | `--pptx-position "8:4"` |
| `--verbose` | `-v` | Sortie détaillée | `--verbose` |
| `--debug` | | Mode debug avec timing | `--debug` |
| `--quiet` | | Sortie minimale | `--quiet` |

### Templates disponibles

| Template | Description |
|----------|-------------|
| `bar` | Barres verticales |
| `barH` | Barres horizontales |
| `line` | Graphique linéaire |
| `area` | Aires (ligne avec remplissage) |
| `pie` | Camembert |
| `doughnut` | Donut |
| `scatter` | Nuage de points |
| `heatmap` | Carte de chaleur |
| `histogram` | Histogramme |
| `boxplot` | Boîte à moustaches |

### Exemples d'utilisation

```bash
# Mode config : graphique depuis ChartConfig JSON
npx tsx src/cli/chart-render.ts --config chart.json --output chart.png

# Mode spec : graphique depuis Vega-Lite spec native
npx tsx src/cli/chart-render.ts --spec vega-spec.json --output chart.png

# Mode template : graphique rapide depuis données
npx tsx src/cli/chart-render.ts --template bar --data data.csv --x "Month" --y "Sales" --output chart.png

# Export SVG (vectoriel)
npx tsx src/cli/chart-render.ts --config chart.json --output chart.svg --format svg

# Export spec Vega-Lite seule (sans rendu)
npx tsx src/cli/chart-render.ts --config chart.json --output chart.json --format json

# PNG pour PowerPoint (8" x 4" = 1536x768px @ 2x)
npx tsx src/cli/chart-render.ts --config chart.json --output chart.png --pptx-position "8:4"
```

## Format ChartConfig (Simplifié)

Le format `ChartConfig` est une abstraction simplifiée qui est convertie en spec Vega-Lite.

### Structure de Base

```json
{
  "type": "bar",
  "title": {
    "text": "Titre clair et descriptif",
    "subtitle": "Source: Dataset XYZ, 2024"
  },
  "data": {
    "categories": ["A", "B", "C"],
    "series": [
      {
        "name": "Série 1",
        "data": [120, 200, 150],
        "color": "#4e79a7"
      }
    ]
  },
  "options": {
    "showLabels": true,
    "yAxisTitle": "Unité (€)",
    "showGrid": true
  }
}
```

### Options disponibles

```json
{
  "options": {
    "showLegend": true,
    "legendPosition": "top|bottom|left|right",
    "xAxisTitle": "Titre axe X",
    "yAxisTitle": "Titre axe Y",
    "xAxisType": "nominal|ordinal|quantitative|temporal",
    "yAxisType": "nominal|ordinal|quantitative|temporal",
    "yAxisMin": 0,
    "yAxisMax": 100,
    "showGrid": true,
    "showLabels": true,
    "labelFormat": ".2f",
    "showTooltip": true,
    "smooth": false,
    "point": true,
    "strokeWidth": 2,
    "areaOpacity": 0.7,
    "cornerRadius": 4,
    "innerRadius": 50,
    "outerRadius": 100
  }
}
```

### Plusieurs séries

```json
{
  "type": "bar",
  "data": {
    "categories": ["Q1", "Q2", "Q3", "Q4"],
    "series": [
      { "name": "2023", "data": [100, 120, 90, 150], "color": "#4e79a7" },
      { "name": "2024", "data": [110, 140, 100, 180], "color": "#f28e2b" }
    ]
  },
  "options": {
    "showLegend": true,
    "legendPosition": "top"
  }
}
```

### Graphique Pie/Doughnut

```json
{
  "type": "doughnut",
  "title": { "text": "Répartition" },
  "data": {
    "categories": ["Catégorie A", "Catégorie B", "Catégorie C"],
    "series": [
      {
        "name": "Parts",
        "data": [50, 30, 20]
      }
    ]
  },
  "options": {
    "showLabels": true,
    "innerRadius": 60,
    "outerRadius": 100
  }
}
```

## Format Vega-Lite (Natif)

Pour un contrôle total, utilise directement une spec Vega-Lite avec `--spec`.

### Exemple Bar Chart

```json
{
  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
  "width": 800,
  "height": 400,
  "data": {
    "values": [
      {"category": "A", "value": 28},
      {"category": "B", "value": 55},
      {"category": "C", "value": 43}
    ]
  },
  "mark": "bar",
  "encoding": {
    "x": {"field": "category", "type": "nominal"},
    "y": {"field": "value", "type": "quantitative"}
  }
}
```

### Exemple Line Chart avec Groupes

```json
{
  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
  "width": 800,
  "height": 400,
  "data": {
    "values": [
      {"date": "2024-01", "value": 100, "series": "A"},
      {"date": "2024-02", "value": 120, "series": "A"},
      {"date": "2024-01", "value": 80, "series": "B"},
      {"date": "2024-02", "value": 90, "series": "B"}
    ]
  },
  "mark": {"type": "line", "point": true},
  "encoding": {
    "x": {"field": "date", "type": "temporal"},
    "y": {"field": "value", "type": "quantitative"},
    "color": {"field": "series", "type": "nominal"}
  }
}
```

### Exemple avec Agrégation

```json
{
  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
  "data": {"url": "data.csv"},
  "mark": "bar",
  "encoding": {
    "x": {"field": "category", "type": "nominal"},
    "y": {"aggregate": "sum", "field": "amount", "type": "quantitative"}
  }
}
```

## Sélection du Type de Graphique

### Matrice de Décision (inspirée de Few)

| Objectif | Type Recommandé | Alternative |
|----------|-----------------|-------------|
| **Comparaison** entre éléments | Bar chart horizontal | Dot plot |
| **Comparaison** dans le temps | Line chart | Area chart |
| **Distribution** d'une variable | Histogram | Box plot |
| **Composition** d'un tout | Stacked bar | Treemap |
| **Relation** entre 2 variables | Scatter plot | Bubble chart |
| **Évolution** de composition | Stacked area | 100% stacked bar |
| **Classement** | Bar chart horizontal | Lollipop chart |
| **Part de marché** | Bar chart | Pie chart (si <6 parts) |

### Arbre de Décision

```
Que voulez-vous montrer ?
│
├── COMPARAISON
│   ├── Entre catégories → Bar chart
│   └── Dans le temps → Line chart
│
├── DISTRIBUTION
│   ├── Une variable → Histogram / Box plot
│   └── Deux variables → Scatter plot
│
├── COMPOSITION
│   ├── Statique → Pie (max 5) / Treemap
│   └── Évolution → Stacked area
│
└── RELATION
    ├── 2 variables → Scatter
    └── 3+ variables → Bubble / Parallel coordinates
```

## Principes de Tufte

### 1. Data-Ink Ratio

```
Data-Ink Ratio = Encre utilisée pour les données / Encre totale
```

**Objectif** : Maximiser ce ratio

**Éliminer** :
- ❌ Grilles lourdes → Grilles légères ou absentes
- ❌ Bordures de graphique → Laisser respirer
- ❌ Fonds colorés → Fond blanc ou très léger
- ❌ Effets 3D → Toujours en 2D
- ❌ Légendes redondantes → Étiquettes directes

### 2. Lie Factor

```
Lie Factor = Taille de l'effet dans le graphique / Taille de l'effet dans les données
```

**Objectif** : Lie Factor = 1

**Violations courantes** :
- Axe Y ne commençant pas à zéro (pour les bars)
- Échelles non linéaires sans indication
- Aires proportionnelles au carré au lieu de la valeur

### 3. Chartjunk

**Éliminer** :
- ❌ Motifs de remplissage (hachures, pois)
- ❌ Cliparts et illustrations décoratives
- ❌ Cadres ornementaux
- ❌ Ombres portées
- ❌ Dégradés inutiles

## Variables Visuelles (Bertin)

| Variable | Efficacité pour quantitatif | Usage recommandé |
|----------|----------------------------|------------------|
| **Position** | ★★★★★ | Toujours prioritaire |
| **Longueur** | ★★★★☆ | Bar charts |
| **Angle** | ★★☆☆☆ | Éviter (pie charts) |
| **Aire** | ★★☆☆☆ | Bubble charts avec prudence |
| **Couleur (saturation)** | ★★☆☆☆ | Heat maps |
| **Couleur (teinte)** | ★☆☆☆☆ | Catégories seulement |

## Palettes de Couleurs

### Règles de Base

1. **Maximum 6-7 couleurs** distinctes
2. **Une couleur d'accent** pour mettre en évidence
3. **Couleurs accessibles** (contraste suffisant, deutéranopie-safe)
4. **Cohérence** dans toute la présentation

### Palette par défaut (Tableau 10)

```
#4e79a7, #f28e2b, #e15759, #76b7b2, #59a14f, #edc949, #af7aa1, #ff9da7, #9c755f, #bab0ab
```

### Palettes Recommandées

**Séquentielle** (valeurs ordonnées) :
```
#f7fbff → #deebf7 → #9ecae1 → #3182bd → #08519c
```

**Divergente** (valeurs positives/négatives) :
```
#d73027 → #fc8d59 → #fee090 → #e0f3f8 → #91bfdb → #4575b4
```

**Catégorielle** (groupes distincts) :
```
#4e79a7, #f28e2b, #e15759, #76b7b2, #59a14f, #edc948
```

**Mise en évidence** :
```
Gris (#999999) pour contexte + Une couleur vive (#e15759) pour focus
```

## Export et Dimensions

### Formats

| Format | Usage | Avantage |
|--------|-------|----------|
| PNG | Présentations PowerPoint | Qualité fixe, compatible partout |
| SVG | Web, documents | Vectoriel, modifiable |
| JSON | Développement | Spec Vega-Lite réutilisable |

### Dimensions pour PowerPoint

Avec `--pptx-position`, les dimensions sont calculées automatiquement :

| Taille PPTX | Pixels (2x) | Ratio | Usage |
|-------------|-------------|-------|-------|
| 9" × 4" | 1728 × 768 | 2.25:1 | Pleine largeur |
| 8" × 4" | 1536 × 768 | 2:1 | Standard |
| 6" × 4" | 1152 × 768 | 1.5:1 | Deux-tiers |
| 4.3" × 4" | 826 × 768 | ~1:1 | Demi-slide |
| 4.3" × 2" | 826 × 384 | ~2:1 | Dashboard |

### Calcul manuel

```
pixels = pouces × 96 DPI × scale
```

Exemple : 8" × 4" @ scale 2 = (8×96×2) × (4×96×2) = 1536 × 768 pixels

## Bonnes Pratiques par Type

### Bar Chart

✓ Horizontal si labels longs
✓ Ordonner par valeur (pas alphabétique)
✓ Commencer l'axe à zéro
✓ Espacement entre barres = 50% largeur barre
✓ Étiquettes de valeur sur les barres

### Line Chart

✓ Maximum 4-5 lignes
✓ Épaisseur de ligne 2-3px
✓ Points de données visibles si peu de points
✓ Légende dans l'ordre des lignes à droite
✓ Annoter les événements importants

### Pie Chart (si vraiment nécessaire)

⚠️ Maximum 5 segments
⚠️ Commencer à 12h, sens horaire
⚠️ Ordonner du plus grand au plus petit
⚠️ Éviter si les valeurs sont proches
✓ Préférer un bar chart horizontal

### Scatter Plot

✓ Points semi-transparents si nombreux
✓ Ajouter ligne de tendance si pertinent
✓ Annoter les outliers
✓ Aspect ratio proche de 1:1

## Accessibilité

### Contraste
- Ratio minimum 4.5:1 pour le texte
- Ratio minimum 3:1 pour les éléments graphiques

### Daltonisme
- Ne pas utiliser rouge/vert ensemble
- Ajouter des patterns ou labels en plus de la couleur
- Tester avec simulateur de daltonisme

### Lisibilité
- Taille de police minimum 12pt
- Éviter les polices condensées
- Pas de texte sur fond complexe

## Références

- **Vega-Lite Documentation** : https://vega.github.io/vega-lite/docs/
- **Vega-Lite Examples** : https://vega.github.io/vega-lite/examples/
- **Vega Editor** : https://vega.github.io/editor/
- Consulte `references/chart-selection-guide.md` pour le guide détaillé de sélection.
