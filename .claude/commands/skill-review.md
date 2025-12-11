---
name: skill-review
description: Analyze and evaluate skill quality - description, expertise, tools and best practices
tags: [skills, quality, review, audit]
version: 1.0.0
---

# Skill Quality Evaluation

## Objective

Analyze each skill in `.claude/skills/` and evaluate its quality across 4 main axes to ensure optimal utilization by Claude Code.

## Evaluation Methodology

For each skill, perform a comprehensive analysis according to the criteria below and assign a score from 1 to 5.

---

## Axis 1: Clarity and Usability by Claude Code

### Evaluation Criteria

| Criterion | Weight | Description |
|---------|-------|-------------|
| **Complete front matter** | 20% | name, description, allowed-tools present and consistent |
| **Concise and precise description** | 25% | The description explains WHEN to use the skill (trigger) |
| **Actionable instructions** | 25% | Instructions are clear, sequenced, without ambiguity |
| **Usage examples** | 15% | Concrete and reproducible CLI examples |
| **Document structure** | 15% | Clear hierarchy, well-defined sections |

### Checklist

- [ ] Front matter contains `name`, `description`, `allowed-tools`
- [ ] Description starts with an action verb or "Use this skill when..."
- [ ] CLI commands are documented with all options
- [ ] Examples cover the main use cases
- [ ] Structure follows a logical order (context → reference → examples)
- [ ] No unexplained jargon
- [ ] Prerequisites are explicit
- [ ] Limitations are documented

### Questions to Ask

1. Can Claude understand WHEN to invoke this skill?
2. Can Claude execute the tasks WITHOUT additional information?
3. Do the instructions avoid any ambiguity?
4. Does the skill guide toward the right decisions?

---

## Axis 2: Domain Expertise and References

### Evaluation Criteria

| Criterion | Weight | Description |
|---------|-------|-------------|
| **Credible expert persona** | 20% | The skill embodies real and cited expertise |
| **Authoritative references** | 25% | Citations from experts, books, recognized standards |
| **Fundamental principles** | 20% | Philosophy/principles guiding decisions |
| **Reference currency** | 20% | Up-to-date sources, not obsolete |
| **Reference documents** | 15% | Relevant and complete files in `references/` |

### Checklist

- [ ] The skill defines an "expert persona" (e.g., "You are a Senior Data Engineer")
- [ ] The cited experts/authors are recognized references in the field
- [ ] Fundamental principles are clearly stated
- [ ] Sources are verifiable (books, URLs, standards)
- [ ] The `references/` directory contains complementary guides
- [ ] References are less than 5 years old (or timeless classics)
- [ ] Terminology used is that of the professional domain

### Questions to Ask

1. Would a domain expert validate these recommendations?
2. Are the cited references recognized authorities?
3. Is the skill's philosophy coherent and professional?
4. Are the recommended practices up to date?

### Expected References by Domain

| Domain | Recommended References |
|---------|------------------------|
| Data Engineering | Joe Reis, Matt Housley, Martin Kleppmann |
| Visualization | Edward Tufte, Stephen Few, Alberto Cairo, Jacques Bertin |
| Storytelling | Nancy Duarte, Cole Nussbaumer Knaflic, Chip & Dan Heath |
| Presentation | Garr Reynolds, Nancy Duarte, Chris Anderson |
| UX/Design | Don Norman, Steve Krug, Jakob Nielsen |
| Architecture | Martin Fowler, Eric Evans, Sam Newman |

---

## Axis 3: Tools and Technical Documentation

### Evaluation Criteria

| Criterion | Weight | Description |
|---------|-------|-------------|
| **Complete CLI commands** | 25% | All options documented with examples |
| **Input/output formats** | 20% | Data structures clearly defined |
| **Error handling** | 15% | Error cases and solutions documented |
| **Workflow integration** | 20% | How the skill integrates with others |
| **Best practices** | 20% | Tips, warnings, anti-patterns |

### Checklist

