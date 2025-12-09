# Guide PlantUML Complet

## Configuration de Base

```plantuml
@startuml
' Configuration globale
skinparam backgroundColor #FFFFFF
skinparam defaultFontName Arial
skinparam defaultFontSize 12

' Couleurs
skinparam class {
    BackgroundColor #F5F5F5
    BorderColor #333333
    ArrowColor #666666
}
@enduml
```

## Class Diagram

### Relations Complètes

```plantuml
@startuml
' Héritage
class Animal
class Dog extends Animal

' Implémentation
interface Runnable
class Dog implements Runnable

' Association
class Owner
class Pet
Owner --> Pet : owns

' Agrégation (partie peut exister sans le tout)
class Team
class Player
Team o-- Player

' Composition (partie ne peut exister sans le tout)
class House
class Room
House *-- Room

' Dépendance
class Service
class Logger
Service ..> Logger : uses
@enduml
```

### Visibilité et Modificateurs

```plantuml
@startuml
class Example {
    - privateField: int
    # protectedField: string
    ~ packageField: boolean
    + publicField: double

    - privateMethod()
    # protectedMethod()
    ~ packageMethod()
    + publicMethod()

    {static} staticField: int
    {abstract} abstractMethod()
    {final} CONSTANT: string
}
@enduml
```

### Stéréotypes et Notes

```plantuml
@startuml
class User <<Entity>>
class UserService <<Service>>
class UserRepository <<Repository>>
interface IUserRepository <<Interface>>

note right of User
  Entité principale
  représentant un utilisateur
end note

note "Note flottante" as N1
UserService .. N1
@enduml
```

## Sequence Diagram

### Participants Typés

```plantuml
@startuml
actor User
boundary WebUI
control Controller
entity Service
database DB
collections Cache
queue MessageQueue

User -> WebUI: Click
WebUI -> Controller: Request
Controller -> Service: Process
Service -> DB: Query
Service -> Cache: Check
Service -> MessageQueue: Publish
@enduml
```

### Groupes et Dividers

```plantuml
@startuml
participant A
participant B
participant C

== Initialisation ==
A -> B: init()
B -> C: setup()

== Traitement ==
group Validation
    A -> B: validate()
    B --> A: OK
end

group #LightBlue Exécution
    A -> B: execute()
    B -> C: process()
    C --> B: result
    B --> A: done
end

== Nettoyage ==
A -> B: cleanup()
@enduml
```

### Création et Destruction

```plantuml
@startuml
participant Client
participant Factory
participant Product

Client -> Factory: create()
create Product
Factory -> Product: new
activate Product
Product --> Factory: instance
Factory --> Client: product

...5 minutes later...

Client -> Product: use()
Product --> Client: result

Client -> Product: destroy()
destroy Product
@enduml
```

## Activity Diagram

### Flux de Base

```plantuml
@startuml
start
:Étape 1;
:Étape 2;

if (Condition?) then (oui)
    :Action A;
else (non)
    :Action B;
endif

:Étape finale;
stop
@enduml
```

### Parallélisme et Swimlanes

```plantuml
@startuml
|Client|
start
:Soumettre commande;

|Système|
:Valider commande;

fork
    |Entrepôt|
    :Préparer colis;
fork again
    |Comptabilité|
    :Émettre facture;
end fork

|Logistique|
:Expédier;

|Client|
:Recevoir colis;
stop
@enduml
```

## Component Diagram

```plantuml
@startuml
package "Frontend" {
    [React App] as react
    [Redux Store] as redux
}

package "Backend" {
    [API Gateway] as gateway
    [Auth Service] as auth
    [Business Service] as business
}

package "Data Layer" {
    database "PostgreSQL" as db
    database "Redis" as cache
}

react --> gateway : HTTPS
gateway --> auth : gRPC
gateway --> business : gRPC
business --> db : SQL
business --> cache : TCP
@enduml
```

