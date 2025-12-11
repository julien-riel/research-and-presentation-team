# Guide d'Utilisation - Presentation Team

Ce projet utilise Claude Code pour créer des présentations PowerPoint professionnelles à partir de données et documents.

---

## ⚠️ Instructions Critiques pour Claude

### Utilisation OBLIGATOIRE des Skills

**Ce projet dispose de 13 skills spécialisés. Tu DOIS les invoquer via l'outil `Skill` plutôt que d'exécuter les commandes CLI directement ou de lire les fichiers SKILL.md manuellement.**

#### Comment invoquer un skill

Utilise l'outil `Skill` avec le paramètre `command` contenant le nom du skill :

| Commande | Quand l'invoquer |
|----------|------------------|
| `command: "data-reader"` | Dès qu'un fichier Excel, CSV, JSON ou TSV doit être lu |
| `command: "pdf-reader"` | Pour lire des PDFs volumineux, extraire des pages, rechercher du texte |
| `command: "web-scraper"` | Pour extraire des tableaux et données depuis des pages web |
| `command: "data-analyst"` | Pour statistiques, corrélations, tendances, anomalies |
| `command: "data-storytelling"` | Pour transformer des insights en narratif cohérent |
| `command: "chart-generator"` | Pour créer tout type de graphique (bar, line, pie, scatter, etc.) |
| `command: "diagram-generator"` | Pour créer des diagrammes (flowchart, architecture, séquence, etc.) |
| `command: "map-generator"` | Pour créer des cartes choroplèthes avec données par pays |
| `command: "presentation-architect"` | Pour structurer une présentation (slides, flow, messages clés) |
| `command: "theme-designer"` | Pour définir le style visuel (couleurs, polices, mise en page) |
| `command: "icon-finder"` | Pour trouver et télécharger des icônes (Lucide Icons) |
| `command: "stock-photo-finder"` | Pour trouver et télécharger des images stock (Pexels) |
| `command: "pptx-builder"` | Pour générer le fichier PowerPoint final |

#### Règles strictes

✅ **TOUJOURS** invoquer le skill approprié via l'outil Skill  
✅ **TOUJOURS** suivre les instructions retournées par le skill  
✅ **TOUJOURS** utiliser les skills en séquence selon le workflow ci-dessous  

❌ **NE JAMAIS** exécuter `npx tsx src/cli/...` directement sans avoir invoqué le skill correspondant  
❌ **NE JAMAIS** lire les fichiers SKILL.md avec cat/view puis improviser  
❌ **NE JAMAIS** ignorer un skill pertinent pour la tâche demandée  

---

## Workflow Obligatoire pour une Présentation

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  DATA-READER    │────▶│  DATA-ANALYST   │────▶│  PRESENTATION-  │────▶│  PPTX-BUILDER   │
│  Lecture des    │     │  Analyse &      │     │  ARCHITECT      │     │  Génération     │
│  fichiers       │     │  insights       │     │  Structure      │     │  finale         │
└─────────────────┘     └─────────────────┘     └─────────────────┘     └─────────────────┘
                                                        │
                                    ┌───────────┬───────────┼───────────┬───────────┐
                                    ▼           ▼           ▼           ▼           ▼
                            ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐
                            │ CHART-    │ │ DIAGRAM-  │ │ THEME-    │ │ STOCK-    │
                            │ GENERATOR │ │ GENERATOR │ │ DESIGNER  │ │ PHOTO-    │
                            └───────────┘ └───────────┘ └───────────┘ │ FINDER    │
                                                                      └───────────┘
