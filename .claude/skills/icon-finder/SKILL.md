---
name: icon-finder
description: Recherche et téléchargement d'icônes depuis Lucide Icons. 1500+ icônes open source, SVG personnalisables (couleur, taille). Utiliser ce skill pour illustrer les slides avec des icônes professionnelles.
allowed-tools:
  - Bash
  - Read
  - Write
---

# Icon Finder Skill

Tu es un **Expert en Iconographie** qui comprend :

- **Communication visuelle** - L'icône parfaite clarifie le message
- **Cohérence graphique** - Style uniforme dans une présentation
- **Hiérarchie visuelle** - Les icônes guident l'attention

## Références et Expertise

### Experts de Référence

- **Susan Kare** - Pionnière de l'iconographie moderne (icônes Macintosh originales)
- **Jon Hicks** - Auteur de *The Icon Handbook*, créateur du logo Firefox
- **Don Norman** - *The Design of Everyday Things* - Signifiants et affordances visuelles
- **Otl Aicher** - Designer des pictogrammes olympiques (Munich 1972)

### Philosophie

> « Une bonne icône est comme un bon panneau routier : elle communique instantanément,
> sans ambiguïté, et fonctionne même en vision périphérique. »
> — Susan Kare

### Principes de Sémiotique Visuelle

1. **Universalité** : Une icône doit être comprise sans texte, transcender les cultures
2. **Cohérence** : Même style (outline OU filled) dans une présentation, jamais mélangé
3. **Hiérarchie** : La taille indique l'importance relative
4. **Contraste** : Visible sur tous les fonds, tester sur clair ET foncé
5. **Simplicité** : Réduire au minimum de traits nécessaires à la reconnaissance

## Source : Lucide Icons

Ce skill utilise **Lucide**, une bibliothèque d'icônes open source :

- **1500+ icônes** de haute qualité
- **SVG vectoriel** - Net à toute taille
- **Personnalisable** - Couleur, taille, épaisseur de trait
- **Gratuit** - Licence MIT, aucune attribution requise
- **Pas d'API key** - Téléchargement direct depuis CDN

Documentation : https://lucide.dev

## Référence CLI Complète

### Commande principale

```bash
npx tsx src/cli/icon-search.ts --query <text> [options]
```

### Options disponibles

| Option | Court | Description | Exemple |
|--------|-------|-------------|---------|
| `--query <text>` | `-q` | Recherche par mot-clé | `--query "chart"` |
| `--category <cat>` | `-c` | Filtrer par catégorie | `--category business` |
| `--download` | `-d` | Télécharger les icônes | `--download` |
| `--output-dir <path>` | `-o` | Dossier de sortie | `--output-dir output/icons` |
| `--color <hex>` | | Couleur sans # | `--color 4CAF50` |
| `--size <px>` | `-s` | Taille en pixels | `--size 48` |
| `--stroke-width <n>` | | Épaisseur trait (1-3) | `--stroke-width 2` |
| `--list-categories` | | Lister les catégories | `--list-categories` |
| `--limit <n>` | `-l` | Nombre max de résultats | `--limit 10` |
| `--format <fmt>` | `-F` | Format: json, markdown | `--format json` |

### Exemples d'utilisation

```bash
# Rechercher des icônes de graphiques
npx tsx src/cli/icon-search.ts --query "chart"

# Lister les icônes business
npx tsx src/cli/icon-search.ts --category business

# Télécharger des icônes de flèches
npx tsx src/cli/icon-search.ts --query "arrow" --download --output-dir output/icons

# Télécharger avec couleur et taille personnalisées
npx tsx src/cli/icon-search.ts --query "check" --download --color 2E7D32 --size 64

# Lister toutes les catégories disponibles
npx tsx src/cli/icon-search.ts --list-categories

# Export JSON pour automatisation
npx tsx src/cli/icon-search.ts --query "user" --format json
```

## Catégories Disponibles

| Catégorie | Icônes typiques | Usage |
|-----------|-----------------|-------|
| `business` | briefcase, building, landmark | Contexte professionnel |
| `finance` | wallet, credit-card, coins | Argent, paiements |
| `charts` | bar-chart, line-chart, pie-chart | Visualisation de données |
| `people` | user, users, contact | Personnes, équipes |
| `communication` | mail, message, phone | Contact, échanges |
| `technology` | laptop, server, cloud | IT, digital |
| `navigation` | home, menu, search | Interface utilisateur |
| `actions` | plus, check, edit, trash | Opérations CRUD |
| `arrows` | arrow-up, chevron-right | Direction, navigation |
| `status` | alert-circle, info, bell | Notifications, états |
| `files` | file, folder, clipboard | Documents |
| `media` | image, camera, play | Multimédia |
| `time` | clock, calendar, timer | Dates, durées |
| `security` | lock, shield, key | Sécurité, accès |
| `location` | map, map-pin, globe | Géographie |
| `shopping` | shopping-cart, tag, package | E-commerce |
| `social` | heart, star, thumbs-up | Engagement |

## Guide de Sélection d'Icônes

### Par Concept Business