## Deployment Diagram

```plantuml
@startuml
node "Load Balancer" as lb {
    [HAProxy]
}

node "Web Server 1" as ws1 {
    [Nginx]
    [Node.js] as node1
}

node "Web Server 2" as ws2 {
    [Nginx]
    [Node.js] as node2
}

node "Database Server" as dbs {
    database "PostgreSQL Primary" as primary
    database "PostgreSQL Replica" as replica
}

cloud "AWS S3" as s3

lb --> ws1
lb --> ws2
ws1 --> primary
ws2 --> primary
primary --> replica : replication
node1 --> s3
node2 --> s3
@enduml
```

## Use Case Diagram

```plantuml
@startuml
left to right direction

actor "Client" as client
actor "Admin" as admin

rectangle "E-commerce System" {
    usecase "Browse Products" as UC1
    usecase "Add to Cart" as UC2
    usecase "Checkout" as UC3
    usecase "Manage Orders" as UC4
    usecase "Manage Products" as UC5

    UC3 .> UC2 : <<include>>
    UC3 <.. UC4 : <<extend>>
}

client --> UC1
client --> UC2
client --> UC3
admin --> UC4
admin --> UC5
@enduml
```

## C4 Model

### Context Diagram

```plantuml
@startuml
!include https://raw.githubusercontent.com/plantuml-stdlib/C4-PlantUML/master/C4_Context.puml

LAYOUT_WITH_LEGEND()

Person(user, "Utilisateur", "Client de l'application")
Person(admin, "Administrateur", "Gère le système")

System(app, "Notre Application", "Application principale")
System_Ext(payment, "Système de Paiement", "Stripe")
System_Ext(email, "Service Email", "SendGrid")

Rel(user, app, "Utilise")
Rel(admin, app, "Administre")
Rel(app, payment, "Traite paiements")
Rel(app, email, "Envoie emails")
@enduml
```

### Container Diagram

```plantuml
@startuml
!include https://raw.githubusercontent.com/plantuml-stdlib/C4-PlantUML/master/C4_Container.puml

LAYOUT_WITH_LEGEND()

Person(user, "Utilisateur")

System_Boundary(app, "Application") {
    Container(spa, "SPA", "React", "Interface utilisateur")
    Container(api, "API", "Node.js/Express", "API REST")
    Container(worker, "Worker", "Node.js", "Tâches async")
    ContainerDb(db, "Database", "PostgreSQL", "Données")
    ContainerQueue(queue, "Queue", "Redis", "Messages")
}

Rel(user, spa, "HTTPS")
Rel(spa, api, "JSON/HTTPS")
Rel(api, db, "SQL/TCP")
Rel(api, queue, "Publish")
Rel(worker, queue, "Subscribe")
Rel(worker, db, "SQL/TCP")
@enduml
```

## Styles et Thèmes

### Thème Personnalisé

```plantuml
@startuml
!define PRIMARY #4A90A4
!define SECONDARY #F5F5F5
!define ACCENT #E15759

skinparam backgroundColor white
skinparam handwritten false

skinparam class {
    BackgroundColor SECONDARY
    BorderColor PRIMARY
    FontColor #333333
}

skinparam sequence {
    ArrowColor PRIMARY
    LifeLineBorderColor PRIMARY
    ParticipantBackgroundColor SECONDARY
    ParticipantBorderColor PRIMARY
}

skinparam note {
    BackgroundColor #FFFDE7
    BorderColor #FFC107
}
@enduml
```

### Icônes et Sprites

```plantuml
@startuml
!include <office/Servers/application_server>
!include <office/Servers/database_server>
!include <office/Devices/device_laptop>

OFF_DEVICE_LAPTOP(laptop, "Client")
OFF_APPLICATION_SERVER(server, "API Server")
OFF_DATABASE_SERVER(db, "Database")

laptop --> server
server --> db
@enduml
```
