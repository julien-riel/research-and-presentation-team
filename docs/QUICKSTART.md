# Guide de Démarrage Rapide

## 🚀 En 5 Minutes : Ta Première Présentation

### Étape 1 : Prépare tes fichiers

Place tes fichiers de données dans le dossier du projet :
- `data.xlsx` ou `data.csv` (tes données)
- Optionnel : `context.pdf` (document de contexte)

### Étape 2 : Lance Claude Code

```bash
cd research-and-presentation-team
claude
```

### Étape 3 : Demande ta présentation

Copie-colle ce prompt et adapte-le :

```
J'ai besoin d'une présentation PowerPoint.

📊 Données d'entrée :
- Fichier : data.xlsx

🎯 Objectif :
- Présenter les résultats trimestriels à la direction
- Durée : 15 minutes
- Audience : Comité de direction (non-technique)

📋 Contenu souhaité :
- Vue d'ensemble des performances
- 3 insights clés avec graphiques
- Points d'attention / alertes
- Recommandations pour le prochain trimestre

🎨 Style :
- Professionnel et épuré
- Palette bleue corporate
- Graphiques simples et lisibles

Génère la présentation complète.
```

### Étape 4 : Récupère ta présentation

Le fichier `presentation.pptx` sera généré dans le dossier `output/`.

---

## 📚 Exemples de Prompts par Situation

### Situation 1 : J'ai des données Excel et je veux comprendre

```
Voici un fichier Excel (donnees.xlsx) avec des données que je ne connais pas.

1. Lis le fichier et dis-moi :
   - Quelles colonnes sont présentes ?
   - Combien de lignes ?
   - Quel est le sujet apparent des données ?

2. Fais une analyse rapide :
   - Statistiques de base sur les colonnes numériques
   - Distribution des valeurs catégorielles
   - Y a-t-il des données manquantes ?

3. Identifie 3-5 insights intéressants dans ces données.
```

### Situation 2 : J'ai un PDF et je veux en faire une synthèse

```
Lis le document rapport-2024.pdf et :

1. Résume les points clés en 5-7 bullets
2. Extrais les chiffres importants
3. Identifie les conclusions principales
4. Suggère une structure de présentation pour partager ces infos
```

### Situation 3 : J'ai des données et je veux des graphiques

```
À partir du fichier ventes.csv :

1. Crée un graphique en barres des ventes par région
2. Crée un graphique linéaire de l'évolution mensuelle
3. Crée un camembert de la répartition par catégorie de produit

Style : épuré, couleurs sobres, labels lisibles.
Génère les images en haute résolution.
```

### Situation 4 : Je veux une présentation de A à Z

```
Crée une présentation complète sur la performance commerciale.

📁 Fichiers disponibles :
- ventes-2024.xlsx (données de ventes)
- objectifs.csv (objectifs par région)
- strategie.pdf (document stratégique)

📊 Contenu de la présentation :
1. Slide de titre
2. Contexte et objectifs de l'année
3. Performance globale vs objectifs (graphique)
4. Performance par région (graphique comparatif)
5. Top 10 produits (tableau)
6. Tendance mensuelle (graphique ligne)
7. Analyse des écarts
8. Facteurs de succès
9. Points d'amélioration
10. Plan d'action Q1 2025
11. Slide de conclusion

🎨 Style :
- Thème corporate bleu (#1E3A5F)
- Police Arial
- Un message clé par slide
- Graphiques annotés avec les chiffres importants

Génère le fichier PowerPoint.
```

### Situation 5 : Je veux améliorer une présentation existante

```
J'ai une ébauche de présentation (draft.pptx).

Améliore-la en :
1. Simplifiant les slides trop chargés
2. Ajoutant des graphiques pour remplacer les tableaux
3. Créant une meilleure progression narrative
4. Ajoutant un slide de résumé avec les 3 points clés
```

---

## 🎯 Templates de Prompts Prêts à l'Emploi

