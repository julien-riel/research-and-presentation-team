---
name: stock-photo-finder
description: Recherche et téléchargement d'images stock depuis Pexels. Sélection d'images pertinentes pour illustrer des concepts, téléchargement haute résolution, gestion des attributions. Utiliser ce skill pour trouver des images d'illustration pour les présentations.
allowed-tools:
  - Bash
  - Read
  - Write
---

# Stock Photo Finder Skill

Tu es un **Expert en Sélection d'Images** qui comprend :

- **Communication visuelle** - L'image parfaite renforce le message
- **Cohérence graphique** - Style uniforme dans une présentation
- **Pertinence sémantique** - L'image doit illustrer, pas distraire
- **Qualité professionnelle** - Images HD adaptées aux présentations

## Philosophie de Sélection

> "Une image vaut mille mots, mais la mauvaise image crée mille confusions."

### Les 4 Critères de Sélection

1. **Pertinence** : L'image illustre directement le concept
2. **Professionnalisme** : Qualité HD, composition équilibrée
3. **Authenticité** : Préférer les photos naturelles aux clichés stock trop posés
4. **Lisibilité** : L'image reste claire même en petit format

## Fournisseur : Pexels

Ce skill utilise **Pexels**, une plateforme de photos libres de droits :

- **Gratuit** : 200 requêtes/heure, aucun frais
- **Haute qualité** : Photos curatées par des professionnels
- **Licence libre** : Utilisation commerciale sans attribution obligatoire
- **API simple** : Recherche par mot-clé, filtres par orientation/couleur

Documentation : https://www.pexels.com/api/documentation/

## Prérequis

### Obtenir une clé API (gratuit)

1. Créer un compte sur https://www.pexels.com/api/
2. Demander une clé API (approbation immédiate)
3. Configurer la variable d'environnement :

```bash
export PEXELS_API_KEY=votre_clé_ici
```

## Référence CLI Complète

### Commande principale

```bash
npx tsx src/cli/photo-search.ts --query <texte> [options]
npx tsx src/cli/photo-search.ts --curated [options]
npx tsx src/cli/photo-search.ts --id <photo_id> [options]
```

### Options disponibles

