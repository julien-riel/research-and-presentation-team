# Principes d'Iconographie

Ce document compile les principes fondamentaux de conception d'icônes, basés sur les travaux des experts de référence du domaine.

---

## 1. Les Fondamentaux de Susan Kare

Susan Kare, créatrice des icônes originales du Macintosh, a établi des principes qui restent la référence aujourd'hui.

### Règle de la Grille Pixel

- Travailler sur une grille fixe (16x16, 32x32, 48x48)
- Aligner les éléments sur la grille pour une netteté maximale
- Éviter les diagonales qui créent un effet d'escalier

### Métaphore Visuelle

| Concept Abstrait | Métaphore Concrète | Exemple |
|------------------|-------------------|---------|
| Supprimer | Poubelle | 🗑️ |
| Enregistrer | Disquette | 💾 |
| Paramètres | Engrenage | ⚙️ |
| Accueil | Maison | 🏠 |
| Recherche | Loupe | 🔍 |

### Reconnaissance vs Rappel

> « Une icône réussie est reconnue, pas déchiffrée. L'utilisateur ne doit pas
> avoir à réfléchir pour comprendre sa signification. »

---

## 2. Les Variables Visuelles de Bertin

Jacques Bertin a identifié 7 variables visuelles applicables aux icônes :

| Variable | Usage en Iconographie |
|----------|----------------------|
| **Position** | Placement dans l'interface |
| **Taille** | Hiérarchie d'importance |
| **Forme** | Catégorisation |
| **Valeur** | État (actif/inactif) via luminosité |
| **Couleur** | Sémantique (danger = rouge, succès = vert) |
| **Orientation** | Direction de l'action (flèches) |
| **Texture** | Rare, utilisée pour accessibilité |

---

## 3. Principes de Design Universel (Don Norman)

### Affordances et Signifiants

- **Affordance** : Ce que l'objet permet de faire
- **Signifiant** : L'indice visuel de l'affordance

Exemple : Une icône de bouton doit avoir :
- Relief suggérant qu'on peut « presser »
- Changement d'état au survol (hover)

### Les 7 Principes de Norman appliqués aux Icônes

1. **Visibilité** : L'icône est clairement visible dans son contexte
2. **Feedback** : État clair (normal, survol, actif, désactivé)
3. **Contraintes** : Limiter les interprétations possibles
4. **Mapping** : Correspondance intuitive (flèche droite = avancer)
5. **Cohérence** : Même style dans toute l'interface
6. **Accessibilité** : Taille minimale 44x44px pour le tactile

---

## 4. Les Pictogrammes d'Otl Aicher (Munich 1972)

Otl Aicher a créé le système de pictogrammes des JO de Munich, devenu un standard mondial.

### Principes de Construction

```
┌─────────────────────────────────────┐
│  Grille modulaire 10x10             │
│  ├── Proportions humaines 1:8       │
│  ├── Angles à 45° uniquement        │
│  └── Épaisseur de trait constante   │
└─────────────────────────────────────┘
```

### Réduction à l'Essentiel

1. **Identifier l'action clé** : Quel geste définit le sport/concept ?
2. **Silhouette uniquement** : Pas de détails du visage
3. **Position dynamique** : Capturer le mouvement, pas le repos
4. **Test de reconnaissance** : Compréhensible en 0.5 seconde

---

## 5. Cohérence Stylistique

### Outline vs Filled

| Style | Quand l'utiliser | Exemple |
|-------|------------------|---------|
| **Outline** | Navigation, actions secondaires | Lucide Icons par défaut |
| **Filled** | États actifs, éléments principaux | Icône sélectionnée |
| **Two-tone** | Différenciation subtile | Distinction primaire/secondaire |

**Règle d'or** : Ne JAMAIS mélanger outline et filled dans la même interface.

### Épaisseur de Trait (Stroke Width)

| Contexte | Stroke Width | Taille Recommandée |
|----------|--------------|-------------------|
| Corps de texte | 1.5px | 16-20px |
| Navigation | 2px | 24px |
| Illustration | 1.5-2px | 32-48px |
| Titre/Hero | 2-2.5px | 64px+ |

---

## 6. Couleurs et Sémantique

### Palette Fonctionnelle

| Couleur | Signification | Usage |
|---------|---------------|-------|
| **Bleu** | Information, action principale | Boutons, liens |
| **Vert** | Succès, validation, positif | Confirmation, check |
| **Rouge** | Erreur, danger, suppression | Alertes, delete |
| **Orange/Jaune** | Avertissement, attention | Warnings |
| **Gris** | Neutre, désactivé | États inactifs |

### Contraste et Accessibilité

- Ratio minimum **3:1** pour les icônes (WCAG AA)
- Ratio recommandé **4.5:1** pour une lisibilité optimale
- Tester sur fond clair ET fond foncé

```
Fond blanc (#FFFFFF) → Icône minimum #767676
Fond noir (#000000) → Icône minimum #949494
```

---

## 7. Anti-Patterns à Éviter

### ❌ Surcharge de Détails

```
Mauvais : Icône maison avec fenêtres, cheminée, jardin, voiture
Bon : Silhouette simple de maison (toit + base)
```

### ❌ Métaphores Culturellement Biaisées

| Icône Problématique | Pourquoi | Alternative |
|--------------------|----------|-------------|
| Boîte aux lettres US | Inconnue hors USA | Enveloppe |
| Disquette | Génération Z ne connaît pas | Flèche vers le bas (télécharger) |
| Main OK 👌 | Offensant dans certaines cultures | Check mark ✓ |

### ❌ Taille Insuffisante

- Minimum **24px** pour desktop
- Minimum **44px** pour tactile (zone de tap)
- Jamais en dessous de **16px** sans label texte

### ❌ Manque de Distinction

Si deux icônes se ressemblent trop, l'utilisateur hésitera.

```
Problème : ⬆️ vs ↑ (trop similaires)
Solution : Utiliser des formes distinctes ou ajouter des labels
```

---

## 8. Checklist de Validation

Avant d'utiliser une icône dans une présentation :

- [ ] Est-elle reconnaissable sans label en 0.5 seconde ?
- [ ] Est-elle cohérente avec les autres icônes (même style) ?
- [ ] Est-elle visible sur le fond prévu (contraste suffisant) ?
- [ ] Est-elle à une taille appropriée pour le contexte ?
- [ ] La métaphore est-elle universellement comprise ?
- [ ] L'icône fonctionne-t-elle en noir et blanc ?

---

## Ressources Complémentaires

- *The Icon Handbook* - Jon Hicks (2011)
- *The Design of Everyday Things* - Don Norman (2013)
- *Pictograms, Icons & Signs* - Abdullah & Hübner (2006)
- Lucide Icons Guidelines: https://lucide.dev/guide/design/icon-design-guide
