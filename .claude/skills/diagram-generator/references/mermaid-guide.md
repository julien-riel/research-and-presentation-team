# Guide Mermaid Complet

## Configuration Globale

```mermaid
%%{init: {
  'theme': 'base',
  'themeVariables': {
    'primaryColor': '#4A90A4',
    'primaryTextColor': '#fff',
    'primaryBorderColor': '#2E5A6B',
    'lineColor': '#333',
    'secondaryColor': '#F5F5F5',
    'tertiaryColor': '#E8E8E8'
  }
}}%%
```

## Flowchart Avancé

### Sous-graphes

```mermaid
flowchart TB
    subgraph Frontend
        A[React App]
        B[Redux Store]
    end

    subgraph Backend
        C[API Gateway]
        D[Microservice 1]
        E[Microservice 2]
    end

    subgraph Data
        F[(PostgreSQL)]
        G[(Redis)]
    end

    A --> C
    C --> D
    C --> E
    D --> F
    E --> G
```

### Styles Personnalisés

```mermaid
flowchart LR
    A[Normal]
    B[Important]
    C[Warning]
    D[Error]

    style A fill:#f9f9f9,stroke:#333
    style B fill:#4A90A4,stroke:#2E5A6B,color:#fff
    style C fill:#FFC107,stroke:#FF9800
    style D fill:#F44336,stroke:#B71C1C,color:#fff

    classDef highlight fill:#E8F5E9,stroke:#4CAF50
    class A highlight
```

### Liens avec Styles

```mermaid
flowchart LR
    A --> B
    A --- C
    A -.-> D
    A ==> E
    A --o F
    A --x G
    A <--> H

    A -- "label" --> I
    A -- "texte long
    sur plusieurs lignes" --> J
```

## Sequence Diagram Avancé

### Activation et Désactivation

```mermaid
sequenceDiagram
    participant C as Client
    participant S as Server
    participant D as Database

    C->>+S: Request
    S->>+D: Query
    D-->>-S: Results
    S-->>-C: Response
```

### Boucles et Alternatives

```mermaid
sequenceDiagram
    participant U as User
    participant A as Auth
    participant S as Service

    U->>A: Login(credentials)

    alt Valid credentials
        A->>S: CreateSession
        S-->>A: SessionToken
        A-->>U: Success + Token
    else Invalid credentials
        A-->>U: Error 401
    end

    loop Every 5 minutes
        U->>A: RefreshToken
        A-->>U: NewToken
    end

    opt User requests logout
        U->>A: Logout
        A->>S: DestroySession
    end
```

### Notes et Rectangles

```mermaid
sequenceDiagram
    participant A
    participant B

    Note left of A: Note à gauche
    Note right of B: Note à droite
    Note over A,B: Note partagée

    rect rgba(200, 220, 255, 0.5)
        Note over A,B: Zone mise en évidence
        A->>B: Message 1
        B-->>A: Réponse 1
    end

    rect rgba(255, 200, 200, 0.5)
        A->>B: Message critique
    end
```

## State Diagram Avancé

### États Composites

```mermaid
stateDiagram-v2
    [*] --> Off

    state On {
        [*] --> Idle
        Idle --> Processing: start
        Processing --> Idle: done

        state Processing {
            [*] --> Reading
            Reading --> Transforming
            Transforming --> Writing
            Writing --> [*]
        }
    }

    Off --> On: powerOn
    On --> Off: powerOff
```

### Forks et Joins

```mermaid
stateDiagram-v2
    state fork_state <<fork>>
    state join_state <<join>>

    [*] --> fork_state
    fork_state --> Task1
    fork_state --> Task2
    fork_state --> Task3

    Task1 --> join_state
    Task2 --> join_state
    Task3 --> join_state

    join_state --> [*]
```

## Gantt Avancé

### Dépendances et Jalons

```mermaid
gantt
    title Planning de Release
    dateFormat YYYY-MM-DD
    excludes weekends

    section Préparation
    Analyse des besoins     :done, a1, 2024-01-01, 2024-01-15
    Spécifications          :done, a2, after a1, 10d
    Revue architecture      :milestone, m1, 2024-01-25, 0d

    section Développement
    Sprint 1                :active, b1, 2024-01-26, 14d
    Sprint 2                :b2, after b1, 14d
    Sprint 3                :b3, after b2, 14d
    Feature freeze          :milestone, m2, after b3, 0d

    section Validation
    Tests intégration       :c1, after m2, 7d
    Tests UAT               :c2, after c1, 7d
    Go/No-Go                :milestone, m3, after c2, 0d

    section Déploiement
    Déploiement prod        :crit, d1, after m3, 2d
```

## Pie Chart

```mermaid
pie showData
    title Répartition du Budget
    "Développement" : 45
    "Marketing" : 25
    "Opérations" : 20
    "R&D" : 10
```

## Git Graph

```mermaid
gitGraph
    commit id: "Initial"
    branch develop
    checkout develop
    commit id: "Feature A"
    commit id: "Feature B"
    checkout main
    merge develop id: "Release 1.0"
    branch hotfix
    commit id: "Fix bug"
    checkout main
    merge hotfix id: "1.0.1"
```

## Quadrant Chart

```mermaid
quadrantChart
    title Matrice Effort/Impact
    x-axis Low Effort --> High Effort
    y-axis Low Impact --> High Impact

    quadrant-1 Plan carefully
    quadrant-2 Do first
    quadrant-3 Eliminate
    quadrant-4 Delegate

    Feature A: [0.8, 0.9]
    Feature B: [0.2, 0.8]
    Feature C: [0.3, 0.3]
    Feature D: [0.7, 0.2]
```

## Timeline

```mermaid
timeline
    title Histoire de l'Entreprise
    section Fondation
        2010 : Création
             : Premier produit
    section Croissance
        2015 : Série A
             : 50 employés
        2018 : Série B
             : Expansion internationale
    section Maturité
        2022 : IPO
        2024 : Leader du marché
```

## Thèmes Disponibles

```
%%{init: {'theme': 'default'}}%%    # Standard
%%{init: {'theme': 'forest'}}%%     # Vert naturel
%%{init: {'theme': 'dark'}}%%       # Mode sombre
%%{init: {'theme': 'neutral'}}%%    # Gris neutre
%%{init: {'theme': 'base'}}%%       # Base personnalisable
```