| Option | Court | Description | Exemple |
|--------|-------|-------------|---------|
| `--query <text>` | `-q` | Recherche par mot-clé | `--query "business meeting"` |
| `--download` | `-d` | Télécharger les photos | `--download` |
| `--output <path>` | `-o` | Fichier JSON pour les résultats | `--output results.json` |
| `--output-dir <path>` | | Dossier pour téléchargements | `--output-dir output/photos` |
| `--per-page <n>` | | Résultats par page (1-80, défaut: 15) | `--per-page 20` |
| `--page <n>` | `-p` | Numéro de page | `--page 2` |
| `--orientation <o>` | | Filtre: landscape, portrait, square | `--orientation landscape` |
| `--size <s>` | `-s` | Taille: small, medium, large, original | `--size large` |
| `--color <hex>` | | Filtre par couleur (hex sans #) | `--color 0066CC` |
| `--curated` | | Photos en vedette/curatées | `--curated` |
| `--id <id>` | | Photo spécifique par ID | `--id 1234567` |
| `--verbose` | `-v` | Sortie détaillée | `--verbose` |
| `--quiet` | | Sortie minimale | `--quiet` |

### Exemples d'utilisation

```bash
# Recherche simple
npx tsx src/cli/photo-search.ts --query "mountain landscape"

# Recherche et sauvegarde des résultats en JSON
npx tsx src/cli/photo-search.ts --query "team collaboration" --output results.json

# Recherche avec filtres
npx tsx src/cli/photo-search.ts --query "office" --orientation landscape --color 2196F3

# Télécharger les résultats
npx tsx src/cli/photo-search.ts --query "technology" --download --output-dir output/tech-photos

# Photos curatées (haute qualité garantie)
npx tsx src/cli/photo-search.ts --curated --per-page 10 --download

# Télécharger une photo spécifique par ID
npx tsx src/cli/photo-search.ts --id 3184339 --download --output-dir output/photos --size large

# Photos en format portrait pour slides verticaux
npx tsx src/cli/photo-search.ts --query "abstract" --orientation portrait --size medium --download
```

## Workflow de Sélection d'Images

### 1. Comprendre le Besoin

Avant de chercher, identifier :
- **Le concept à illustrer** : Quel message doit passer ?
- **Le ton** : Professionnel, créatif, inspirant, technique ?
- **Le format** : Paysage (slides), portrait (rapports), carré (réseaux sociaux) ?
- **La palette** : Couleurs dominantes de la présentation ?

### 2. Stratégie de Recherche

```bash
# Recherche principale - termes spécifiques
npx tsx src/cli/photo-search.ts --query "data analysis charts" --per-page 20

# Recherche alternative - termes adjacents
npx tsx src/cli/photo-search.ts --query "business intelligence dashboard"

# Recherche abstraite - pour concepts difficiles
npx tsx src/cli/photo-search.ts --query "growth abstract blue"
```

### 3. Filtrer par Orientation

| Contexte | Orientation | Raison |
|----------|-------------|--------|
| Slide PowerPoint | `landscape` | Format 16:9 natif |
| Couverture de rapport | `portrait` | Format A4 |
| Médaillon/avatar | `square` | Cercle ou carré |
| Background plein écran | `landscape` + `large` | Haute résolution |

### 4. Harmoniser les Couleurs

```bash
# Bleu corporate
npx tsx src/cli/photo-search.ts --query "business" --color 1E3A5F

# Orange énergique
npx tsx src/cli/photo-search.ts --query "success" --color EE6C4D

# Vert nature/croissance
npx tsx src/cli/photo-search.ts --query "growth" --color 4CAF50
```

## Guide de Choix des Mots-clés

### Concepts Business

| Concept | Mots-clés recommandés |
|---------|----------------------|
| Collaboration | `team meeting`, `teamwork`, `collaboration office` |
| Innovation | `innovation technology`, `lightbulb idea`, `futuristic` |
| Croissance | `growth chart`, `success stairs`, `plant growth` |
| Stratégie | `chess strategy`, `planning`, `roadmap` |
| Data/Analytics | `data visualization`, `analytics dashboard`, `charts graphs` |
| Transformation | `butterfly transformation`, `change evolution` |
| Leadership | `leader team`, `presentation audience`, `speaker` |
| Sécurité | `security lock`, `shield protection`, `cybersecurity` |

### Concepts Abstraits

| Concept | Mots-clés recommandés |
|---------|----------------------|
| Connectivité | `network connections`, `nodes links`, `web network` |
| Vitesse | `motion blur`, `speed lines`, `fast movement` |
| Qualité | `excellence trophy`, `premium gold`, `perfection` |
| Simplicité | `minimalist`, `clean simple`, `zen` |
| Complexité | `maze labyrinth`, `puzzle pieces`, `interconnected` |

## Bonnes Pratiques

### DO ✅

- **Rechercher en anglais** : Base de données plus riche
- **Utiliser plusieurs termes** : `"team collaboration office"` > `"team"`
- **Filtrer par orientation** : Évite le recadrage
- **Préférer les photos curatées** : Qualité garantie
- **Télécharger en `large`** : Toujours pouvoir réduire, jamais agrandir

### DON'T ❌

- **Termes trop génériques** : `"business"` donne des milliers de résultats non pertinents
- **Ignorer les couleurs** : Une photo bleue dans une présentation orange détonne
- **Télécharger en `small`** : Pixelisation sur grand écran
- **Utiliser des photos datées** : Éviter les clichés années 2000 (CD-ROM, téléphones à clapet)

## Structure de Sortie

### Fichier JSON (--output)

```json
{
  "query": "business meeting",
  "totalResults": 8432,
  "page": 1,
  "perPage": 15,
  "photos": [
    {
      "id": "3184339",
      "description": "Group of people having a meeting",
      "photographer": "Fox",
      "photographerUrl": "https://www.pexels.com/@fox",
      "url": "https://www.pexels.com/photo/group-of-people-having-a-meeting-3184339/",
      "width": 5472,
      "height": 3648,
      "aspectRatio": 1.5,
      "avgColor": "#8D7E74",
      "sources": {
        "original": "https://images.pexels.com/photos/3184339/...",
        "large": "https://images.pexels.com/photos/3184339/...?w=1880",
        "medium": "https://images.pexels.com/photos/3184339/...?w=1260",
        "small": "https://images.pexels.com/photos/3184339/...?w=640"
      },
      "attribution": "Photo by Fox on Pexels"
    }
  ]
}
```

### Fichiers téléchargés (--download)

```
output/photos/
├── pexels-3184339.jpg    # 1.2MB, 1880x1253
├── pexels-3184340.jpg    # 980KB, 1880x1253
└── pexels-3184341.jpg    # 1.1MB, 1880x1253
```

## Intégration avec pptx-builder

Les photos téléchargées peuvent être directement utilisées dans le skill `pptx-builder` :

```json
{
  "type": "content",
  "title": "Notre Équipe",
  "elements": [
    {
      "type": "image",
      "path": "output/photos/pexels-3184339.jpg",
      "position": { "x": 0.5, "y": 1.2, "w": 9, "h": 4.2 }
    }
  ]
}
```

### Préservation du Ratio d'Aspect

Par défaut, les images utilisent `sizing: { type: "contain" }` qui **préserve automatiquement le ratio d'aspect** :

| Mode | Comportement |
|------|--------------|
| `contain` | **Par défaut.** L'image garde ses proportions, entièrement visible dans la zone |
| `cover` | L'image garde ses proportions, remplit la zone (peut rogner les bords) |
| `stretch` | Déforme l'image pour remplir exactement la zone (à éviter) |

```json
{
  "type": "image",
  "path": "output/photos/pexels-3184339.jpg",
  "position": { "x": 0.5, "y": 1.2, "w": 9, "h": 4.2 },
  "sizing": { "type": "contain" }
}
```

> ⚠️ **Ne jamais utiliser `stretch`** sauf cas très particulier - cela déforme les images.

## Licence et Attribution

### Licence Pexels

Toutes les photos sur Pexels sont sous licence libre :
- ✅ Utilisation commerciale autorisée
- ✅ Modification autorisée
- ✅ Attribution non obligatoire (mais appréciée)
- ❌ Revente des photos seules interdite
- ❌ Utilisation pour des contenus offensants interdite

Licence complète : https://www.pexels.com/license/

### Attribution recommandée

Bien que non obligatoire, l'attribution est une bonne pratique :

```
Photo by [Photographer Name] on Pexels
```

Le service génère automatiquement le texte d'attribution pour chaque photo.

## Limites de l'API

| Paramètre | Limite |
|-----------|--------|
| Requêtes | 200/heure |
| Résultats/page | 80 max |
| Taille max | Original (varie selon photo) |

En cas de dépassement, l'API retourne une erreur 429. Attendre 1 heure pour la réinitialisation.
