# SmartRide — Présentation Synthétique du Projet (Séance 4)

---

## Slide 1 : Page de Titre
**Titre :** SmartRide  
**Sous-titre :** Plateforme de covoiturage intelligente avec matching par IA  
**Cadre :** Séance 4 — Présentation synthétique du projet  
**Équipe :** 
- Baccari Ibtihel (`ibtihel.baccari@esprit.tn`) — Lead Frontend & Matching IA
- Ghofran Hajjej (`ghofran.Hajjej@esprit.tn`) — Développeuse Fullstack & Microservices
- Membre 3 — Développeur Microservices & Database
- Membre 4 — Développeur Fullstack & Assurance Qualité

---

## Slide 2 : Idée et Problématique du Projet

### Idée Générale
SmartRide est une plateforme de covoiturage qui connecte automatiquement conducteurs et passagers effectuant des trajets similaires. Un moteur de matching intelligent basé sur l'IA analyse en temps réel les itinéraires, horaires et préférences pour proposer les correspondances les plus optimisées et pertinentes, plutôt qu'une recherche manuelle restrictive par filtres.

L'utilisateur réserve, paie et note son trajet directement sur la plateforme, avec un suivi en temps réel et un système rigoureux de vérification d'identité pour instaurer une confiance mutuelle.

### Problématique
- **Recherche de trajet manuelle et peu optimisée :** Les utilisateurs comparent péniblement eux-mêmes les horaires et détours.
- **Manque de confiance entre inconnus :** Absence de vérification d'identité fiable ni d'historique partagé d'évaluations.
- **Trajets sous-optimaux :** Deux personnes réalisant presque le même itinéraire ne se croisent jamais faute d'un algorithme de correspondance flexible.
- **Coût et impact environnemental élevés :** Empreinte carbone importante due au transport individuel sous-employé.
- **Absence de suivi centralisé :** Processus fragmenté (réservation, paiement, messagerie et évaluation dispersés).

---

## Slide 3 : Principales Fonctionnalités

### 1. Fonctionnalités Passager
- Recherche de trajet classique et assistée par IA
- Algorithme de Matching intelligent (IA) avec score de compatibilité
- Réservation et paiement sécurisé en ligne
- Historique des trajets et évaluation des conducteurs

### 2. Fonctionnalités Conducteur
- Publication de trajet (départ, arrivée, heures, prix par siège, préférences)
- Gestion des demandes de réservation et acceptation
- Réception automatique du paiement après validation du trajet
- Évaluation des passagers transportés

### 3. Fonctionnalités Transverses (Plateforme)
- Messagerie instantanée & Chat conducteur $\leftrightarrow$ passager
- Système de Notifications push / email / SMS
- Vérification d'identité (pièce d'identité et badge de confiance)
- Suivi GPS du véhicule en temps réel durant le trajet

---

## Slide 4 : Microservices et Responsabilités

| Microservice | Technologie Choisie | Responsabilités Principales |
| :--- | :--- | :--- |
| **User Service** | **Spring Boot (Java)** | Authentification, profils, vérification d'identité |
| **Trip Service** | **Go** | Publication et recherche de trajet haute performance |
| **Booking Service** | **Node.js + Express** | Réservation, confirmation, verrouillage de sièges |
| **Payment Service** | **Python + FastAPI** | Traitement des paiements en ligne et facturation |
| **Rating/Chat Service** | **NestJS (TypeScript)** | Messagerie instantanée en temps réel et évaluations |
| **Notification/Tracking Service** | **Symfony (PHP)** | Envoi de notifications push/SMS et suivi GPS temps réel |
| **Matching Service (IA)** | **Python + FastAPI** | Algorithme de scoring et prédiction de trajets compatibles |

---

## Slide 5 : Architecture Globale Proposée

- **Architecture Microservices Polyglotte :** Découpage modulaire orienté domaines métier avec les meilleures technologies adaptées à chaque besoin.
- **API Gateway (Spring Cloud Gateway) :** Point d'entrée unique sécurisé avec routage dynamique et filtrage.
- **Service Discovery (Eureka Server) :** Enregistrement et localisation dynamique des instances microservices.
- **Config Server (Spring Cloud Config) :** Centralisation et versionnement des configurations multi-environnements.
- **Database per Service :** Isolation des données (PostgreSQL pour User/Trip/Booking/Payment, MongoDB pour Chat/Rating, Redis pour le tracking).
- **Frontend Unique (Angular) :** Interface utilisateur SPA moderne et réactive consommant les API REST via la Gateway.

---

## Slide 6 : Technologies Choisies

- **Frontend :** Angular 17, HTML5, Vanilla CSS / SCSS, RxJS.
- **Microservices Backend :**
  - **User Service :** Spring Boot (Java 17)
  - **Trip Service :** Go (Golang 1.22)
  - **Booking Service :** Node.js + Express
  - **Payment Service :** Python + FastAPI
  - **Rating/Chat Service :** NestJS (TypeScript)
  - **Notification/Tracking Service :** Symfony (PHP 8.2)
  - **Matching Service (IA) :** Python + FastAPI
- **Infrastructure & Cloud :** Spring Cloud Gateway, Eureka Server, Docker, Docker Compose.
- **Bases de données :** PostgreSQL, MongoDB, Redis.

---

## Slide 7 : Répartition des Tâches dans l'Équipe

| Membre | Email | Rôle principal | Microservices / Modules sous responsabilité |
| :--- | :--- | :--- | :--- |
| **Baccari Ibtihel** | `ibtihel.baccari@esprit.tn` | Lead Frontend & Matching IA | Interface Angular, Matching Service (Python + FastAPI), Intégration Gateway. |
| **Ghofran Hajjej** | `ghofran.Hajjej@esprit.tn` | Fullstack & Microservices | Trip Service (Go), Booking Service (Node.js + Express), Schémas PostgreSQL. |
| **Membre 3** | — | Lead Backend & DevOps | Infrastructure Spring Cloud (Eureka, Config, Gateway), User Service (Spring Boot), Docker. |
| **Membre 4** | — | Fullstack & QA | Payment Service (FastAPI), Rating/Chat (NestJS), Notif/Tracking (Symfony), Tests. |

---

## Slide 8 : Planning Prévisionnel & Principaux Risques

### Planning Prévisionnel (Sprints)
- **Sprint 1 (Semaines 1-2) :** Architecture microservices polyglotte, modèles de données, dépôt Git.
- **Sprint 2 (Semaines 3-4) :** Microservices User (Spring Boot), Trip (Go), Booking (Node.js) et Angular.
- **Sprint 3 (Semaines 5-6) :** Moteur d'IA (FastAPI), Payment (FastAPI), Rating/Chat (NestJS), Notif/Tracking (Symfony).
- **Sprint 4 (Semaines 7-8) :** Intégration globale, tests E2E, déploiement Docker.

### Principaux Risques et Mitigations
1. **Gestion d'une stack polyglotte :**  
   *Mitigation :* Standardisation de la conteneurisation Docker pour chaque microservice.
2. **Temps de calcul du Matching IA :**  
   *Mitigation :* Traitement asynchrone et mise en cache Redis des requêtes fréquentes.
