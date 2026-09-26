# SmartRide — Présentation Synthétique du Projet (Séance 4)

---

## Slide 1 : Page de Titre
**Titre :** SmartRide  
**Sous-titre :** Plateforme de covoiturage intelligente avec matching par IA  
**Cadre :** Séance 4 — Présentation synthétique du projet  
**Équipe :** 
- Baccari Ibtihel (Lead Frontend & Matching IA)
- Membre 2 (Lead Backend Microservices & DevOps)
- Membre 3 (Développeur Microservices & Database)
- Membre 4 (Développeur Fullstack & Assurance Qualité)

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

| Microservice | Responsabilités Principales |
| :--- | :--- |
| **User Service** | Authentification JWT, gestion des profils, vérification des pièces d'identité et rôles. |
| **Trip Service** | Publication, mise à jour, suppression et recherche de trajets. |
| **Booking Service** | Gestion du cycle de vie des réservations et validation des places. |
| **Payment Service** | Gestion des paiements en ligne, portefeuilles virtuels et facturation. |
| **Rating + Chat Service** | Module d'évaluation des utilisateurs et messagerie instantanée. |
| **Notification + Tracking Service** | Notifications en temps réel et suivi cartographique GPS. |
| **Matching Service (IA)** | Algorithme de scoring et prédiction des trajets compatibles. |

---

## Slide 5 : Architecture Globale Proposée

- **Architecture Microservices :** Découpage modulaire avec un service par fonctionnalité métier.
- **API Gateway (Spring Cloud Gateway) :** Point d'entrée unique sécurisé avec routage dynamique et filtrage.
- **Service Discovery (Eureka Server) :** Enregistrement et localisation dynamique des instances microservices.
- **Config Server (Spring Cloud Config) :** Centralisation et versionnement des configurations multi-environnements.
- **Database per Service :** Isolation des données (PostgreSQL pour User/Trip/Booking/Payment, MongoDB pour Chat/Rating, Redis pour le tracking).
- **Frontend Unique (Angular) :** Interface utilisateur SPA moderne et réactive consommant les API REST via la Gateway.

---

## Slide 6 : Technologies Choisies

- **Frontend :** Angular 17, HTML5, Vanilla CSS / SCSS, RxJS, Leaflet / Google Maps API.
- **Backend :** Java 17, Spring Boot 3, Spring Cloud Gateway, Eureka Server, Spring Data JPA.
- **IA & Intelligence :** Python 3.11, FastAPI, Scikit-learn, NetworkX (graphe d'itinéraires).
- **Bases de données :** PostgreSQL (données relationnelles), MongoDB (chat & logs), Redis (cache & tracking temps réel).
- **DevOps & CI/CD :** Docker, Docker Compose, Git, GitHub Actions.

---

## Slide 7 : Répartition des Tâches dans l'Équipe

| Membre | Rôle principal | Microservices / Modules sous responsabilité |
| :--- | :--- | :--- |
| **Baccari Ibtihel** | Lead Frontend & Matching IA | Interface Angular, UI/UX, Matching Service (IA), Intégration Gateway. |
| **Membre 2** | Lead Backend & DevOps | Infrastructure Spring Cloud (Eureka, Config, Gateway), User Service, CI/CD Docker. |
| **Membre 3** | Développeur Microservices | Trip Service, Booking Service, Schémas PostgreSQL & persistance. |
| **Membre 4** | Développeur Fullstack & QA | Payment Service, Rating + Chat Service, Notification & Tracking Service, Tests. |

---

## Slide 8 : Organisation Git & Outil de Gestion du Projet

### Organisation Git (GitFlow)
- `main` : Branche de production, code stable et déployable.
- `develop` : Branche d'intégration principale des nouvelles fonctionnalités.
- `feature/<nom-fonctionnalite>` : Branches isolées pour le développement des fonctionnalités.
- `fix/<nom-bug>` : Branches dédiées à la résolution des anomalies.

### Outil de Gestion de Projet
- **GitHub Projects / Trello** : Tableau Kanban pour le suivi des User Stories, backlog, tâches en cours et sprints.
- **Reunions d'équipe :** Stand-up hebdomadaires et revues de code systématiques (Pull Requests obligatoires avec au moins 1 approbation).

---

## Slide 9 : Planning Prévisionnel & Principaux Risques

### Planning Prévisionnel (Sprints)
- **Sprint 1 (Semaines 1-2) :** Conception de l'architecture, modèles de données, initialisation du dépôt Git et des serveurs Spring Cloud.
- **Sprint 2 (Semaines 3-4) :** Développement des microservices fondamentaux (User, Trip, Booking) et de l'interface Angular de base.
- **Sprint 3 (Semaines 5-6) :** Implémentation du moteur d'IA (Matching Service), du module de Payment et de Rating/Chat.
- **Sprint 4 (Semaines 7-8) :** Intégration globale, suivi GPS temps réel, tests d'endurance, documentation finale et déploiement Docker.

### Principaux Risques et Mitigations
1. **Temps de calcul de l'algorithme d'IA :**  
   *Mitigation :* Mise en cache des calculs d'itinéraires fréquents avec Redis.
2. **Complexité du suivi GPS en temps réel :**  
   *Mitigation :* Utilisation de WebSockets légers et throttling des mises à jour de position.
3. **Sécurité des données de paiement et identités :**  
   *Mitigation :* Tokenisation JWT, HTTPS strict et pas de stockage direct d'identifiants bancaires.
