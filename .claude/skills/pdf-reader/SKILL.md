---
name: pdf-reader
description: Reading and extracting content from large PDF files. Text extraction, metadata, search, tables. Use this skill to read PDFs that are too large for Claude's native reading or to extract structured data.
allowed-tools:
  - Bash
  - Read
  - Write
---

# PDF Reader Skill

You are a **PDF Document Extraction Expert** who masters:

- **Text extraction** from complex PDFs
- **Metadata analysis** to understand origin and structure
- **Full-text search** with context
- **Table detection** using heuristics

## References and Expertise

### Standards and Specifications

- **PDF Reference** (Adobe) - ISO 32000-2:2020 Standard
- **Web Content Accessibility Guidelines (WCAG 2.1)** - For accessible extraction
- **Document Engineering** (Glushko & McGrath) - Document structure principles
- **Unicode Technical Report #50** - Text orientation and direction

### Philosophy

> "A well-extracted document preserves not only the text, but also the structure
> and intent of the original author."
> — Robert J. Glushko, *Document Engineering*

### Extraction Principles

1. **Fidelity**: Preserve logical reading order, not visual
2. **Structure**: Maintain hierarchy (headings, paragraphs, lists)
3. **Context**: Metadata informs content interpretation
4. **Integrity**: Signal information loss (images, forms)

## When to Use This Skill

| Situation | Use this skill? |
|-----------|-----------------|
| PDF < 10 MB, simple reading | No - Claude reads natively |
| PDF > 20 MB or very large | **Yes** - Programmatic extraction |
| Specific page extraction | **Yes** - `--pages` option |
| Text search within PDF | **Yes** - `--search` option |
| Table extraction | **Yes** - `--tables` option |
| Metadata only (fast) | **Yes** - `--metadata` option |
| Statistics (words, pages) | **Yes** - `--summary` option |

## Complete CLI Reference

### Main command

```bash
npx tsx src/cli/pdf-read.ts --file <path> [options]
```

### Available options

| Option | Short | Description | Example |
|--------|-------|-------------|---------|
| `--file <path>` | `-f` | Path to PDF file (required) | `--file report.pdf` |
| `--metadata` | `-m` | Display only metadata (fast) | `--metadata` |
| `--summary` | `-s` | Display document statistics | `--summary` |
| `--pages <range>` | `-p` | Extract specific pages | `--pages 1-5` |
| `--search <term>` | | Search for text in the PDF | `--search "revenue"` |
| `--tables` | `-t` | Attempt to extract tables | `--tables` |
| `--format <fmt>` | `-F` | Output format: json, markdown, table | `--format json` |
| `--verbose` | `-v` | Detailed output | `--verbose` |
| `--debug` | | Debug mode with timing | `--debug` |
| `--quiet` | | Minimal output | `--quiet` |

### Page range formats

| Format | Description | Example |
|--------|-------------|---------|
| `N` | Single page | `--pages 5` (page 5 only) |
| `N-M` | Page range | `--pages 1-10` (pages 1 to 10) |
| `N-` | From page N to end | `--pages 50-` (page 50 to end) |

## Usage Examples

### Metadata (fast operation)

```bash
# View metadata without reading all content
npx tsx src/cli/pdf-read.ts --file rapport-annuel.pdf --metadata
```

Output:
```
PDF Metadata
────────────────────────────────────
Title          : Rapport Annuel 2024
Author         : Direction Financière
Subject        : Performance et Perspectives
Pages          : 156
Creation Date  : 2024-03-15T10:30:00.000Z
PDF Version    : 1.7
```

### Document statistics

```bash
npx tsx src/cli/pdf-read.ts --file document.pdf --summary
```

Output:
```
PDF Summary
────────────────────────────────────
Title          : Document Strategy
Author         : Consulting Team
Pages          : 45
Words          : 12,450
Characters     : 78,320
Lines          : 1,245
Avg Words/Page : 277
```

### Specific page extraction

```bash
# Pages 1 to 5
npx tsx src/cli/pdf-read.ts --file rapport.pdf --pages 1-5

# Single page
npx tsx src/cli/pdf-read.ts --file rapport.pdf --pages 10

# Pages 50 to end
npx tsx src/cli/pdf-read.ts --file rapport.pdf --pages 50-
```

### Text search

```bash
npx tsx src/cli/pdf-read.ts --file contrat.pdf --search "clause résiliation"
```

Output:
```
Search Results for "clause résiliation"
────────────────────────────────────────
Page  Position  Context
────  ────────  ──────────────────────────────────
12    1245      ...selon la clause résiliation prévue à l'article 8...
15    890       ...invoquer la clause résiliation dans un délai de...
23    2100      ...modification de la clause résiliation nécessite...
```

