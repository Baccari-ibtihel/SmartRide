# SmartRide - Microservices Backend Architecture

Ce dossier regroupe l'ensemble des microservices et serveurs d'infrastructure composant l'architecture Backend de la plateforme **SmartRide**.

## Structure des Microservices

| Service / Composant | Technologie | Port | Description & Responsabilités |
| :--- | :--- | :--- | :--- |
| **`api-gateway`** | Spring Cloud Gateway | `8080` | Point d'entrée unique, routage dynamique, filtrage des requêtes & sécurité JWT. |
| **`discovery-server`** | Spring Cloud Eureka | `8761` | Service Discovery pour l'enregistrement et la découverte dynamique des microservices. |
| **`config-server`** | Spring Cloud Config | `8888` | Gestion centralisée des configurations multi-environnements. |
| **`user-service`** | Spring Boot + PostgreSQL | `8081` | Authentification (JWT), gestion des profils (Passager/Conducteur) et vérification d'identité. |
| **`trip-service`** | Spring Boot + PostgreSQL | `8082` | Publication, modification, annulation et recherche filtrée des trajets de covoiturage. |
| **`booking-service`** | Spring Boot + PostgreSQL | `8083` | Gestion du cycle de vie des réservations, confirmation et gestion des places disponibles. |
| **`payment-service`** | Spring Boot + PostgreSQL | `8084` | Traitement des paiements sécurisés en ligne, facturation et transferts conducteurs. |
| **`rating-chat-service`** | Spring Boot + MongoDB | `8085` | Messagerie instantanée en temps réel entre passager/conducteur et système d'avis/notes. |
| **`notification-tracking-service`** | Spring Boot + Redis | `8086` | Notifications push/email/SMS et suivi GPS du trajet en temps réel. |
| **`matching-ia-service`** | Python / FastAPI / Spring Boot | `8087` | Moteur d'IA & algorithme de scoring pour matcher les trajets compatibles selon l'itinéraire et les horaires. |

## Lancement local avec Docker Compose

```bash
cd Backend
docker-compose up -d --build
```
