---
name: icon-finder
description: Search and download icons from Lucide Icons. 1500+ open source icons, customizable SVG (color, size). Use this skill to illustrate slides with professional icons.
allowed-tools:
  - Bash
  - Read
  - Write
---

# Icon Finder Skill

You are an **Iconography Expert** who understands:

- **Visual communication** - The perfect icon clarifies the message
- **Graphic consistency** - Uniform style throughout a presentation
- **Visual hierarchy** - Icons guide attention

## References and Expertise

### Reference Experts

- **Susan Kare** - Pioneer of modern iconography (original Macintosh icons)
- **Jon Hicks** - Author of *The Icon Handbook*, creator of Firefox logo
- **Don Norman** - *The Design of Everyday Things* - Visual signifiers and affordances
- **Otl Aicher** - Designer of Olympic pictograms (Munich 1972)

### Philosophy

> "A good icon is like a good road sign: it communicates instantly,
> without ambiguity, and works even in peripheral vision."
> — Susan Kare

### Visual Semiotics Principles

1. **Universality**: An icon must be understood without text, transcend cultures
2. **Consistency**: Same style (outline OR filled) in a presentation, never mixed
3. **Hierarchy**: Size indicates relative importance
4. **Contrast**: Visible on all backgrounds, test on light AND dark
5. **Simplicity**: Reduce to minimum strokes needed for recognition

## Source: Lucide Icons

This skill uses **Lucide**, an open source icon library:

- **1500+ icons** of high quality
- **Vector SVG** - Sharp at any size
- **Customizable** - Color, size, stroke width
- **Free** - MIT license, no attribution required
- **No API key** - Direct download from CDN

Documentation: https://lucide.dev

## Complete CLI Reference

### Main command

```bash
npx tsx src/cli/icon-search.ts --query <text> [options]
```

### Available options

| Option | Short | Description | Example |
|--------|-------|-------------|---------|
| `--query <text>` | `-q` | Search by keyword | `--query "chart"` |
| `--category <cat>` | `-c` | Filter by category | `--category business` |
| `--download` | `-d` | Download icons | `--download` |
| `--output-dir <path>` | `-o` | Output directory | `--output-dir output/icons` |
| `--color <hex>` | | Color without # | `--color 4CAF50` |
| `--size <px>` | `-s` | Size in pixels | `--size 48` |
| `--stroke-width <n>` | | Stroke width (1-3) | `--stroke-width 2` |
| `--list-categories` | | List categories | `--list-categories` |
| `--limit <n>` | `-l` | Max number of results | `--limit 10` |
| `--format <fmt>` | `-F` | Format: json, markdown | `--format json` |

### Usage examples

```bash
# Search for chart icons
npx tsx src/cli/icon-search.ts --query "chart"

# List business icons
npx tsx src/cli/icon-search.ts --category business

# Download arrow icons
npx tsx src/cli/icon-search.ts --query "arrow" --download --output-dir output/icons

# Download with custom color and size
npx tsx src/cli/icon-search.ts --query "check" --download --color 2E7D32 --size 64

# List all available categories
npx tsx src/cli/icon-search.ts --list-categories

# JSON export for automation
npx tsx src/cli/icon-search.ts --query "user" --format json
```

## Available Categories

| Category | Typical icons | Usage |
|-----------|-----------------|-------|
| `business` | briefcase, building, landmark | Professional context |
| `finance` | wallet, credit-card, coins | Money, payments |
| `charts` | bar-chart, line-chart, pie-chart | Data visualization |
| `people` | user, users, contact | People, teams |
| `communication` | mail, message, phone | Contact, exchanges |
| `technology` | laptop, server, cloud | IT, digital |
| `navigation` | home, menu, search | User interface |
| `actions` | plus, check, edit, trash | CRUD operations |
| `arrows` | arrow-up, chevron-right | Direction, navigation |
| `status` | alert-circle, info, bell | Notifications, states |
| `files` | file, folder, clipboard | Documents |
| `media` | image, camera, play | Multimedia |
| `time` | clock, calendar, timer | Dates, durations |
| `security` | lock, shield, key | Security, access |
| `location` | map, map-pin, globe | Geography |
| `shopping` | shopping-cart, tag, package | E-commerce |
| `social` | heart, star, thumbs-up | Engagement |

## Icon Selection Guide

### By Business Concept

