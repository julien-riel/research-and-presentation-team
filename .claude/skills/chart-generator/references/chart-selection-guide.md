# Guide de Sélection des Graphiques

## Comparaison

### Bar Chart (Barres verticales)

**Quand utiliser** :
- Comparer des valeurs entre catégories
- Peu de catégories (< 10)
- Labels courts

**Configuration ECharts** :
```json
{
  "xAxis": { "type": "category", "data": ["A", "B", "C"] },
  "yAxis": { "type": "value" },
  "series": [{ "type": "bar", "data": [120, 200, 150] }]
}
```

**Bonnes pratiques** :
- Axe Y commence à 0
- Barres ordonnées par valeur
- Couleur unique sauf mise en évidence

---

### Bar Chart Horizontal

**Quand utiliser** :
- Labels de catégories longs
- Classement (ranking)
- Plus de 7 catégories

**Configuration ECharts** :
```json
{
  "yAxis": { "type": "category", "data": ["Catégorie longue A", "Catégorie B", "C"] },
  "xAxis": { "type": "value" },
  "series": [{ "type": "bar", "data": [120, 200, 150] }]
}
```

---

### Grouped Bar Chart

**Quand utiliser** :
- Comparer 2-3 séries par catégorie
- Montrer des différences entre groupes

**Configuration ECharts** :
```json
{
  "legend": { "data": ["2023", "2024"] },
  "xAxis": { "type": "category", "data": ["Q1", "Q2", "Q3", "Q4"] },
  "yAxis": { "type": "value" },
  "series": [
    { "name": "2023", "type": "bar", "data": [100, 120, 140, 160] },
    { "name": "2024", "type": "bar", "data": [120, 150, 130, 180] }
  ]
}
```

---

### Dot Plot (Lollipop)

**Quand utiliser** :
- Alternative élégante au bar chart
- Accent sur la valeur précise
- Réduire l'encre (Tufte)

**Configuration ECharts** :
```json
{
  "xAxis": { "type": "value" },
  "yAxis": { "type": "category", "data": ["A", "B", "C"] },
  "series": [
    {
      "type": "scatter",
      "symbolSize": 12,
      "data": [[120, 0], [200, 1], [150, 2]]
    }
  ]
}
```

## Évolution Temporelle

### Line Chart

**Quand utiliser** :
- Montrer une tendance dans le temps
- Données continues
- Jusqu'à 4-5 séries

**Configuration ECharts** :
```json
{
  "xAxis": { "type": "time" },
  "yAxis": { "type": "value" },
  "series": [{
    "type": "line",
    "smooth": false,
    "data": [
      ["2024-01", 100],
      ["2024-02", 120],
      ["2024-03", 115]
    ]
  }]
}
```

**Options avancées** :
```json
{
  "series": [{
    "type": "line",
    "smooth": true,
    "areaStyle": { "opacity": 0.1 },
    "markLine": {
      "data": [{ "type": "average", "name": "Moyenne" }]
    },
    "markPoint": {
      "data": [
        { "type": "max", "name": "Max" },
        { "type": "min", "name": "Min" }
      ]
    }
  }]
}
```

---

### Area Chart

**Quand utiliser** :
- Mettre en évidence le volume/magnitude
- Une seule série
- Évolution cumulative

**Configuration ECharts** :
```json
{
  "series": [{
    "type": "line",
    "areaStyle": { "opacity": 0.7 },
    "data": [100, 120, 115, 140]
  }]
}
```

---

### Stacked Area

**Quand utiliser** :
- Montrer la composition qui évolue
- Parts relatives dans le temps
- Maximum 5-6 catégories

**Configuration ECharts** :
```json
{
  "series": [
    { "name": "A", "type": "line", "stack": "total", "areaStyle": {}, "data": [100, 120, 130] },
    { "name": "B", "type": "line", "stack": "total", "areaStyle": {}, "data": [80, 90, 85] },
    { "name": "C", "type": "line", "stack": "total", "areaStyle": {}, "data": [50, 60, 70] }
  ]
}
```

## Distribution

### Histogram

**Quand utiliser** :
- Distribution d'une variable continue
- Identifier la forme (normale, bimodale, skewed)

**Configuration ECharts** :
```json
{
  "xAxis": { "type": "category", "data": ["0-10", "10-20", "20-30", "30-40"] },
  "yAxis": { "type": "value", "name": "Fréquence" },
  "series": [{
    "type": "bar",
    "barWidth": "99%",
    "data": [5, 20, 36, 15]
  }]
}
```

