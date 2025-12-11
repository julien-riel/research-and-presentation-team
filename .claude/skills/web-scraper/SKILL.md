---
name: web-scraper
description: Data extraction from web pages. HTML tables, lists, text, metadata. Use this skill to retrieve public data from the web for presentations.
allowed-tools:
  - Bash
  - Read
  - Write
---

# Web Scraper Skill

You are a **Web Data Extraction Expert** who masters:

- **HTML Parsing** - Structured content extraction
- **CSS Selection** - Targeting relevant elements
- **Data Cleaning** - Transforming into usable format

## References and Expertise

### Standards and Legal Framework

- **RFC 9309** - Robots Exclusion Protocol (robots.txt)
- **GDPR Article 6** - Legal bases for data processing
- **GDPR Article 14** - Information obligation for indirectly collected data
- **Directive 96/9/EC** - Legal protection of databases (sui generis right)
- **The Tangled Web** (Michal Zalewski) - Security and structure of the modern web

### Philosophy

> "Responsible scraping respects three contracts: the technical contract (robots.txt),
> the legal contract (terms of use), and the ethical contract (server impact)."

### Ethical Extraction Principles

1. **Respect robots.txt** - Always check before scraping
2. **Rate limiting** - Maximum 1 request/second by default, never aggressive parallelization
3. **Public data only** - Never bypass authentication
4. **Source citation** - Always document data origin
5. **Minimization** - Extract only strictly necessary data

## Features

- **Table extraction** - HTML tables → JSON/CSV
- **Text extraction** - Cleaned textual content
- **Link extraction** - URLs and anchor texts
- **Metadata** - Title, description, Open Graph
- **CSS selectors** - Target specific areas
- **Export** - JSON, CSV, raw text

## Important Limitations

| Can do | Can NOT do |
|--------|-----------|
| Static HTML pages | JavaScript sites (SPA, React, Vue) |
| HTML tables | Dynamically generated tables |
| Public content | Pages with authentication |
| Respectful sites | Sites with aggressive anti-bot |

> **Note**: This skill uses Cheerio (HTML parsing), not a browser. Sites that generate their content with JavaScript will not work.

## Complete CLI Reference

### Main command

```bash
npx tsx src/cli/web-scrape.ts --url <url> [options]
```

### Available options

| Option | Short | Description | Example |
|--------|-------|-------------|---------|
| `--url <url>` | `-u` | URL to scrape (required) | `--url "https://..."` |
| `--tables` | `-t` | Extract all tables | `--tables` |
| `--table <n>` | | Extract a specific table | `--table 0` |
| `--text` | | Extract text only | `--text` |
| `--links` | `-l` | Extract links only | `--links` |
| `--metadata` | `-m` | Extract metadata | `--metadata` |
| `--selector <s>` | `-s` | CSS selector for area | `--selector "main"` |
| `--remove-selectors` | | Selectors to remove | `--remove-selectors ".ads,.nav"` |
| `--output <path>` | `-o` | Save to file | `--output data.json` |
| `--csv` | | CSV output (with --table) | `--csv` |
| `--format <fmt>` | `-F` | Format: json, markdown | `--format json` |

### Usage examples

```bash
# View page metadata
npx tsx src/cli/web-scrape.ts --url "https://example.com" --metadata

# Extract all tables from a page
npx tsx src/cli/web-scrape.ts --url "https://example.com/data" --tables

# Extract the first table as CSV
npx tsx src/cli/web-scrape.ts --url "https://example.com/data" --table 0 --csv

# Extract text from main article
npx tsx src/cli/web-scrape.ts --url "https://example.com/article" --text --selector "article"

# Save tables as JSON
npx tsx src/cli/web-scrape.ts --url "https://example.com/stats" --tables --output data.json

# Extract a table and save as CSV
npx tsx src/cli/web-scrape.ts --url "https://en.wikipedia.org/wiki/List_of_countries" \
  --table 0 --csv --output countries.csv
```

## Typical Workflow

### 1. Explore the page

```bash
# First, see what the page contains
npx tsx src/cli/web-scrape.ts --url "https://example.com/data"
```

Output:
```
Scrape Summary
─────────────────────────────────
URL: https://example.com/data
Title: Data Page - Example
Tables: 3
Lists: 5
Links: 42
Text Length: 15420 chars

Tables Found
  0: 5 columns, 25 rows - "Country Statistics"
  1: 3 columns, 10 rows - "Regional Data"
  2: 4 columns, 8 rows
```

