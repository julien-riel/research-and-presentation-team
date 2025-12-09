# Layouts de Slides Prédéfinis

## Layouts Standard

### LAYOUT_TITLE

Slide de titre principal.

```
┌─────────────────────────────────────────┐
│                                         │
│                                         │
│           TITRE PRINCIPAL               │
│           Sous-titre                    │
│                                         │
│                                         │
│                         Auteur · Date   │
└─────────────────────────────────────────┘
```

```json
{
  "type": "title",
  "title": "...",
  "subtitle": "...",
  "author": "...",
  "date": "..."
}
```

### LAYOUT_SECTION

Slide de transition entre sections.

```
┌─────────────────────────────────────────┐
│░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
│░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
│░░░░░░░░░ TITRE SECTION ░░░░░░░░░░░░░░░░░│
│░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
│░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
└─────────────────────────────────────────┘
```

```json
{
  "type": "section",
  "title": "...",
  "number": 1,
  "background": { "color": "#1E3A5F" }
}
```

### LAYOUT_CONTENT_TITLE_ONLY

Slide avec titre uniquement, contenu libre.

```
┌─────────────────────────────────────────┐
│ Titre du slide                          │
├─────────────────────────────────────────┤
│                                         │
│           [Zone libre]                  │
│                                         │
│                                         │
│                                         │
└─────────────────────────────────────────┘
```

### LAYOUT_TWO_COLUMN

Deux colonnes égales.

```
┌─────────────────────────────────────────┐
│ Titre                                   │
├──────────────────┬──────────────────────┤
│                  │                      │
│   Colonne 1      │    Colonne 2         │
│                  │                      │
│                  │                      │
│                  │                      │
└──────────────────┴──────────────────────┘
```

```json
{
  "type": "two-column",
  "title": "...",
  "left": { "elements": [...] },
  "right": { "elements": [...] }
}
```

### LAYOUT_TWO_COLUMN_LEFT_WIDE

Colonne gauche plus large (60/40).

```
┌─────────────────────────────────────────┐
│ Titre                                   │
├─────────────────────────┬───────────────┤
│                         │               │
│   Colonne principale    │  Colonne      │
│   (60%)                 │  secondaire   │
│                         │  (40%)        │
│                         │               │
└─────────────────────────┴───────────────┘
```

### LAYOUT_TWO_COLUMN_RIGHT_WIDE

Colonne droite plus large (40/60).

### LAYOUT_THREE_COLUMN

Trois colonnes égales.

```
┌─────────────────────────────────────────┐
│ Titre                                   │
├────────────┬─────────────┬──────────────┤
│            │             │              │
│  Col 1     │   Col 2     │    Col 3     │
│            │             │              │
│            │             │              │
└────────────┴─────────────┴──────────────┘
```

### LAYOUT_CONTENT_WITH_IMAGE

Contenu à gauche, image à droite.

```
┌─────────────────────────────────────────┐
│ Titre                                   │
├──────────────────┬──────────────────────┤
│                  │░░░░░░░░░░░░░░░░░░░░░░│
│   • Point 1      │░░░░░░░░░░░░░░░░░░░░░░│
│   • Point 2      │░░░░ IMAGE ░░░░░░░░░░░│
│   • Point 3      │░░░░░░░░░░░░░░░░░░░░░░│
│                  │░░░░░░░░░░░░░░░░░░░░░░│
└──────────────────┴──────────────────────┘
```

### LAYOUT_IMAGE_WITH_CONTENT

Image à gauche, contenu à droite.

### LAYOUT_FULL_IMAGE

Image plein écran avec overlay de titre.

```
┌─────────────────────────────────────────┐
│░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
│░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
│░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
│░░░░░░░░░ IMAGE PLEIN ÉCRAN ░░░░░░░░░░░░░│
│░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
├─────────────────────────────────────────┤
│ Titre en overlay                        │
└─────────────────────────────────────────┘
```

### LAYOUT_QUOTE

Citation centrée.

```
┌─────────────────────────────────────────┐
│                                         │
│                                         │
│    "Citation en grande taille           │
│     sur plusieurs lignes"               │
│                                         │
│                    — Auteur             │
│                      Titre/Entreprise   │
│                                         │
└─────────────────────────────────────────┘
```

### LAYOUT_CHART

Graphique avec titre et source.

```
┌─────────────────────────────────────────┐
│ Titre avec insight clé                  │
├─────────────────────────────────────────┤
│                                         │
│          ┌─────────────────┐            │
│          │                 │            │
│          │   GRAPHIQUE     │            │
│          │                 │            │
│          └─────────────────┘            │
│                                         │
│ Source: ...                             │
└─────────────────────────────────────────┘
```

