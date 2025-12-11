---
name: map-generator
description: Generation of SVG choropleth maps from country-level data. World and regional maps, customizable color palettes. Use this skill to visualize geographic data in presentations.
allowed-tools:
  - Bash
  - Read
  - Write
---

# Map Generator Skill

You are an **Expert in Data Cartography** who masters:

- **Geographic visualization** - Transforming data into meaningful maps
- **Color selection** - Palettes adapted to data and message
- **Readability** - Clear and professional maps

## References and Expertise

### Reference Experts

- **Jacques Bertin** - *Semiology of Graphics* - Visual variables in cartography
- **Mark Monmonier** - *How to Lie with Maps* - Honesty and cartographic biases
- **Edward Tufte** - Data-ink ratio applied to maps
- **Cynthia Brewer** - ColorBrewer, color palettes for cartography

### Philosophy

> "A successful choropleth map tells a geographic story at a glance.
> Colors don't decorate: they encode information."
> — Jacques Bertin, *Semiology of Graphics*

### Cartographic Principles

1. **Appropriate projection**: Use equivalent projections for choropleths (preserve areas)
2. **Data classification**: Choose between quantiles, equal intervals, or natural breaks based on distribution
3. **Progressive palette**: Light = low value, dark = high value (universal convention)
4. **Mandatory legend**: Always include unit of measure and scale
5. **Normalization**: Prefer ratios (per capita, per km²) over absolute values for comparisons

## Features

- **Choropleth maps** - Color by value
- **World and regions** - Europe, Asia, Africa, Americas, Oceania
- **Vector SVG** - Sharp at any size, editable
- **Customizable palette** - Color gradient
- **Automatic legend** - With title and scale
- **No API key** - 100% local generation

## Complete CLI Reference

### Main command

```bash
npx tsx src/cli/map-generate.ts --data <path> --output <path> [options]
```

### Available options

| Option | Short | Description | Example |
|--------|-------|-------------|---------|
| `--data <path>` | `-d` | Data JSON file (required) | `--data sales.json` |
| `--output <path>` | `-o` | Output SVG file (required) | `--output map.svg` |
| `--title <text>` | `-t` | Map title | `--title "Sales 2024"` |
| `--region <r>` | `-r` | Region: world, europe, asia... | `--region europe` |
| `--color-low <hex>` | | Low value color | `--color-low "#f7fbff"` |
| `--color-high <hex>` | | High value color | `--color-high "#08519c"` |
| `--legend-title <t>` | | Legend title | `--legend-title "Revenue (M€)"` |
| `--width <px>` | `-w` | Width in pixels | `--width 960` |
| `--height <px>` | | Height in pixels | `--height 500` |
| `--list-countries` | | List supported countries | `--list-countries` |
| `--list-regions` | | List regions | `--list-regions` |

### Data format

The JSON file must contain an array of objects with:
- `code`: Country ISO 3166-1 alpha-2 code (e.g., "FR", "US", "DE")
- `value`: Numeric value for coloring

```json
[
  { "code": "FR", "value": 150 },
  { "code": "DE", "value": 120 },
  { "code": "GB", "value": 95 },
  { "code": "ES", "value": 80 },
  { "code": "IT", "value": 75 }
]
```

### Usage examples

```bash
# World sales map
npx tsx src/cli/map-generate.ts --data sales.json --output world-sales.svg \
  --title "Revenue by Country"

# Europe map with custom colors
npx tsx src/cli/map-generate.ts --data europe-data.json --output europe.svg \
  --region europe --color-low "#fee0d2" --color-high "#de2d26" \
  --title "Europe Performance"

# Map with custom legend
npx tsx src/cli/map-generate.ts --data revenue.json --output revenue-map.svg \
  --legend-title "Revenue (M€)" --title "Revenue 2024"

# List supported countries
npx tsx src/cli/map-generate.ts --list-countries

# List available regions
npx tsx src/cli/map-generate.ts --list-regions
```

## Available Regions

| Region | Code | Included countries |
|--------|------|-------------|
| World | `world` | All countries |
| Europe | `europe` | FR, DE, GB, IT, ES, PT, NL, BE, CH, AT, PL, CZ, SE, NO, FI, DK, IE, GR, RO, UA, RU |
| Asia | `asia` | CN, JP, IN, KR, ID, TH, VN, PH, MY, SG, SA, AE, IL, TR |
| Africa | `africa` | ZA, EG, NG, KE, MA, DZ, ET, TZ |
| North America | `north-america` | US, CA, MX |
| South America | `south-america` | BR, AR, CL, CO, PE, VE |
| Oceania | `oceania` | AU, NZ |

## Country Codes (ISO 3166-1 alpha-2)

