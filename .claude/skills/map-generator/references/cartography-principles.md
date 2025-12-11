# Principes de Cartographie pour Visualisation de Données

Ce document compile les principes fondamentaux de cartographie de données, basés sur les travaux des experts de référence.

---

## 1. Les Variables Visuelles de Jacques Bertin

Jacques Bertin, dans *Sémiologie Graphique* (1967), a défini les variables visuelles applicables à la cartographie.

### Variables Rétiniennes

| Variable | Type de Données | Efficacité pour Cartes |
|----------|-----------------|------------------------|
| **Position** | Toutes | ★★★ Fondamentale |
| **Taille** | Quantitatives | ★★★ Symboles proportionnels |
| **Valeur** (luminosité) | Ordonnées, Quantitatives | ★★★ Choroplèthes |
| **Grain/Texture** | Nominales | ★★ Accessibilité |
| **Couleur** (teinte) | Nominales | ★★ Catégories |
| **Orientation** | Nominales | ★ Limitée |
| **Forme** | Nominales | ★ Symboles ponctuels |

### Application aux Choroplèthes

Pour les cartes choroplèthes, la **valeur** (luminosité) est la variable principale :

```
Valeur faible ──────────────────► Valeur élevée
   Clair                              Foncé
   #F7FBFF ─────────────────────► #08519C
```

---

## 2. Classification des Données

### Méthodes de Classification

| Méthode | Description | Quand l'utiliser |
|---------|-------------|------------------|
| **Quantiles** | Même nombre d'unités par classe | Distribution asymétrique |
| **Intervalles égaux** | Mêmes écarts de valeur | Distribution uniforme |
| **Seuils naturels (Jenks)** | Minimise variance intra-classe | Recherche de clusters |
| **Écart-type** | Classes basées sur σ | Données normalement distribuées |
| **Manuels** | Seuils significatifs | Contexte métier spécifique |

### Nombre de Classes Recommandé

| Audience | Nombre de Classes | Raison |
|----------|------------------|--------|
| Grand public | 3-4 | Compréhension immédiate |
| Professionnels | 5-6 | Plus de nuances |
| Experts | 7-9 | Analyse fine |

> « L'œil humain ne distingue facilement que 7±2 niveaux de gris. »
> — George Miller (psychologue cognitif)

---

## 3. Honnêteté Cartographique (Mark Monmonier)

Mark Monmonier, dans *How to Lie with Maps* (1991), alerte sur les manipulations cartographiques.

### Manipulations à Éviter

| Manipulation | Effet | Solution |
|--------------|-------|----------|
| **Échelle non linéaire** | Exagère les différences | Utiliser échelle linéaire |
| **Palette inversée** | Confond le lecteur | Clair = faible, foncé = élevé |
| **Classes biaisées** | Cache ou amplifie des patterns | Documenter la méthode de classification |
| **Absence de légende** | Interprétation impossible | Toujours inclure une légende |
| **Projection déformante** | Déforme les surfaces | Utiliser projection équivalente |

### Checklist d'Honnêteté

- [ ] La source des données est-elle citée ?
- [ ] La date des données est-elle indiquée ?
- [ ] La méthode de classification est-elle appropriée ?
- [ ] La légende est-elle claire et complète ?
- [ ] Les données manquantes sont-elles signalées ?

---

## 4. Palettes de Couleurs (Cynthia Brewer)

Cynthia Brewer a créé ColorBrewer, la référence pour les palettes cartographiques.

### Types de Palettes

#### Séquentielle (données ordonnées)

Pour des valeurs allant de faible à élevé.

```
Blues:     #F7FBFF → #DEEBF7 → #9ECAE1 → #4292C6 → #08519C
Greens:    #EDF8E9 → #C7E9C0 → #74C476 → #31A354 → #006D2C
Oranges:   #FEEDDE → #FDD0A2 → #FDAE6B → #F16913 → #D94801
```

#### Divergente (données avec point central)

Pour des données avec un point neutre (0, moyenne).

```
RdBu:      #B2182B → #F4A582 → #F7F7F7 → #92C5DE → #2166AC
           (négatif)            (zéro)              (positif)

PiYG:      #C51B7D → #E9A3C9 → #F7F7F7 → #A1D76A → #4D9221
           (faible)             (moyen)             (élevé)
```

#### Qualitative (données catégorielles)

Pour des catégories sans ordre.

```
Set2:      #66C2A5, #FC8D62, #8DA0CB, #E78AC3, #A6D854
Paired:    #A6CEE3, #1F78B4, #B2DF8A, #33A02C, #FB9A99
```

### Accessibilité et Daltonisme

8% des hommes sont daltoniens (principalement rouge-vert).

| Type | À éviter | Alternative |
|------|----------|-------------|
| Rouge-Vert | Palette RdYlGn | Palette BlOr ou PuOr |
| Bleu-Jaune (rare) | Palette YlGnBu | Palette viridis |