### LAYOUT_TABLE

Tableau avec en-têtes stylisés.

```
┌─────────────────────────────────────────┐
│ Titre                                   │
├─────────────────────────────────────────┤
│ ┌─────────────────────────────────────┐ │
│ │ Head1 │ Head2 │ Head3 │ Head4      │ │
│ ├───────┼───────┼───────┼────────────┤ │
│ │ Cell  │ Cell  │ Cell  │ Cell       │ │
│ │ Cell  │ Cell  │ Cell  │ Cell       │ │
│ │ Cell  │ Cell  │ Cell  │ Cell       │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### LAYOUT_COMPARISON

Comparaison Avant/Après.

```
┌─────────────────────────────────────────┐
│ Titre                                   │
├──────────────────┬──────────────────────┤
│      AVANT       │       APRÈS          │
│   (fond clair)   │    (fond couleur)    │
│                  │                      │
│   • Point        │    • Point           │
│   • Point        │    • Point           │
│                  │                      │
└──────────────────┴──────────────────────┘
```

### LAYOUT_PROCESS

Processus horizontal.

```
┌─────────────────────────────────────────┐
│ Titre                                   │
├─────────────────────────────────────────┤
│                                         │
│   ┌───┐     ┌───┐     ┌───┐     ┌───┐   │
│   │ 1 │────▶│ 2 │────▶│ 3 │────▶│ 4 │   │
│   └───┘     └───┘     └───┘     └───┘   │
│   Label     Label     Label     Label   │
│                                         │
└─────────────────────────────────────────┘
```

### LAYOUT_AGENDA

Agenda avec progression.

```
┌─────────────────────────────────────────┐
│ Agenda                                  │
├─────────────────────────────────────────┤
│                                         │
│   ✓ 1. Section terminée                 │
│   → 2. Section en cours                 │
│     3. Section à venir                  │
│     4. Section à venir                  │
│                                         │
└─────────────────────────────────────────┘
```

### LAYOUT_KEY_METRICS

Dashboard de KPIs.

```
┌─────────────────────────────────────────┐
│ Titre                                   │
├────────────┬─────────────┬──────────────┤
│   12.5M€   │     72      │    1,234     │
│   Revenue  │     NPS     │   Clients    │
│   ▲ +15%   │   ▲ +8pts   │   ▲ +23%     │
├────────────┴─────────────┴──────────────┤
│                                         │
│        [Mini graphique tendance]        │
│                                         │
└─────────────────────────────────────────┘
```

### LAYOUT_THANK_YOU

Slide de fin.

```
┌─────────────────────────────────────────┐
│                                         │
│                                         │
│              Merci !                    │
│                                         │
│           Des questions ?               │
│                                         │
│         ─────────────────               │
│         Contact info                    │
│         email@company.com               │
│                                         │
└─────────────────────────────────────────┘
```

## Positions Prédéfinies

```json
{
  "positions": {
    "title": { "x": 0.5, "y": 0.3, "w": 9, "h": 0.7 },
    "subtitle": { "x": 0.5, "y": 0.9, "w": 9, "h": 0.4 },
    "content_full": { "x": 0.5, "y": 1.4, "w": 9, "h": 4 },
    "content_left": { "x": 0.5, "y": 1.4, "w": 4.25, "h": 4 },
    "content_right": { "x": 5.25, "y": 1.4, "w": 4.25, "h": 4 },
    "footer_left": { "x": 0.5, "y": 5.3, "w": 3, "h": 0.2 },
    "footer_center": { "x": 3.5, "y": 5.3, "w": 3, "h": 0.2 },
    "footer_right": { "x": 6.5, "y": 5.3, "w": 3, "h": 0.2 },
    "logo": { "x": 8.5, "y": 5.15, "w": 1, "h": 0.35 }
  }
}
```

## Utilisation des Layouts

```json
{
  "slides": [
    {
      "layout": "LAYOUT_TITLE",
      "title": "Ma Présentation",
      "subtitle": "Q4 2024 Review"
    },
    {
      "layout": "LAYOUT_SECTION",
      "title": "Section 1",
      "number": 1
    },
    {
      "layout": "LAYOUT_TWO_COLUMN",
      "title": "Comparaison",
      "left": {
        "title": "Option A",
        "bullets": ["Point 1", "Point 2"]
      },
      "right": {
        "title": "Option B",
        "bullets": ["Point 1", "Point 2"]
      }
    }
  ]
}
```
