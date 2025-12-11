---
name: pptx-builder
description: Generation of PowerPoint files (.pptx) from structured specifications. Creating slides, inserting images, charts, tables, formatting. Use this skill to produce the final PowerPoint file.
allowed-tools:
  - Bash
  - Read
  - Write
---

# PPTX Builder Skill

You are a **Presentation Production Expert** who masters:

- The **PptxGenJS** library for programmatic generation
- The **Office Open XML** (OOXML) standards for PowerPoint
- **Best practices** for layout and accessibility

## Complete CLI Reference

### Main command

```bash
npx tsx src/cli/pptx-build.ts --spec <path> --output <path>
```

### Available options

| Option | Short | Description | Example |
|--------|-------|-------------|---------|
| `--spec <path>` | `-s` | JSON specification file (required) | `--spec presentation.json` |
| `--theme <path>` | `-t` | JSON theme file | `--theme theme.json` |
| `--output <path>` | `-o` | Output PPTX file path (required) | `--output slides.pptx` |
| `--quick` | `-q` | Interactive quick mode | `--quick` |
| `--title <text>` | | Title (for quick mode) | `--title "My Presentation"` |
| `--verbose` | `-v` | Verbose output | `--verbose` |
| `--debug` | | Debug mode with timing | `--debug` |
| `--quiet` | | Minimal output | `--quiet` |

### Available slide types

| Type | Description |
|------|-------------|
| `title` | Title slide with main title, subtitle, author, date |
| `section` | Section divider with number and title |
| `content` | Content slide with title and elements |
| `two-column` | Two-column layout |
| `quote` | Quote slide with attribution |

### Element types in slides

| Element | Description |
|---------|-------------|
| `text` | Text block with style |
| `bullets` | Bullet list |
| `table` | Table with headers |
| `image` | Image from a file path |
| `chart` | Embedded chart |

### Usage examples

```bash
# Generate a presentation from a JSON specification
npx tsx src/cli/pptx-build.ts --spec presentation.json --output output.pptx

# With a separate custom theme
npx tsx src/cli/pptx-build.ts --spec presentation.json --theme theme.json --output output.pptx

# Verbose mode for debugging
npx tsx src/cli/pptx-build.ts --spec presentation.json --output output.pptx --verbose
```

## Specification Format

### Main Structure

```json
{
  "metadata": {
    "title": "Presentation title",
    "author": "Author name",
    "company": "Company",
    "subject": "Subject",
    "revision": "1.0"
  },
  "settings": {
    "layout": "LAYOUT_16x9",
    "rtlMode": false
  },
  "theme": {
    "colors": {
      "primary": "#1E3A5F",
      "secondary": "#4A90A4",
      "accent": "#2E7D32",
      "background": "#FFFFFF",
      "surface": "#F5F5F5",
      "text": {
        "primary": "#333333",
        "secondary": "#666666"
      }
    },
    "typography": {
      "fontFamily": {
        "heading": "Arial",
        "body": "Arial"
      },
      "sizes": {
        "h1": "44",
        "h2": "32",
        "h3": "24",
        "body": "18",
        "caption": "14"
      }
    }
  },
  "slides": [
    { ... }
  ]
}
```

### Theme Format (ThemeColors and ThemeTypography)

**IMPORTANT**: The theme must follow exactly this structure. Do not use simplified values.

#### ThemeColors (required)

```json
{
  "colors": {
    "primary": "#1E3A5F",
    "secondary": "#4A90A4",
    "accent": "#2E7D32",
    "background": "#FFFFFF",
    "surface": "#F5F5F5",
    "text": {
      "primary": "#333333",
      "secondary": "#666666"
    }
  }
}
```

| Property | Description | Example |
|----------|-------------|---------|
| `primary` | Main color (titles, headers) | `#1E3A5F` |
| `secondary` | Secondary color (light accents) | `#4A90A4` |
| `accent` | Accent color (highlighting) | `#2E7D32` |
| `background` | Slide background | `#FFFFFF` |
| `surface` | Element background (cards, boxes) | `#F5F5F5` |
| `text.primary` | Primary text color | `#333333` |
| `text.secondary` | Secondary text color | `#666666` |

⚠️ **Warning**: `text` must be an object with `primary` and `secondary`, not a simple string.

#### ThemeTypography (required)

```json
{
  "typography": {
    "fontFamily": {
      "heading": "Arial",
      "body": "Arial"
    },
    "sizes": {
      "h1": "44",
      "h2": "32",
      "h3": "24",
      "body": "18",
      "caption": "14"
    }
  }
}
```

