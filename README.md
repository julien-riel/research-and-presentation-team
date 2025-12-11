# Presentation Team

**Turn data into polished PowerPoint presentations through conversation with AI.**

Presentation Team is a Claude Code skills system that transforms raw data, PDFs, and ideas into professional presentations. Instead of spending hours on formatting, charts, and slide layouts, simply describe what you need and let 13 specialized AI skills do the heavy lifting.

## The Problem

Creating presentations is tedious:
- Hours spent formatting instead of thinking about content
- Manual chart creation from spreadsheets
- Inconsistent styles across slides
- No time left to iterate on the story

## The Solution

A skills-based architecture where 13 specialized AI experts collaborate:

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  DATA INPUT  │────▶│   ANALYSIS   │────▶│   VISUALS    │────▶│    OUTPUT    │
│              │     │              │     │              │     │              │
│ data-reader  │     │ data-analyst │     │ chart-gen    │     │ pptx-builder │
│ pdf-reader   │     │ storytelling │     │ diagram-gen  │     │              │
│ web-scraper  │     │ architect    │     │ photo-finder │     │              │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
```

## Features

- **13 Specialized Skills**: Each skill is a domain expert (data analysis, visualization, presentation design)
- **Multiple Input Formats**: Excel, CSV, JSON, PDF, and web scraping
- **Professional Charts**: Vega-Lite powered visualizations exported to PNG
- **Architecture Diagrams**: 25+ formats via Kroki API (Mermaid, PlantUML, GraphViz...)
- **Stock Photos**: Pexels integration for professional imagery
- **Type Safety**: Zod validation at every skill boundary
- **Large File Support**: Streaming for files >100MB

## Quick Start

### Prerequisites

- Node.js 18+
- Claude Code CLI with skills support
- Pexels API key (free) for stock photos

### Installation

```bash
git clone https://github.com/your-username/presentation-team.git
cd presentation-team
npm install

# Optional: Set up Pexels API key for stock photos
export PEXELS_API_KEY=your_key_here
```

### Usage with Claude Code

Start Claude Code in the project directory:

```bash
cd presentation-team
claude
```

Then simply describe what you need:

```
Create a 10-slide presentation from sales-data.xlsx focusing on Q4 performance.
Include charts comparing this year vs last year.
```

Claude will automatically invoke the appropriate skills in sequence:
1. `data-reader` loads the Excel file
2. `data-analyst` finds trends and insights
3. `presentation-architect` designs the slide structure
4. `chart-generator` creates visualizations
5. `pptx-builder` generates the final PowerPoint

## The 13 Skills

| Category | Skills | What They Do |
|----------|--------|--------------|
| **Data Input** | `data-reader`, `pdf-reader`, `web-scraper` | Load Excel, CSV, JSON, PDFs, and web tables |
| **Analysis** | `data-analyst`, `data-storytelling` | Statistical analysis, trend detection, narrative crafting |
| **Visualization** | `chart-generator`, `diagram-generator`, `map-generator` | Charts, diagrams, choropleth maps |
| **Design** | `presentation-architect`, `theme-designer`, `icon-finder`, `stock-photo-finder` | Slide structure, visual themes, assets |
| **Build** | `pptx-builder` | PowerPoint generation |

## Technology Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| Charts | [Vega-Lite](https://vega.github.io/vega-lite/) | Declarative visualization grammar |
| Diagrams | [Kroki](https://kroki.io/) | Unified API for 25+ diagram types |
| PowerPoint | [PptxGenJS](https://gitbrent.github.io/PptxGenJS/) | Programmatic .pptx generation |
| Validation | [Zod](https://zod.dev/) | Runtime type safety |
| Data | [ExcelJS](https://github.com/exceljs/exceljs), csv-parse | File parsing |

## Example Prompts

### Monthly Report
```
Create a 12-slide monthly review from kpis-november.xlsx for the executive committee.
Focus on performance vs objectives, trends, and alerts.
End with next month's priorities.
```

### Investor Pitch
```
Build a 10-slide pitch deck from business-plan.xlsx and market-study.pdf.
Make it compelling for Series A investors.
```

### Data Exploration
```
I have this dataset (data.csv) I don't know well.
Explore it and create a presentation summarizing your discoveries.
```

## Project Structure

```
presentation-team/
├── .claude/
│   ├── skills/           # 13 skill definitions
│   │   ├── data-reader/
│   │   ├── chart-generator/
│   │   ├── pptx-builder/
│   │   └── ...
│   └── commands/         # Slash commands for validation
│       ├── skill-review.md       # Evaluate individual skill quality
│       └── skill-coop-review.md  # Evaluate skill cooperation
├── src/
│   ├── cli/              # CLI entry points
│   ├── lib/              # Core services
│   │   ├── data/         # DataReaderService
│   │   ├── analysis/     # StatisticsService
│   │   ├── visualization/# ChartGeneratorService
│   │   ├── rendering/    # KrokiService
│   │   └── presentation/ # PptxBuilderService
│   ├── contracts/        # Zod schemas & validation
│   └── types/            # TypeScript interfaces
├── output/               # Generated files
│   ├── charts/
│   ├── diagrams/
│   └── *.pptx
└── CLAUDE.md             # Project instructions for Claude
```

## Data Contracts

Skills communicate through validated data structures:

```
data-reader ──▶ DataFrame ──▶ data-analyst
                    │
                    ▼
            chart-generator ──▶ PNG ──▶ pptx-builder
                                            │
                                            ▼
                                        .pptx file
