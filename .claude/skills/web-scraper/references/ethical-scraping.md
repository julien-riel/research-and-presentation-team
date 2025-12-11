# Guide d'Extraction Éthique de Données Web

Ce document compile les principes légaux, éthiques et techniques pour l'extraction responsable de données depuis le web.

---

## 1. Cadre Légal

### Standards Techniques

#### RFC 9309 - Robots Exclusion Protocol

Le fichier `robots.txt` est le standard de facto pour indiquer les permissions de scraping.

```
# Exemple de robots.txt
User-agent: *
Disallow: /private/
Disallow: /admin/
Allow: /public/
Crawl-delay: 10
```

| Directive | Signification |
|-----------|---------------|
| `User-agent` | Bot concerné (* = tous) |
| `Disallow` | Chemins interdits |
| `Allow` | Chemins autorisés (priorité sur Disallow) |
| `Crawl-delay` | Délai minimum entre requêtes (secondes) |
| `Sitemap` | URL du sitemap XML |

**Obligation** : Toujours vérifier `robots.txt` avant de scraper.

```bash
curl https://example.com/robots.txt
```

### Réglementation Européenne

#### RGPD - Règlement Général sur la Protection des Données

| Article | Impact sur le Scraping |
|---------|------------------------|
| **Art. 6** | Base légale requise pour traiter des données personnelles |
| **Art. 14** | Obligation d'informer les personnes dont les données sont collectées indirectement |
| **Art. 17** | Droit à l'effacement applicable aux données scrapées |
| **Art. 25** | Privacy by design - minimiser les données collectées |

**Implications pratiques** :
- Ne jamais scraper de données personnelles sans base légale
- Anonymiser immédiatement si données personnelles inévitables
- Documenter la finalité du traitement

#### Directive 96/9/CE - Protection des Bases de Données

Le « droit sui generis » protège les bases de données représentant un investissement substantiel.

| Permis | Interdit |
|--------|----------|
| Extraction ponctuelle d'éléments non substantiels | Extraction systématique de la totalité |
| Consultation pour usage personnel | Réutilisation commerciale sans accord |
| Citation avec source | Copie intégrale de la structure |

### Jurisprudence Clé

| Affaire | Décision | Impact |
|---------|----------|--------|
| **hiQ vs LinkedIn** (2022, USA) | Scraping de données publiques autorisé | Données publiques ≠ propriété exclusive |
| **Ryanair vs PR Aviation** (2015, EU) | Protection des données même publiques | Le droit sui generis s'applique |
| **Google vs Oracle** (2021, USA) | Fair use des APIs | Usage transformatif possible |

---

## 2. Principes Éthiques

### Le Triple Contrat

> « Le scraping responsable respecte trois contrats simultanément. »

```
┌─────────────────────────────────────────────────────────────┐
│                    CONTRAT TECHNIQUE                         │
│  • Respecter robots.txt                                     │
│  • Respecter les rate limits                                │
│  • Ne pas contourner les protections                        │
├─────────────────────────────────────────────────────────────┤
│                    CONTRAT LÉGAL                            │
│  • Conditions d'utilisation du site                         │
│  • Licences des données                                     │
│  • Réglementation applicable (RGPD, etc.)                   │
├─────────────────────────────────────────────────────────────┤
│                    CONTRAT ÉTHIQUE                          │
│  • Impact sur le serveur (ne pas nuire)                     │
│  • Finalité légitime                                        │
│  • Proportionnalité des moyens                              │
└─────────────────────────────────────────────────────────────┘
```

### Principes Directeurs

#### 1. Minimisation

Ne collecter que les données strictement nécessaires à l'objectif.

```
❌ Mauvais : Scraper tout le site "au cas où"
✅ Bon : Extraire uniquement le tableau de données nécessaire
```

#### 2. Transparence

Identifier clairement le bot dans le User-Agent.

```
❌ Mauvais : User-Agent: Mozilla/5.0 (simuler un navigateur)
✅ Bon : User-Agent: MyBot/1.0 (contact@mycompany.com)
```

#### 3. Proportionnalité

L'impact sur le serveur doit être proportionnel à l'utilité.

| Fréquence | Usage Approprié |
|-----------|-----------------|
| 1 requête unique | Extraction ponctuelle |
| 1 req/10s | Collecte régulière |
| 1 req/s | Monitoring (avec accord) |
| Parallélisme | **Interdit** sans accord explicite |

#### 4. Finalité Légitime

| Finalité | Légitimité |
|----------|------------|
| Recherche académique | ✅ Généralement acceptée |
| Veille concurrentielle | ⚠️ Zone grise |
| Agrégation de prix | ✅ Intérêt consommateur |
| Spam/harcèlement | ❌ Toujours interdit |
| Copie de contenu | ❌ Violation copyright |

---

## 3. Bonnes Pratiques Techniques

### Rate Limiting

```python
# Exemple de délai respectueux
import time

MIN_DELAY = 2  # secondes entre requêtes

def polite_request(url):
    response = requests.get(url)
    time.sleep(MIN_DELAY)
    return response
```