### Table extraction

```bash
npx tsx src/cli/pdf-read.ts --file finances.pdf --tables --format json
```

JSON output:
```json
[
  {
    "headers": ["Trimestre", "CA", "Marge", "EBITDA"],
    "rows": [
      ["Q1 2024", "12.5M€", "42%", "2.1M€"],
      ["Q2 2024", "14.2M€", "45%", "2.8M€"]
    ],
    "pageNumber": 8
  }
]
```

### Complete JSON extraction

```bash
npx tsx src/cli/pdf-read.ts --file document.pdf --format json > output.json
```

## Typical Workflow

### 1. Quick exploration

```bash
# Step 1: Check metadata
npx tsx src/cli/pdf-read.ts --file rapport.pdf --metadata

# Step 2: View statistics
npx tsx src/cli/pdf-read.ts --file rapport.pdf --summary
```

### 2. Targeted extraction

```bash
# Extract introduction (pages 1-5)
npx tsx src/cli/pdf-read.ts --file rapport.pdf --pages 1-5 > intro.txt

# Extract financial data (pages 20-30)
npx tsx src/cli/pdf-read.ts --file rapport.pdf --pages 20-30 --tables --format json > finances.json
```

### 3. Information search

```bash
# Find all mentions of a term
npx tsx src/cli/pdf-read.ts --file rapport.pdf --search "croissance"

# Then extract context from relevant pages
npx tsx src/cli/pdf-read.ts --file rapport.pdf --pages 12-15
```

## Integration with Other Skills

### With data-analyst

```bash
# 1. Extract tables from PDF
npx tsx src/cli/pdf-read.ts --file rapport.pdf --tables --format json > data/tables.json

# 2. Invoke data-analyst to analyze extracted data
```

### With presentation-architect

```bash
# 1. Extract key content
npx tsx src/cli/pdf-read.ts --file etude.pdf --pages 1-20 > content.txt

# 2. Use content to structure the presentation
```

## Structure of Returned Data

### Metadata (PdfMetadata)

```typescript
{
  title?: string;           // Document title
  author?: string;          // Author
  subject?: string;         // Subject
  keywords?: string;        // Keywords
  creator?: string;         // Creator application
  producer?: string;        // PDF generator
  creationDate?: Date;      // Creation date
  modificationDate?: Date;  // Modification date
  pageCount: number;        // Number of pages
  version?: string;         // PDF version
}
```

### Extracted content (PdfContent)

```typescript
{
  text: string;             // Complete raw text
  pages: string[];          // Text by page
  metadata: PdfMetadata;    // Metadata
  info: {
    path: string;           // File path
    size: number;           // Size in bytes
  }
}
```

### Extracted table (ExtractedTable)

```typescript
{
  headers: string[];        // Headers (first row)
  rows: string[][];         // Data rows
  pageNumber?: number;      // Source page
}
```

## Limitations and Best Practices

### Limitations

| Limitation | Description |
|------------|-------------|
| Scanned PDFs | No OCR - only PDFs with native text are supported |
| Complex tables | Heuristic detection - may miss complex tables |
| Layout | Text is extracted linearly, layout is lost |
| Forms | Form fields are not extracted |

### Best Practices

**DO**:
- Always start with `--metadata` to evaluate the document
- Use `--pages` for large PDFs
- Export with `--format json` for programmatic processing
- Combine with other skills for analysis

**DON'T**:
- Extract a 500-page PDF without filtering pages
- Expect perfect table extraction
- Use on scanned PDFs without prior OCR

## Memory Management

The service uses streams to read files (64KB chunks), making it efficient for large files:

```
PDF File
    ↓ (stream 64KB chunks)
Memory buffer
    ↓ (pdfjs-dist)
Extracted text
```

For very large files (> 100 MB), prefer extraction by page ranges:

```bash
# Instead of
npx tsx src/cli/pdf-read.ts --file huge.pdf

# Prefer
npx tsx src/cli/pdf-read.ts --file huge.pdf --pages 1-50 > part1.txt
npx tsx src/cli/pdf-read.ts --file huge.pdf --pages 51-100 > part2.txt
```

## Troubleshooting

### "PDF file not found"

Check the file path. Use an absolute path if necessary.

### Unreadable text or missing characters

The PDF may use non-standard embedded fonts. Try with `--verbose` to see details.

### No table detected

Table detection is heuristic. Tables with graphic borders or complex layout may not be detected.

### Slow extraction

- Use `--metadata` or `--summary` for fast operations
- Limit with `--pages` to extract only what is necessary
