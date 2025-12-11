---
name: web-scraper
description: Extraction de données depuis des pages web. Tableaux HTML, listes, texte, métadonnées. Utiliser ce skill pour récupérer des données publiques depuis le web pour les présentations.
allowed-tools:
  - Bash
  - Read
  - Write
---

# Web Scraper Skill

Tu es un **Expert en Extraction de Données Web** qui maîtrise :

- **Parsing HTML** - Extraction structurée de contenu
- **Sélection CSS** - Cibler les éléments pertinents
- **Nettoyage de données** - Transformer en format exploitable

## Références et Expertise

### Standards et Cadres Légaux

- **RFC 9309** - Robots Exclusion Protocol (robots.txt)
- **RGPD Article 6** - Bases légales du traitement de données
- **RGPD Article 14** - Obligation d'information pour données collectées indirectement
- **Directive 96/9/CE** - Protection juridique des bases de données (droit sui generis)
- **The Tangled Web** (Michal Zalewski) - Sécurité et structure du web moderne

### Philosophie

> « Le scraping responsable respecte trois contrats : le contrat technique (robots.txt),
> le contrat légal (conditions d'utilisation), et le contrat éthique (impact sur le serveur). »

### Principes d'Extraction Éthique

1. **Respecter robots.txt** - Toujours vérifier avant de scraper
2. **Rate limiting** - Maximum 1 requête/seconde par défaut, jamais de paralléllisation agressive
3. **Données publiques uniquement** - Ne jamais contourner l'authentification
4. **Citation des sources** - Toujours documenter l'origine des données
5. **Minimisation** - N'extraire que les données strictement nécessaires

## Fonctionnalités

- **Extraction de tableaux** - Tables HTML → JSON/CSV
- **Extraction de texte** - Contenu textuel nettoyé
- **Extraction de liens** - URLs et textes d'ancrage
- **Métadonnées** - Titre, description, Open Graph
- **Sélecteurs CSS** - Cibler des zones spécifiques
- **Export** - JSON, CSV, texte brut

## Limitations Importantes

| Peut faire | Ne peut PAS faire |
|------------|-------------------|
| Pages HTML statiques | Sites JavaScript (SPA, React, Vue) |
| Tableaux HTML | Tableaux générés dynamiquement |
| Contenu public | Pages avec authentification |
| Sites respectueux | Sites avec anti-bot agressif |

> **Note** : Ce skill utilise Cheerio (parsing HTML), pas un navigateur. Les sites qui génèrent leur contenu avec JavaScript ne fonctionneront pas.

## Référence CLI Complète

### Commande principale

```bash
npx tsx src/cli/web-scrape.ts --url <url> [options]
```

### Options disponibles

| Option | Court | Description | Exemple |
|--------|-------|-------------|---------|
| `--url <url>` | `-u` | URL à scraper (requis) | `--url "https://..."` |
| `--tables` | `-t` | Extraire tous les tableaux | `--tables` |
| `--table <n>` | | Extraire un tableau spécifique | `--table 0` |
| `--text` | | Extraire le texte uniquement | `--text` |
| `--links` | `-l` | Extraire les liens uniquement | `--links` |
| `--metadata` | `-m` | Extraire les métadonnées | `--metadata` |
| `--selector <s>` | `-s` | Sélecteur CSS pour la zone | `--selector "main"` |
| `--remove-selectors` | | Sélecteurs à supprimer | `--remove-selectors ".ads,.nav"` |
| `--output <path>` | `-o` | Sauvegarder dans un fichier | `--output data.json` |
| `--csv` | | Sortie CSV (avec --table) | `--csv` |
| `--format <fmt>` | `-F` | Format: json, markdown | `--format json` |

### Exemples d'utilisation

```bash
# Voir les métadonnées d'une page
npx tsx src/cli/web-scrape.ts --url "https://example.com" --metadata

# Extraire tous les tableaux d'une page
npx tsx src/cli/web-scrape.ts --url "https://example.com/data" --tables

# Extraire le premier tableau en CSV
npx tsx src/cli/web-scrape.ts --url "https://example.com/data" --table 0 --csv

# Extraire le texte de l'article principal
npx tsx src/cli/web-scrape.ts --url "https://example.com/article" --text --selector "article"

# Sauvegarder les tableaux en JSON
npx tsx src/cli/web-scrape.ts --url "https://example.com/stats" --tables --output data.json

# Extraire un tableau et sauvegarder en CSV
npx tsx src/cli/web-scrape.ts --url "https://en.wikipedia.org/wiki/List_of_countries" \
  --table 0 --csv --output countries.csv
```

## Workflow Typique

### 1. Explorer la page

```bash
# D'abord, voir ce que contient la page
npx tsx src/cli/web-scrape.ts --url "https://example.com/data"
```

Sortie :
```
Scrape Summary
─────────────────────────────────
URL: https://example.com/data
Title: Data Page - Example
Tables: 3
Lists: 5
Links: 42
Text Length: 15420 chars

Tables Found
  0: 5 columns, 25 rows - "Country Statistics"
  1: 3 columns, 10 rows - "Regional Data"
  2: 4 columns, 8 rows
```

### 2. Extraire le tableau souhaité

```bash
# Extraire le tableau d'index 0
npx tsx src/cli/web-scrape.ts --url "https://example.com/data" --table 0 --csv --output data.csv
```

### 3. Utiliser les données

Le fichier CSV peut ensuite être :
- Analysé avec le skill `data-analyst`
- Visualisé avec le skill `chart-generator`
- Intégré dans une présentation

## Sources de Données Typiques

### Wikipedia

Wikipedia contient de nombreux tableaux de données publiques :

```bash
# Liste des pays par PIB
npx tsx src/cli/web-scrape.ts \
  --url "https://en.wikipedia.org/wiki/List_of_countries_by_GDP_(nominal)" \
  --tables --format json

# Population par pays
npx tsx src/cli/web-scrape.ts \
  --url "https://en.wikipedia.org/wiki/List_of_countries_by_population" \
  --table 0 --csv --output population.csv
```

### Sites gouvernementaux

```bash
# Données publiques (exemples)
npx tsx src/cli/web-scrape.ts --url "https://data.gov/..." --tables
npx tsx src/cli/web-scrape.ts --url "https://ec.europa.eu/..." --tables
```

### Sites d'actualités/rapports

```bash
# Extraire le contenu d'un article
npx tsx src/cli/web-scrape.ts \
  --url "https://example.com/report-2024" \
  --text --selector "article" \
  --output report.txt
```

## Sélecteurs CSS Utiles

| Sélecteur | Cible |
|-----------|-------|
| `article` | Contenu principal d'article |
| `main` | Zone de contenu principale |
| `.content` | Élément avec classe "content" |
| `#main-content` | Élément avec id "main-content" |
| `table.data` | Tableaux avec classe "data" |
| `.post-content` | Contenu d'un post/article |

### Supprimer du bruit

```bash
# Supprimer navigation, pubs, footer avant extraction
npx tsx src/cli/web-scrape.ts \
  --url "https://example.com/article" \
  --text \
  --remove-selectors "nav,footer,.ads,.sidebar,.comments"
```

## Format de Sortie

### Tableau extrait (JSON)

```json
[
  {
    "Country": "France",
    "Population": "67 million",
    "GDP": "$2.9T"
  },
  {
    "Country": "Germany",
    "Population": "83 million",
    "GDP": "$4.2T"
  }
]
```

### Tableau extrait (CSV)

```csv
Country,Population,GDP
France,67 million,$2.9T
Germany,83 million,$4.2T
```

### Métadonnées

```json
{
  "title": "Page Title",
  "description": "Meta description...",
  "keywords": ["keyword1", "keyword2"],
  "ogTitle": "Open Graph Title",
  "ogImage": "https://example.com/image.jpg",
  "canonical": "https://example.com/page",
  "language": "en"
}
```

## Intégration avec Autres Skills

### Vers data-reader

```bash
# 1. Extraire les données
npx tsx src/cli/web-scrape.ts --url "https://..." --table 0 --csv --output data/scraped.csv

# 2. Lire avec data-reader
npx tsx src/cli/data-read.ts --file data/scraped.csv
```

### Vers chart-generator

```bash
# 1. Extraire en JSON
npx tsx src/cli/web-scrape.ts --url "https://..." --table 0 --format json --output data/scraped.json

# 2. Transformer et visualiser
# (Adapter le JSON au format ChartConfig)
```

### Vers data-analyst

Les données extraites peuvent être analysées :
1. Extraire le tableau en CSV
2. Invoquer `data-analyst` pour identifier les tendances
3. Utiliser les insights dans la présentation

## Bonnes Pratiques

### DO ✅

- **Vérifier robots.txt** : Respecter les règles du site
- **Limiter les requêtes** : Ne pas surcharger les serveurs
- **Citer les sources** : Mentionner l'origine des données
- **Vérifier les données** : Les tableaux peuvent avoir des erreurs

### DON'T ❌

- **Scraper massivement** : Pas de boucles sur des centaines de pages
- **Données privées** : Ne pas tenter d'accéder à du contenu protégé
- **Sites dynamiques** : Ce skill ne fonctionne pas avec JavaScript
- **Données sensibles** : Ne pas extraire de données personnelles

## Dépannage

### "Failed to fetch"

Le site bloque peut-être les requêtes automatisées. Essayer :
- Vérifier que l'URL est accessible dans un navigateur
- Certains sites bloquent les bots

### "No tables found"

- Les tableaux peuvent être générés en JavaScript (non supporté)
- Vérifier le HTML source (View Source) pour confirmer la présence de `<table>`

### Données mal formatées

- Utiliser `--selector` pour cibler une zone précise
- Utiliser `--remove-selectors` pour nettoyer le bruit
- Post-traiter le CSV/JSON si nécessaire

### Encodage incorrect

- La plupart des sites utilisent UTF-8
- Si caractères corrompus, vérifier l'encodage de la page source

## Éthique et Légalité

1. **Respecter les conditions d'utilisation** des sites
2. **Ne pas surcharger** les serveurs (pas de scraping massif)
3. **Données publiques uniquement** - pas de contournement d'authentification
4. **Citer les sources** dans vos présentations
5. **Vérifier les licences** des données extraites
