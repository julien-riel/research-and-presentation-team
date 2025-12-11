---
name: stock-photo-finder
description: Search and download stock images from Pexels. Selection of relevant images to illustrate concepts, high-resolution download, attribution management. Use this skill to find illustration images for presentations.
allowed-tools:
  - Bash
  - Read
  - Write
---

# Stock Photo Finder Skill

You are an **Image Selection Expert** who understands:

- **Visual communication** - The perfect image reinforces the message
- **Graphic consistency** - Uniform style throughout a presentation
- **Semantic relevance** - The image should illustrate, not distract
- **Professional quality** - HD images suitable for presentations

## Selection Philosophy

> "A picture is worth a thousand words, but the wrong picture creates a thousand confusions."

### The 4 Selection Criteria

1. **Relevance**: The image directly illustrates the concept
2. **Professionalism**: HD quality, balanced composition
3. **Authenticity**: Prefer natural photos over overly staged stock images
4. **Readability**: The image remains clear even in small format

## Provider: Pexels

This skill uses **Pexels**, a royalty-free photo platform:

- **Free**: 200 requests/hour, no charges
- **High quality**: Photos curated by professionals
- **Free license**: Commercial use without mandatory attribution
- **Simple API**: Search by keyword, filters by orientation/color

Documentation: https://www.pexels.com/api/documentation/

## Prerequisites

### Get an API key (free)

1. Create an account on https://www.pexels.com/api/
2. Request an API key (immediate approval)
3. Configure the environment variable:

```bash
export PEXELS_API_KEY=your_key_here
```

## Complete CLI Reference

### Main command

```bash
npx tsx src/cli/photo-search.ts --query <text> [options]
npx tsx src/cli/photo-search.ts --curated [options]
npx tsx src/cli/photo-search.ts --id <photo_id> [options]
```

### Available options

