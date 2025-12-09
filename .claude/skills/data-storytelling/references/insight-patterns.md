# Patterns d'Insights Courants

## Types d'Insights

### 1. L'Insight de Tendance

**Pattern** : "X a changé de Y% sur la période Z"

**Structure** :
```
OBSERVATION   → Direction et magnitude du changement
COMPARAISON   → Par rapport à quoi (historique, benchmark, marché)
IMPLICATION   → Ce que cela signifie pour le futur
```

**Exemple** :
> "Les ventes en ligne ont augmenté de 45% cette année, soit 3x la croissance du marché. Si cette tendance se maintient, le digital représentera 60% de nos revenus d'ici 2026."

### 2. L'Insight de Comparaison

**Pattern** : "X est Y fois plus/moins que Z"

**Structure** :
```
SUJET A       → Ce que vous comparez
SUJET B       → À quoi vous comparez
DIFFÉRENCE    → Magnitude et direction
SIGNIFICATION → Pourquoi c'est important
```

**Exemple** :
> "Notre coût d'acquisition client (85€) est 2.3x supérieur à la moyenne du secteur (37€). Cela érode notre marge de 12 points par client."

### 3. L'Insight de Corrélation

**Pattern** : "Quand X augmente, Y augmente/diminue également"

**Structure** :
```
VARIABLE 1    → Premier facteur
VARIABLE 2    → Second facteur
RELATION      → Force et direction (r=0.78)
CAVEAT        → Corrélation ≠ causalité
HYPOTHÈSE     → Mécanisme possible
```

**Exemple** :
> "Les clients qui utilisent notre app mobile dépensent 67% de plus (r=0.72). Hypothèse : l'app facilite les achats impulsifs via les notifications push."

### 4. L'Insight de Segmentation

**Pattern** : "Le groupe X se comporte différemment du groupe Y"

**Structure** :
```
SEGMENT A     → Caractéristiques
SEGMENT B     → Caractéristiques
DIFFÉRENCE    → Comportement distinctif
OPPORTUNITÉ   → Action possible
```

**Exemple** :
> "Les millennials urbains (25-35 ans, villes >100k) ont un panier moyen de 127€ vs 84€ pour les autres segments. Ils représentent 18% des clients mais 31% du CA."

### 5. L'Insight d'Anomalie

**Pattern** : "X dévie significativement de la norme"

**Structure** :
```
OBSERVATION   → La valeur anormale
NORME         → Ce qui était attendu
ÉCART         → Magnitude de la déviation
INVESTIGATION → Causes possibles
```

**Exemple** :
> "Le mois de mars montre un pic de retours produits (+340% vs moyenne). Investigation : lot défectueux du fournisseur B livré en février."

### 6. L'Insight de Concentration

**Pattern** : "X% de Y génère Z% des résultats" (Pareto)

**Structure** :
```
MINORITÉ      → Le petit groupe
MAJORITÉ      → L'impact disproportionné
IMPLICATION   → Focus et priorités
```

**Exemple** :
> "Nos 50 plus gros clients (3% du total) génèrent 47% du chiffre d'affaires. La perte d'un seul représente un risque de 1.2M€."

### 7. L'Insight de Seuil

**Pattern** : "Au-delà de X, le comportement change"

**Structure** :
```
SEUIL         → Valeur critique
AVANT         → Comportement sous le seuil
APRÈS         → Comportement au-dessus
ACTION        → Comment exploiter ce seuil
```

**Exemple** :
> "Les clients avec plus de 5 achats ont un taux de rétention de 89% vs 34% pour les autres. L'objectif : amener chaque nouveau client au 5ème achat."

### 8. L'Insight Contre-Intuitif

**Pattern** : "Contrairement aux attentes, X est vrai"

**Structure** :
```
CROYANCE      → Ce qu'on pensait vrai
RÉALITÉ       → Ce que les données montrent
EXPLICATION   → Pourquoi la réalité diffère
IMPACT        → Changement de stratégie nécessaire
```

**Exemple** :
> "On pensait que les promotions augmentaient les ventes. Les données montrent qu'elles cannibalisent les ventes plein tarif sans générer de volume additionnel net."

## Templates de Formulation

### Pour Maximiser l'Impact

**Le Chiffre Choc**
> "8 clients sur 10 ne reviennent jamais après leur premier achat"

**La Comparaison Parlante**
> "Nous perdons l'équivalent de 3 salariés à temps plein chaque mois en inefficacités process"

**Le Coût de l'Inaction**
> "Chaque jour sans action nous coûte 47,000€ en opportunités manquées"

**La Projection**
> "À ce rythme, nous aurons perdu notre position de leader d'ici 18 mois"

**Le Benchmark**
> "Amazon livre en 1 jour. Notre moyenne est de 5.2 jours. Le gap est critique."

### Pour Nuancer

**L'Intervalle de Confiance**
> "L'impact estimé est de 2.3M€, avec un intervalle de confiance de [1.8M€ - 2.9M€]"

**La Limitation**
> "Ces résultats sont basés sur les 6 derniers mois. La saisonnalité n'est pas encore visible."

**L'Alternative**
> "Une interprétation alternative serait que... Cependant, les données suggèrent plus fortement que..."

## Validation d'un Insight

Avant de présenter un insight, vérifie :

### Checklist de Qualité

| Critère | Question | ✓/✗ |
|---------|----------|-----|
| **Vrai** | Les données supportent-elles vraiment cette conclusion ? | |
| **Nouveau** | L'audience ne le savait-elle pas déjà ? | |
| **Important** | Cela a-t-il un impact significatif sur les décisions ? | |
| **Actionnable** | Peut-on agir en conséquence ? | |
| **Compréhensible** | Un non-expert peut-il comprendre ? | |
| **Mémorable** | L'audience s'en souviendra-t-elle demain ? | |

### Red Flags

⚠️ **Insight faible** si :
- Basé sur moins de 30 observations
- p-value > 0.05 sans mention
- Confusion corrélation/causalité
- Cherry-picking évident
- Trop complexe à expliquer

## Hiérarchiser les Insights

### Matrice Impact/Surprise

```
                    SURPRISE
                 Faible    Forte
              ┌─────────┬─────────┐
        Fort  │ Valider │ VEDETTE │
    IMPACT    ├─────────┼─────────┤
       Faible │ Ignorer │ Curieux │
              └─────────┴─────────┘
```

- **Vedette** : Insight principal de la présentation
- **Valider** : Confirme les intuitions (crédibilité)
- **Curieux** : Intéressant mais pas prioritaire
- **Ignorer** : Ne pas inclure