| Property | Description | Example |
|----------|-------------|---------|
| `fontFamily.heading` | Font for headings | `Arial`, `Calibri` |
| `fontFamily.body` | Font for body text | `Arial`, `Calibri` |
| `sizes.h1` | Level 1 heading size | `"44"` |
| `sizes.h2` | Level 2 heading size | `"32"` |
| `sizes.h3` | Level 3 heading size | `"24"` |
| `sizes.body` | Body text size | `"18"` |
| `sizes.caption` | Caption/notes size | `"14"` |

⚠️ **Warning**: Sizes are strings (`"44"`), not numbers.

#### Recommended Color Palettes

**Corporate Blue** (professional)
```json
{
  "primary": "#1E3A5F",
  "secondary": "#4A90A4",
  "accent": "#2E7D32",
  "background": "#FFFFFF",
  "surface": "#F5F5F5",
  "text": { "primary": "#333333", "secondary": "#666666" }
}
```

**Modern Dark** (impactful presentations)
```json
{
  "primary": "#2D3436",
  "secondary": "#636E72",
  "accent": "#00B894",
  "background": "#FFFFFF",
  "surface": "#DFE6E9",
  "text": { "primary": "#2D3436", "secondary": "#636E72" }
}
```

**Tech Green** (innovation, tech)
```json
{
  "primary": "#00695C",
  "secondary": "#4DB6AC",
  "accent": "#FF6F00",
  "background": "#FFFFFF",
  "surface": "#E0F2F1",
  "text": { "primary": "#263238", "secondary": "#546E7A" }
}
```

### Slide Types

#### 1. Title Slide

```json
{
  "type": "title",
  "title": "Main Title",
  "subtitle": "Optional subtitle",
  "author": "Presenter",
  "date": "2024-01-15",
  "background": {
    "color": "#1E3A5F"
  }
}
```

#### 2. Section Slide

```json
{
  "type": "section",
  "title": "Section 1",
  "subtitle": "Introduction",
  "background": {
    "image": "images/section-bg.jpg"
  }
}
```

#### 3. Standard Content Slide

```json
{
  "type": "content",
  "title": "Slide title",
  "elements": [
    {
      "type": "text",
      "content": "Text paragraph...",
      "position": { "x": 0.5, "y": 1.5, "w": 9, "h": 1 },
      "style": {
        "fontSize": 18,
        "color": "#333333"
      }
    },
    {
      "type": "bullets",
      "items": [
        "First point",
        "Second point",
        { "text": "Point with sub-points", "indent": 0 },
        { "text": "Sub-point", "indent": 1 }
      ],
      "position": { "x": 0.5, "y": 2.5, "w": 9, "h": 3 }
    }
  ]
}
```

#### 4. Slide with Image

```json
{
  "type": "content",
  "title": "Slide with image",
  "elements": [
    {
      "type": "image",
      "path": "images/chart.png",
      "position": { "x": 1, "y": 1.5, "w": 8, "h": 4.5 },
      "sizing": { "type": "contain" }
    },
    {
      "type": "text",
      "content": "Source: Report 2024",
      "position": { "x": 1, "y": 6.2, "w": 8, "h": 0.3 },
      "style": { "fontSize": 10, "color": "#666666" }
    }
  ]
}
```

**Sizing options for images**:

| Type | Behavior |
|------|----------|
| `contain` | **Default**. Preserves aspect ratio, image is fully visible within the area |
| `cover` | Preserves aspect ratio, fills the area (may crop) |
| `stretch` | Stretches image to exactly fill the area (may distort) |

⚠️ **Important**: By default, images use `contain` to preserve their aspect ratio and avoid distortion. Use `stretch` only if you explicitly want to distort the image.

### Stock Photo Integration (skill: stock-photo-finder)

Images downloaded via `stock-photo-finder` are ready to use:

```bash
# Download an image for the presentation
npx tsx src/cli/photo-search.ts --query "team collaboration" --orientation landscape --download --output-dir output/photos
```

**Usage in specification:**

```json
{
  "type": "content",
  "title": "Our Team",
  "elements": [
    {
      "type": "image",
      "path": "output/photos/pexels-3184339.jpg",
      "position": { "x": 0.5, "y": 1.2, "w": 9, "h": 4.5 },
      "sizing": { "type": "cover" }
    }
  ],
  "notes": "Photo by Fox on Pexels"
}
```

**Slide types with stock photos:**

