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

## Référence CLI Complète

### Commande principale

```bash
npx tsx src/cli/pptx-build.ts --spec <path> --output <path>
```

### Options disponibles

| Option | Court | Description | Exemple |
|--------|-------|-------------|---------|
| `--spec <path>` | `-s` | Fichier de spécification JSON (requis) | `--spec presentation.json` |
| `--theme <path>` | `-t` | Fichier de thème JSON | `--theme theme.json` |
| `--output <path>` | `-o` | Chemin du fichier PPTX de sortie (requis) | `--output slides.pptx` |
| `--quick` | `-q` | Mode rapide interactif | `--quick` |
| `--title <text>` | | Titre (pour mode quick) | `--title "Ma Présentation"` |
| `--verbose` | `-v` | Sortie détaillée | `--verbose` |
| `--debug` | | Mode debug avec timing | `--debug` |
| `--quiet` | | Sortie minimale | `--quiet` |

### Types de slides disponibles

| Type | Description |
|------|-------------|
| `title` | Slide titre avec titre principal, sous-titre, auteur, date |
| `section` | Diviseur de section avec numéro et titre |
| `content` | Slide de contenu avec titre et éléments |
| `two-column` | Layout à deux colonnes |
| `quote` | Slide citation avec attribution |

### Types d'éléments dans les slides

| Élément | Description |
|---------|-------------|
| `text` | Bloc de texte avec style |
| `bullets` | Liste à puces |
| `table` | Tableau avec en-têtes |
| `image` | Image depuis un chemin de fichier |
| `chart` | Graphique intégré |

### Exemples d'utilisation

```bash
# Générer une présentation depuis une spécification JSON
npx tsx src/cli/pptx-build.ts --spec presentation.json --output output.pptx

# Avec un thème personnalisé séparé
npx tsx src/cli/pptx-build.ts --spec presentation.json --theme theme.json --output output.pptx

# Mode verbose pour debugging
npx tsx src/cli/pptx-build.ts --spec presentation.json --output output.pptx --verbose
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
    "colors": {
      "primary": "#1E3A5F",
      "secondary": "#4A90A4",
      "accent": "#2E7D32",
      "background": "#FFFFFF",
      "surface": "#F5F5F5",
      "text": {
        "primary": "#333333",
        "secondary": "#666666"
      }
    },
    "typography": {
      "fontFamily": {
        "heading": "Arial",
        "body": "Arial"
      },
      "sizes": {
        "h1": "44",
        "h2": "32",
        "h3": "24",
        "body": "18",
        "caption": "14"
      }
    }
  },
  "slides": [
    { ... }
  ]
}
```

### Format du Thème (ThemeColors et ThemeTypography)

**IMPORTANT** : Le thème doit respecter exactement cette structure. Ne pas utiliser de valeurs simplifiées.

#### ThemeColors (obligatoire)

```json
{
  "colors": {
    "primary": "#1E3A5F",
    "secondary": "#4A90A4",
    "accent": "#2E7D32",
    "background": "#FFFFFF",
    "surface": "#F5F5F5",
    "text": {
      "primary": "#333333",
      "secondary": "#666666"
    }
  }
}
```

| Propriété | Description | Exemple |
|-----------|-------------|---------|
| `primary` | Couleur principale (titres, headers) | `#1E3A5F` |
| `secondary` | Couleur secondaire (accents légers) | `#4A90A4` |
| `accent` | Couleur d'accent (mise en évidence) | `#2E7D32` |
| `background` | Fond des slides | `#FFFFFF` |
| `surface` | Fond des éléments (cartes, boîtes) | `#F5F5F5` |
| `text.primary` | Couleur du texte principal | `#333333` |
| `text.secondary` | Couleur du texte secondaire | `#666666` |

⚠️ **Attention** : `text` doit être un objet avec `primary` et `secondary`, pas une chaîne simple.

#### ThemeTypography (obligatoire)

```json
{
  "typography": {
    "fontFamily": {
      "heading": "Arial",
      "body": "Arial"
    },
    "sizes": {
      "h1": "44",
      "h2": "32",
      "h3": "24",
      "body": "18",
      "caption": "14"
    }
  }
}
```