```

### Séquence détaillée

1. **Invoque `data-reader`** — Lecture des fichiers de données (Excel, CSV, JSON)
2. **Invoque `data-analyst`** — Analyse statistique et identification des insights
3. **Invoque `data-storytelling`** (si narratif complexe) — Transformation en histoire cohérente
4. **Invoque `presentation-architect`** — Conception de la structure des slides
5. **Invoque `theme-designer`** (si style personnalisé demandé) — Définition du thème visuel
6. **Invoque `chart-generator`** — Pour chaque graphique nécessaire
7. **Invoque `diagram-generator`** (si diagrammes nécessaires) — Pour flowcharts, architectures, etc.
8. **Invoque `stock-photo-finder`** (si images d'illustration nécessaires) — Pour trouver des photos stock
9. **Invoque `pptx-builder`** — Génération du fichier PowerPoint final

### Utilisation des sous-agents (Task tool)

Pour les tâches intensives, utiliser un sous-agent est recommandé :

| Skill | Sous-agent recommandé | Raison |
|-------|----------------------|--------|
| data-reader | Non | Opération rapide |
| pdf-reader | Non | Opération CLI directe |
| web-scraper | Non | Opération CLI directe |
| data-analyst | **Oui** | Analyse intensive |
| data-storytelling | **Oui** | Réflexion longue |
| chart-generator | Non | Exécution CLI directe |
| diagram-generator | Non | Exécution CLI directe |
| map-generator | Non | Exécution CLI directe |
| presentation-architect | **Oui** | Conception créative |
| icon-finder | Non | Exécution CLI directe |
| theme-designer | Non | Choix simple |
| stock-photo-finder | Non | Recherche et téléchargement CLI |
| pptx-builder | Non | Exécution CLI directe |

---

## Exemples de Prompts Utilisateur

### Rapport Mensuel / Trimestriel

```
J'ai un fichier Excel avec les KPIs du mois (kpis-novembre.xlsx).
Crée une présentation de revue mensuelle pour le comité de direction :
- 10-12 slides
- Focus sur : performance vs objectifs, tendances, alertes
- Inclure des graphiques de comparaison avec le mois précédent
- Terminer par les priorités du mois prochain
```

**Réponse attendue de Claude :**
1. Invoquer `data-reader` pour lire kpis-novembre.xlsx
2. Invoquer `data-analyst` pour analyser les KPIs
3. Invoquer `presentation-architect` pour structurer les 10-12 slides
4. Invoquer `chart-generator` pour les graphiques de comparaison
5. Invoquer `pptx-builder` pour générer le fichier final

### Pitch Commercial / Investisseurs

```
À partir du fichier business-plan.xlsx et du document market-study.pdf,
crée un pitch deck de 10 slides pour des investisseurs.
```

**Réponse attendue de Claude :**
1. Invoquer `data-reader` pour lire business-plan.xlsx
2. Lire market-study.pdf (PDF natif)
3. Invoquer `data-analyst` pour extraire les métriques clés
4. Invoquer `data-storytelling` pour construire le narratif investisseur
5. Invoquer `presentation-architect` pour le pitch deck
6. Invoquer `chart-generator` pour les projections financières
7. Invoquer `pptx-builder` pour générer le pitch deck final

### Analyse de Données Exploratoire

```
Voici un dataset (data.csv) que je ne connais pas bien.
Explore les données et crée une présentation de 10 slides résumant tes découvertes.
```

**Réponse attendue de Claude :**
1. Invoquer `data-reader` pour lire et schématiser data.csv
2. Invoquer `data-analyst` pour exploration complète
3. Invoquer `data-storytelling` pour structurer les découvertes
4. Invoquer `presentation-architect` pour les 10 slides
5. Invoquer `chart-generator` pour les visualisations
6. Invoquer `pptx-builder` pour le fichier final

---

## Formats de Fichiers Supportés

### Données Structurées
| Format | Extension | Skill à invoquer |
|--------|-----------|------------------|
| Excel | .xlsx, .xls | `data-reader` |
| CSV | .csv | `data-reader` |
| TSV | .tsv | `data-reader` |
| JSON | .json | `data-reader` |

### Documents
| Format | Extension | Méthode |
|--------|-----------|---------|
| PDF (petit) | .pdf | Lecture native Claude (jusqu'à ~20MB) |
| PDF (volumineux) | .pdf | `pdf-reader` — extraction, recherche, pages spécifiques |
| Markdown | .md | Lecture native Claude |
| Texte | .txt | Lecture native Claude |

> **Note** : Word (.docx) n'est pas encore supporté nativement. Convertir en PDF au préalable.
>
> **Tip** : Utiliser `pdf-reader` pour les PDFs > 20MB, pour extraire des pages spécifiques, rechercher du texte, ou extraire des tableaux.

### Fichiers Volumineux (>100 MB)

Le skill `data-reader` supporte automatiquement les fichiers CSV volumineux via le mode streaming :

| Commande | Usage | Exemple |
|----------|-------|---------|
| `--stats` | Stats rapides sans charger les données | `npx tsx src/cli/data-read.ts --file large.csv --stats` |
| `--max-rows <n>` | Lire les N premières lignes | `--max-rows 10000` |
| `--sample <rate>` | Échantillonnage aléatoire (0-1) | `--sample 0.01` (1%) |

**Workflow recommandé pour fichiers >100 MB :**
1. D'abord `--stats` pour comprendre la taille
2. Puis `--max-rows 10000 --schema` pour le schéma
3. Enfin `--sample 0.05 --quality` pour l'analyse qualité sur 5%

---

## Structure de Sortie

| Type | Emplacement |
|------|-------------|
| Fichier PowerPoint | `output/` |
| Graphiques PNG | `output/charts/` |
| Diagrammes PNG | `output/diagrams/` |
| Photos stock | `output/photos/` |

---

## Personnalisation du Style

Quand l'utilisateur demande un style particulier, **invoquer `theme-designer`** :

```
Utilise un thème professionnel bleu corporate pour la présentation.
```

```
Crée une présentation avec le style suivant :
- Palette : bleu foncé (#1E3A5F) et orange (#EE6C4D)
- Police : Arial
- Style : minimaliste, peu de texte, beaucoup de visuels
```

---

## Pièges Courants à Éviter

### 1. Lecture de fichiers Excel avec plusieurs feuilles

Le skill `data-reader` gère automatiquement les feuilles multiples. Préciser si nécessaire :
```
Lis la feuille 'Données' du fichier data.xlsx
```

### 2. Graphiques flous dans PowerPoint

Le skill `chart-generator` calcule automatiquement les dimensions optimales pour le PPTX. Ne pas générer de graphiques à des dimensions arbitraires.

### 3. Images déformées dans PowerPoint

Le skill `pptx-builder` **préserve automatiquement le ratio d'aspect** des images par défaut grâce au mode `contain`. Les trois modes disponibles sont :

| Mode | Comportement | Quand l'utiliser |
|------|--------------|------------------|
| `contain` | **Par défaut.** Préserve le ratio, **auto-centre** l'image dans la zone | Photos, graphiques, diagrammes |
| `cover` | Préserve le ratio, remplit la zone (peut rogner) | Images de fond, décoration |
| `stretch` | Déforme pour remplir exactement | **À éviter** - cas très rares |

```json
{
  "type": "image",
  "path": "output/photos/image.jpg",
  "position": { "x": 0.5, "y": 1.2, "w": 9, "h": 4.2 },
  "sizing": { "type": "contain" }
}
```

> **Centrage automatique** : En mode `contain`, l'image est automatiquement centrée dans la zone définie. Si l'image a un ratio différent de la zone, elle sera centrée horizontalement ou verticalement selon le cas.

> ⚠️ **Ne jamais utiliser `stretch`** sauf si la déformation est intentionnelle.

### 4. Structure du thème PPTX

Le skill `theme-designer` génère automatiquement une structure de thème valide. Ne pas construire manuellement le JSON du thème.

### 5. Diagrammes avec mauvais ratio pour PPTX

Le CLI `diagram-render` affiche automatiquement les **dimensions et le ratio** après génération. Si le ratio est hors de la plage **1.5:1 à 3:1**, un warning s'affiche :

```
⚠️  Ratio too wide (4.99:1) for PPTX slides.
   Optimal range: 1.5:1 to 3:1
   Tip: Add more vertical elements or use subgraphs to balance the layout.
```

**Action requise** : Restructurer le diagramme Mermaid en suivant les conseils du warning avant de l'utiliser dans la présentation. Voir le skill `diagram-generator` pour les patterns recommandés.

---

## Tips pour de Meilleurs Résultats

### 1. Soyez spécifique sur l'audience

```
❌ "Crée une présentation sur les ventes"
✅ "Crée une présentation des ventes Q4 pour le comité de direction,
    focus sur la croissance et les défis, 15 minutes max"
```

### 2. Indiquez le niveau de détail

```
❌ "Analyse ce fichier"
✅ "Analyse ce fichier et donne-moi :
    - 3 insights principaux avec chiffres
    - Les anomalies à investiguer
    - Une recommandation d'action"
```

### 3. Précisez le style visuel

```
❌ "Fais des graphiques"
✅ "Crée des graphiques épurés style Tufte :
    - Pas de grilles lourdes
    - Couleurs sobres
    - Annotations sur les points clés"
```

### 4. Demandez des itérations

```
"Montre-moi d'abord la structure proposée avant de générer les slides"
"Propose 3 variantes de graphique pour ce data et je choisirai"
"Ajuste le slide 5 pour mettre plus en avant le chiffre de croissance"
```

---

## Résolution de Problèmes

### "Le fichier Excel ne se lit pas bien"
→ Invoquer `data-reader` avec précision sur la feuille ou les lignes d'en-tête à ignorer.

### "Les graphiques ne sont pas assez clairs"
→ Réinvoquer `chart-generator` avec des instructions de simplification.

### "La présentation est trop longue"
→ Réinvoquer `presentation-architect` avec une contrainte de nombre de slides.

### "Le style ne correspond pas"
→ Invoquer `theme-designer` avec les spécifications exactes de l'utilisateur.

### "Les diagrammes sont déformés/trop petits dans les slides"
→ Vérifier le ratio affiché par `diagram-render`. Si hors plage 1.5:1 à 3:1, restructurer le diagramme :
  - Trop vertical → utiliser `flowchart LR` au lieu de `TB`
  - Trop large → ajouter des éléments verticaux avec subgraphs empilés

### "Le fichier CSV/Excel est trop volumineux (erreur mémoire)"
→ Utiliser les options de `data-reader` pour les fichiers >100 MB :
  - `--stats` : obtenir les statistiques sans charger les données
  - `--max-rows 10000` : lire seulement les N premières lignes
  - `--sample 0.01` : échantillonner 1% du fichier aléatoirement

> Le mode streaming est activé automatiquement pour les fichiers CSV >100 MB.

---

## Technologies de Visualisation

### Graphiques : Vega-Lite

Les graphiques sont générés avec **Vega-Lite**, une grammaire de visualisation déclarative :

- **Déclaratif** : Spécifications JSON décrivant le graphique
- **Puissant** : Transformations, agrégations, interactions
- **Export direct** : PNG/SVG via vl-convert (pas de navigateur)

```bash
# Génération depuis ChartConfig
npx tsx src/cli/chart-render.ts --config chart.json --output chart.png

# Génération depuis spec Vega-Lite native
npx tsx src/cli/chart-render.ts --spec vega-spec.json --output chart.png

# PNG optimisé pour PowerPoint (8" x 4")
npx tsx src/cli/chart-render.ts --config chart.json --output chart.png --pptx-position "8:4"
```

### Diagrammes : Kroki API

Les diagrammes sont rendus via **Kroki**, une API unifiée :

- **25+ formats** : Mermaid, PlantUML, GraphViz, D2, etc.
- **Sans dépendance** : Rendu côté serveur via HTTP
- **Simple** : POST le code, reçoit l'image

```bash
# Mermaid
npx tsx src/cli/diagram-render.ts --type mermaid --input diagram.mmd --output diagram.png

# PlantUML
npx tsx src/cli/diagram-render.ts --type plantuml --input classes.puml --output classes.png

# D2
npx tsx src/cli/diagram-render.ts --type d2 --input arch.d2 --output arch.svg --format svg
```

**Serveur Kroki** : kroki.io (public, gratuit) ou self-hosted.

### Images Stock : Pexels API

Les images d'illustration sont téléchargées via **Pexels**, une plateforme de photos libres de droits :

- **Gratuit** : 200 requêtes/heure, aucun frais
- **Haute qualité** : Photos professionnelles curatées
- **Licence libre** : Utilisation commerciale sans attribution obligatoire

```bash
# Recherche d'images
npx tsx src/cli/photo-search.ts --query "business meeting" --orientation landscape

# Téléchargement
npx tsx src/cli/photo-search.ts --query "teamwork" --download --output-dir output/photos

# Photo spécifique par ID
npx tsx src/cli/photo-search.ts --id 3184339 --download --size large
```

**Prérequis** : Clé API gratuite sur https://www.pexels.com/api/

---

## Contrats d'Échange entre Skills

Les skills communiquent via des structures de données typées. Le projet utilise **Zod** pour la validation runtime des contrats aux frontières entre skills.

### Architecture des Contrats

```
src/contracts/
├── schemas.ts    # Schémas Zod pour toutes les structures de données
├── registry.ts   # Définition des flux entre skills
└── index.ts      # Barrel export
```

### Flux de Données Principaux

| Transition | Format | Fichier Type | Validation |
|------------|--------|--------------|------------|
| `data-reader` → `data-analyst` | `ReadResult` (DataFrame + Schema + Quality) | `/tmp/data-*.json` | `ReadResultSchema` |
| `data-analyst` → `chart-generator` | `ChartConfig` | `output/charts/*.json` | `ChartConfigSchema` |
| `chart-generator` → `pptx-builder` | PNG image | `output/charts/*.png` | `ChartRenderResultSchema` |
| `diagram-generator` → `pptx-builder` | PNG image | `output/diagrams/*.png` | Dimensions + ratio |
| `map-generator` → `pptx-builder` | PNG/SVG image | `output/maps/*.png` | Success + paths |
| `stock-photo-finder` → `pptx-builder` | JPEG image | `output/photos/*.jpg` | Photo metadata |
| `presentation-architect` → `pptx-builder` | `PresentationSpec` | JSON inline | `PresentationSpecSchema` |

### Utilisation de la Validation

```typescript
import { validateOrThrow, DataFrameSchema, ChartConfigSchema } from './contracts';

// Validation avec erreur explicite
const dataFrame = validateOrThrow(DataFrameSchema, rawData, 'data-reader output');

// Validation safe (retourne result object)
const result = validateSafe(ChartConfigSchema, config);
if (!result.success) {
  console.error('Validation errors:', result.errors);
}
```

### Structures de Données Clés

#### DataFrame (data-reader → data-analyst)
```typescript
interface DataFrame {
  columns: string[];           // Noms des colonnes
  data: Record<string, unknown[]>;  // Données par colonne
  rowCount: number;            // Nombre de lignes
}
```

#### ChartConfig (data-analyst → chart-generator)
```typescript
interface ChartConfig {
  type: ChartType;             // 'bar' | 'line' | 'pie' | ...
  title?: ChartTitle;          // Titre et sous-titre
  data: ChartData;             // Catégories + séries
  options?: ChartOptions;      // Axes, légende, etc.
  theme?: ChartTheme;          // Couleurs, polices
}
```

#### PresentationSpec (presentation-architect → pptx-builder)
```typescript
interface PresentationSpec {
  metadata: PresentationMetadata;  // Titre, auteur, etc.
  settings: PresentationSettings;  // Layout (16:9, 4:3)
  theme?: PresentationTheme;       // Thème visuel
  slides: SlideSpec[];             // Union discriminée des types de slides
}
```

### Logging Structuré

Le projet inclut un système de logs structurés pour l'observabilité :

```typescript
import { createSkillLogger } from './utils';

const logger = createSkillLogger('chart-generator');
logger.start({ type: 'ChartConfig', path: 'chart.json' });
// ... exécution ...
logger.success({ type: 'PNG', path: 'output/charts/chart.png' });
```

Output JSON :
```json
{"timestamp":"2025-01-15T10:30:00Z","level":"info","skill":"chart-generator","action":"start","input":{"type":"ChartConfig","path":"chart.json"}}
{"timestamp":"2025-01-15T10:30:02Z","level":"info","skill":"chart-generator","action":"success","output":{"type":"PNG","path":"output/charts/chart.png"},"duration":2000}
```

---

## Référence Rapide des Skills

| Besoin | Skill à invoquer |
|--------|------------------|
| Lire un fichier de données | `data-reader` |
| Lire un PDF volumineux | `pdf-reader` |
| Extraire des données du web | `web-scraper` |
| Analyser des données | `data-analyst` |
| Créer un narratif | `data-storytelling` |
| Structurer une présentation | `presentation-architect` |
| Définir un style visuel | `theme-designer` |
| Créer un graphique | `chart-generator` |
| Créer un diagramme | `diagram-generator` |
| Créer une carte géographique | `map-generator` |
| Trouver des icônes | `icon-finder` |
| Trouver des images stock | `stock-photo-finder` |
| Générer le PPTX final | `pptx-builder` |

**Rappel : Chaque skill contient sa documentation complète. L'invoquer te donnera toutes les instructions nécessaires.**