# Usage Guide - Presentation Team

This project uses Claude Code to create professional PowerPoint presentations from data and documents.

---

## Critical Instructions for Claude

### MANDATORY Use of Skills

**This project has 13 specialized skills. You MUST invoke them via the `Skill` tool rather than executing CLI commands directly or reading SKILL.md files manually.**

#### How to invoke a skill

Use the `Skill` tool with the `command` parameter containing the skill name:

| Command | When to invoke |
|---------|----------------|
| `command: "data-reader"` | When an Excel, CSV, JSON, or TSV file needs to be read |
| `command: "pdf-reader"` | To read large PDFs, extract pages, search text |
| `command: "web-scraper"` | To extract tables and data from web pages |
| `command: "data-analyst"` | For statistics, correlations, trends, anomalies |
| `command: "data-storytelling"` | To transform insights into a coherent narrative |
| `command: "chart-generator"` | To create any type of chart (bar, line, pie, scatter, etc.) |
| `command: "diagram-generator"` | To create diagrams (flowchart, architecture, sequence, etc.) |
| `command: "map-generator"` | To create choropleth maps with country data |
| `command: "presentation-architect"` | To structure a presentation (slides, flow, key messages) |
| `command: "theme-designer"` | To define the visual style (colors, fonts, layout) |
| `command: "icon-finder"` | To find and download icons (Lucide Icons) |
| `command: "stock-photo-finder"` | To find and download stock images (Pexels) |
| `command: "pptx-builder"` | To generate the final PowerPoint file |

#### Strict rules

✅ **ALWAYS** invoke the appropriate skill via the Skill tool
✅ **ALWAYS** follow the instructions returned by the skill
✅ **ALWAYS** use skills in sequence according to the workflow below

❌ **NEVER** execute `npx tsx src/cli/...` directly without having invoked the corresponding skill
❌ **NEVER** read SKILL.md files with cat/view and then improvise
❌ **NEVER** ignore a relevant skill for the requested task

---

## Mandatory Workflow for a Presentation

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  DATA-READER    │────▶│  DATA-ANALYST   │────▶│  PRESENTATION-  │────▶│  PPTX-BUILDER   │
│  Read files     │     │  Analysis &     │     │  ARCHITECT      │     │  Final          │
│                 │     │  insights       │     │  Structure      │     │  generation     │
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

### Detailed sequence

1. **Invoke `data-reader`** — Read data files (Excel, CSV, JSON)
2. **Invoke `data-analyst`** — Statistical analysis and insight identification
3. **Invoke `data-storytelling`** (if complex narrative) — Transform into coherent story
4. **Invoke `presentation-architect`** — Design slide structure
5. **Invoke `theme-designer`** (if custom style requested) — Define visual theme
6. **Invoke `chart-generator`** — For each required chart
7. **Invoke `diagram-generator`** (if diagrams needed) — For flowcharts, architectures, etc.
8. **Invoke `stock-photo-finder`** (if illustration images needed) — To find stock photos
9. **Invoke `pptx-builder`** — Generate final PowerPoint file

### Using sub-agents (Task tool)

For intensive tasks, using a sub-agent is recommended:

| Skill | Sub-agent recommended | Reason |
|-------|----------------------|--------|
| data-reader | No | Quick operation |
| pdf-reader | No | Direct CLI operation |
| web-scraper | No | Direct CLI operation |
| data-analyst | **Yes** | Intensive analysis |
| data-storytelling | **Yes** | Long reflection |
| chart-generator | No | Direct CLI execution |
| diagram-generator | No | Direct CLI execution |
| map-generator | No | Direct CLI execution |
| presentation-architect | **Yes** | Creative design |
| icon-finder | No | Direct CLI execution |
| theme-designer | No | Simple choice |
| stock-photo-finder | No | CLI search and download |
| pptx-builder | No | Direct CLI execution |

---

## Example User Prompts

### Monthly / Quarterly Report

```
I have an Excel file with this month's KPIs (kpis-november.xlsx).
Create a monthly review presentation for the executive committee:
- 10-12 slides
- Focus on: performance vs objectives, trends, alerts
- Include comparison charts with the previous month
- End with next month's priorities
```

**Expected Claude response:**
1. Invoke `data-reader` to read kpis-november.xlsx
2. Invoke `data-analyst` to analyze the KPIs
3. Invoke `presentation-architect` to structure the 10-12 slides
4. Invoke `chart-generator` for comparison charts
5. Invoke `pptx-builder` to generate the final file

### Sales / Investor Pitch

```
From business-plan.xlsx and market-study.pdf,
create a 10-slide pitch deck for investors.
```

