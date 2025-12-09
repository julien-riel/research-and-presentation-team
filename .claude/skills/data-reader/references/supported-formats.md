# Formats de Données Supportés

## Excel (.xlsx, .xls)

### Caractéristiques
- **Multi-feuilles** : Un fichier peut contenir plusieurs feuilles de calcul
- **Formules** : Les cellules peuvent contenir des formules (lecture de la valeur calculée)
- **Formatage** : Dates, nombres, devises sont formatés
- **Types natifs** : Excel distingue texte, nombre, date, booléen

### Particularités à Gérer
- **Cellules fusionnées** : Peuvent casser la structure tabulaire
- **Lignes d'en-tête multiples** : Parfois 2-3 lignes pour les headers
- **Colonnes cachées** : Peuvent contenir des données importantes
- **Noms de feuilles** : Utiliser pour identifier le contexte

### Commande
```bash
npx tsx src/cli/data-read.ts --file data.xlsx --sheet "Feuil1"
```

## CSV (.csv)

### Caractéristiques
- **Délimiteur** : Virgule (,) standard, mais peut varier
- **Encodage** : UTF-8 préféré, mais Latin-1 courant en Europe
- **Échappement** : Guillemets doubles pour les valeurs contenant des virgules

### Variantes Courantes
| Région | Délimiteur | Séparateur décimal |
|--------|------------|-------------------|
| US/UK | , (virgule) | . (point) |
| France/Europe | ; (point-virgule) | , (virgule) |
| TAB-separated | \t (tabulation) | variable |

### Détection Automatique
Le système analyse les premières lignes pour détecter :
1. Le délimiteur le plus probable
2. La présence d'en-têtes
3. L'encodage

### Commande
```bash
npx tsx src/cli/data-read.ts --file data.csv --delimiter ";" --encoding "utf-8"
```

## TSV (.tsv)

### Caractéristiques
- **Délimiteur** : Tabulation (\t)
- **Avantage** : Pas de confusion avec les virgules dans les données
- **Usage** : Export de bases de données, fichiers scientifiques

### Commande
```bash
npx tsx src/cli/data-read.ts --file data.tsv
```

## JSON (.json)

### Structures Supportées

**Array d'objets** (recommandé) :
```json
[
  {"id": 1, "name": "Alice", "score": 95},
  {"id": 2, "name": "Bob", "score": 87}
]
```

**Objet avec array** :
```json
{
  "data": [
    {"id": 1, "name": "Alice"},
    {"id": 2, "name": "Bob"}
  ],
  "metadata": {"source": "API", "date": "2024-01-15"}
}
```

**JSON Lines (.jsonl)** :
```
{"id": 1, "name": "Alice"}
{"id": 2, "name": "Bob"}
```

### Commande
```bash
npx tsx src/cli/data-read.ts --file data.json --jsonpath "$.data"
```

## Détection d'Encodage

### Encodages Supportés
| Encodage | Usage | Caractères spéciaux |
|----------|-------|---------------------|
| UTF-8 | Standard moderne | Tous caractères Unicode |
| UTF-8 BOM | Windows UTF-8 | Préfixe EF BB BF |
| Latin-1 (ISO-8859-1) | Europe occidentale | é, è, ç, ñ |
| Windows-1252 | Windows legacy | €, œ, Œ |

### Indices de Détection
1. **BOM** : Si présent, identifie l'encodage
2. **Caractères invalides** : UTF-8 invalide → essayer Latin-1
3. **Fréquence caractères** : Patterns statistiques

## Gestion des Erreurs

### Erreurs Courantes
| Erreur | Cause | Solution |
|--------|-------|----------|
| `Invalid character` | Mauvais encodage | Spécifier --encoding |
| `Inconsistent columns` | Lignes malformées | Vérifier le délimiteur |
| `Date parse error` | Format date ambigu | Spécifier --date-format |
| `Number format error` | Séparateur décimal | Spécifier --decimal "," |

### Mode Tolérant
```bash
npx tsx src/cli/data-read.ts --file data.csv --lenient
```
- Ignore les lignes malformées
- Conserve un log des erreurs
- Continue le traitement
