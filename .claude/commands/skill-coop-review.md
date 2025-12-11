---
name: skill-coop-review
description: Évalue la coopération entre les skills - formats d'échange, orchestration et architecture d'agents
tags: [architecture, skills, orchestration, review]
version: 1.0.0
---

# Évaluation de la Coopération entre Skills

## Objectif
Analyser comment les skills collaborent, évaluer la clarté des formats d'échange, et recommander des patterns d'orchestration inspirés des architectures web d'agents.

## Méthodologie

### 1. Analyse des Échanges de Données
- Identifier tous les points d'échange entre skills
- Vérifier la définition explicite des formats (types TypeScript, schémas JSON)
- Détecter les couplages implicites ou dépendances cachées
- Valider la cohérence des interfaces

### 2. Évaluation de la Coordination
- **Où se définit l'orchestration ?**
  - Dans les fichiers `.claude/` (custom_tools, commands)
  - Dans le code TypeScript (services, types)
  - Dans les prompts système
  
- **Niveaux d'orchestration :**
  - **Orchestration déclarative** : Définition dans CLAUDE.md ou front matter
  - **Orchestration procédurale** : Logique dans les skills individuels
  - **Orchestration intelligente** : Claude décide du workflow basé sur le contexte

### 3. Patterns d'Orchestration Web/Agents

#### Pattern 1 : Agent Hub (Central Coordinator)
```
Claude (Orchestrateur Central)
   ├─> Skill A (données)
   ├─> Skill B (analyse) ← utilise sortie de A
   └─> Skill C (visualisation) ← utilise sortie de B
```
**Avantages** : Contrôle centralisé, traçabilité
**Inconvénients** : Claude doit connaître tous les workflows

#### Pattern 2 : Agent Pipeline (Chain)
```
Skill A → Skill B → Skill C → Résultat
```
**Avantages** : Séquence claire, facile à déboguer
**Inconvénients** : Rigide, peu adaptable

#### Pattern 3 : Agent Mesh (Peer-to-peer)
```
Skill A ←→ Skill B
   ↕         ↕
Skill C ←→ Skill D
```
**Avantages** : Flexible, découplé
**Inconvénients** : Complexe, risque de cycles

#### Pattern 4 : Event-Driven Agents
```
Event Bus
  ├─ Skill A (émet: data.ready)
  ├─ Skill B (écoute: data.ready, émet: analysis.done)
  └─ Skill C (écoute: analysis.done)
```
**Avantages** : Découplage maximal, évolutif
**Inconvénients** : Difficile à tracer, debugging complexe

### 4. Recommandations pour ce Projet

#### Définition des Contrats (Types)
Créer des interfaces explicites dans `src/types/`:
```typescript
// src/types/skill-contracts.ts
export interface SkillInput<T> {
  type: string;
  data: T;
  metadata?: Record<string, unknown>;
}

export interface SkillOutput<T> {
  type: string;
  data: T;
  nextSkill?: string;
  errors?: string[];
}

// Contrats spécifiques
export interface DataAnalysisContract {
  input: SkillInput<{ filePath: string; columns?: string[] }>;
  output: SkillOutput<StatisticsResult>;
}
```

#### Orchestration dans CLAUDE.md
```markdown
## Workflows Prédéfinis

### Workflow: Analyse → Visualisation
1. `data-analyze` → génère `analysis.json`
2. `chart-render` ← consomme `analysis.json`
3. Format: `{ type: "statistics", data: StatisticsResult }`

### Workflow: Données → Carte
1. `data-read` → extrait colonnes lat/lng
2. `map-generate` ← consomme coordonnées
3. Format: `{ locations: Array<{lat, lng, label}> }`
```

#### Orchestration Web : Inspiration LangGraph/CrewAI

**LangGraph Pattern** :
```python
# Définition de graphe
graph = StateGraph()
graph.add_node("read", data_read_agent)
graph.add_node("analyze", data_analyze_agent)
graph.add_edge("read", "analyze")
```