**Expected Claude response:**
1. Invoke `data-reader` to read business-plan.xlsx
2. Read market-study.pdf (native PDF)
3. Invoke `data-analyst` to extract key metrics
4. Invoke `data-storytelling` to build investor narrative
5. Invoke `presentation-architect` for the pitch deck
6. Invoke `chart-generator` for financial projections
7. Invoke `pptx-builder` to generate the final pitch deck

### Exploratory Data Analysis

```
Here's a dataset (data.csv) I don't know well.
Explore the data and create a 10-slide presentation summarizing your discoveries.
```

**Expected Claude response:**
1. Invoke `data-reader` to read and schematize data.csv
2. Invoke `data-analyst` for complete exploration
3. Invoke `data-storytelling` to structure discoveries
4. Invoke `presentation-architect` for the 10 slides
5. Invoke `chart-generator` for visualizations
6. Invoke `pptx-builder` for the final file

---

## Supported File Formats

### Structured Data
| Format | Extension | Skill to invoke |
|--------|-----------|-----------------|
| Excel | .xlsx, .xls | `data-reader` |
| CSV | .csv | `data-reader` |
| TSV | .tsv | `data-reader` |
| JSON | .json | `data-reader` |

### Documents
| Format | Extension | Method |
|--------|-----------|--------|
| PDF (small) | .pdf | Native Claude reading (up to ~20MB) |
| PDF (large) | .pdf | `pdf-reader` — extraction, search, specific pages |
| Markdown | .md | Native Claude reading |
| Text | .txt | Native Claude reading |

> **Note**: Word (.docx) is not yet natively supported. Convert to PDF beforehand.
>
> **Tip**: Use `pdf-reader` for PDFs > 20MB, to extract specific pages, search text, or extract tables.

### Large Files (>100 MB)

The `data-reader` skill automatically supports large CSV files via streaming mode:

| Option | Usage | Example |
|--------|-------|---------|
| `--stats` | Quick stats without loading data | `npx tsx src/cli/data-read.ts --file large.csv --stats` |
| `--max-rows <n>` | Read first N rows | `--max-rows 10000` |
| `--sample <rate>` | Random sampling (0-1) | `--sample 0.01` (1%) |

**Recommended workflow for files >100 MB:**
1. First `--stats` to understand the size
2. Then `--max-rows 10000 --schema` for the schema
3. Finally `--sample 0.05 --quality` for quality analysis on 5%

---

## Output Structure

| Type | Location |
|------|----------|
| PowerPoint file | `output/` |
| PNG charts | `output/charts/` |
| PNG diagrams | `output/diagrams/` |
| Stock photos | `output/photos/` |
| SVG icons | `output/icons/` |

---

## Style Customization

When the user requests a specific style, **invoke `theme-designer`**:

```
Use a professional blue corporate theme for the presentation.
```

```
Create a presentation with the following style:
- Palette: dark blue (#1E3A5F) and orange (#EE6C4D)
- Font: Arial
- Style: minimalist, little text, lots of visuals
```

---

## Common Pitfalls to Avoid

### 1. Reading Excel files with multiple sheets

The `data-reader` skill automatically handles multiple sheets. Specify if needed:
```
Read the 'Data' sheet from data.xlsx
```

### 2. Blurry charts in PowerPoint

The `chart-generator` skill automatically calculates optimal dimensions for PPTX. Don't generate charts at arbitrary dimensions.

### 3. Distorted images in PowerPoint

The `pptx-builder` skill **automatically preserves aspect ratio** of images by default using `contain` mode. The three available modes are:

| Mode | Behavior | When to use |
|------|----------|-------------|
| `contain` | **Default.** Preserves ratio, **auto-centers** image in the area | Photos, charts, diagrams |
| `cover` | Preserves ratio, fills the area (may crop) | Background images, decoration |
| `stretch` | Distorts to fill exactly | **Avoid** - very rare cases |

```json
{
  "type": "image",
  "path": "output/photos/image.jpg",
  "position": { "x": 0.5, "y": 1.2, "w": 9, "h": 4.2 },
  "sizing": { "type": "contain" }
}
```

> **Auto-centering**: In `contain` mode, the image is automatically centered in the defined area. If the image has a different ratio than the area, it will be centered horizontally or vertically as needed.

> **Never use `stretch`** unless distortion is intentional.

### 4. PPTX theme structure

The `theme-designer` skill automatically generates a valid theme structure. Don't manually build the theme JSON.

### 5. Diagrams with wrong ratio for PPTX

The `diagram-render` CLI automatically displays **dimensions and ratio** after generation. If the ratio is outside the **1.5:1 to 3:1** range, a warning is displayed:

```
  Ratio too wide (4.99:1) for PPTX slides.
   Optimal range: 1.5:1 to 3:1
   Tip: Add more vertical elements or use subgraphs to balance the layout.
```