- [ ] Complete CLI syntax with all options
- [ ] Table of options with description and examples
- [ ] Input formats documented (types, schemas)
- [ ] Output formats documented (JSON structure, files)
- [ ] Error messages explained with solutions
- [ ] Integration workflow with other skills
- [ ] "Best Practices" section or equivalent
- [ ] "Pitfalls to Avoid" section or equivalent

### Questions to Ask

1. Can a developer use the tool without external help?
2. Are data formats explicit and validatable?
3. Are common error cases covered?
4. Is integration with other skills clear?

---

## Axis 4: General Quality and Best Practices

### Evaluation Criteria

| Criterion | Weight | Description |
|---------|-------|-------------|
| **Internal consistency** | 20% | No contradictions, uniform terminology |
| **Completeness** | 20% | All use cases are covered |
| **Maintainability** | 20% | Easy to update, modular |
| **Accessibility** | 20% | Understandable by a non-expert |
| **Added value** | 20% | The skill provides real expertise |

### Checklist

- [ ] Consistent terminology throughout the document
- [ ] No empty sections or "TODO"
- [ ] Appropriate length (neither too short, nor too verbose)
- [ ] Implicit table of contents via headings
- [ ] Links to other skills if relevant
- [ ] Testable and reproducible examples
- [ ] The skill avoids redundancy with CLAUDE.md
- [ ] Assets (palettes, configs) are up to date

### Anti-Patterns to Detect

| Anti-Pattern | Description | Impact |
|--------------|-------------|--------|
| **Empty skill** | Little content, no expertise | Claude doesn't know what to do |
| **Catch-all skill** | Too many responsibilities | Confusion about when to use it |
| **Ambiguous instructions** | "Do your best", "If necessary" | Inconsistent results |
| **Obsolete references** | Outdated tools/methods | Bad recommendations |
| **Strong coupling** | Depends too much on other skills | Hard to maintain |
| **Inverted documentation** | Reference before context | Hard to understand |

---

## Scoring Grid

### Scale

| Score | Level | Description |
|------|--------|-------------|
| 5 | Excellent | Exemplary skill, can serve as a model |
| 4 | Good | Some minor improvements possible |
| 3 | Acceptable | Functional but improvable |
| 2 | Insufficient | Major gaps, requires revision |
| 1 | Critical | Does not fulfill its function |

### Overall Score Calculation

```
Score = (Axis1 × 30%) + (Axis2 × 25%) + (Axis3 × 25%) + (Axis4 × 20%)
```

---

## Report Template

For each analyzed skill, produce a structured report:

```markdown
## Skill: [name]

### Summary
- **Overall score**: X.X/5
- **Strengths**: ...
- **Areas for improvement**: ...

### Detail by Axis

#### Axis 1: Clarity and Usability (X/5)
- Front matter: ✓/✗
- Description: ...
- Instructions: ...
- Examples: ...

#### Axis 2: Domain Expertise (X/5)
- Persona: ...
- References: ...
- Currency: ...

#### Axis 3: Tools and Documentation (X/5)
- CLI: ...
- Formats: ...
- Integration: ...

#### Axis 4: General Quality (X/5)
- Consistency: ...
- Completeness: ...
- Maintainability: ...

### Priority Recommendations
1. [Priority action 1]
2. [Priority action 2]
3. [Priority action 3]
```

---

## Analysis to Perform

1. **List all skills** in `.claude/skills/`

2. **For each skill**:
   - Read the `SKILL.md` file
   - Read files in `references/` if they exist
   - Read assets (JSON, configs) if they exist
   - Apply the evaluation grid

3. **Produce**:
   - An individual report per skill
   - A summary table with scores
   - A list of overall priority recommendations

4. **Identify**:
   - The model skill (best score)
   - Skills requiring urgent revision
   - Common patterns to improve

---

## Expected Deliverables

1. **Summary table**: All skills with their 4 scores and overall score
2. **Detailed reports**: One report per skill following the template
3. **Overall recommendations**: Cross-cutting improvements for all skills
4. **Model skill**: Identification of the best skill as a reference
5. **Action plan**: Prioritized list of improvements to make