### Gestion des Erreurs

| Code HTTP | Signification | Action |
|-----------|---------------|--------|
| 200 | OK | Continuer |
| 403 | Forbidden | **Arrêter**, vous êtes bloqué |
| 429 | Too Many Requests | Ralentir drastiquement |
| 503 | Service Unavailable | Pause longue, réessayer plus tard |

### Caching Intelligent

Ne jamais re-télécharger une page identique.

```python
# Headers de cache
headers = {
    'If-Modified-Since': last_modified,
    'If-None-Match': etag
}
```

### Identification du Bot

```python
headers = {
    'User-Agent': 'ResearchBot/1.0 (+https://mysite.com/bot; contact@mysite.com)',
    'From': 'contact@mysite.com'
}
```

---

## 4. Ce Qui Est Interdit

### Absolument Interdit

| Action | Raison |
|--------|--------|
| Contourner l'authentification | Accès non autorisé (pénal) |
| Scraper après blocage | Intrusion (pénal) |
| CAPTCHA solving automatique | Contournement de protection |
| Usurpation d'identité | Fraude |
| DDoS involontaire | Dommage au serveur |

### Zone Rouge

| Action | Risque |
|--------|--------|
| Scraper des données personnelles | Violation RGPD |
| Ignorer robots.txt | Rupture de contrat implicite |
| Republier du contenu copyrightable | Violation copyright |
| Scraper à des fins de spam | Illégal dans la plupart des juridictions |

---

## 5. Sources de Données Recommandées

### Données Ouvertes

| Source | Type | Licence |
|--------|------|---------|
| data.gouv.fr | Données françaises | Licence Ouverte |
| data.europa.eu | Données UE | CC BY 4.0 |
| World Bank Open Data | Économie mondiale | CC BY 4.0 |
| Wikipedia | Encyclopédique | CC BY-SA |

### APIs Officielles

Préférer les APIs aux scraping quand disponibles :

| Service | API | Avantage |
|---------|-----|----------|
| Twitter/X | API v2 | Structuré, rate limits clairs |
| GitHub | REST/GraphQL | Données propres |
| Google Maps | Places API | Légal, documenté |

### Sites Scrap-Friendly

Certains sites autorisent explicitement le scraping :

```
robots.txt avec Allow: /
Ou mention explicite "Scraping allowed"
```

---

## 6. Documentation et Traçabilité

### Métadonnées à Conserver

Pour chaque extraction :

```json
{
  "source_url": "https://example.com/data",
  "extraction_date": "2024-12-10T14:30:00Z",
  "robots_txt_checked": true,
  "crawl_delay_respected": true,
  "purpose": "Market research for internal presentation",
  "data_retention": "30 days",
  "contact": "analyst@company.com"
}
```

### Registre des Extractions

Maintenir un log des activités de scraping :

| Date | URL | Données | Finalité | Rétention |
|------|-----|---------|----------|-----------|
| 2024-12-10 | wikipedia.org | Population pays | Présentation Q4 | 30j |

---

## 7. Alternatives au Scraping

### 1. APIs Officielles

Toujours vérifier si une API existe avant de scraper.

### 2. Téléchargement Direct

Beaucoup de sites proposent des exports CSV/Excel.

### 3. Demande de Données

Contacter le webmaster :
```
Bonjour,
Je souhaiterais utiliser les données de [page] pour [finalité].
Serait-il possible d'obtenir un export ou l'autorisation de les extraire ?
Cordialement
```

### 4. Partenariat Data

Pour des besoins récurrents, négocier un accès data.

---

## 8. Checklist Avant Extraction

### Vérifications Préalables

- [ ] `robots.txt` vérifié et respecté ?
- [ ] Conditions d'utilisation lues ?
- [ ] Pas de données personnelles ?
- [ ] Finalité documentée ?
- [ ] Rate limiting configuré (min. 2s entre requêtes) ?
- [ ] User-Agent identifiant le bot ?

### Vérifications Pendant

- [ ] Codes HTTP surveillés (stop sur 403/429) ?
- [ ] Erreurs loguées ?
- [ ] Impact serveur raisonnable ?

### Vérifications Après

- [ ] Source citée dans la présentation ?
- [ ] Données purgées après usage ?
- [ ] Registre mis à jour ?

---

## 9. Ressources

### Textes de Référence

- RFC 9309 : https://www.rfc-editor.org/rfc/rfc9309
- RGPD : https://eur-lex.europa.eu/eli/reg/2016/679/oj
- Directive 96/9/CE : https://eur-lex.europa.eu/legal-content/FR/TXT/?uri=CELEX%3A31996L0009

### Outils de Vérification

- robots.txt tester : https://www.google.com/webmasters/tools/robots-testing-tool
- RGPD compliance checker : https://gdpr.eu/checklist/

### Lectures Recommandées

- *The Tangled Web* - Michal Zalewski
- *Web Scraping with Python* - Ryan Mitchell (O'Reilly)
- *Data and Goliath* - Bruce Schneier (aspects éthiques)
