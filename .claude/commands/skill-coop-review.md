---
name: skill-coop-review
description: Evaluates cooperation between skills - exchange formats, orchestration and agent architecture
tags: [architecture, skills, orchestration, review]
version: 1.0.0
---

# Skill Cooperation Evaluation

## Objective
Analyze how skills collaborate, evaluate the clarity of exchange formats, and recommend orchestration patterns inspired by web agent architectures.

## Methodology

### 1. Data Exchange Analysis
- Identify all exchange points between skills
- Verify explicit format definitions (TypeScript types, JSON schemas)
- Detect implicit couplings or hidden dependencies
- Validate interface consistency

### 2. Coordination Evaluation
- **Where is orchestration defined?**
  - In `.claude/` files (custom_tools, commands)
  - In TypeScript code (services, types)
  - In system prompts

- **Orchestration levels:**
  - **Declarative orchestration**: Definition in CLAUDE.md or front matter
  - **Procedural orchestration**: Logic in individual skills
  - **Intelligent orchestration**: Claude decides workflow based on context

### 3. Web/Agent Orchestration Patterns

#### Pattern 1: Agent Hub (Central Coordinator)
```
Claude (Central Orchestrator)
   ├─> Skill A (data)
   ├─> Skill B (analysis) ← uses output from A
   └─> Skill C (visualization) ← uses output from B
```
**Advantages**: Centralized control, traceability
**Disadvantages**: Claude must know all workflows

#### Pattern 2: Agent Pipeline (Chain)
```
Skill A → Skill B → Skill C → Result
```
**Advantages**: Clear sequence, easy to debug
**Disadvantages**: Rigid, not very adaptable

#### Pattern 3: Agent Mesh (Peer-to-peer)
```
Skill A ←→ Skill B
   ↕         ↕
Skill C ←→ Skill D
```
**Advantages**: Flexible, decoupled
**Disadvantages**: Complex, risk of cycles

#### Pattern 4: Event-Driven Agents
```
Event Bus
  ├─ Skill A (emits: data.ready)
  ├─ Skill B (listens: data.ready, emits: analysis.done)
  └─ Skill C (listens: analysis.done)
```
**Advantages**: Maximum decoupling, scalable
**Disadvantages**: Difficult to trace, complex debugging

### 4. Recommendations for this Project

#### Contract Definition (Types)
Create explicit interfaces in `src/types/`:
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

// Specific contracts
export interface DataAnalysisContract {
  input: SkillInput<{ filePath: string; columns?: string[] }>;
  output: SkillOutput<StatisticsResult>;
}
```

#### Orchestration in CLAUDE.md
```markdown
## Predefined Workflows

### Workflow: Analysis → Visualization
1. `data-analyze` → generates `analysis.json`
2. `chart-render` ← consumes `analysis.json`
3. Format: `{ type: "statistics", data: StatisticsResult }`

### Workflow: Data → Map
1. `data-read` → extracts lat/lng columns
2. `map-generate` ← consumes coordinates
3. Format: `{ locations: Array<{lat, lng, label}> }`
```

#### Web Orchestration: LangGraph/CrewAI Inspiration

**LangGraph Pattern**:
```python
# Graph definition
graph = StateGraph()
graph.add_node("read", data_read_agent)
graph.add_node("analyze", data_analyze_agent)
graph.add_edge("read", "analyze")
```

**Claude Adaptation**:
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

#### Skill Decoupling
**Principle**: A skill must NOT know about other skills

**Bad**:
```typescript
// In DataAnalyzeService
const chartService = new ChartGeneratorService();
chartService.create(this.results); // ❌ Coupling
```

**Good**:
```typescript
// In DataAnalyzeService
return {
  type: 'statistics',
  data: this.results,
  suggestedNext: ['chart-render', 'pdf-generate']
}; // ✅ Decoupled
```

## Evaluation Checklist

### Exchange Formats
- [ ] All inputs/outputs have defined TypeScript types
- [ ] JSON schemas are documented (for intermediate files)
- [ ] Formats are validated at runtime (Zod, io-ts)
- [ ] Format documentation in README or CLAUDE.md

### Coupling
- [ ] No direct imports between services from different skills
- [ ] Communication via files, API, or events
- [ ] Each skill can function independently
- [ ] Unit tests without cross-dependencies

### Orchestration
- [ ] Common workflows documented in CLAUDE.md
- [ ] Claude can dynamically compose skills
- [ ] Error handling between steps defined
- [ ] Ability to parallelize independent skills

### Observability
- [ ] Structured logs per skill
- [ ] Data traceability between skills
- [ ] Performance metrics per step
- [ ] Facilitated debugging (workflow reproduction)

## Patterns Anti-Patterns

### ❌ Anti-Pattern: God Skill
A skill that does everything and calls others

### ❌ Anti-Pattern: Tight Coupling
Skills that import each other mutually

### ❌ Anti-Pattern: Implicit Contracts
Undocumented exchange formats, based on conventions

### ✅ Pattern: Contract-First
Define interfaces before implementation

### ✅ Pattern: Middleware Layer
Central service for communication (event bus, message queue)

### ✅ Pattern: Schema Registry
Central registry of exchange formats

## Recommended Implementation

### Option A: Declarative Orchestration (Simple)
Define workflows in `CLAUDE.md`, Claude executes sequentially

### Option B: Event-Based Orchestration (Advanced)
```typescript
// src/orchestration/event-bus.ts
class SkillEventBus {
  emit(event: string, data: unknown): void;
  on(event: string, handler: Function): void;
}
```

### Option C: Graph-Based Orchestration (Expert)
```typescript
// Inspired by LangGraph
class WorkflowGraph {
  addNode(skill: Skill): void;
  addEdge(from: string, to: string, condition?: Function): void;
  execute(input: unknown): Promise<unknown>;
}
```

## Analysis to Perform

1. **Scan the code**:
   - Find all imports between `src/lib/*/`
   - Identify direct calls between services

2. **Verify types**:
   - List all types in `src/types/`
   - Verify which services use them
   - Detect `any` or implicit types

3. **Trace workflows**:
   - Identify call sequences in `src/cli/`
   - Document data flows

4. **Propose improvements**:
   - Create missing contracts
   - Decouple coupled services
   - Document recommended orchestration

## Deliverables

1. **Analysis report**: Coupling matrix between skills
2. **Contract schemas**: TypeScript interfaces for all exchanges
3. **Orchestration documentation**: CLAUDE.md update
4. **Workflow examples**: 3-5 documented use cases
5. **Recommended architecture**: Diagram of optimal pattern

---

**Note**: This command combines static code analysis and architectural recommendations based on best practices from multi-agent systems (LangChain, AutoGen, CrewAI, LangGraph).