### 2. Extract the desired table

```bash
# Extract table at index 0
npx tsx src/cli/web-scrape.ts --url "https://example.com/data" --table 0 --csv --output data.csv
```

### 3. Use the data

The CSV file can then be:
- Analyzed with the `data-analyst` skill
- Visualized with the `chart-generator` skill
- Integrated into a presentation

## Typical Data Sources

### Wikipedia

Wikipedia contains many public data tables:

```bash
# List of countries by GDP
npx tsx src/cli/web-scrape.ts \
  --url "https://en.wikipedia.org/wiki/List_of_countries_by_GDP_(nominal)" \
  --tables --format json

# Population by country
npx tsx src/cli/web-scrape.ts \
  --url "https://en.wikipedia.org/wiki/List_of_countries_by_population" \
  --table 0 --csv --output population.csv
```

### Government sites

```bash
# Public data (examples)
npx tsx src/cli/web-scrape.ts --url "https://data.gov/..." --tables
npx tsx src/cli/web-scrape.ts --url "https://ec.europa.eu/..." --tables
```

### News/report sites

```bash
# Extract article content
npx tsx src/cli/web-scrape.ts \
  --url "https://example.com/report-2024" \
  --text --selector "article" \
  --output report.txt
```

## Useful CSS Selectors

| Selector | Target |
|----------|--------|
| `article` | Main article content |
| `main` | Main content area |
| `.content` | Element with "content" class |
| `#main-content` | Element with "main-content" id |
| `table.data` | Tables with "data" class |
| `.post-content` | Post/article content |

### Remove noise

```bash
# Remove navigation, ads, footer before extraction
npx tsx src/cli/web-scrape.ts \
  --url "https://example.com/article" \
  --text \
  --remove-selectors "nav,footer,.ads,.sidebar,.comments"
```

## Output Format

### Extracted table (JSON)

```json
[
  {
    "Country": "France",
    "Population": "67 million",
    "GDP": "$2.9T"
  },
  {
    "Country": "Germany",
    "Population": "83 million",
    "GDP": "$4.2T"
  }
]
```

### Extracted table (CSV)

```csv
Country,Population,GDP
France,67 million,$2.9T
Germany,83 million,$4.2T
```

### Metadata

```json
{
  "title": "Page Title",
  "description": "Meta description...",
  "keywords": ["keyword1", "keyword2"],
  "ogTitle": "Open Graph Title",
  "ogImage": "https://example.com/image.jpg",
  "canonical": "https://example.com/page",
  "language": "en"
}
```

## Integration with Other Skills

### To data-reader

```bash
# 1. Extract data
npx tsx src/cli/web-scrape.ts --url "https://..." --table 0 --csv --output data/scraped.csv

# 2. Read with data-reader
npx tsx src/cli/data-read.ts --file data/scraped.csv
```

### To chart-generator

```bash
# 1. Extract as JSON
npx tsx src/cli/web-scrape.ts --url "https://..." --table 0 --format json --output data/scraped.json

# 2. Transform and visualize
# (Adapt JSON to ChartConfig format)
```

### To data-analyst

Extracted data can be analyzed:
1. Extract table as CSV
2. Invoke `data-analyst` to identify trends
3. Use insights in the presentation

## Best Practices

### DO ✅

- **Check robots.txt**: Respect site rules
- **Limit requests**: Don't overload servers
- **Cite sources**: Mention data origin
- **Verify data**: Tables may contain errors

### DON'T ❌

- **Mass scraping**: No loops over hundreds of pages
- **Private data**: Don't attempt to access protected content
- **Dynamic sites**: This skill doesn't work with JavaScript
- **Sensitive data**: Don't extract personal data

## Troubleshooting

### "Failed to fetch"

The site may be blocking automated requests. Try:
- Verify the URL is accessible in a browser
- Some sites block bots

### "No tables found"

- Tables may be generated with JavaScript (not supported)
- Check HTML source (View Source) to confirm presence of `<table>`

### Poorly formatted data

- Use `--selector` to target a specific area
- Use `--remove-selectors` to clean noise
- Post-process CSV/JSON if necessary

### Incorrect encoding

- Most sites use UTF-8
- If corrupted characters, check source page encoding

## Ethics and Legality

1. **Respect terms of use** of sites
2. **Don't overload** servers (no mass scraping)
3. **Public data only** - no authentication bypass
4. **Cite sources** in your presentations
5. **Check licenses** of extracted data
