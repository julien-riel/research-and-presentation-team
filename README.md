# Presentation Team

A collection of Claude Code Skills for creating data-driven PowerPoint presentations.

## Overview

This project provides 8 specialized skills that work together to transform data into compelling presentations:

| Skill | Purpose |
|-------|---------|
| **data-reader** | Read and analyze data files (Excel, CSV, JSON) |
| **data-analyst** | Statistical analysis, correlations, trends |
| **data-storytelling** | Transform insights into narratives |
| **chart-generator** | Create visualizations with ECharts |
| **diagram-generator** | Generate diagrams with Mermaid/PlantUML |
| **presentation-architect** | Design presentation structure and flow |
| **theme-designer** | Define visual identity and styling |
| **pptx-builder** | Generate PowerPoint files |

## Installation

```bash
npm install
```

## Usage

### With Claude Code Skills

The skills are located in the `skills/` directory. Each skill contains:
- `SKILL.md` - Instructions and guidelines for Claude
- `references/` - Detailed documentation and guides
- `assets/` - Templates, palettes, and configurations

### CLI Tools

```bash
# Read and analyze data
npx tsx src/cli/data-read.ts --file data.xlsx --schema --preview

# Statistical analysis
npx tsx src/cli/data-analyze.ts --file data.csv --describe --correlations

# Generate charts
npx tsx src/cli/chart-render.ts --config chart.json --output chart.png

# Generate diagrams
npx tsx src/cli/diagram-render.ts --type mermaid --input diagram.mmd --output diagram.png

# Build PowerPoint
npx tsx src/cli/pptx-build.ts --spec presentation.json --output presentation.pptx
```

## Skills Philosophy

Each skill is designed to think like the best experts in their field:

### Data Reader
Inspired by **Joe Reis** (Fundamentals of Data Engineering) and **Martin Kleppmann** (Designing Data-Intensive Applications).

### Data Analyst
Combines approaches from **John Tukey** (EDA), **Ronald Fisher** (statistical rigor), and **Daniel Kahneman** (cognitive biases).

### Data Storytelling
Based on **Cole Nussbaumer Knaflic** (Storytelling with Data), **Hans Rosling** (Factfulness), and **Nancy Duarte** (DataStory).

### Chart Generator
Implements principles from **Edward Tufte** (data-ink ratio), **Stephen Few** (Show Me the Numbers), and **Jacques Bertin** (visual variables).

### Diagram Generator
Follows **Dan Roam** (The Back of the Napkin), **Simon Brown** (C4 Model), and **Martin Fowler** (UML Distilled).

### Presentation Architect
Synthesizes **Nancy Duarte** (Resonate), **Garr Reynolds** (Presentation Zen), **Barbara Minto** (Pyramid Principle), and **Carmine Gallo** (Talk Like TED).

### Theme Designer
Applies **Josef Albers** (color theory), **Jan Tschichold** (typography), and **Dieter Rams** (less is more).

## Project Structure

```
presentation-team/
├── skills/
│   ├── data-reader/
│   ├── data-analyst/
│   ├── data-storytelling/
│   ├── chart-generator/
│   ├── diagram-generator/
│   ├── presentation-architect/
│   ├── theme-designer/
│   └── pptx-builder/
├── src/
│   ├── cli/              # Command-line tools
│   ├── lib/              # Shared libraries
│   └── types/            # TypeScript definitions
├── output/               # Generated files
├── package.json
└── tsconfig.json
```

## Dependencies

- **exceljs** - Excel file handling
- **csv-parse** - CSV parsing
- **arquero** - Data manipulation
- **simple-statistics** - Statistical functions
- **echarts** + **canvas** - Chart generation
- **pptxgenjs** - PowerPoint generation
- **sharp** - Image processing

## License

MIT