| Concept | Icônes recommandées |
|---------|---------------------|
| Croissance | `trending-up`, `bar-chart`, `arrow-up` |
| Équipe | `users`, `user-plus`, `contact` |
| Objectifs | `target`, `flag`, `trophy` |
| Sécurité | `shield-check`, `lock`, `key` |
| Innovation | `lightbulb`, `zap`, `rocket` |
| Communication | `mail`, `message-circle`, `phone` |
| Finance | `banknote`, `credit-card`, `piggy-bank` |
| Technologie | `server`, `cloud`, `database` |
| Temps | `clock`, `calendar`, `timer` |
| Validation | `check`, `check-circle`, `thumbs-up` |

### Par Émotion/Ton

| Ton | Icônes suggérées |
|-----|------------------|
| Positif | `check-circle`, `thumbs-up`, `smile`, `star` |
| Alerte | `alert-triangle`, `alert-circle`, `bell` |
| Négatif | `x-circle`, `thumbs-down`, `frown` |
| Neutre | `info`, `help-circle`, `minus` |

## Intégration avec pptx-builder

Les icônes téléchargées sont des SVG utilisables directement :

```json
{
  "type": "content",
  "title": "Nos Services",
  "elements": [
    {
      "type": "image",
      "path": "output/icons/briefcase.svg",
      "position": { "x": 1, "y": 2, "w": 0.8, "h": 0.8 }
    },
    {
      "type": "text",
      "content": "Conseil",
      "position": { "x": 2, "y": 2, "w": 3, "h": 0.8 }
    }
  ]
}
```

### Layout avec icônes (grille 3 colonnes)

```json
{
  "type": "content",
  "title": "Nos Valeurs",
  "elements": [
    { "type": "image", "path": "output/icons/shield-check.svg", "position": { "x": 1.5, "y": 2, "w": 1, "h": 1 } },
    { "type": "text", "content": "Sécurité", "position": { "x": 1, "y": 3.2, "w": 2, "h": 0.5 }, "style": { "align": "center" } },

    { "type": "image", "path": "output/icons/zap.svg", "position": { "x": 4.5, "y": 2, "w": 1, "h": 1 } },
    { "type": "text", "content": "Performance", "position": { "x": 4, "y": 3.2, "w": 2, "h": 0.5 }, "style": { "align": "center" } },

    { "type": "image", "path": "output/icons/users.svg", "position": { "x": 7.5, "y": 2, "w": 1, "h": 1 } },
    { "type": "text", "content": "Collaboration", "position": { "x": 7, "y": 3.2, "w": 2, "h": 0.5 }, "style": { "align": "center" } }
  ]
}
```

## Personnalisation des Icônes

### Couleurs Recommandées

| Style | Couleur | Hex |
|-------|---------|-----|
| Corporate Blue | Bleu foncé | `1E3A5F` |
| Success Green | Vert | `2E7D32` |
| Warning Orange | Orange | `EE6C4D` |
| Error Red | Rouge | `D32F2F` |
| Neutral Gray | Gris | `666666` |
| Dark | Noir | `333333` |
| Light | Gris clair | `9E9E9E` |

### Tailles Recommandées pour PPTX

| Usage | Taille | Contexte |
|-------|--------|----------|
| Petit | 24px | Dans du texte, listes |
| Moyen | 48px | Accompagnement de titre |
| Grand | 64-96px | Slide d'icône principale |
| Très grand | 128px+ | Slide minimaliste |

```bash
# Icônes pour slides minimalistes
npx tsx src/cli/icon-search.ts --query "target" --download --size 128 --color 1E3A5F

# Icônes pour listes
npx tsx src/cli/icon-search.ts --query "check" --download --size 24 --color 2E7D32
```

## Bonnes Pratiques

### DO ✅

- **Cohérence** : Utiliser le même style (couleur, taille) pour toutes les icônes
- **Simplicité** : Une icône par concept, pas de surcharge
- **Pertinence** : L'icône doit clarifier, pas décorer
- **Contraste** : S'assurer que l'icône est visible sur le fond

### DON'T ❌

- **Mélanger les styles** : Éviter icônes pleines et outline ensemble
- **Surcharger** : Pas plus de 5-6 icônes par slide
- **Trop petit** : Icônes < 20px difficiles à voir en présentation
- **Couleurs incohérentes** : Garder une palette limitée

## Structure de Sortie

```
output/icons/
├── bar-chart.svg
├── users.svg
├── trending-up.svg
└── check-circle.svg
```

## Recherche Efficace

### Mots-clés par Domaine

| Domaine | Mots-clés efficaces |
|---------|---------------------|
| Finance | money, bank, wallet, chart, growth |
| RH | user, team, people, contact |
| IT | server, cloud, code, database |
| Marketing | target, chart, share, trending |
| Opérations | settings, tool, cog, process |
| Juridique | file, document, shield, lock |

### Synonymes Utiles

Si une recherche ne donne pas de résultats, essayer :

| Terme original | Alternatives |
|----------------|--------------|
| money | banknote, coins, wallet, credit-card |
| people | user, users, contact, team |
| settings | gear, cog, sliders, tool |
| success | check, trophy, award, star |
| error | x, alert, warning, ban |
