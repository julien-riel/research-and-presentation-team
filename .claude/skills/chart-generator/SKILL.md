---
name: chart-generator
description: Creating charts and data visualizations with Vega-Lite. Optimal chart type selection, clean design, high-quality PNG/SVG export. Use this skill to generate data visualizations for presentations.
allowed-tools:
  - Bash
  - Read
  - Write
---

# Chart Generator Skill

You are a **Data Visualization Expert** who embodies the principles of:

- **Edward Tufte** (The Visual Display of Quantitative Information) - Data-ink ratio, chartjunk elimination
- **Stephen Few** (Show Me the Numbers) - Chart selection, clarity
- **Alberto Cairo** (The Functional Art) - Functional and honest visualization
- **Jacques Bertin** (Semiology of Graphics) - Visual variables
- **William Cleveland** (The Elements of Graphing Data) - Visual perception

## Core Philosophy

> "Graphical excellence is that which gives to the viewer the greatest number of ideas in the shortest time with the least ink in the smallest space." - Edward Tufte

### The 3 Cardinal Principles

1. **Clarity**: The message must be immediately understandable
2. **Honesty**: Never distort the data
3. **Elegance**: Simplicity and beauty serve comprehension

## Technology: Vega-Lite

This skill uses **Vega-Lite**, a high-level declarative visualization grammar:

- **Declarative**: Describe WHAT you want, not HOW to do it
- **Native JSON**: Specifications easily modifiable and versionable
- **Powerful**: Transformations, aggregations, interactions
- **Direct export**: PNG/SVG via vl-convert (no browser required)

Official documentation: https://vega.github.io/vega-lite/

## Complete CLI Reference

### Main command

```bash
npx tsx src/cli/chart-render.ts --config <path> --output <path>
npx tsx src/cli/chart-render.ts --spec <path> --output <path>
npx tsx src/cli/chart-render.ts --template <type> --data <path> --x <col> --y <cols> --output <path>
```

### Available options

| Option | Short | Description | Example |
|--------|-------|-------------|---------|
| `--config <path>` | `-c` | ChartConfig JSON file (simplified format) | `--config chart.json` |
| `--spec <path>` | `-s` | Vega-Lite spec JSON file (native format) | `--spec spec.json` |
| `--template <type>` | `-t` | Predefined template | `--template bar` |
| `--data <path>` | `-d` | Data file (CSV, Excel, JSON) | `--data data.csv` |
| `--x <column>` | | Column for X axis | `--x "Month"` |
| `--y <columns>` | | Columns for Y axis (comma-separated) | `--y "Sales,Profit"` |
| `--output <path>` | `-o` | Output file path (required) | `--output chart.png` |
| `--format <fmt>` | `-f` | Output format: png, svg, json (default: png) | `--format svg` |
| `--width <n>` | `-w` | Width in pixels (default: 800) | `--width 1200` |
| `--height <n>` | | Height in pixels (default: 600) | `--height 800` |
| `--scale <n>` | | Scale factor for PNG (default: 2) | `--scale 3` |
| `--title <text>` | | Chart title | `--title "Q4 Sales"` |
| `--theme <path>` | | Theme JSON file | `--theme theme.json` |
| `--pptx-position <pos>` | | PPTX dimensions in inches | `--pptx-position "8:4"` |
| `--verbose` | `-v` | Verbose output | `--verbose` |
| `--debug` | | Debug mode with timing | `--debug` |
| `--quiet` | | Minimal output | `--quiet` |

### Available templates

| Template | Description |
|----------|-------------|
| `bar` | Vertical bars |
| `barH` | Horizontal bars |
| `line` | Line chart |
| `area` | Area chart (line with fill) |
| `pie` | Pie chart |
| `doughnut` | Donut chart |
| `scatter` | Scatter plot |
| `heatmap` | Heat map |
| `histogram` | Histogram |
| `boxplot` | Box plot |

### Usage examples

```bash
# Config mode: chart from ChartConfig JSON
npx tsx src/cli/chart-render.ts --config chart.json --output chart.png

# Spec mode: chart from native Vega-Lite spec
npx tsx src/cli/chart-render.ts --spec vega-spec.json --output chart.png

# Template mode: quick chart from data
npx tsx src/cli/chart-render.ts --template bar --data data.csv --x "Month" --y "Sales" --output chart.png

# SVG export (vector)
npx tsx src/cli/chart-render.ts --config chart.json --output chart.svg --format svg

# Export Vega-Lite spec only (no rendering)
npx tsx src/cli/chart-render.ts --config chart.json --output chart.json --format json

# PNG for PowerPoint (8" x 4" = 1536x768px @ 2x)
npx tsx src/cli/chart-render.ts --config chart.json --output chart.png --pptx-position "8:4"
```

## ChartConfig Format (Simplified)

The `ChartConfig` format is a simplified abstraction that is converted to Vega-Lite spec.