| Usage | Sizing | Recommended position |
|-------|--------|---------------------|
| Full slide image (background) | `cover` | `{ "x": 0, "y": 0, "w": 10, "h": 5.625 }` |
| Image with title | `contain` | `{ "x": 0.5, "y": 1.2, "w": 9, "h": 4.2 }` |
| Half-slide image (left) | `cover` | `{ "x": 0, "y": 0, "w": 5, "h": 5.625 }` |
| Half-slide image (right) | `cover` | `{ "x": 5, "y": 0, "w": 5, "h": 5.625 }` |
| Thumbnail/vignette | `cover` | `{ "x": 7, "y": 1.5, "w": 2.5, "h": 2.5 }` |

**Slide with text over image (overlay):**

```json
{
  "type": "content",
  "title": "",
  "background": {
    "image": "output/photos/pexels-3184339.jpg"
  },
  "elements": [
    {
      "type": "shape",
      "shape": "rect",
      "position": { "x": 0, "y": 3.5, "w": 10, "h": 2.125 },
      "style": { "fill": "000000", "transparency": 50 }
    },
    {
      "type": "text",
      "content": "Our Vision for 2025",
      "position": { "x": 0.5, "y": 4, "w": 9, "h": 1 },
      "style": { "fontSize": 36, "color": "#FFFFFF", "bold": true }
    }
  ]
}
```

> 💡 **Tip**: Include attribution in presenter notes to follow best practices.

#### 5. Slide with Chart

```json
{
  "type": "content",
  "title": "Quarterly Performance",
  "elements": [
    {
      "type": "chart",
      "chartType": "bar",
      "data": [
        { "name": "Q1", "values": [100, 120, 80] },
        { "name": "Q2", "values": [120, 140, 95] },
        { "name": "Q3", "values": [110, 130, 90] },
        { "name": "Q4", "values": [150, 160, 110] }
      ],
      "series": ["Product A", "Product B", "Product C"],
      "position": { "x": 0.5, "y": 1.5, "w": 9, "h": 5 },
      "options": {
        "showLegend": true,
        "legendPos": "b",
        "showValue": true
      }
    }
  ]
}
```

#### 6. Slide with Table

```json
{
  "type": "content",
  "title": "Comparison",
  "elements": [
    {
      "type": "table",
      "headers": ["Criteria", "Option A", "Option B", "Option C"],
      "rows": [
        ["Price", "100€", "150€", "120€"],
        ["Performance", "★★★", "★★★★★", "★★★★"],
        ["Support", "Email", "24/7", "Business hours"]
      ],
      "position": { "x": 0.5, "y": 1.5, "w": 9, "h": 4 },
      "style": {
        "headerBackground": "#1E3A5F",
        "headerColor": "#FFFFFF",
        "alternateRows": true
      }
    }
  ]
}
```

#### 7. Two-Column Slide

```json
{
  "type": "two-column",
  "title": "Comparison",
  "left": {
    "title": "Before",
    "elements": [
      { "type": "bullets", "items": ["Point 1", "Point 2"] }
    ]
  },
  "right": {
    "title": "After",
    "elements": [
      { "type": "bullets", "items": ["Point 1", "Point 2"] }
    ]
  }
}
```

#### 8. Quote Slide

```json
{
  "type": "quote",
  "quote": "The best time to plant a tree was 20 years ago. The second best time is now.",
  "author": "Chinese proverb",
  "style": {
    "quoteSize": 28,
    "authorSize": 16
  }
}
```

## Positioning System

### Coordinates (in inches)

For a 16:9 slide (dimensions: 10" x 5.625"):

```
┌─────────────────────────────────────────┐
│ (0,0)                           (10,0)  │
│                                         │
│          Content area                   │
│                                         │
│ (0,5.625)                    (10,5.625) │
└─────────────────────────────────────────┘
```

### Predefined Positions

```json
{
  "positions": {
    "fullWidth": { "x": 0.5, "y": 1.2, "w": 9, "h": 4.2 },
    "leftHalf": { "x": 0.5, "y": 1.2, "w": 4.3, "h": 4.2 },
    "rightHalf": { "x": 5.2, "y": 1.2, "w": 4.3, "h": 4.2 },
    "topHalf": { "x": 0.5, "y": 1.2, "w": 9, "h": 2 },
    "bottomHalf": { "x": 0.5, "y": 3.4, "w": 9, "h": 2 },
    "centered": { "x": 2, "y": 2, "w": 6, "h": 3 }
  }
}
```

## Supported Chart Types

| Type | Code | Description |
|------|------|-------------|
| Vertical bars | `bar` | Category comparison |
| Horizontal bars | `barH` | Ranking, long labels |
| Lines | `line` | Temporal trends |
| Areas | `area` | Volume over time |
| Pie | `pie` | Parts of a whole |
| Donut | `doughnut` | Parts with central space |
| Scatter | `scatter` | Correlations |
| Radar | `radar` | Multi-criteria comparison |

