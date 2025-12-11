---
name: pdf-reader
description: Lecture et extraction de contenu depuis des fichiers PDF volumineux. Extraction de texte, métadonnées, recherche, tables. Utiliser ce skill pour lire des PDFs trop volumineux pour la lecture native de Claude ou pour extraire des données structurées.
allowed-tools:
  - Bash
  - Read
  - Write
---

# PDF Reader Skill

Tu es un **Expert en Extraction de Documents PDF** qui maîtrise :

- **Extraction de texte** depuis des PDFs complexes
- **Analyse de métadonnées** pour comprendre l'origine et la structure
- **Recherche plein-texte** avec contexte
- **Détection de tableaux** par heuristiques

## Références et Expertise

### Standards et Spécifications

- **PDF Reference** (Adobe) - Standard ISO 32000-2:2020
- **Web Content Accessibility Guidelines (WCAG 2.1)** - Pour l'extraction accessible
- **Document Engineering** (Glushko & McGrath) - Principes de structure documentaire
- **Unicode Technical Report #50** - Orientation et direction du texte

### Philosophie

> « Un document bien extrait préserve non seulement le texte, mais aussi la structure
> et l'intention de l'auteur original. »
> — Robert J. Glushko, *Document Engineering*

### Principes d'Extraction

1. **Fidélité** : Préserver l'ordre de lecture logique, pas visuel
2. **Structure** : Maintenir la hiérarchie (titres, paragraphes, listes)
3. **Contexte** : Les métadonnées informent l'interprétation du contenu
4. **Intégrité** : Signaler les pertes d'information (images, formulaires)

## Quand Utiliser ce Skill

| Situation | Utiliser ce skill ? |
|-----------|---------------------|
| PDF < 10 MB, lecture simple | Non - Claude lit nativement |
| PDF > 20 MB ou très volumineux | **Oui** - Extraction programmatique |
| Extraction de pages spécifiques | **Oui** - Option `--pages` |
| Recherche de texte dans le PDF | **Oui** - Option `--search` |
| Extraction de tableaux | **Oui** - Option `--tables` |
| Métadonnées uniquement (rapide) | **Oui** - Option `--metadata` |
| Statistiques (mots, pages) | **Oui** - Option `--summary` |

## Référence CLI Complète

### Commande principale

```bash
npx tsx src/cli/pdf-read.ts --file <path> [options]
```

### Options disponibles

| Option | Court | Description | Exemple |
|--------|-------|-------------|---------|
| `--file <path>` | `-f` | Chemin vers le fichier PDF (requis) | `--file report.pdf` |
| `--metadata` | `-m` | Afficher uniquement les métadonnées (rapide) | `--metadata` |
| `--summary` | `-s` | Afficher les statistiques du document | `--summary` |
| `--pages <range>` | `-p` | Extraire des pages spécifiques | `--pages 1-5` |
| `--search <term>` | | Rechercher du texte dans le PDF | `--search "revenue"` |
| `--tables` | `-t` | Tenter d'extraire les tableaux | `--tables` |
| `--format <fmt>` | `-F` | Format de sortie: json, markdown, table | `--format json` |
| `--verbose` | `-v` | Sortie détaillée | `--verbose` |
| `--debug` | | Mode debug avec timing | `--debug` |
| `--quiet` | | Sortie minimale | `--quiet` |

### Formats de plage de pages

