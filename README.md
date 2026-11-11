# SmartRide — Branche `ibtihel` : Dashboard Service & Infrastructure

![SmartRide](https://img.shields.io/badge/SmartRide-Module%207%20Dashboard-1e2454?style=for-the-badge&logo=spring&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.x-6db33f?style=for-the-badge&logo=springboot&logoColor=white)
![MySQL](https://img.shields.io/badge/Base%20de%20donn%C3%A9es-MySQL-4479a1?style=for-the-badge&logo=mysql&logoColor=white)
![Eureka](https://img.shields.io/badge/Service%20Discovery-Netflix%20Eureka-0d5c80?style=for-the-badge&logo=spring&logoColor=white)
![API Gateway](https://img.shields.io/badge/Routage-Spring%20Cloud%20Gateway-0e85a3?style=for-the-badge&logo=spring&logoColor=white)
![Docker](https://img.shields.io/badge/Conteneurisation-Dockerfile-2496ed?style=for-the-badge&logo=docker&logoColor=white)

---

## 👤 Informations Étudiante
* **Nom & Prénom :** Ibtihel Baccari
* **Module Attribué :** **Module 7 — Dashboard Service (Statistiques, Analytics & Supervision Admin)**
* **Projet :** SmartRide — Plateforme de Covoiturage Intelligente
* **Institution :** ESPRIT

---

## 📌 Présentation du Module 7 : Dashboard Service

Le **Dashboard Service** constitue le centre névralgique de supervision et d'analyse de la plateforme **SmartRide**. Il agrège les données de l'ensemble de l'écosystème pour produire des indicateurs clés de performance (KPIs), analyser les flux de transport et assurer la gouvernance administrateur.

### Responsabilités Métier :
1. **Génération de statistiques & rapports** : Analyse des données pour produire des métriques en temps réel sur l'activité globale.
2. **Suivi des utilisateurs** : Évolution du nombre d'inscriptions, répartition des rôles (Conducteur / Passager) et statuts des comptes.
3. **Analyse des trajets & paiements** : Taux d'occupation des véhicules, trajets par gouvernorat tunisien, chiffre d'affaires et commissions SmartRide.
4. **Suivi des réservations** : Évolution des demandes, confirmations et taux d'annulation.
5. **Résilience & Tolérance aux pannes** : Utilisation de **Spring Cloud OpenFeign** couplé à **Resilience4j Circuit Breakers** pour sécuriser les appels inter-services.

---

## 📁 Périmètre Individuel dans cette Branche (`ibtihel`)

Conformément aux consignes de travail individuel, cette branche contient **exclusivement** le travail propre au module de l'étudiante et son infrastructure associée :

```
SmartRide/ (Branche: ibtihel)
├── Backend/
│   ├── dashboard-service/          # Microservice Métier (Spring Boot 3 + MySQL)
│   │   ├── src/main/java/          # Contrôleurs, Services, Entités, Feign Clients & Fallbacks
│   │   ├── src/main/resources/     # application.properties (MySQL & Eureka)
│   │   ├── pom.xml                 # Dépendances Maven (Spring Data JPA, Feign, Resilience4j)
│   │   └── Dockerfile              # Build multi-stage Java 17
│   │
│   ├── api-gateway/                # Passerelle Spring Cloud Gateway
│   │   ├── src/main/resources/     # Configuration du routage dynamique (/api/dashboard/**)
│   │   ├── pom.xml                 # Dépendances Gateway & Security
│   │   └── Dockerfile              # Conteneurisation de la passerelle
│   │
│   └── discovery-server/           # Serveur de Découverte Netflix Eureka
│       ├── src/main/resources/     # Configuration standalone Eureka (Port 8761)
│       ├── pom.xml                 # Dépendances Spring Cloud Netflix Eureka Server
│       └── Dockerfile              # Conteneurisation du discovery server
│
├── .gitignore                      # Exclusion des fichiers temporaires & dossiers externes
└── README.md                       # Documentation officielle de la branche
```

---

## 🛠️ Stack Technologique du Module

| Composant | Technologie | Version / Détails |
| :--- | :--- | :--- |
| **Framework Backend** | **Spring Boot** | `3.2.x` |
| **Langage** | **Java** | `Java 17 (LTS)` |
| **Service Discovery** | **Netflix Eureka Client** | Enregistrement sous `DASHBOARD-SERVICE` |
| **Communication Inter-services** | **Spring Cloud OpenFeign** | Appels REST synchrones déclaratifs |
| **Tolérance aux pannes** | **Resilience4j** | Circuit Breakers avec Fallback methods |
| **ORM & Persistance** | **Spring Data JPA / Hibernate** | Entités statistiques & métriques |
| **Base de Données** | **MySQL** | Base dédiée `smartride_dashboard` (Port `3308`) |
| **API Gateway** | **Spring Cloud Gateway** | Routage réactif non bloquant (Port `8080`) |
| **Conteneurisation** | **Docker** | Dockerfile multi-stage (Maven build + JRE Alpine) |

---

## 🔌 API Endpoints (Dashboard Service - Port 8088)

Toutes les requêtes peuvent être appelées soit directement sur le microservice (`http://localhost:8088`), soit via l'API Gateway (`http://localhost:8080/api/dashboard/...`).

| Méthode | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/dashboard/kpis` | Retourne les KPIs globaux (Utilisateurs, Trajets actifs, Revenus TND, Taux de remplissage) |
| `GET` | `/api/dashboard/trips-by-governorate` | Répartition des trajets par gouvernorat (Tunis, Ariana, Sousse, Sfax, Nabeul...) |
| `GET` | `/api/dashboard/monthly-revenue` | Historique des volumes de transactions et commissions mensuelles |
| `GET` | `/api/dashboard/service-health` | État de santé de l'écosystème et état des Circuit Breakers |
| `GET` | `/api/dashboard/recent-activity` | Flux chronologique des derniers événements sur la plateforme |
| `GET` | `/actuator/health` | Healthcheck Eureka & Actuator |

---

## 🛡️ Résilience & Architecture de Communication

Pour respecter le principe de découplage des microservices :
* Le **Dashboard Service** communique avec les microservices métiers via des clients **OpenFeign**.
* Chaque appel externe est encapsulé dans un **Circuit Breaker Resilience4j**.
* Si un service dépendant (ex: Paiement ou Trajet) est ralenti ou indisponible, le Circuit Breaker déclenche automatiquement la méthode de **Fallback**, renvoyant des données de substitution fiables sans jamais bloquer l'administrateur.

---

## 🚀 Instructions d'Exécution & Déploiement

### 1. Prérequis
* JDK 17 installé (`java -version`)
* Maven 3.9+ (`mvn -version`)
* Serveur MySQL en écoute sur `localhost:3306` ou `3308` (Base: `smartride_dashboard`)

### 2. Démarrage des Composants en Local

#### Étape 1 : Lancer le Serveur de Découverte (Eureka)
```bash
cd Backend/discovery-server
mvn spring-boot:run
```
> Console Eureka disponible sur : 👉 **http://localhost:8761**

#### Étape 2 : Lancer le Dashboard Service
```bash
cd Backend/dashboard-service
mvn spring-boot:run
```
> Le microservice s'enregistre automatiquement auprès d'Eureka sous `DASHBOARD-SERVICE`.

#### Étape 3 : Lancer l'API Gateway
```bash
cd Backend/api-gateway
mvn spring-boot:run
```
> Les requêtes envoyées à `http://localhost:8080/api/dashboard/**` sont routées dynamiquement vers le Dashboard Service.

### 3. Construction des Images Docker

Chaque composant dispose de son propre `Dockerfile` :

```bash
# Image Dashboard Service
docker build -t smartride/dashboard-service:1.0 ./Backend/dashboard-service

# Image API Gateway
docker build -t smartride/api-gateway:1.0 ./Backend/api-gateway

# Image Discovery Server
docker build -t smartride/discovery-server:1.0 ./Backend/discovery-server
```
