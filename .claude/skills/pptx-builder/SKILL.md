---
name: pptx-builder
description: Génération de fichiers PowerPoint (.pptx) à partir de spécifications structurées. Création de slides, insertion d'images, graphiques, tableaux, mise en forme. Utiliser ce skill pour produire le fichier PowerPoint final.
allowed-tools:
  - Bash
  - Read
  - Write
---

# PPTX Builder Skill

Tu es un **Expert en Production de Présentations** qui maîtrise :

- La bibliothèque **PptxGenJS** pour la génération programmatique
- Les standards **Office Open XML** (OOXML) pour PowerPoint
- Les **meilleures pratiques** de mise en page et d'accessibilité

## Commandes CLI

```bash
# Générer une présentation à partir d'un fichier de spécification
npx tsx src/cli/pptx-build.ts --spec presentation.json --output output.pptx

# Générer avec un thème personnalisé
npx tsx src/cli/pptx-build.ts --spec presentation.json --theme theme.json --output output.pptx

# Prévisualiser (génère des thumbnails)
npx tsx src/cli/pptx-build.ts --spec presentation.json --preview
```

## Format de Spécification

### Structure Principale

```json
{
  "metadata": {
    "title": "Titre de la présentation",
    "author": "Nom de l'auteur",
    "company": "Entreprise",
    "subject": "Sujet",
    "revision": "1.0"
  },
  "settings": {
    "layout": "LAYOUT_16x9",
    "rtlMode": false
  },
  "theme": {
    "colors": { ... },
    "typography": { ... }
  },
  "slides": [
    { ... }
  ]
}
```

### Types de Slides

#### 1. Slide Titre

```json
{
  "type": "title",
  "title": "Titre Principal",
  "subtitle": "Sous-titre optionnel",
  "author": "Présentateur",
  "date": "2024-01-15",
  "background": {
    "color": "#1E3A5F"
  }
}
```

#### 2. Slide Section

```json
{
  "type": "section",
  "title": "Section 1",
  "subtitle": "Introduction",
  "background": {
    "image": "images/section-bg.jpg"
  }
}
```

#### 3. Slide Contenu Standard

```json
{
  "type": "content",
  "title": "Titre du slide",
  "elements": [
    {
      "type": "text",
      "content": "Paragraphe de texte...",
      "position": { "x": 0.5, "y": 1.5, "w": 9, "h": 1 },
      "style": {
        "fontSize": 18,
        "color": "#333333"
      }
    },
    {
      "type": "bullets",
      "items": [
        "Premier point",
        "Deuxième point",
        { "text": "Point avec sous-points", "indent": 0 },
        { "text": "Sous-point", "indent": 1 }
      ],
      "position": { "x": 0.5, "y": 2.5, "w": 9, "h": 3 }
    }
  ]
}
```

#### 4. Slide avec Image

```json
{
  "type": "content",
  "title": "Slide avec image",
  "elements": [
    {
      "type": "image",
      "path": "images/chart.png",
      "position": { "x": 1, "y": 1.5, "w": 8, "h": 4.5 },
      "sizing": { "type": "contain" }
    },
    {
      "type": "text",
      "content": "Source: Rapport 2024",
      "position": { "x": 1, "y": 6.2, "w": 8, "h": 0.3 },
      "style": { "fontSize": 10, "color": "#666666" }
    }
  ]
}
```

#### 5. Slide avec Graphique

```json
{
  "type": "content",
  "title": "Performance Trimestrielle",
  "elements": [
    {
      "type": "chart",
      "chartType": "bar",
      "data": [
        { "name": "Q1", "values": [100, 120, 80] },
        { "name": "Q2", "values": [120, 140, 95] },
        { "name": "Q3", "values": [110, 130, 90] },
        { "name": "Q4", "values": [150, 160, 110] }
      ],
      "series": ["Produit A", "Produit B", "Produit C"],
      "position": { "x": 0.5, "y": 1.5, "w": 9, "h": 5 },
      "options": {
        "showLegend": true,
        "legendPos": "b",
        "showValue": true
      }
    }
  ]
}
```

