---
name: skill-review
description: Analyse et évalue la qualité des skills - description, expertise, outils et bonnes pratiques
tags: [skills, quality, review, audit]
version: 1.0.0
---

# Évaluation de la Qualité des Skills

## Objectif

Analyser chaque skill dans `.claude/skills/` et évaluer sa qualité selon 4 axes principaux pour garantir une exploitation optimale par Claude Code.

## Méthodologie d'Évaluation

Pour chaque skill, effectuer une analyse complète selon les critères ci-dessous et attribuer une note de 1 à 5.

---

## Axe 1 : Clarté et Exploitabilité par Claude Code

### Critères d'évaluation

| Critère | Poids | Description |
|---------|-------|-------------|
| **Front matter complet** | 20% | name, description, allowed-tools présents et cohérents |
| **Description concise et précise** | 25% | La description explique QUAND utiliser le skill (trigger) |
| **Instructions actionnables** | 25% | Les instructions sont claires, séquencées, sans ambiguïté |
| **Exemples d'utilisation** | 15% | Exemples CLI concrets et reproductibles |
| **Structure du document** | 15% | Hiérarchie claire, sections bien délimitées |

### Checklist

- [ ] Le front matter contient `name`, `description`, `allowed-tools`
- [ ] La description commence par un verbe d'action ou "Utiliser ce skill quand..."
- [ ] Les commandes CLI sont documentées avec toutes les options
- [ ] Les exemples couvrent les cas d'usage principaux
- [ ] La structure suit un ordre logique (contexte → référence → exemples)
- [ ] Pas de jargon non expliqué
- [ ] Les prérequis sont explicites
- [ ] Les limitations sont documentées

### Questions à se poser

1. Claude peut-il comprendre QUAND invoquer ce skill ?
2. Claude peut-il exécuter les tâches SANS information supplémentaire ?
3. Les instructions évitent-elles toute ambiguïté ?
4. Le skill guide-t-il vers les bonnes décisions ?

---

## Axe 2 : Expertise Métier et Références

### Critères d'évaluation

| Critère | Poids | Description |
|---------|-------|-------------|
| **Persona expert crédible** | 20% | Le skill incarne une expertise réelle et citée |
| **Références autoritatives** | 25% | Citations d'experts, livres, standards reconnus |
| **Principes fondamentaux** | 20% | Philosophie/principes guidant les décisions |
| **Actualité des références** | 20% | Sources à jour, pas obsolètes |
| **Documents de référence** | 15% | Fichiers dans `references/` pertinents et complets |

### Checklist

- [ ] Le skill définit un "persona expert" (ex: "Tu es un Data Engineer Senior")
- [ ] Les experts/auteurs cités sont des références reconnues du domaine
- [ ] Les principes fondamentaux sont énoncés clairement
- [ ] Les sources sont vérifiables (livres, URLs, standards)
- [ ] Le répertoire `references/` contient des guides complémentaires
- [ ] Les références sont datées de moins de 5 ans (ou classiques intemporels)
- [ ] La terminologie utilisée est celle du domaine professionnel

### Questions à se poser

1. Un expert du domaine validerait-il ces recommandations ?
2. Les références citées sont-elles des autorités reconnues ?
3. La philosophie du skill est-elle cohérente et professionnelle ?
4. Les pratiques recommandées sont-elles à jour ?

### Références Attendues par Domaine

| Domaine | Références Recommandées |
|---------|------------------------|
| Data Engineering | Joe Reis, Matt Housley, Martin Kleppmann |
| Visualisation | Edward Tufte, Stephen Few, Alberto Cairo, Jacques Bertin |
| Storytelling | Nancy Duarte, Cole Nussbaumer Knaflic, Chip & Dan Heath |
| Présentation | Garr Reynolds, Nancy Duarte, Chris Anderson |
| UX/Design | Don Norman, Steve Krug, Jakob Nielsen |
| Architecture | Martin Fowler, Eric Evans, Sam Newman |

---

## Axe 3 : Outils et Documentation Technique

### Critères d'évaluation

| Critère | Poids | Description |
|---------|-------|-------------|
| **Commandes CLI complètes** | 25% | Toutes les options documentées avec exemples |
| **Formats d'entrée/sortie** | 20% | Structures de données clairement définies |
| **Gestion des erreurs** | 15% | Cas d'erreur et solutions documentés |
| **Intégration workflow** | 20% | Comment le skill s'intègre aux autres |
| **Bonnes pratiques** | 20% | Tips, warnings, anti-patterns |

### Checklist

- [ ] Syntaxe CLI complète avec toutes les options
- [ ] Tableau des options avec description et exemples
- [ ] Formats d'entrée documentés (types, schémas)
- [ ] Formats de sortie documentés (structure JSON, fichiers)
- [ ] Messages d'erreur expliqués avec solutions
- [ ] Workflow d'intégration avec les autres skills
- [ ] Section "Bonnes Pratiques" ou équivalent
- [ ] Section "Pièges à Éviter" ou équivalent