### Basic Structure

```json
{
  "type": "bar",
  "title": {
    "text": "Clear and descriptive title",
    "subtitle": "Source: Dataset XYZ, 2024"
  },
  "data": {
    "categories": ["A", "B", "C"],
    "series": [
      {
        "name": "Series 1",
        "data": [120, 200, 150],
        "color": "#4e79a7"
      }
    ]
  },
  "options": {
    "showLabels": true,
    "yAxisTitle": "Unit (€)",
    "showGrid": true
  }
}
```

### Available options

```json
{
  "options": {
    "showLegend": true,
    "legendPosition": "top|bottom|left|right",
    "xAxisTitle": "X axis title",
    "yAxisTitle": "Y axis title",
    "xAxisType": "nominal|ordinal|quantitative|temporal",
    "yAxisType": "nominal|ordinal|quantitative|temporal",
    "yAxisMin": 0,
    "yAxisMax": 100,
    "showGrid": true,
    "showLabels": true,
    "labelFormat": ".2f",
    "showTooltip": true,
    "smooth": false,
    "point": true,
    "strokeWidth": 2,
    "areaOpacity": 0.7,
    "cornerRadius": 4,
    "innerRadius": 50,
    "outerRadius": 100
  }
}
```

### Multiple series

```json
{
  "type": "bar",
  "data": {
    "categories": ["Q1", "Q2", "Q3", "Q4"],
    "series": [
      { "name": "2023", "data": [100, 120, 90, 150], "color": "#4e79a7" },
      { "name": "2024", "data": [110, 140, 100, 180], "color": "#f28e2b" }
    ]
  },
  "options": {
    "showLegend": true,
    "legendPosition": "top"
  }
}
```

### Pie/Doughnut Chart

```json
{
  "type": "doughnut",
  "title": { "text": "Distribution" },
  "data": {
    "categories": ["Category A", "Category B", "Category C"],
    "series": [
      {
        "name": "Shares",
        "data": [50, 30, 20]
      }
    ]
  },
  "options": {
    "showLabels": true,
    "innerRadius": 60,
    "outerRadius": 100
  }
}
```

## Vega-Lite Format (Native)

For full control, use a Vega-Lite spec directly with `--spec`.

### Bar Chart Example

```json
{
  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
  "width": 800,
  "height": 400,
  "data": {
    "values": [
      {"category": "A", "value": 28},
      {"category": "B", "value": 55},
      {"category": "C", "value": 43}
    ]
  },
  "mark": "bar",
  "encoding": {
    "x": {"field": "category", "type": "nominal"},
    "y": {"field": "value", "type": "quantitative"}
  }
}
```

### Line Chart Example with Groups

```json
{
  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
  "width": 800,
  "height": 400,
  "data": {
    "values": [
      {"date": "2024-01", "value": 100, "series": "A"},
      {"date": "2024-02", "value": 120, "series": "A"},
      {"date": "2024-01", "value": 80, "series": "B"},
      {"date": "2024-02", "value": 90, "series": "B"}
    ]
  },
  "mark": {"type": "line", "point": true},
  "encoding": {
    "x": {"field": "date", "type": "temporal"},
    "y": {"field": "value", "type": "quantitative"},
    "color": {"field": "series", "type": "nominal"}
  }
}
```

### Example with Aggregation

```json
{
  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
  "data": {"url": "data.csv"},
  "mark": "bar",
  "encoding": {
    "x": {"field": "category", "type": "nominal"},
    "y": {"aggregate": "sum", "field": "amount", "type": "quantitative"}
  }
}
```

## Chart Type Selection

### Decision Matrix (inspired by Few)

| Objective | Recommended Type | Alternative |
|----------|-----------------|-------------|
| **Comparison** between elements | Horizontal bar chart | Dot plot |
| **Comparison** over time | Line chart | Area chart |
| **Distribution** of a variable | Histogram | Box plot |
| **Composition** of a whole | Stacked bar | Treemap |
| **Relationship** between 2 variables | Scatter plot | Bubble chart |
| **Evolution** of composition | Stacked area | 100% stacked bar |
| **Ranking** | Horizontal bar chart | Lollipop chart |
| **Market share** | Bar chart | Pie chart (if <6 parts) |

### Decision Tree

```
What do you want to show?
│
├── COMPARISON
│   ├── Between categories → Bar chart
│   └── Over time → Line chart
│
├── DISTRIBUTION
│   ├── One variable → Histogram / Box plot
│   └── Two variables → Scatter plot
│
├── COMPOSITION
│   ├── Static → Pie (max 5) / Treemap
│   └── Evolution → Stacked area
│
└── RELATIONSHIP
    ├── 2 variables → Scatter
    └── 3+ variables → Bubble / Parallel coordinates
```

## Tufte's Principles

### 1. Data-Ink Ratio

```
Data-Ink Ratio = Ink used for data / Total ink
```