### Chart Options

```json
{
  "chartOptions": {
    "showLegend": true,
    "legendPos": "b",
    "showTitle": false,
    "showValue": true,
    "showPercent": false,
    "showCatAxisTitle": true,
    "catAxisTitle": "Quarters",
    "showValAxisTitle": true,
    "valAxisTitle": "Revenue (M€)",
    "catGridLine": { "style": "none" },
    "valGridLine": { "style": "dash", "color": "#E5E5E5" }
  }
}
```

## Text Styles

### Formatting Options

```json
{
  "textStyle": {
    "fontFace": "Arial",
    "fontSize": 18,
    "color": "#333333",
    "bold": false,
    "italic": false,
    "underline": false,
    "strike": false,
    "align": "left",
    "valign": "top",
    "margin": [0.1, 0.1, 0.1, 0.1],
    "lineSpacing": 1.2,
    "paraSpaceBefore": 0,
    "paraSpaceAfter": 6,
    "bullet": { "type": "bullet", "style": "●" }
  }
}
```

### Rich Text

```json
{
  "type": "text",
  "content": [
    { "text": "Normal text " },
    { "text": "in bold", "options": { "bold": true } },
    { "text": " and " },
    { "text": "in color", "options": { "color": "#E15759" } }
  ]
}
```

## Shape Elements

### Basic Shapes

```json
{
  "type": "shape",
  "shape": "rect",
  "position": { "x": 1, "y": 1, "w": 2, "h": 1 },
  "style": {
    "fill": "#4A90A4",
    "line": { "color": "#2E5A6B", "width": 1 },
    "shadow": { "type": "outer", "blur": 3, "offset": 2 }
  },
  "text": {
    "content": "Label",
    "style": { "color": "#FFFFFF", "align": "center" }
  }
}
```

**Available shapes**: `rect`, `roundRect`, `ellipse`, `triangle`, `diamond`, `pentagon`, `hexagon`, `arrow`, `chevron`, `line`

### Connectors

```json
{
  "type": "connector",
  "from": { "x": 2, "y": 2 },
  "to": { "x": 5, "y": 3 },
  "style": {
    "line": { "color": "#333333", "width": 1, "dashType": "solid" },
    "beginArrowType": "none",
    "endArrowType": "arrow"
  }
}
```

## Master Slides and Layouts

### Define a Master

```json
{
  "masters": [
    {
      "name": "CUSTOM_MASTER",
      "background": { "color": "#FFFFFF" },
      "elements": [
        {
          "type": "image",
          "path": "images/logo.png",
          "position": { "x": 8.5, "y": 5.2, "w": 1, "h": 0.3 }
        },
        {
          "type": "text",
          "content": "Confidential",
          "position": { "x": 0.5, "y": 5.3, "w": 2, "h": 0.2 },
          "style": { "fontSize": 8, "color": "#999999" }
        }
      ]
    }
  ]
}
```

### Use a Layout

```json
{
  "type": "content",
  "master": "CUSTOM_MASTER",
  "title": "...",
  "elements": [...]
}
```

## Presenter Notes

```json
{
  "type": "content",
  "title": "Slide with notes",
  "elements": [...],
  "notes": "Key points to mention:\n- First important point\n- Second point\n- Question to ask the audience"
}
```

## Animations (Basic)

```json
{
  "type": "text",
  "content": "Animated text",
  "animation": {
    "type": "fadeIn",
    "delay": 0.5
  }
}
```

**Animation types**: `fadeIn`, `fadeOut`, `slideInLeft`, `slideInRight`, `slideInTop`, `slideInBottom`, `zoomIn`, `zoomOut`

## Production Best Practices

### Performance

- Images: Use JPEG for photos, PNG for charts
- Resolution: 2x for retina displays (max 1920x1080 per image)
- Compression: Optimize images before inclusion

### Compatibility

- Fonts: Use web-safe fonts to ensure display
- Colors: Use HEX format (#RRGGBB)
- Dimensions: Respect the 16:9 ratio

### Accessibility

- Alt text for all images
- Sufficient contrast (WCAG 2.1)
- Hierarchical heading structure

## Generation Workflow

1. **Validation**: Check JSON structure
2. **Resource resolution**: Load images, check paths
3. **Theme application**: Apply colors, typography
4. **Generation**: Create slides one by one
5. **Post-processing**: Add metadata, optimize
6. **Export**: Save the .pptx file

## References

See `references/slide-layouts.md` for predefined layouts.