**Required action**: Restructure the Mermaid diagram following the warning's advice before using it in the presentation. See the `diagram-generator` skill for recommended patterns.

---

## Tips for Better Results

### 1. Be specific about the audience

```
❌ "Create a presentation about sales"
✅ "Create a Q4 sales presentation for the executive committee,
    focus on growth and challenges, 15 minutes max"
```

### 2. Indicate the level of detail

```
❌ "Analyze this file"
✅ "Analyze this file and give me:
    - 3 main insights with numbers
    - Anomalies to investigate
    - An action recommendation"
```

### 3. Specify the visual style

```
❌ "Make some charts"
✅ "Create clean Tufte-style charts:
    - No heavy gridlines
    - Subdued colors
    - Annotations on key points"
```

### 4. Ask for iterations

```
"Show me the proposed structure first before generating the slides"
"Propose 3 chart variants for this data and I'll choose"
"Adjust slide 5 to highlight the growth figure more"
```

---

## Troubleshooting

### "Excel file doesn't read well"
→ Invoke `data-reader` with precision on the sheet or header rows to skip.

### "Charts aren't clear enough"
→ Re-invoke `chart-generator` with simplification instructions.

### "Presentation is too long"
→ Re-invoke `presentation-architect` with a slide count constraint.

### "Style doesn't match"
→ Invoke `theme-designer` with exact user specifications.

### "Diagrams are distorted/too small in slides"
→ Check the ratio displayed by `diagram-render`. If outside 1.5:1 to 3:1 range, restructure the diagram:
  - Too vertical → use `flowchart LR` instead of `TB`
  - Too wide → add vertical elements with stacked subgraphs

### "CSV/Excel file is too large (memory error)"
→ Use `data-reader` options for files >100 MB:
  - `--stats`: get statistics without loading data
  - `--max-rows 10000`: read only the first N rows
  - `--sample 0.01`: sample 1% of the file randomly

> Streaming mode is automatically enabled for CSV files >100 MB.

---

## Visualization Technologies

### Charts: Vega-Lite

Charts are generated with **Vega-Lite**, a declarative visualization grammar:

- **Declarative**: JSON specifications describing the chart
- **Powerful**: Transformations, aggregations, interactions
- **Direct export**: PNG/SVG via vl-convert (no browser needed)

```bash
# Generate from ChartConfig
npx tsx src/cli/chart-render.ts --config chart.json --output chart.png

# Generate from native Vega-Lite spec
npx tsx src/cli/chart-render.ts --spec vega-spec.json --output chart.png

# PNG optimized for PowerPoint (8" x 4")
npx tsx src/cli/chart-render.ts --config chart.json --output chart.png --pptx-position "8:4"
```

### Diagrams: Kroki API

Diagrams are rendered via **Kroki**, a unified API:

- **25+ formats**: Mermaid, PlantUML, GraphViz, D2, etc.
- **No dependencies**: Server-side rendering via HTTP
- **Simple**: POST the code, receive the image

```bash
# Mermaid
npx tsx src/cli/diagram-render.ts --type mermaid --input diagram.mmd --output diagram.png

# PlantUML
npx tsx src/cli/diagram-render.ts --type plantuml --input classes.puml --output classes.png

# D2
npx tsx src/cli/diagram-render.ts --type d2 --input arch.d2 --output arch.svg --format svg
```

**Kroki server**: kroki.io (public, free) or self-hosted.

### Stock Images: Pexels API

Illustration images are downloaded via **Pexels**, a royalty-free photo platform:

- **Free**: 200 requests/hour, no fees
- **High quality**: Professionally curated photos
- **Free license**: Commercial use without mandatory attribution

```bash
# Image search
npx tsx src/cli/photo-search.ts --query "business meeting" --orientation landscape

# Download
npx tsx src/cli/photo-search.ts --query "teamwork" --download --output-dir output/photos

# Specific photo by ID
npx tsx src/cli/photo-search.ts --id 3184339 --download --size large
```

**Prerequisite**: Free API key at https://www.pexels.com/api/

### Icons: Lucide Icons

Icons are downloaded via **Lucide**, an open-source icon library:

- **1500+ icons**: High-quality SVG icons
- **Customizable**: Color, size, stroke width
- **Free**: MIT license, no attribution required
- **No API key**: Direct download from CDN

```bash
# Search for icons
npx tsx src/cli/icon-search.ts --query "chart"

# List available categories
npx tsx src/cli/icon-search.ts --list-categories

# Download icons with custom color and size
npx tsx src/cli/icon-search.ts --query "check" --download --output-dir output/icons --color 2E7D32 --size 64

# Download business icons
npx tsx src/cli/icon-search.ts --category business --download --output-dir output/icons
```

**Common icon categories**: `business`, `finance`, `charts`, `people`, `communication`, `technology`, `navigation`, `actions`, `arrows`, `status`

