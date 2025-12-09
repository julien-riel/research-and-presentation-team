---
name: chart-generator
description: Création de graphiques et visualisations de données avec ECharts. Sélection du type de graphique optimal, design épuré, export en image haute qualité. Utiliser ce skill pour générer des visualisations de données pour des présentations.
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

## Commandes CLI

```bash
# Générer un graphique à partir d'une configuration
npx tsx src/cli/chart-render.ts --config chart.json --output chart.png

# Générer avec un template
npx tsx src/cli/chart-render.ts --template bar --data data.csv --output chart.png

# Prévisualiser (génère HTML interactif)
npx tsx src/cli/chart-render.ts --config chart.json --preview
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
│   ├── Statique → Pie / Treemap
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

### 4. Small Multiples

Préférer plusieurs petits graphiques identiques à un seul graphique surchargé.

```
┌─────┐ ┌─────┐ ┌─────┐
│ Q1  │ │ Q2  │ │ Q3  │
│ ╱   │ │  ╱  │ │   ╲ │
└─────┘ └─────┘ └─────┘
```

## Variables Visuelles (Bertin)

| Variable | Efficacité pour quantitatif | Usage recommandé |
|----------|----------------------------|------------------|
| **Position** | ★★★★★ | Toujours prioritaire |
| **Longueur** | ★★★★☆ | Bar charts |
| **Angle** | ★★☆☆☆ | Éviter (pie charts) |
| **Aire** | ★★☆☆☆ | Bubble charts avec prudence |
| **Couleur (saturation)** | ★★☆☆☆ | Heat maps |
| **Couleur (teinte)** | ★☆☆☆☆ | Catégories seulement |

## Configuration ECharts

### Structure de Base

```json
{
  "title": {
    "text": "Titre clair et descriptif",
    "subtext": "Source: Dataset XYZ, 2024",
    "left": "center"
  },
  "tooltip": {
    "trigger": "axis"
  },
  "xAxis": {
    "type": "category",
    "data": ["A", "B", "C"]
  },
  "yAxis": {
    "type": "value",
    "name": "Unité (€)"
  },
  "series": [{
    "type": "bar",
    "data": [120, 200, 150]
  }]
}
```

### Style Tufte-Compliant

```json
{
  "backgroundColor": "#ffffff",
  "textStyle": {
    "fontFamily": "Arial, sans-serif",
    "color": "#333333"
  },
  "xAxis": {
    "axisLine": { "show": false },
    "axisTick": { "show": false },
    "splitLine": { "show": false }
  },
  "yAxis": {
    "axisLine": { "show": false },
    "axisTick": { "show": false },
    "splitLine": {
      "lineStyle": { "color": "#eeeeee", "type": "dashed" }
    }
  },
  "series": [{
    "itemStyle": {
      "color": "#4A90A4"
    },
    "label": {
      "show": true,
      "position": "top"
    }
  }]
}
```

## Palettes de Couleurs

### Règles de Base

1. **Maximum 6-7 couleurs** distinctes
2. **Une couleur d'accent** pour mettre en évidence
3. **Couleurs accessibles** (contraste suffisant, deutéranopie-safe)
4. **Cohérence** dans toute la présentation

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

## Export

### Formats

| Format | Usage | Résolution |
|--------|-------|------------|
| PNG | Présentations | 2x (retina) |
| SVG | Web, zoom | Vectoriel |
| PDF | Impression | Vectoriel |

### Dimensions Recommandées

| Contexte | Largeur | Hauteur | Aspect |
|----------|---------|---------|--------|
| Slide pleine largeur | 1920px | 1080px | 16:9 |
| Demi-slide | 960px | 720px | 4:3 |
| Rapport A4 | 1200px | 800px | 3:2 |

## Références

Consulte `references/chart-selection-guide.md` pour le guide détaillé de sélection.
