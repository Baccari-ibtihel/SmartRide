# SmartRide - Microservices Backend Architecture

Ce dossier regroupe l'ensemble des microservices et serveurs d'infrastructure composant l'architecture Backend polyglotte de la plateforme **SmartRide**.

## Structure & Technologies des Microservices

| Service / Composant | Responsable | Technologie Choisie | Base de Données | Port | Description & Responsabilités |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`api-gateway`** | Transverse | Spring Cloud Gateway | - | `8080` | Point d'entrée unique, routage dynamique Eureka (`lb://`) & filtrage JWT. |
| **`discovery-server`** | Transverse | Spring Cloud Eureka | - | `8761` | Service Discovery pour l'enregistrement et la découverte dynamique des microservices. |
| **`config-server`** | Transverse | Spring Cloud Config | - | `8888` | Gestion centralisée des configurations multi-environnements. |
| **`keycloak`** | Transverse | Keycloak IAM | H2 / Embedded | `8180` | Fournisseur d'identité OpenID Connect / OAuth2, gestion des rôles et tokens JWT. |
| **`user-service`** | Transverse | **Spring Boot (Java)** | **MySQL** | `8081` | Authentification (JWT), profils (Passager/Conducteur) et vérification d'identité. |
| **`trip-service`** | **Aymen Arfeoui** | **Go (Golang)** | **PostgreSQL** | `8082` | Publication et recherche haute performance des trajets de covoiturage. |
| **`booking-service`** | **Ghofran Hajjej** | **Node.js + Express** | **PostgreSQL** | `8083` | Gestion du cycle de vie des réservations et validation des places. |
| **`payment-service`** | **Mahdi Naifer** | **Python + FastAPI** | **MongoDB** | `8084` | Traitement des paiements sécurisés en ligne (Flouci, D17, CB) et facturation. |
| **`rating-chat-service`** | **Hamza Ben Hmida** | **Java / Spring Boot** | **MySQL / MongoDB** | `8085` | Messagerie instantanée en temps réel (WebSockets) et système d'avis/notes. |
| **`notification-tracking-service`** | **Hafedh Hammami** | **Symfony (PHP)** | **MongoDB** | `8086` | Envoi de notifications (push/SMS) et suivi GPS temps réel sur carte. |
| **`matching-ia-service`** | Transverse | **Python + FastAPI** | **PostgreSQL** | `8087` | Moteur d'IA & algorithme de scoring pour matcher les trajets compatibles. |
| **`dashboard-service`** | **Ibtihel Baccari** | **Spring Boot (Java)** | **MySQL** | `8088` | Tableau de bord administrateur, KPIs, agrégation Feign & tolérance aux pannes (Resilience4j). |

## Lancement local avec Docker Compose

```bash
cd Backend
docker compose up -d
```

## Vérification de l'état des conteneurs

```bash
docker ps
```