### Questions à se poser

1. Un développeur peut-il utiliser l'outil sans aide extérieure ?
2. Les formats de données sont-ils explicites et validables ?
3. Les cas d'erreur courants sont-ils couverts ?
4. L'intégration avec les autres skills est-elle claire ?

---

## Axe 4 : Qualité Générale et Bonnes Pratiques

### Critères d'évaluation

| Critère | Poids | Description |
|---------|-------|-------------|
| **Cohérence interne** | 20% | Pas de contradictions, terminologie uniforme |
| **Complétude** | 20% | Tous les cas d'usage sont couverts |
| **Maintenabilité** | 20% | Facile à mettre à jour, modulaire |
| **Accessibilité** | 20% | Compréhensible par un non-expert |
| **Valeur ajoutée** | 20% | Le skill apporte une réelle expertise |

### Checklist

- [ ] Terminologie cohérente dans tout le document
- [ ] Pas de sections vides ou "TODO"
- [ ] Longueur appropriée (ni trop court, ni trop verbeux)
- [ ] Table des matières implicite via les titres
- [ ] Liens vers d'autres skills si pertinent
- [ ] Exemples testables et reproductibles
- [ ] Le skill évite la redondance avec CLAUDE.md
- [ ] Les assets (palettes, configs) sont à jour

### Anti-Patterns à Détecter

| Anti-Pattern | Description | Impact |
|--------------|-------------|--------|
| **Skill vide** | Peu de contenu, pas d'expertise | Claude ne sait pas quoi faire |
| **Skill fourre-tout** | Trop de responsabilités | Confusion sur quand l'utiliser |
| **Instructions ambiguës** | "Fais au mieux", "Si nécessaire" | Résultats inconsistants |
| **Références obsolètes** | Outils/méthodes dépassés | Mauvaises recommandations |
| **Couplage fort** | Dépend trop d'autres skills | Difficile à maintenir |
| **Documentation inversée** | Référence avant contexte | Difficile à comprendre |

---

## Grille de Notation

### Échelle

| Note | Niveau | Description |
|------|--------|-------------|
| 5 | Excellent | Skill exemplaire, peut servir de modèle |
| 4 | Bon | Quelques améliorations mineures possibles |
| 3 | Acceptable | Fonctionnel mais perfectible |
| 2 | Insuffisant | Lacunes importantes, nécessite révision |
| 1 | Critique | Ne remplit pas sa fonction |

### Calcul du Score Global

```
Score = (Axe1 × 30%) + (Axe2 × 25%) + (Axe3 × 25%) + (Axe4 × 20%)
```

---

## Template de Rapport

Pour chaque skill analysé, produire un rapport structuré :

```markdown
## Skill: [nom]

### Résumé
- **Score global** : X.X/5
- **Points forts** : ...
- **Axes d'amélioration** : ...

### Détail par Axe

#### Axe 1 : Clarté et Exploitabilité (X/5)
- Front matter : ✓/✗
- Description : ...
- Instructions : ...
- Exemples : ...

#### Axe 2 : Expertise Métier (X/5)
- Persona : ...
- Références : ...
- Actualité : ...

#### Axe 3 : Outils et Documentation (X/5)
- CLI : ...
- Formats : ...
- Intégration : ...

#### Axe 4 : Qualité Générale (X/5)
- Cohérence : ...
- Complétude : ...
- Maintenabilité : ...

### Recommandations Prioritaires
1. [Action prioritaire 1]
2. [Action prioritaire 2]
3. [Action prioritaire 3]
```

---

## Analyse à Effectuer

1. **Lister tous les skills** dans `.claude/skills/`

2. **Pour chaque skill** :
   - Lire le fichier `SKILL.md`
   - Lire les fichiers dans `references/` s'ils existent
   - Lire les assets (JSON, configs) s'ils existent
   - Appliquer la grille d'évaluation

3. **Produire** :
   - Un rapport individuel par skill
   - Un tableau récapitulatif avec scores
   - Une liste de recommandations prioritaires globales

4. **Identifier** :
   - Le skill modèle (meilleur score)
   - Les skills nécessitant une révision urgente
   - Les patterns communs à améliorer

---

## Livrables Attendus

1. **Tableau récapitulatif** : Tous les skills avec leurs 4 scores et le score global
2. **Rapports détaillés** : Un rapport par skill suivant le template
3. **Recommandations globales** : Améliorations transversales à tous les skills
4. **Skill modèle** : Identification du meilleur skill comme référence
5. **Plan d'action** : Liste priorisée des améliorations à apporter