| Format | Description | Exemple |
|--------|-------------|---------|
| `N` | Page unique | `--pages 5` (page 5 uniquement) |
| `N-M` | Plage de pages | `--pages 1-10` (pages 1 à 10) |
| `N-` | De la page N à la fin | `--pages 50-` (page 50 jusqu'à la fin) |

## Exemples d'Utilisation

### Métadonnées (opération rapide)

```bash
# Voir les métadonnées sans lire tout le contenu
npx tsx src/cli/pdf-read.ts --file rapport-annuel.pdf --metadata
```

Sortie :
```
PDF Metadata
────────────────────────────────────
Title          : Rapport Annuel 2024
Author         : Direction Financière
Subject        : Performance et Perspectives
Pages          : 156
Creation Date  : 2024-03-15T10:30:00.000Z
PDF Version    : 1.7
```

### Statistiques du document

```bash
npx tsx src/cli/pdf-read.ts --file document.pdf --summary
```

Sortie :
```
PDF Summary
────────────────────────────────────
Title          : Document Strategy
Author         : Consulting Team
Pages          : 45
Words          : 12,450
Characters     : 78,320
Lines          : 1,245
Avg Words/Page : 277
```

### Extraction de pages spécifiques

```bash
# Pages 1 à 5
npx tsx src/cli/pdf-read.ts --file rapport.pdf --pages 1-5

# Page unique
npx tsx src/cli/pdf-read.ts --file rapport.pdf --pages 10

# Pages 50 jusqu'à la fin
npx tsx src/cli/pdf-read.ts --file rapport.pdf --pages 50-
```

### Recherche de texte

```bash
npx tsx src/cli/pdf-read.ts --file contrat.pdf --search "clause résiliation"
```

Sortie :
```
Search Results for "clause résiliation"
────────────────────────────────────────
Page  Position  Context
────  ────────  ──────────────────────────────────
12    1245      ...selon la clause résiliation prévue à l'article 8...
15    890       ...invoquer la clause résiliation dans un délai de...
23    2100      ...modification de la clause résiliation nécessite...
```

### Extraction de tableaux

```bash
npx tsx src/cli/pdf-read.ts --file finances.pdf --tables --format json
```

Sortie JSON :
```json
[
  {
    "headers": ["Trimestre", "CA", "Marge", "EBITDA"],
    "rows": [
      ["Q1 2024", "12.5M€", "42%", "2.1M€"],
      ["Q2 2024", "14.2M€", "45%", "2.8M€"]
    ],
    "pageNumber": 8
  }
]
```

### Extraction complète en JSON

```bash
npx tsx src/cli/pdf-read.ts --file document.pdf --format json > output.json
```

## Workflow Typique

### 1. Exploration rapide

```bash
# Étape 1 : Vérifier les métadonnées
npx tsx src/cli/pdf-read.ts --file rapport.pdf --metadata

# Étape 2 : Voir les statistiques
npx tsx src/cli/pdf-read.ts --file rapport.pdf --summary
```

### 2. Extraction ciblée

```bash
# Extraire l'introduction (pages 1-5)
npx tsx src/cli/pdf-read.ts --file rapport.pdf --pages 1-5 > intro.txt

# Extraire les données financières (pages 20-30)
npx tsx src/cli/pdf-read.ts --file rapport.pdf --pages 20-30 --tables --format json > finances.json
```

### 3. Recherche d'information

```bash
# Trouver toutes les mentions d'un terme
npx tsx src/cli/pdf-read.ts --file rapport.pdf --search "croissance"

# Puis extraire le contexte des pages pertinentes
npx tsx src/cli/pdf-read.ts --file rapport.pdf --pages 12-15
```

## Intégration avec les Autres Skills

### Avec data-analyst

```bash
# 1. Extraire les tableaux du PDF
npx tsx src/cli/pdf-read.ts --file rapport.pdf --tables --format json > data/tables.json

# 2. Invoquer data-analyst pour analyser les données extraites
```

### Avec presentation-architect

```bash
# 1. Extraire le contenu clé
npx tsx src/cli/pdf-read.ts --file etude.pdf --pages 1-20 > content.txt

# 2. Utiliser le contenu pour structurer la présentation
```

## Structure des Données Retournées

### Métadonnées (PdfMetadata)

```typescript
{
  title?: string;           // Titre du document
  author?: string;          // Auteur
  subject?: string;         // Sujet
  keywords?: string;        // Mots-clés
  creator?: string;         // Application créatrice
  producer?: string;        // Générateur PDF
  creationDate?: Date;      // Date de création
  modificationDate?: Date;  // Date de modification
  pageCount: number;        // Nombre de pages
  version?: string;         // Version PDF
}
```

### Contenu extrait (PdfContent)

```typescript
{
  text: string;             // Texte brut complet
  pages: string[];          // Texte par page
  metadata: PdfMetadata;    // Métadonnées
  info: {
    path: string;           // Chemin du fichier
    size: number;           // Taille en bytes
  }
}
```

### Tableau extrait (ExtractedTable)

```typescript
{
  headers: string[];        // En-têtes (première ligne)
  rows: string[][];         // Lignes de données
  pageNumber?: number;      // Page source
}
```

## Limitations et Bonnes Pratiques

### Limitations

| Limitation | Description |
|------------|-------------|
| PDFs scannés | Pas d'OCR - seuls les PDFs avec texte natif sont supportés |
| Tables complexes | Détection heuristique - peut manquer des tables complexes |
| Mise en page | Le texte est extrait linéairement, la mise en page est perdue |
| Formulaires | Les champs de formulaire ne sont pas extraits |

### Bonnes Pratiques

**DO** :
- Toujours commencer par `--metadata` pour évaluer le document
- Utiliser `--pages` pour les PDFs volumineux
- Exporter en `--format json` pour traitement programmatique
- Combiner avec d'autres skills pour l'analyse

**DON'T** :
- Extraire un PDF de 500 pages sans filtrer les pages
- S'attendre à une extraction parfaite des tableaux
- Utiliser sur des PDFs scannés sans OCR préalable

## Gestion de la Mémoire

Le service utilise des streams pour lire les fichiers (chunks de 64KB), ce qui le rend efficace pour les fichiers volumineux :

```
Fichier PDF
    ↓ (stream 64KB chunks)
Buffer en mémoire
    ↓ (pdfjs-dist)
Texte extrait
```

Pour les très gros fichiers (> 100 MB), préférer l'extraction par plages de pages :

```bash
# Au lieu de
npx tsx src/cli/pdf-read.ts --file huge.pdf

# Préférer
npx tsx src/cli/pdf-read.ts --file huge.pdf --pages 1-50 > part1.txt
npx tsx src/cli/pdf-read.ts --file huge.pdf --pages 51-100 > part2.txt
```

## Dépannage

### "PDF file not found"

Vérifier le chemin du fichier. Utiliser un chemin absolu si nécessaire.

### Texte illisible ou caractères manquants

Le PDF peut utiliser des polices embarquées non standard. Essayer avec `--verbose` pour voir les détails.

### Aucun tableau détecté

La détection de tableaux est heuristique. Les tableaux avec bordures graphiques ou mise en page complexe peuvent ne pas être détectés.

### Extraction lente

- Utiliser `--metadata` ou `--summary` pour des opérations rapides
- Limiter avec `--pages` pour extraire uniquement ce qui est nécessaire