| Propriété | Description | Exemple |
|-----------|-------------|---------|
| `fontFamily.heading` | Police pour les titres | `Arial`, `Calibri` |
| `fontFamily.body` | Police pour le texte | `Arial`, `Calibri` |
| `sizes.h1` | Taille titre niveau 1 | `"44"` |
| `sizes.h2` | Taille titre niveau 2 | `"32"` |
| `sizes.h3` | Taille titre niveau 3 | `"24"` |
| `sizes.body` | Taille texte corps | `"18"` |
| `sizes.caption` | Taille légendes/notes | `"14"` |

⚠️ **Attention** : Les tailles sont des chaînes (`"44"`), pas des nombres.

#### Palettes de Couleurs Recommandées

**Corporate Blue** (professionnel)
```json
{
  "primary": "#1E3A5F",
  "secondary": "#4A90A4",
  "accent": "#2E7D32",
  "background": "#FFFFFF",
  "surface": "#F5F5F5",
  "text": { "primary": "#333333", "secondary": "#666666" }
}
```

**Modern Dark** (présentations impactantes)
```json
{
  "primary": "#2D3436",
  "secondary": "#636E72",
  "accent": "#00B894",
  "background": "#FFFFFF",
  "surface": "#DFE6E9",
  "text": { "primary": "#2D3436", "secondary": "#636E72" }
}
```

**Tech Green** (innovation, tech)
```json
{
  "primary": "#00695C",
  "secondary": "#4DB6AC",
  "accent": "#FF6F00",
  "background": "#FFFFFF",
  "surface": "#E0F2F1",
  "text": { "primary": "#263238", "secondary": "#546E7A" }
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

**Options de sizing pour les images** :

| Type | Comportement |
|------|--------------|
| `contain` | **Par défaut**. Préserve le ratio d'aspect, l'image est entièrement visible dans la zone |
| `cover` | Préserve le ratio d'aspect, remplit la zone (peut rogner) |
| `stretch` | Étire l'image pour remplir exactement la zone (peut déformer) |

⚠️ **Important** : Par défaut, les images utilisent `contain` pour préserver leur ratio d'aspect et éviter les déformations. Utilisez `stretch` uniquement si vous voulez explicitement déformer l'image.

### Intégration des Images Stock (skill: stock-photo-finder)

Les images téléchargées via `stock-photo-finder` sont prêtes à l'emploi :

```bash
# Télécharger une image pour la présentation
npx tsx src/cli/photo-search.ts --query "team collaboration" --orientation landscape --download --output-dir output/photos
```

**Utilisation dans la spécification :**

```json
{
  "type": "content",
  "title": "Notre Équipe",
  "elements": [
    {
      "type": "image",
      "path": "output/photos/pexels-3184339.jpg",
      "position": { "x": 0.5, "y": 1.2, "w": 9, "h": 4.5 },
      "sizing": { "type": "cover" }
    }
  ],
  "notes": "Photo by Fox on Pexels"
}
```

**Types de slides avec images stock :**

| Usage | Sizing | Position recommandée |
|-------|--------|----------------------|
| Image plein slide (background) | `cover` | `{ "x": 0, "y": 0, "w": 10, "h": 5.625 }` |
| Image avec titre | `contain` | `{ "x": 0.5, "y": 1.2, "w": 9, "h": 4.2 }` |
| Image demi-slide (gauche) | `cover` | `{ "x": 0, "y": 0, "w": 5, "h": 5.625 }` |
| Image demi-slide (droite) | `cover` | `{ "x": 5, "y": 0, "w": 5, "h": 5.625 }` |
| Vignette/médaillon | `cover` | `{ "x": 7, "y": 1.5, "w": 2.5, "h": 2.5 }` |

**Slide avec texte sur image (overlay) :**

```json
{
  "type": "content",
  "title": "",
  "background": {
    "image": "output/photos/pexels-3184339.jpg"
  },
  "elements": [
    {
      "type": "shape",
      "shape": "rect",
      "position": { "x": 0, "y": 3.5, "w": 10, "h": 2.125 },
      "style": { "fill": "000000", "transparency": 50 }
    },
    {
      "type": "text",
      "content": "Notre Vision pour 2025",
      "position": { "x": 0.5, "y": 4, "w": 9, "h": 1 },
      "style": { "fontSize": 36, "color": "#FFFFFF", "bold": true }
    }
  ]
}
```

> 💡 **Astuce** : Inclure l'attribution dans les notes du présentateur pour respecter les bonnes pratiques.

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