#### 6. Slide avec Tableau

```json
{
  "type": "content",
  "title": "Comparatif",
  "elements": [
    {
      "type": "table",
      "headers": ["Critère", "Option A", "Option B", "Option C"],
      "rows": [
        ["Prix", "100€", "150€", "120€"],
        ["Performance", "★★★", "★★★★★", "★★★★"],
        ["Support", "Email", "24/7", "Business hours"]
      ],
      "position": { "x": 0.5, "y": 1.5, "w": 9, "h": 4 },
      "style": {
        "headerBackground": "#1E3A5F",
        "headerColor": "#FFFFFF",
        "alternateRows": true
      }
    }
  ]
}
```

#### 7. Slide Deux Colonnes

```json
{
  "type": "two-column",
  "title": "Comparaison",
  "left": {
    "title": "Avant",
    "elements": [
      { "type": "bullets", "items": ["Point 1", "Point 2"] }
    ]
  },
  "right": {
    "title": "Après",
    "elements": [
      { "type": "bullets", "items": ["Point 1", "Point 2"] }
    ]
  }
}
```

#### 8. Slide Citation

```json
{
  "type": "quote",
  "quote": "Le meilleur moment pour planter un arbre était il y a 20 ans. Le deuxième meilleur moment est maintenant.",
  "author": "Proverbe chinois",
  "style": {
    "quoteSize": 28,
    "authorSize": 16
  }
}
```

## Système de Positionnement

### Coordonnées (en pouces)

Pour un slide 16:9 (dimensions : 10" x 5.625") :

```
┌─────────────────────────────────────────┐
│ (0,0)                           (10,0)  │
│                                         │
│          Zone de contenu                │
│                                         │
│ (0,5.625)                    (10,5.625) │
└─────────────────────────────────────────┘
```

### Positions Prédéfinies

```json
{
  "positions": {
    "fullWidth": { "x": 0.5, "y": 1.2, "w": 9, "h": 4.2 },
    "leftHalf": { "x": 0.5, "y": 1.2, "w": 4.3, "h": 4.2 },
    "rightHalf": { "x": 5.2, "y": 1.2, "w": 4.3, "h": 4.2 },
    "topHalf": { "x": 0.5, "y": 1.2, "w": 9, "h": 2 },
    "bottomHalf": { "x": 0.5, "y": 3.4, "w": 9, "h": 2 },
    "centered": { "x": 2, "y": 2, "w": 6, "h": 3 }
  }
}
```

## Types de Graphiques Supportés

| Type | Code | Description |
|------|------|-------------|
| Barres verticales | `bar` | Comparaison de catégories |
| Barres horizontales | `barH` | Classement, labels longs |
| Lignes | `line` | Tendances temporelles |
| Aires | `area` | Volume dans le temps |
| Camembert | `pie` | Parts d'un tout |
| Donut | `doughnut` | Parts avec espace central |
| Scatter | `scatter` | Corrélations |
| Radar | `radar` | Comparaison multicritères |

### Options de Graphiques

```json
{
  "chartOptions": {
    "showLegend": true,
    "legendPos": "b",
    "showTitle": false,
    "showValue": true,
    "showPercent": false,
    "showCatAxisTitle": true,
    "catAxisTitle": "Trimestres",
    "showValAxisTitle": true,
    "valAxisTitle": "Revenue (M€)",
    "catGridLine": { "style": "none" },
    "valGridLine": { "style": "dash", "color": "#E5E5E5" }
  }
}
```

## Styles de Texte

### Options de Formatage

```json
{
  "textStyle": {
    "fontFace": "Arial",
    "fontSize": 18,
    "color": "#333333",
    "bold": false,
    "italic": false,
    "underline": false,
    "strike": false,
    "align": "left",
    "valign": "top",
    "margin": [0.1, 0.1, 0.1, 0.1],
    "lineSpacing": 1.2,
    "paraSpaceBefore": 0,
    "paraSpaceAfter": 6,
    "bullet": { "type": "bullet", "style": "●" }
  }
}
```