**Recommended icons by concept**:
| Concept | Icons |
|---------|-------|
| Growth | `trending-up`, `bar-chart`, `arrow-up` |
| Team | `users`, `user-plus`, `contact` |
| Goals | `target`, `flag`, `trophy` |
| Security | `shield-check`, `lock`, `key` |
| Innovation | `lightbulb`, `zap`, `rocket` |
| Validation | `check`, `check-circle`, `thumbs-up` |

**Documentation**: https://lucide.dev

---

## Data Exchange Contracts Between Skills

Skills communicate via typed data structures. The project uses **Zod** for runtime validation of contracts at skill boundaries.

### Contract Architecture

```
src/contracts/
├── schemas.ts    # Zod schemas for all data structures
├── registry.ts   # Definition of flows between skills
└── index.ts      # Barrel export
```

### Main Data Flows

| Transition | Format | File Type | Validation |
|------------|--------|-----------|------------|
| `data-reader` → `data-analyst` | `ReadResult` (DataFrame + Schema + Quality) | `/tmp/data-*.json` | `ReadResultSchema` |
| `data-analyst` → `chart-generator` | `ChartConfig` | `output/charts/*.json` | `ChartConfigSchema` |
| `chart-generator` → `pptx-builder` | PNG image | `output/charts/*.png` | `ChartRenderResultSchema` |
| `diagram-generator` → `pptx-builder` | PNG image | `output/diagrams/*.png` | Dimensions + ratio |
| `map-generator` → `pptx-builder` | PNG/SVG image | `output/maps/*.png` | Success + paths |
| `stock-photo-finder` → `pptx-builder` | JPEG image | `output/photos/*.jpg` | Photo metadata |
| `presentation-architect` → `pptx-builder` | `PresentationSpec` | JSON inline | `PresentationSpecSchema` |

### Using Validation

```typescript
import { validateOrThrow, DataFrameSchema, ChartConfigSchema } from './contracts';

// Validation with explicit error
const dataFrame = validateOrThrow(DataFrameSchema, rawData, 'data-reader output');

// Safe validation (returns result object)
const result = validateSafe(ChartConfigSchema, config);
if (!result.success) {
  console.error('Validation errors:', result.errors);
}
```

### Key Data Structures

#### DataFrame (data-reader → data-analyst)
```typescript
interface DataFrame {
  columns: string[];           // Column names
  data: Record<string, unknown[]>;  // Data by column
  rowCount: number;            // Number of rows
}
```

#### ChartConfig (data-analyst → chart-generator)
```typescript
interface ChartConfig {
  type: ChartType;             // 'bar' | 'line' | 'pie' | ...
  title?: ChartTitle;          // Title and subtitle
  data: ChartData;             // Categories + series
  options?: ChartOptions;      // Axes, legend, etc.
  theme?: ChartTheme;          // Colors, fonts
}
```

#### PresentationSpec (presentation-architect → pptx-builder)
```typescript
interface PresentationSpec {
  metadata: PresentationMetadata;  // Title, author, etc.
  settings: PresentationSettings;  // Layout (16:9, 4:3)
  theme?: PresentationTheme;       // Visual theme
  slides: SlideSpec[];             // Discriminated union of slide types
}
```

### Structured Logging

The project includes a structured logging system for observability:

```typescript
import { createSkillLogger } from './utils';

const logger = createSkillLogger('chart-generator');
logger.start({ type: 'ChartConfig', path: 'chart.json' });
// ... execution ...
logger.success({ type: 'PNG', path: 'output/charts/chart.png' });
```

JSON output:
```json
{"timestamp":"2025-01-15T10:30:00Z","level":"info","skill":"chart-generator","action":"start","input":{"type":"ChartConfig","path":"chart.json"}}
{"timestamp":"2025-01-15T10:30:02Z","level":"info","skill":"chart-generator","action":"success","output":{"type":"PNG","path":"output/charts/chart.png"},"duration":2000}
```

---

## Quick Skill Reference

| Need | Skill to invoke |
|------|-----------------|
| Read a data file | `data-reader` |
| Read a large PDF | `pdf-reader` |
| Extract data from the web | `web-scraper` |
| Analyze data | `data-analyst` |
| Create a narrative | `data-storytelling` |
| Structure a presentation | `presentation-architect` |
| Define a visual style | `theme-designer` |
| Create a chart | `chart-generator` |
| Create a diagram | `diagram-generator` |
| Create a geographic map | `map-generator` |
| Find icons | `icon-finder` |
| Find stock images | `stock-photo-finder` |
| Generate the final PPTX | `pptx-builder` |

**Reminder: Each skill contains its complete documentation. Invoking it will give you all the necessary instructions.**