```

Every data exchange is validated with Zod schemas to ensure type safety at runtime.

## CLI Tools

Each skill has a corresponding CLI tool for direct usage:

```bash
# Read data
npx tsx src/cli/data-read.ts --file data.xlsx --schema --quality

# Generate chart
npx tsx src/cli/chart-render.ts --config chart.json --output chart.png

# Create diagram
npx tsx src/cli/diagram-render.ts --type mermaid --input flow.mmd --output diagram.png

# Build presentation
npx tsx src/cli/pptx-build.ts --spec presentation.json --output slides.pptx
```

## Meta-Presentation

This repository includes a presentation about itself, generated by its own system:

```bash
# The presentation was created by invoking:
# 1. presentation-architect (structure)
# 2. theme-designer (visual theme)
# 3. diagram-generator (architecture diagrams)
# 4. stock-photo-finder (images from Pexels)
# 5. pptx-builder (final .pptx)

open output/presentation-team-how-it-works.pptx
```

## Contributing

Contributions are welcome! Here's how you can help:

1. **Report bugs**: Open an issue describing the problem
2. **Request features**: Describe your use case in an issue
3. **Submit PRs**: Fork, branch, and submit a pull request
4. **Improve docs**: Help make the documentation clearer
5. **Add skills**: Create new specialized skills

### Development Setup

```bash
git clone https://github.com/your-username/presentation-team.git
cd presentation-team
npm install
npm run build
npm test
```

### Creating a New Skill

1. Create a directory in `.claude/skills/your-skill-name/`
2. Add a `SKILL.md` file with the skill definition
3. Implement the CLI tool in `src/cli/`
4. Add the service in `src/lib/`
5. Define contracts in `src/contracts/`

### Skill Quality Validation

The project includes two slash commands in `.claude/commands/` to ensure skill quality and cooperation:

#### `/skill-review` - Individual Skill Quality

Evaluates each skill across 4 axes:

| Axis | Weight | What It Checks |
|------|--------|----------------|
| **Clarity & Exploitability** | 30% | Front matter, description, actionable instructions, CLI examples |
| **Domain Expertise** | 25% | Expert persona, authoritative references (Tufte, Duarte, etc.) |
| **Tools & Documentation** | 25% | CLI completeness, input/output formats, error handling |
| **General Quality** | 20% | Consistency, completeness, maintainability |

```bash
# Run the skill review in Claude Code
/skill-review
```

**Output**: Detailed report with scores (1-5) for each skill, recommendations, and identification of the best skill as a reference model.

#### `/skill-coop-review` - Skill Cooperation Analysis

Evaluates how skills collaborate:

- **Data Exchange Formats**: Are TypeScript types and JSON schemas defined?
- **Coupling Analysis**: Do skills depend on each other directly? (anti-pattern)
- **Orchestration Patterns**: Hub, Pipeline, Mesh, or Event-Driven?
- **Contract Validation**: Is Zod validation used at every boundary?

```bash
# Run the cooperation review in Claude Code
/skill-coop-review
```

**Output**: Coupling matrix, workflow documentation, architecture recommendations inspired by LangGraph/CrewAI patterns.

#### Why This Matters

These commands help maintain skill quality as the project evolves:

- **Prevent skill drift**: Ensure skills stay focused on their domain
- **Maintain contracts**: Keep data exchange formats explicit and validated
- **Avoid coupling**: Skills should communicate via files/events, not direct imports
- **Document workflows**: Make orchestration patterns explicit in CLAUDE.md

## License

MIT License - free to use and modify.

## Acknowledgments

- [Claude Code](https://claude.ai) for the skills system
- [Vega-Lite](https://vega.github.io/vega-lite/) for visualization grammar
- [Kroki](https://kroki.io/) for diagram rendering
- [PptxGenJS](https://gitbrent.github.io/PptxGenJS/) for PowerPoint generation
- [Pexels](https://pexels.com/) for stock photography

---

**Star this repo if you find it useful!**