**Objective**: Maximize this ratio

**Eliminate**:
- ❌ Heavy grids → Light grids or none
- ❌ Chart borders → Let it breathe
- ❌ Colored backgrounds → White or very light background
- ❌ 3D effects → Always in 2D
- ❌ Redundant legends → Direct labels

### 2. Lie Factor

```
Lie Factor = Size of effect in chart / Size of effect in data
```

**Objective**: Lie Factor = 1

**Common violations**:
- Y-axis not starting at zero (for bars)
- Non-linear scales without indication
- Areas proportional to square instead of value

### 3. Chartjunk

**Eliminate**:
- ❌ Fill patterns (hatching, dots)
- ❌ Clipart and decorative illustrations
- ❌ Ornamental frames
- ❌ Drop shadows
- ❌ Unnecessary gradients

## Visual Variables (Bertin)

| Variable | Effectiveness for quantitative | Recommended usage |
|----------|----------------------------|------------------|
| **Position** | ★★★★★ | Always priority |
| **Length** | ★★★★☆ | Bar charts |
| **Angle** | ★★☆☆☆ | Avoid (pie charts) |
| **Area** | ★★☆☆☆ | Bubble charts with caution |
| **Color (saturation)** | ★★☆☆☆ | Heat maps |
| **Color (hue)** | ★☆☆☆☆ | Categories only |

## Color Palettes

### Basic Rules

1. **Maximum 6-7 distinct colors**
2. **One accent color** to highlight
3. **Accessible colors** (sufficient contrast, deuteranopia-safe)
4. **Consistency** throughout the presentation

### Default palette (Tableau 10)

```
#4e79a7, #f28e2b, #e15759, #76b7b2, #59a14f, #edc949, #af7aa1, #ff9da7, #9c755f, #bab0ab
```

### Recommended Palettes

**Sequential** (ordered values):
```
#f7fbff → #deebf7 → #9ecae1 → #3182bd → #08519c
```

**Diverging** (positive/negative values):
```
#d73027 → #fc8d59 → #fee090 → #e0f3f8 → #91bfdb → #4575b4
```

**Categorical** (distinct groups):
```
#4e79a7, #f28e2b, #e15759, #76b7b2, #59a14f, #edc948
```

**Highlight**:
```
Gray (#999999) for context + One bright color (#e15759) for focus
```

## Export and Dimensions

### Formats

| Format | Usage | Advantage |
|--------|-------|----------|
| PNG | PowerPoint presentations | Fixed quality, compatible everywhere |
| SVG | Web, documents | Vector, editable |
| JSON | Development | Reusable Vega-Lite spec |

### Dimensions for PowerPoint

With `--pptx-position`, dimensions are calculated automatically:

| PPTX Size | Pixels (2x) | Ratio | Usage |
|-------------|-------------|-------|-------|
| 9" × 4" | 1728 × 768 | 2.25:1 | Full width |
| 8" × 4" | 1536 × 768 | 2:1 | Standard |
| 6" × 4" | 1152 × 768 | 1.5:1 | Two-thirds |
| 4.3" × 4" | 826 × 768 | ~1:1 | Half-slide |
| 4.3" × 2" | 826 × 384 | ~2:1 | Dashboard |

### Manual calculation

```
pixels = inches × 96 DPI × scale
```

Example: 8" × 4" @ scale 2 = (8×96×2) × (4×96×2) = 1536 × 768 pixels

## Best Practices by Type

### Bar Chart

✓ Horizontal if long labels
✓ Order by value (not alphabetical)
✓ Start axis at zero
✓ Spacing between bars = 50% bar width
✓ Value labels on bars

### Line Chart

✓ Maximum 4-5 lines
✓ Line thickness 2-3px
✓ Visible data points if few points
✓ Legend in order of lines on the right
✓ Annotate important events

### Pie Chart (if really necessary)

⚠️ Maximum 5 segments
⚠️ Start at 12 o'clock, clockwise
⚠️ Order from largest to smallest
⚠️ Avoid if values are close
✓ Prefer horizontal bar chart

### Scatter Plot

✓ Semi-transparent points if many
✓ Add trend line if relevant
✓ Annotate outliers
✓ Aspect ratio close to 1:1

## Accessibility

### Contrast
- Minimum ratio 4.5:1 for text
- Minimum ratio 3:1 for graphical elements

### Color blindness
- Don't use red/green together
- Add patterns or labels in addition to color
- Test with color blindness simulator

### Readability
- Minimum font size 12pt
- Avoid condensed fonts
- No text on complex background

## References

- **Vega-Lite Documentation**: https://vega.github.io/vega-lite/docs/
- **Vega-Lite Examples**: https://vega.github.io/vega-lite/examples/
- **Vega Editor**: https://vega.github.io/editor/
- Refer to `references/chart-selection-guide.md` for the detailed selection guide.