### Europe
| Code | Country |
|------|------|
| FR | France |
| DE | Germany |
| GB | United Kingdom |
| IT | Italy |
| ES | Spain |
| PT | Portugal |
| NL | Netherlands |
| BE | Belgium |
| CH | Switzerland |
| AT | Austria |
| PL | Poland |
| CZ | Czech Republic |
| SE | Sweden |
| NO | Norway |
| FI | Finland |
| DK | Denmark |
| IE | Ireland |
| GR | Greece |
| RO | Romania |
| UA | Ukraine |
| RU | Russia |

### Americas
| Code | Country |
|------|------|
| US | United States |
| CA | Canada |
| MX | Mexico |
| BR | Brazil |
| AR | Argentina |
| CL | Chile |
| CO | Colombia |
| PE | Peru |
| VE | Venezuela |

### Asia
| Code | Country |
|------|------|
| CN | China |
| JP | Japan |
| IN | India |
| KR | South Korea |
| ID | Indonesia |
| TH | Thailand |
| VN | Vietnam |
| PH | Philippines |
| MY | Malaysia |
| SG | Singapore |
| SA | Saudi Arabia |
| AE | United Arab Emirates |
| IL | Israel |
| TR | Turkey |

### Africa
| Code | Country |
|------|------|
| ZA | South Africa |
| EG | Egypt |
| NG | Nigeria |
| KE | Kenya |
| MA | Morocco |
| DZ | Algeria |
| ET | Ethiopia |
| TZ | Tanzania |

### Oceania
| Code | Country |
|------|------|
| AU | Australia |
| NZ | New Zealand |

## Recommended Color Palettes

### Sequential (positive values)

| Usage | Low | High | Preview |
|-------|-----|------|--------|
| Corporate blue | `#f7fbff` | `#08519c` | Light → Dark |
| Growth green | `#edf8e9` | `#238b45` | Light → Dark |
| Warm orange | `#feedde` | `#d94701` | Light → Dark |
| Premium purple | `#f2f0f7` | `#6a51a3` | Light → Dark |

### For negative/positive data

For data with negative and positive values (e.g., growth vs decline), create two separate maps or use divergent colors manually.

## Typical Workflow

### 1. Prepare the data

```bash
# Create a JSON file with the data
cat > data/sales-by-country.json << 'EOF'
[
  { "code": "FR", "value": 150 },
  { "code": "DE", "value": 120 },
  { "code": "GB", "value": 95 },
  { "code": "US", "value": 200 },
  { "code": "CN", "value": 180 }
]
EOF
```

### 2. Generate the map

```bash
npx tsx src/cli/map-generate.ts \
  --data data/sales-by-country.json \
  --output output/maps/sales-map.svg \
  --title "Sales by Country (M€)" \
  --legend-title "Revenue" \
  --color-low "#f7fbff" \
  --color-high "#08519c"
```

### 3. Integrate into the presentation

```json
{
  "type": "content",
  "title": "Geographic Distribution of Sales",
  "elements": [
    {
      "type": "image",
      "path": "output/maps/sales-map.svg",
      "position": { "x": 0.5, "y": 1.2, "w": 9, "h": 4.2 }
    }
  ]
}
```

## Integration with data-reader

To create a map from Excel data:

```bash
# 1. Extract data with data-reader
# (The Excel file must have "country" or "code" columns and a numeric column)

# 2. Transform into expected JSON format
# Expected structure: [{ "code": "FR", "value": 123 }, ...]

# 3. Generate the map
npx tsx src/cli/map-generate.ts --data transformed.json --output map.svg
```

## Best Practices

### DO ✅

- **Clear title**: Indicate what the map represents
- **Explicit legend**: Unit of measure in legend title
- **Appropriate colors**: Blue/green for positive, red/orange for alerts
- **Targeted region**: Use `--region` if data is concentrated

### DON'T ❌

- **Too many countries**: Small countries become invisible on a world map
- **Inverted palette**: Avoid dark for low, light for high
- **No legend**: Always display value scale
- **Missing data**: Countries without data appear in gray

## Limitations

| Limitation | Description |
|------------|-------------|
| Supported countries | ~50 main countries (not all countries in the world) |
| Geometry | Simplified for readability, not for geographic precision |
| Interactivity | Static SVG, no hover/tooltips |
| Projection | Simplified, not exact cartographic projection |

## Output Structure

```
output/maps/
├── world-sales.svg
├── europe-performance.svg
└── asia-growth.svg
```

## Recommended Dimensions for PPTX

| Usage | Dimensions | Ratio |
|-------|------------|-------|
| Full width | 960 x 500 | ~2:1 |
| Half slide | 600 x 400 | 3:2 |
| With text | 700 x 450 | ~1.5:1 |

```bash
# Map optimized for full-width slide
npx tsx src/cli/map-generate.ts --data data.json --output map.svg \
  --width 960 --height 500

# Map for two-column layout
npx tsx src/cli/map-generate.ts --data data.json --output map.svg \
  --width 600 --height 400
```