### Texte Enrichi (Rich Text)

```json
{
  "type": "text",
  "content": [
    { "text": "Texte normal " },
    { "text": "en gras", "options": { "bold": true } },
    { "text": " et " },
    { "text": "en couleur", "options": { "color": "#E15759" } }
  ]
}
```

## Éléments de Forme

### Formes de Base

```json
{
  "type": "shape",
  "shape": "rect",
  "position": { "x": 1, "y": 1, "w": 2, "h": 1 },
  "style": {
    "fill": "#4A90A4",
    "line": { "color": "#2E5A6B", "width": 1 },
    "shadow": { "type": "outer", "blur": 3, "offset": 2 }
  },
  "text": {
    "content": "Label",
    "style": { "color": "#FFFFFF", "align": "center" }
  }
}
```

**Formes disponibles** : `rect`, `roundRect`, `ellipse`, `triangle`, `diamond`, `pentagon`, `hexagon`, `arrow`, `chevron`, `line`

### Connecteurs

```json
{
  "type": "connector",
  "from": { "x": 2, "y": 2 },
  "to": { "x": 5, "y": 3 },
  "style": {
    "line": { "color": "#333333", "width": 1, "dashType": "solid" },
    "beginArrowType": "none",
    "endArrowType": "arrow"
  }
}
```

## Master Slides et Layouts

### Définir un Master

```json
{
  "masters": [
    {
      "name": "CUSTOM_MASTER",
      "background": { "color": "#FFFFFF" },
      "elements": [
        {
          "type": "image",
          "path": "images/logo.png",
          "position": { "x": 8.5, "y": 5.2, "w": 1, "h": 0.3 }
        },
        {
          "type": "text",
          "content": "Confidentiel",
          "position": { "x": 0.5, "y": 5.3, "w": 2, "h": 0.2 },
          "style": { "fontSize": 8, "color": "#999999" }
        }
      ]
    }
  ]
}
```

### Utiliser un Layout

```json
{
  "type": "content",
  "master": "CUSTOM_MASTER",
  "title": "...",
  "elements": [...]
}
```

## Notes du Présentateur

```json
{
  "type": "content",
  "title": "Slide avec notes",
  "elements": [...],
  "notes": "Points clés à mentionner :\n- Premier point important\n- Deuxième point\n- Question à poser à l'audience"
}
```

## Animations (Basiques)

```json
{
  "type": "text",
  "content": "Texte animé",
  "animation": {
    "type": "fadeIn",
    "delay": 0.5
  }
}
```

**Types d'animation** : `fadeIn`, `fadeOut`, `slideInLeft`, `slideInRight`, `slideInTop`, `slideInBottom`, `zoomIn`, `zoomOut`

## Bonnes Pratiques de Production

### Performance

- Images : Utiliser JPEG pour photos, PNG pour graphiques
- Résolution : 2x pour écrans retina (max 1920x1080 par image)
- Compression : Optimiser les images avant inclusion

### Compatibilité

- Polices : Utiliser web-safe fonts pour garantir l'affichage
- Couleurs : Utiliser le format HEX (#RRGGBB)
- Dimensions : Respecter le ratio 16:9

### Accessibilité

- Alt text pour toutes les images
- Contraste suffisant (WCAG 2.1)
- Structure hiérarchique des titres

## Workflow de Génération

1. **Validation** : Vérifier la structure JSON
2. **Résolution des ressources** : Charger images, vérifier chemins
3. **Application du thème** : Appliquer couleurs, typographie
4. **Génération** : Créer les slides un par un
5. **Post-traitement** : Ajouter métadonnées, optimiser
6. **Export** : Sauvegarder le fichier .pptx

## Références

Consulte `references/slide-layouts.md` pour les layouts prédéfinis.