**Adaptation Claude** :
```typescript
// src/orchestration/workflow-graph.ts
export const workflows = {
  'data-to-insights': {
    steps: ['data-read', 'data-analyze', 'chart-render'],
    contracts: {
      'data-read->data-analyze': DataToAnalysisContract,
      'data-analyze->chart-render': AnalysisToChartContract
    }
  }
}
```

#### Découplage des Skills
**Principe** : Un skill ne doit PAS connaître les autres skills

**Mauvais** :
```typescript
// Dans DataAnalyzeService
const chartService = new ChartGeneratorService();
chartService.create(this.results); // ❌ Couplage
```

**Bon** :
```typescript
// Dans DataAnalyzeService
return {
  type: 'statistics',
  data: this.results,
  suggestedNext: ['chart-render', 'pdf-generate']
}; // ✅ Découplé
```

## Checklist d'Évaluation

### Formats d'Échange
- [ ] Tous les inputs/outputs ont des types TypeScript définis
- [ ] Les schémas JSON sont documentés (pour les fichiers intermédiaires)
- [ ] Les formats sont validés à l'exécution (Zod, io-ts)
- [ ] Documentation des formats dans README ou CLAUDE.md

### Couplage
- [ ] Aucun import direct entre services de skills différents
- [ ] Communication via fichiers, API, ou événements
- [ ] Chaque skill peut fonctionner indépendamment
- [ ] Tests unitaires sans dépendances croisées

### Orchestration
- [ ] Workflows courants documentés dans CLAUDE.md
- [ ] Claude peut composer dynamiquement les skills
- [ ] Gestion d'erreurs entre étapes définie
- [ ] Possibilité de paralléliser les skills indépendants

### Observabilité
- [ ] Logs structurés par skill
- [ ] Traçabilité des données entre skills
- [ ] Métriques de performance par étape
- [ ] Debugging facilité (reproduction des workflows)

## Patterns Anti-Patterns

### ❌ Anti-Pattern : God Skill
Un skill qui fait tout et appelle les autres

### ❌ Anti-Pattern : Tight Coupling
Skills qui s'importent mutuellement

### ❌ Anti-Pattern : Implicit Contracts
Formats d'échange non documentés, basés sur des conventions

### ✅ Pattern : Contract-First
Définir les interfaces avant l'implémentation

### ✅ Pattern : Middleware Layer
Service central pour la communication (event bus, message queue)

### ✅ Pattern : Schema Registry
Registre central des formats d'échange

## Implémentation Recommandée

### Option A : Orchestration Déclarative (Simple)
Définir les workflows dans `CLAUDE.md`, Claude exécute séquentiellement

### Option B : Orchestration par Événements (Avancé)
```typescript
// src/orchestration/event-bus.ts
class SkillEventBus {
  emit(event: string, data: unknown): void;
  on(event: string, handler: Function): void;
}
```

### Option C : Orchestration par Graphe (Expert)
```typescript
// Inspiré de LangGraph
class WorkflowGraph {
  addNode(skill: Skill): void;
  addEdge(from: string, to: string, condition?: Function): void;
  execute(input: unknown): Promise<unknown>;
}
```

## Analyse à Effectuer

1. **Scanner le code** :
   - Trouver tous les imports entre `src/lib/*/`
   - Identifier les appels directs entre services

2. **Vérifier les types** :
   - Lister tous les types dans `src/types/`
   - Vérifier quels services les utilisent
   - Détecter les `any` ou types implicites

3. **Tracer les workflows** :
   - Identifier les séquences d'appels dans `src/cli/`
   - Documenter les flux de données

4. **Proposer des améliorations** :
   - Créer les contrats manquants
   - Découpler les services couplés
   - Documenter l'orchestration recommandée

## Livrables

1. **Rapport d'analyse** : Matrice de couplage entre skills
2. **Schémas de contrats** : Interfaces TypeScript pour tous les échanges
3. **Documentation d'orchestration** : Mise à jour de CLAUDE.md
4. **Exemples de workflows** : 3-5 cas d'usage documentés
5. **Architecture recommandée** : Diagramme du pattern optimal

---

**Note** : Cette commande combine analyse statique du code et recommandations architecturales basées sur les best practices des systèmes multi-agents (LangChain, AutoGen, CrewAI, LangGraph).