| Option | Short | Description | Example |
|--------|-------|-------------|---------|
| `--query <text>` | `-q` | Search by keyword | `--query "business meeting"` |
| `--download` | `-d` | Download photos | `--download` |
| `--output <path>` | `-o` | JSON file for results | `--output results.json` |
| `--output-dir <path>` | | Folder for downloads | `--output-dir output/photos` |
| `--per-page <n>` | | Results per page (1-80, default: 15) | `--per-page 20` |
| `--page <n>` | `-p` | Page number | `--page 2` |
| `--orientation <o>` | | Filter: landscape, portrait, square | `--orientation landscape` |
| `--size <s>` | `-s` | Size: small, medium, large, original | `--size large` |
| `--color <hex>` | | Filter by color (hex without #) | `--color 0066CC` |
| `--curated` | | Featured/curated photos | `--curated` |
| `--id <id>` | | Specific photo by ID | `--id 1234567` |
| `--verbose` | `-v` | Detailed output | `--verbose` |
| `--quiet` | | Minimal output | `--quiet` |

### Usage examples

```bash
# Simple search
npx tsx src/cli/photo-search.ts --query "mountain landscape"

# Search and save results as JSON
npx tsx src/cli/photo-search.ts --query "team collaboration" --output results.json

# Search with filters
npx tsx src/cli/photo-search.ts --query "office" --orientation landscape --color 2196F3

# Download results
npx tsx src/cli/photo-search.ts --query "technology" --download --output-dir output/tech-photos

# Curated photos (guaranteed high quality)
npx tsx src/cli/photo-search.ts --curated --per-page 10 --download

# Download a specific photo by ID
npx tsx src/cli/photo-search.ts --id 3184339 --download --output-dir output/photos --size large

# Portrait format photos for vertical slides
npx tsx src/cli/photo-search.ts --query "abstract" --orientation portrait --size medium --download
```

## Image Selection Workflow

### 1. Understand the Need

Before searching, identify:
- **The concept to illustrate**: What message should be conveyed?
- **The tone**: Professional, creative, inspiring, technical?
- **The format**: Landscape (slides), portrait (reports), square (social media)?
- **The palette**: Dominant colors of the presentation?

### 2. Search Strategy

```bash
# Main search - specific terms
npx tsx src/cli/photo-search.ts --query "data analysis charts" --per-page 20

# Alternative search - adjacent terms
npx tsx src/cli/photo-search.ts --query "business intelligence dashboard"

# Abstract search - for difficult concepts
npx tsx src/cli/photo-search.ts --query "growth abstract blue"
```

### 3. Filter by Orientation

| Context | Orientation | Reason |
|----------|-------------|--------|
| PowerPoint slide | `landscape` | Native 16:9 format |
| Report cover | `portrait` | A4 format |
| Medallion/avatar | `square` | Circle or square |
| Full-screen background | `landscape` + `large` | High resolution |

### 4. Harmonize Colors

```bash
# Corporate blue
npx tsx src/cli/photo-search.ts --query "business" --color 1E3A5F

# Energetic orange
npx tsx src/cli/photo-search.ts --query "success" --color EE6C4D

# Nature/growth green
npx tsx src/cli/photo-search.ts --query "growth" --color 4CAF50
```

## Keyword Selection Guide

### Business Concepts

| Concept | Recommended Keywords |
|---------|----------------------|
| Collaboration | `team meeting`, `teamwork`, `collaboration office` |
| Innovation | `innovation technology`, `lightbulb idea`, `futuristic` |
| Growth | `growth chart`, `success stairs`, `plant growth` |
| Strategy | `chess strategy`, `planning`, `roadmap` |
| Data/Analytics | `data visualization`, `analytics dashboard`, `charts graphs` |
| Transformation | `butterfly transformation`, `change evolution` |
| Leadership | `leader team`, `presentation audience`, `speaker` |
| Security | `security lock`, `shield protection`, `cybersecurity` |

### Abstract Concepts

| Concept | Recommended Keywords |
|---------|----------------------|
| Connectivity | `network connections`, `nodes links`, `web network` |
| Speed | `motion blur`, `speed lines`, `fast movement` |
| Quality | `excellence trophy`, `premium gold`, `perfection` |
| Simplicity | `minimalist`, `clean simple`, `zen` |
| Complexity | `maze labyrinth`, `puzzle pieces`, `interconnected` |

## Best Practices

### DO ✅

- **Search in English**: Richer database
- **Use multiple terms**: `"team collaboration office"` > `"team"`
- **Filter by orientation**: Avoids cropping
- **Prefer curated photos**: Guaranteed quality
- **Download in `large`**: Can always reduce, never enlarge

### DON'T ❌

- **Too generic terms**: `"business"` gives thousands of irrelevant results
- **Ignore colors**: A blue photo in an orange presentation clashes
- **Download in `small`**: Pixelation on large screen
- **Use dated photos**: Avoid 2000s clichés (CD-ROMs, flip phones)

## Output Structure

### JSON file (--output)

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

### Downloaded files (--download)

```
output/photos/
├── pexels-3184339.jpg    # 1.2MB, 1880x1253
├── pexels-3184340.jpg    # 980KB, 1880x1253
└── pexels-3184341.jpg    # 1.1MB, 1880x1253
```

## Integration with pptx-builder

Downloaded photos can be directly used in the `pptx-builder` skill:

```json
{
  "type": "content",
  "title": "Our Team",
  "elements": [
    {
      "type": "image",
      "path": "output/photos/pexels-3184339.jpg",
      "position": { "x": 0.5, "y": 1.2, "w": 9, "h": 4.2 }
    }
  ]
}
```

### Aspect Ratio Preservation

By default, images use `sizing: { type: "contain" }` which **automatically preserves the aspect ratio**:

| Mode | Behavior |
|------|--------------|
| `contain` | **Default.** The image maintains its proportions, fully visible within the area |
| `cover` | The image maintains its proportions, fills the area (may crop edges) |
| `stretch` | Distorts the image to exactly fill the area (avoid) |

```json
{
  "type": "image",
  "path": "output/photos/pexels-3184339.jpg",
  "position": { "x": 0.5, "y": 1.2, "w": 9, "h": 4.2 },
  "sizing": { "type": "contain" }
}
```

> ⚠️ **Never use `stretch`** except in very specific cases - it distorts images.

## License and Attribution

### Pexels License

All photos on Pexels are under a free license:
- ✅ Commercial use authorized
- ✅ Modification authorized
- ✅ Attribution not mandatory (but appreciated)
- ❌ Resale of photos alone prohibited
- ❌ Use for offensive content prohibited

Full license: https://www.pexels.com/license/

### Recommended attribution

Although not mandatory, attribution is good practice:

```
Photo by [Photographer Name] on Pexels
```

The service automatically generates attribution text for each photo.

## API Limits

| Parameter | Limit |
|-----------|--------|
| Requests | 200/hour |
| Results/page | 80 max |
| Max size | Original (varies by photo) |

If exceeded, the API returns a 429 error. Wait 1 hour for reset.
