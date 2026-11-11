# SmartRide — Plateforme de Covoiturage Intelligente avec Matching par IA

![SmartRide Banner](https://img.shields.io/badge/SmartRide-Plateforme-1e2454?style=for-the-badge&logo=angular&logoColor=white)
![Microservices Polyglottes](https://img.shields.io/badge/Architecture-Microservices%20Polyglottes-0d5c80?style=for-the-badge&logo=spring&logoColor=white)
![IA Matching](https://img.shields.io/badge/IA%20Matching-FastAPI%20%2B%20Python-0e85a3?style=for-the-badge&logo=python&logoColor=white)
![Docker Compose](https://img.shields.io/badge/Orchestration-Docker%20Compose-2496ed?style=for-the-badge&logo=docker&logoColor=white)
![Keycloak IAM](https://img.shields.io/badge/S%C3%A9curit%C3%A9-Keycloak%20SSO-e16737?style=for-the-badge&logo=redhat&logoColor=white)

---

## 👥 Équipe de Réalisation (ESPRIT)

| Membre | Rôle / Module Principal | Technologie |
| :--- | :--- | :--- |
| **Ibtihel Baccari** | **Module 7 : Dashboard Service** (Statistiques, Analytics & Admin KPIs) | Spring Boot (Java) + MySQL |
| **Aymen Arfeoui** | **Module 2 : Trip Service** (Publication & Recherche de trajets) | Go (Golang) + PostgreSQL |
| **Ghofran Hajjej** | **Module 3 : Booking Service** (Réservation & Confirmation) | Node.js + Express + PostgreSQL |
| **Mahdi Naifer** | **Module 4 : Payment Service** (Paiement en ligne sécurisé & Facturation) | Python + FastAPI + MongoDB |
| **Hamza Ben Hmida** | **Module 5 : Rating + Chat Service** (Avis, Évaluations & Messagerie live) | Java / Spring Boot + WebSocket + MySQL / MongoDB |
| **Hafedh Hammami** | **Module 6 : Notification + Tracking Service** (Alertes & Suivi GPS en direct) | Symfony (PHP) + MongoDB |

---

## 📌 Présentation du Projet

**SmartRide** est une plateforme moderne de covoiturage conçue pour connecter intelligemment conducteurs et passagers réalisant des itinéraires complémentaires en Tunisie. Contrairement aux plateformes classiques reposant sur une recherche stricte par filtres, SmartRide intègre un **moteur de Matching basé sur l'IA** qui analyse en temps réel les détours, horaires et préférences pour maximiser les correspondances pertinentes.

### Problématiques résolues :
1. **Recherche manuelle optimisée** : Recommandations automatiques par IA au lieu d'une simple recherche par filtres.
2. **Confiance instaurée** : Vérification d'identité, profils certifiés, évaluations réciproques et historique partagé.
3. **Trajets optimaux** : Regroupement de passagers et conducteurs réalisant presque le même itinéraire.
4. **Impact économique & écologique** : Réduction des coûts de carburant et de l'empreinte carbone.
5. **Gestion centralisée de bout en bout** : De la publication du trajet au paiement électronique (Flouci, D17, Carte), chat direct et suivi GPS en temps réel.

---

## 📁 Structure du Dépôt

```
SmartRide/
├── Backend/
│   ├── api-gateway/                    # Spring Cloud Gateway (Port 8080)
│   ├── discovery-server/               # Netflix Eureka Service Discovery (Port 8761)
│   ├── config-server/                  # Spring Cloud Config Server (Port 8888)
│   ├── keycloak/                       # Realm export & IAM (Port 8180)
│   ├── dashboard-service/              # Module 7 : Stats & Admin (Ibtihel - Spring Boot / MySQL)
│   ├── user-service/                   # Module 1 : Auth & Profils (Transverse - Spring Boot / MySQL)
│   ├── trip-service/                   # Module 2 : Trajets (Aymen - Go / PostgreSQL)
│   ├── booking-service/                # Module 3 : Réservations (Ghofran - Node.js / PostgreSQL)
│   ├── payment-service/                # Module 4 : Paiements (Mahdi - Python FastAPI / MongoDB)
│   ├── rating-chat-service/            # Module 5 : Avis & Chat (Hamza - Spring Boot / WebSocket)
│   ├── notification-tracking-service/  # Module 6 : Notifs & GPS (Hafedh - Symfony PHP / MongoDB)
│   ├── matching-ia-service/            # Moteur de scoring IA (Python FastAPI / PostgreSQL)
│   └── docker-compose.yml              # Orchestration globale multi-conteneurs
├── Frontend/                           # Application Web Unique Angular 17 (Port 4200)
│   ├── src/
│   ├── angular.json
│   └── package.json
├── Documentation/
│   ├── Presentation/
│   └── Diagrams/
└── README.md
```

---

## 🛠️ Architecture Technique & Microservices Polyglottes

SmartRide adopte une **architecture Microservices Polyglotte avec Database Per Service** garantissant l'indépendance de déploiement et de montée en charge :

| Module | Service | Responsable | Technologie | Base de Données | Rôle & Responsabilités |
| :---: | :--- | :--- | :--- | :--- | :--- |
| **01** | **User Service** | Équipe (Transverse) | **Spring Boot (Java)** | **MySQL** | Authentification, profils (passager/conducteur), rôles, vérification d'identité |
| **02** | **Trip Service** | **Aymen Arfeoui** | **Go (Golang)** | **PostgreSQL** | Publication d'offres, gestion des places, recherche et cycle de vie des trajets |
| **03** | **Booking Service** | **Ghofran Hajjej** | **Node.js + Express** | **PostgreSQL** | Orchestration des réservations, validation conducteur, annulations |
| **04** | **Payment Service** | **Mahdi Naifer** | **Python + FastAPI** | **MongoDB** | Passerelles de paiement (Flouci, D17, Carte, Cash), reçus officiels, remboursements |
| **05** | **Rating + Chat Service** | **Hamza Ben Hmida** | **Java / Spring Boot** | **MySQL / MongoDB** | Évaluations 1-5 étoiles, compliments, messagerie instantanée WebSockets (STOMP) |
| **06** | **Notification + Tracking Service** | **Hafedh Hammami** | **Symfony (PHP)** | **MongoDB** | Alertes SMS/Push temps réel, suivi cartographique GPS (Leaflet) et calcul d'ETA |
| **07** | **Dashboard Service** | **Ibtihel Baccari** | **Spring Boot (Java)** | **MySQL** | Statistiques globales, métriques financières, supervision des microservices, Feign & Circuit Breaker |
| **IA** | **Matching Service (IA)** | Transverse | **Python + FastAPI** | **PostgreSQL** | Algorithme de scoring et suggestions automatisées de correspondances |

---

## 🌐 Composants d'Infrastructure & Gouvernance

* **Spring Cloud API Gateway (`8080`)** : Point d'entrée unique, vérification des jetons JWT, routage dynamique basé sur Eureka (`lb://`).
* **Netflix Eureka Discovery Server (`8761`)** : Enregistrement dynamique et monitoring de santé (`UP`) de chaque microservice.
* **Spring Cloud Config Server (`8888`)** : Centralisation et distribution des configurations applicatives.
* **Keycloak IAM (`8180`)** : Gestion unifiée des identités, Single Sign-On (SSO) et contrôle d'accès basé sur les rôles (RBAC).
* **RabbitMQ Message Broker (`5672` / `15672`)** : Échange d'événements asynchrones entre services (ex: validation de réservation ➔ alerte paiement ➔ notification).
* **Resilience4j & Circuit Breaker** : Tolérance aux pannes intégrée dans le `dashboard-service` pour la communication inter-services.

---

## 📱 Fonctionnalités de la Plateforme (Frontend Angular 17)

### 🧑‍💼 Espace Passager
* Recherche intelligente de trajets par gouvernorat et date.
* Réservation de places avec notification instantanée.
* Paiement en ligne sécurisé (Flouci, D17, Carte Bancaire) avec génération de reçus `#SR-2026-CONF`.
* Suivi GPS du véhicule en temps réel sur carte Leaflet avec calcul dynamique de l'ETA.
* Chat direct avec le conducteur et notation post-trajet (1 à 5 étoiles + tags).

### 🚗 Espace Conducteur
* Publication de trajet (départ, destination, horaire, nombre de places, prix en TND).
* Validation ou refus des demandes de réservation.
* Gestion des étapes de route (Démarrer / Terminer trajet).
* Réception des paiements et historique des gains.

### ⚡ Espace Administration (Dashboard - Ibtihel Baccari)
* **KPIs en direct** : Utilisateurs actifs, volume de trajets, chiffre d'affaires et commissions SmartRide (12%).
* **Supervision Microservices** : Statut d'intégrité de l'écosystème (Gateway, Eureka, Config Server, RabbitMQ, Bases).
* **Cartographie nationale** : Visualisation des corridors de circulation denses (Tunis-Ariana, Sousse-Monastir, Sfax).
* **Gestion & Modération** : CRUD complet des utilisateurs, validation des trajets et modération des avis signalés.

---

## 🚀 Démarrage Rapide

### 1. Prérequis
* Docker & Docker Desktop
* Node.js (v18+) & Angular CLI (v17+)

### 2. Lancement du Backend (Microservices & Bases)
```bash
cd Backend
docker compose up -d
```

### 3. Lancement du Frontend (Angular)
```bash
cd Frontend
npm install
npm start
```
Accès à l'application : 👉 **http://localhost:4200**

---

## 🔗 Liens Utiles & Consoles de Supervision

* **Application Web :** [http://localhost:4200](http://localhost:4200)
* **Eureka Service Discovery :** [http://localhost:8761](http://localhost:8761)
* **Spring Cloud Config Server :** [http://localhost:8888/application/default](http://localhost:8888/application/default)
* **Keycloak Admin Console :** [http://localhost:8180](http://localhost:8180) *(admin / admin)*
* **RabbitMQ Management :** [http://localhost:15672](http://localhost:15672) *(guest / guest)*
* **API Gateway :** [http://localhost:8080](http://localhost:8080)