---

### Box Plot

**Quand utiliser** :
- Comparer des distributions
- Voir médiane, quartiles, outliers
- Plusieurs groupes

**Configuration ECharts** :
```json
{
  "dataset": [{
    "source": [
      [850, 740, 900, 1070, 930, 850, 950, 980, 980],
      [960, 940, 960, 940, 880, 800, 850, 880, 900]
    ]
  }, {
    "transform": { "type": "boxplot" }
  }],
  "xAxis": { "type": "category", "data": ["Groupe A", "Groupe B"] },
  "yAxis": { "type": "value" },
  "series": [{ "type": "boxplot", "datasetIndex": 1 }]
}
```

## Composition

### Pie Chart ⚠️

**Quand utiliser (avec prudence)** :
- Parts d'un tout = 100%
- Maximum 5 segments
- Différences significatives entre parts

**Configuration ECharts** :
```json
{
  "series": [{
    "type": "pie",
    "radius": ["40%", "70%"],
    "data": [
      { "value": 45, "name": "Produit A" },
      { "value": 30, "name": "Produit B" },
      { "value": 25, "name": "Autres" }
    ],
    "label": {
      "formatter": "{b}: {d}%"
    }
  }]
}
```

**Alternative recommandée** : Bar chart horizontal avec 100%

---

### Treemap

**Quand utiliser** :
- Hiérarchie avec proportions
- Beaucoup de catégories
- Deux niveaux de détail

**Configuration ECharts** :
```json
{
  "series": [{
    "type": "treemap",
    "data": [{
      "name": "Région A",
      "value": 100,
      "children": [
        { "name": "Ville 1", "value": 60 },
        { "name": "Ville 2", "value": 40 }
      ]
    }]
  }]
}
```

## Relations

### Scatter Plot

**Quand utiliser** :
- Relation entre 2 variables
- Identifier des clusters
- Détecter des outliers

**Configuration ECharts** :
```json
{
  "xAxis": { "type": "value", "name": "Variable X" },
  "yAxis": { "type": "value", "name": "Variable Y" },
  "series": [{
    "type": "scatter",
    "symbolSize": 10,
    "data": [[10, 20], [15, 25], [20, 22], [25, 30]]
  }]
}
```

**Avec ligne de tendance** :
```json
{
  "series": [
    { "type": "scatter", "data": [...] },
    {
      "type": "line",
      "smooth": true,
      "showSymbol": false,
      "data": [...],
      "lineStyle": { "type": "dashed" }
    }
  ]
}
```

---

### Bubble Chart

**Quand utiliser** :
- 3 variables (x, y, taille)
- Comparer des entités multidimensionnelles

**Configuration ECharts** :
```json
{
  "series": [{
    "type": "scatter",
    "data": [
      [10, 20, 30],
      [15, 25, 45],
      [20, 22, 20]
    ],
    "symbolSize": function(data) {
      return Math.sqrt(data[2]) * 5;
    }
  }]
}
```

## Spécialisés

### Heatmap

**Quand utiliser** :
- Matrice de valeurs
- Corrélations
- Données calendaires

**Configuration ECharts** :
```json
{
  "xAxis": { "type": "category", "data": ["Lun", "Mar", "Mer"] },
  "yAxis": { "type": "category", "data": ["Matin", "Après-midi", "Soir"] },
  "visualMap": { "min": 0, "max": 100 },
  "series": [{
    "type": "heatmap",
    "data": [[0, 0, 50], [0, 1, 30], [1, 0, 80], ...]
  }]
}
```

---

### Gauge

**Quand utiliser** :
- KPI unique
- Progression vers un objectif
- Dashboard

**Configuration ECharts** :
```json
{
  "series": [{
    "type": "gauge",
    "progress": { "show": true },
    "detail": { "formatter": "{value}%" },
    "data": [{ "value": 75, "name": "Progression" }]
  }]
}
```

---

### Funnel

**Quand utiliser** :
- Processus séquentiel avec perte
- Conversion (ventes, recrutement)

**Configuration ECharts** :
```json
{
  "series": [{
    "type": "funnel",
    "data": [
      { "value": 100, "name": "Visites" },
      { "value": 60, "name": "Leads" },
      { "value": 30, "name": "Opportunités" },
      { "value": 10, "name": "Ventes" }
    ]
  }]
}
```