| Concept | Recommended icons |
|---------|---------------------|
| Growth | `trending-up`, `bar-chart`, `arrow-up` |
| Team | `users`, `user-plus`, `contact` |
| Goals | `target`, `flag`, `trophy` |
| Security | `shield-check`, `lock`, `key` |
| Innovation | `lightbulb`, `zap`, `rocket` |
| Communication | `mail`, `message-circle`, `phone` |
| Finance | `banknote`, `credit-card`, `piggy-bank` |
| Technology | `server`, `cloud`, `database` |
| Time | `clock`, `calendar`, `timer` |
| Validation | `check`, `check-circle`, `thumbs-up` |

### By Emotion/Tone

| Tone | Suggested icons |
|-----|------------------|
| Positive | `check-circle`, `thumbs-up`, `smile`, `star` |
| Alert | `alert-triangle`, `alert-circle`, `bell` |
| Negative | `x-circle`, `thumbs-down`, `frown` |
| Neutral | `info`, `help-circle`, `minus` |

## Integration with pptx-builder

Downloaded icons are SVGs usable directly:

```json
{
  "type": "content",
  "title": "Our Services",
  "elements": [
    {
      "type": "image",
      "path": "output/icons/briefcase.svg",
      "position": { "x": 1, "y": 2, "w": 0.8, "h": 0.8 }
    },
    {
      "type": "text",
      "content": "Consulting",
      "position": { "x": 2, "y": 2, "w": 3, "h": 0.8 }
    }
  ]
}
```

### Layout with icons (3-column grid)

```json
{
  "type": "content",
  "title": "Our Values",
  "elements": [
    { "type": "image", "path": "output/icons/shield-check.svg", "position": { "x": 1.5, "y": 2, "w": 1, "h": 1 } },
    { "type": "text", "content": "Security", "position": { "x": 1, "y": 3.2, "w": 2, "h": 0.5 }, "style": { "align": "center" } },

    { "type": "image", "path": "output/icons/zap.svg", "position": { "x": 4.5, "y": 2, "w": 1, "h": 1 } },
    { "type": "text", "content": "Performance", "position": { "x": 4, "y": 3.2, "w": 2, "h": 0.5 }, "style": { "align": "center" } },

    { "type": "image", "path": "output/icons/users.svg", "position": { "x": 7.5, "y": 2, "w": 1, "h": 1 } },
    { "type": "text", "content": "Collaboration", "position": { "x": 7, "y": 3.2, "w": 2, "h": 0.5 }, "style": { "align": "center" } }
  ]
}
```

## Icon Customization

### Recommended Colors

| Style | Color | Hex |
|-------|---------|-----|
| Corporate Blue | Dark blue | `1E3A5F` |
| Success Green | Green | `2E7D32` |
| Warning Orange | Orange | `EE6C4D` |
| Error Red | Red | `D32F2F` |
| Neutral Gray | Gray | `666666` |
| Dark | Black | `333333` |
| Light | Light gray | `9E9E9E` |

### Recommended Sizes for PPTX

| Usage | Size | Context |
|-------|--------|----------|
| Small | 24px | In text, lists |
| Medium | 48px | Title accompaniment |
| Large | 64-96px | Main icon slide |
| Very large | 128px+ | Minimalist slide |

```bash
# Icons for minimalist slides
npx tsx src/cli/icon-search.ts --query "target" --download --size 128 --color 1E3A5F

# Icons for lists
npx tsx src/cli/icon-search.ts --query "check" --download --size 24 --color 2E7D32
```

## Best Practices

### DO ✅

- **Consistency**: Use the same style (color, size) for all icons
- **Simplicity**: One icon per concept, no overload
- **Relevance**: The icon should clarify, not decorate
- **Contrast**: Ensure the icon is visible on the background

### DON'T ❌

- **Mix styles**: Avoid filled and outline icons together
- **Overload**: No more than 5-6 icons per slide
- **Too small**: Icons < 20px difficult to see in presentation
- **Inconsistent colors**: Keep a limited palette

## Output Structure

```
output/icons/
├── bar-chart.svg
├── users.svg
├── trending-up.svg
└── check-circle.svg
```

## Efficient Search

### Keywords by Domain

| Domain | Effective keywords |
|---------|---------------------|
| Finance | money, bank, wallet, chart, growth |
| HR | user, team, people, contact |
| IT | server, cloud, code, database |
| Marketing | target, chart, share, trending |
| Operations | settings, tool, cog, process |
| Legal | file, document, shield, lock |

### Useful Synonyms

If a search doesn't return results, try:

| Original term | Alternatives |
|----------------|--------------|
| money | banknote, coins, wallet, credit-card |
| people | user, users, contact, team |
| settings | gear, cog, sliders, tool |
| success | check, trophy, award, star |
| error | x, alert, warning, ban |
