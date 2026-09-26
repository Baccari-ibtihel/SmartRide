# SmartRide - Microservices Backend Architecture

Ce dossier regroupe l'ensemble des microservices et serveurs d'infrastructure composant l'architecture Backend polyglotte de la plateforme **SmartRide**.

## Structure & Technologies des Microservices

| Service / Composant | Technologie Choisie | Base de Données | Port | Description & Responsabilités |
| :--- | :--- | :--- | :--- | :--- |
| **`api-gateway`** | Spring Cloud Gateway | - | `8080` | Point d'entrée unique, routage dynamique & filtrage JWT. |
| **`discovery-server`** | Spring Cloud Eureka | - | `8761` | Service Discovery pour l'enregistrement et la découverte dynamique des microservices. |
| **`config-server`** | Spring Cloud Config | - | `8888` | Gestion centralisée des configurations multi-environnements. |
| **`user-service`** | **Spring Boot (Java)** | **MySQL / phpMyAdmin (XAMPP)** | `8081` | Authentification (JWT), profils (Passager/Conducteur) et vérification d'identité. |
| **`trip-service`** | **Go (Golang)** | - | `8082` | Publication et recherche haute performance des trajets de covoiturage. |
| **`booking-service`** | **Node.js + Express** | **PostgreSQL** | `8083` | Gestion du cycle de vie des réservations et validation des places. |
| **`payment-service`** | **Python + FastAPI** | - | `8084` | Traitement des paiements sécurisés en ligne et facturation. |
| **`rating-chat-service`** | **NestJS (TypeScript)** | - | `8085` | Messagerie instantanée en temps réel (WebSockets) et système d'avis/notes. |
| **`notification-tracking-service`** | **Symfony (PHP)** | - | `8086` | Envoi de notifications (push/email) et suivi GPS temps réel. |
| **`matching-ia-service`** | **Python + FastAPI** | - | `8087` | Moteur d'IA & algorithme de scoring pour matcher les trajets compatibles. |

## Lancement local avec Docker Compose

```bash
cd Backend
docker-compose up -d --build
```