Tester les palettes : https://colorbrewer2.org (option « colorblind safe »)

---

## 5. Principes de Tufte pour les Cartes

Edward Tufte applique le principe de **data-ink ratio** aux cartes.

### Maximiser le Data-Ink

```
Data-Ink Ratio = Encre pour les données / Encre totale
```

#### Éléments à Supprimer

| Élément | Garder ? | Raison |
|---------|----------|--------|
| Frontières pays | ✅ | Données géographiques essentielles |
| Fond de carte détaillé | ❌ | Distraction |
| Rose des vents | ❌ | Obvie pour cartes standard |
| Cadre décoratif | ❌ | Chartjunk |
| Grille lat/long | ❌ | Inutile pour choroplèthes |

#### Éléments à Conserver

| Élément | Obligatoire ? | Raison |
|---------|---------------|--------|
| Légende avec échelle | ✅ | Interprétation |
| Titre clair | ✅ | Contexte |
| Source des données | ✅ | Crédibilité |
| Unité de mesure | ✅ | Compréhension |

---

## 6. Normalisation des Données

### Problème des Valeurs Absolues

Une carte des « ventes totales par pays » est trompeuse :
- Les grands pays ont naturellement plus de ventes
- Impossible de comparer France et Luxembourg

### Solutions de Normalisation

| Indicateur | Normalisation | Exemple |
|------------|---------------|---------|
| Population | Par habitant | PIB/habitant |
| Surface | Par km² | Densité de population |
| Base 100 | Indice | Indice des prix |
| Pourcentage | % du total | Part de marché |
| Rang | Position | Classement mondial |

### Quand Utiliser des Valeurs Absolues

Les valeurs absolues sont appropriées pour :
- Cartes de symboles proportionnels (cercles)
- Comparaisons où la taille absolue compte
- Communication de volumes totaux

---

## 7. Projections Cartographiques

### Impact sur les Choroplèthes

Les choroplèthes utilisent la couleur pour encoder des valeurs par surface.
Une projection qui déforme les surfaces fausse la perception.

| Projection | Propriété | Usage Choroplèthe |
|------------|-----------|-------------------|
| **Équivalente** (ex: Albers) | Préserve les surfaces | ✅ Idéal |
| **Conforme** (ex: Mercator) | Préserve les angles | ❌ Déforme Groenland |
| **Équidistante** | Préserve les distances | ⚠️ Acceptable |

### Robinson : Le Compromis Standard

La projection Robinson est un bon compromis pour les cartes monde :
- Ni équivalente ni conforme
- Distorsions minimales acceptables
- Aspect familier et esthétique

---

## 8. Anti-Patterns Cartographiques

### ❌ Arc-en-ciel (Rainbow Palette)

```
Mauvais :  🔴 🟠 🟡 🟢 🔵 🟣
```

Problèmes :
- Pas d'ordre perceptuel naturel
- Le jaune attire l'œil (faux point focal)
- Inaccessible aux daltoniens

### ❌ Inversion des Conventions

```
Mauvais :  Foncé = faible, Clair = élevé
```

L'utilisateur s'attend à : Clair = faible, Foncé = élevé

### ❌ Trop de Classes

```
Mauvais :  15 niveaux de gris indiscernables
```

Limiter à 5-7 classes maximum.

### ❌ Légende Ambiguë

```
Mauvais :  "Valeur"
Bon :      "Ventes par habitant (€/hab, 2024)"
```

---

## 9. Workflow de Création

### Étape 1 : Préparer les Données

```
1. Vérifier les codes pays (ISO 3166-1 alpha-2)
2. Identifier les données manquantes
3. Choisir la normalisation appropriée
4. Analyser la distribution (histogram)
```

### Étape 2 : Choisir la Classification

```
1. Distribution normale → Intervalles égaux
2. Distribution asymétrique → Quantiles
3. Clusters visibles → Seuils naturels
4. Seuils métier → Manuel
```

### Étape 3 : Sélectionner la Palette

```
1. Données séquentielles → Palette monochrome
2. Données divergentes → Palette bipolaire
3. Tester le daltonisme → colorbrewer2.org
```

### Étape 4 : Valider la Carte

- [ ] Le message principal est-il immédiatement visible ?
- [ ] La légende est-elle complète (titre, unité, source) ?
- [ ] Les données manquantes sont-elles identifiables ?
- [ ] La carte est-elle honnête (pas de manipulation) ?

---

## 10. Ressources

### Ouvrages de Référence

- *Sémiologie Graphique* - Jacques Bertin (1967)
- *How to Lie with Maps* - Mark Monmonier (1991)
- *The Visual Display of Quantitative Information* - Edward Tufte (1983)
- *Cartography: Thematic Map Design* - Borden Dent (2008)

### Outils en Ligne

- ColorBrewer : https://colorbrewer2.org
- Simulateur daltonisme : https://www.color-blindness.com/coblis-color-blindness-simulator/
- Natural Earth Data : https://www.naturalearthdata.com