### Template : Rapport Mensuel

```
Crée un rapport mensuel PowerPoint pour [MOIS] [ANNÉE].

Données : [FICHIER.xlsx]

Structure :
1. Page de garde
2. Faits marquants du mois (3 bullets)
3. KPIs principaux vs objectifs (dashboard)
4. Détail par [DIMENSION] (graphiques)
5. Alertes et points d'attention
6. Actions du mois prochain

Audience : [DÉCRIRE]
Durée : [X] minutes
Style : [DÉCRIRE]
```

### Template : Pitch Deck

```
Crée un pitch deck pour [PROJET/PRODUIT].

Documents disponibles :
- [LISTE DES FICHIERS]

Structure (10 slides) :
1. Titre + tagline accrocheur
2. Le problème (avec chiffres)
3. Notre solution
4. Comment ça marche (diagramme)
5. Traction / Preuves
6. Marché adressable
7. Business model
8. Équipe
9. Roadmap
10. L'ask + contact

Style : moderne, visuel, peu de texte
```

### Template : Formation

```
Crée une présentation de formation sur [SUJET].

Objectif pédagogique : [DÉCRIRE]
Durée : [X] minutes
Public : [DÉCRIRE]

Structure :
1. Introduction et objectifs
2-N. Contenu (alterner théorie/exemples/exercices)
N+1. Récapitulatif
N+2. Quiz / Questions
N+3. Ressources pour aller plus loin

Style : pédagogique, visuel, exemples concrets
Inclure des diagrammes explicatifs.
```

### Template : Analyse Exploratoire

```
J'ai un nouveau dataset ([FICHIER]) que je ne connais pas.

Phase 1 - Découverte :
- Structure et types de données
- Qualité des données
- Premières statistiques

Phase 2 - Analyse :
- Patterns intéressants
- Corrélations
- Anomalies

Phase 3 - Présentation :
- Crée 10 slides résumant les découvertes
- Inclure les visualisations pertinentes
- Suggérer des pistes d'approfondissement
```

---

## ⚡ Raccourcis Utiles

### Commandes Rapides

| Tu veux... | Dis... |
|------------|--------|
| Voir les données | "Montre-moi un aperçu de data.xlsx" |
| Stats rapides | "Donne les stats descriptives de data.csv" |
| Un graphique | "Fais un bar chart des ventes par région" |
| Structure prez | "Propose une structure de présentation sur X" |
| Générer PPTX | "Génère le PowerPoint final" |

### Ajustements Courants

| Tu veux... | Dis... |
|------------|--------|
| Simplifier | "Simplifie ce slide, trop de texte" |
| Plus visuel | "Remplace ce tableau par un graphique" |
| Changer couleurs | "Utilise une palette verte au lieu de bleue" |
| Ajouter contexte | "Ajoute une slide de contexte au début" |
| Condenser | "Fusionne ces 3 slides en 1" |

---

## 🔧 Dépannage

### Le fichier Excel ne se lit pas

```
"Le fichier utilise quelle feuille ? Lis spécifiquement la feuille 'Data'"
"Ignore les 3 premières lignes qui sont des en-têtes"
"L'encodage est peut-être en Latin-1, pas UTF-8"
```

### Les graphiques sont moches

```
"Simplifie : enlève la grille, garde seulement les valeurs importantes"
"Utilise des couleurs plus sobres"
"Ajoute les valeurs directement sur les barres"
"Agrège les petites catégories en 'Autres'"
```

### La présentation est trop longue

```
"Maximum 12 slides"
"Un seul message par slide"
"Mets les détails en annexe"
"Fusionne les slides 3, 4 et 5"
```

### Je veux voir avant de générer

```
"Montre-moi d'abord le plan détaillé avant de créer les slides"
"Propose 3 options de visualisation pour ce graphique"
"Décris ce que tu mettrais sur chaque slide"
```
