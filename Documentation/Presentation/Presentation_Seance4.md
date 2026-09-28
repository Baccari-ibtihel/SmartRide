# SmartRide — Présentation Synthétique du Projet (Séance 4)

---

## Slide 1 : Page de Titre
**Titre :** SmartRide  
**Sous-titre :** Plateforme de covoiturage intelligente avec matching par IA  
**Équipe :** 
- Mahdi naifer
- Hafedh Hammami
- Ghofran Hajiej
- Ibtihel Baccari
- Aymen Arfeoui
- Hamza Ben Hmida

---

## Slide 2 : Idée et Problématique du Projet

### Idée Générale
SmartRide est une plateforme de covoiturage qui connecte conducteurs et passagers effectuant des trajets similaires. Un moteur de matching intelligent (IA) analyse itinéraires, horaires et préférences pour proposer automatiquement les correspondances les plus pertinentes, plutôt qu'une simple recherche par filtres.

L'utilisateur réserve, paie et note son trajet directement sur la plateforme, avec un suivi en temps réel et une vérification d'identité pour instaurer la confiance.

### Problématique
1. **Recherche de trajet manuelle et peu optimisée :** Les utilisateurs comparent eux-mêmes horaires et itinéraires.
2. **Manque de confiance entre inconnus :** Pas de vérification fiable ni d'historique partagé.
3. **Trajets sous-optimaux :** Deux personnes faisant presque le même trajet ne se croisent jamais faute de bon matching.
4. **Coût et impact environnemental élevés :** Du transport individuel, faute d'alternative pratique.
5. **Absence de suivi centralisé :** (réservation, paiement, évaluation) au même endroit.

---

## Slide 3 : Principales Fonctionnalités

### Passager
- Recherche de trajet
- Matching intelligent (IA)
- Réservation & paiement
- Évaluation & historique

### Conducteur
- Publication de trajet
- Gestion des réservations
- Réception du paiement
- Évaluation du passager

### Transverse
- Chat conducteur $\leftrightarrow$ passager
- Notifications
- Vérification d'identité
- Suivi en temps réel

---

## Slide 4 : Architecture Globale Proposée

### Principes
- **Architecture microservices** — un service par fonctionnalité métier
- **API Gateway :** point d'entrée unique, routage vers les services
- **Service Discovery :** localisation dynamique des services
- **Config Server :** configuration centralisée
- **Database per Service :** chaque microservice a sa propre base
- **Frontend unique (Angular)** consommant les API via le Gateway

---

## Slide 5 : Microservices et Responsabilités

- **User Service :** Authentification, profils, vérification d'identité
- **Trip Service :** Publication et recherche de trajet
- **Booking Service :** Réservation, confirmation
- **Payment Service :** Paiement en ligne
- **Rating + Chat Service :** Évaluations, messagerie
- **Notification + Tracking Service :** Notifications, suivi en temps réel
- **Matching Service (IA) :** Scoring et suggestions de trajets compatibles

---

## Slide 6 : Technologies Choisies

| Microservice / Module | Technologie | Base de données |
| :--- | :--- | :--- |
| **User Service** | Spring Boot (Java) | MySQL |
| **Trip Service** | Go | PostgreSQL |
| **Booking Service** | Node.js + Express | PostgreSQL |
| **Payment Service** | Python + FastAPI | MongoDB |
| **Rating/Chat Service** | NestJS (TypeScript) | MongoDB |
| **Notification/Tracking Service** | Symfony (PHP) | PostgreSQL |
| **Matching Service (IA)** | Python + FastAPI | PostgreSQL |

**Socle commun :** Frontend : Angular (unique) | Conteneurisation : Docker | Orchestration : Kubernetes | CI/CD : Jenkins

---

## Slide 7 : Répartition des Tâches

1. **Ibtihel Baccari** — User Service
2. **Aymen Arfeoui** — Trip Service
3. **Ghofran Hajjej** — Booking Service
4. **Mahdi naifer** — Payment Service
5. **Hamza Ben Hmida** — Rating + Chat Service
6. **Hafedh Hammami** — Notification + Tracking Service

*Matching Service (IA) : tâche transverse en binôme, en parallèle du microservice principal de chacun.*

---

## Slide 8 : Organisation Git et Gestion de Projet

### Git
- Un repository par microservice
- Branches : `main` (stable) / `develop` (intégration) / `feature/non-fonctionnalité`
- Pull Requests avec revue de code avant fusion
- Documentation API commune (Swagger/OpenAPI)

### Gestion de projet
- **Outil :** GitHub Projects
- Backlog découpé en sprints
- Suivi des tâches par membre
- Stand-up réguliers pour synchroniser l'avancement

---

## Slide 9 : Planning Prévisionnel et Principaux Risques

### Planning (Sprints)
- **S1-2 :** Conception (UML, technos, setup repos)
- **S3-5 :** Développement des microservices
- **S6-7 :** Matching Service (IA) + API Gateway
- **S8 :** Intégration globale, tests inter-services
- **S9 :** Conteneurisation (Docker/Kubernetes)
- **S10 :** Finalisation, soutenance

### Principaux Risques et Mitigation
- **Diversité technologique :** Courbe d'apprentissage différente selon la techno $\rightarrow$ retard possible
- **Intégration inter-services :** API incompatibles ou mal documentées entre microservices
- **Dépendances entre services :** Un service en retard bloque l'intégration globale
- **Coordination d'équipe :** 6 technologies différentes à synchroniser

**Mitigation :** Documentation API commune, stand-ups réguliers, tests d'intégration continus, marge de temps dédiée à l'intégration.

---

## Slide 10 : Conclusion

1. **Une plateforme de covoiturage complète :** De la recherche de trajet au paiement, au chat et au suivi en temps réel, avec un matching intelligent par IA.
2. **Une architecture microservices solide :** Sept services indépendants derrière une API Gateway, chacun avec sa propre base de données.
3. **Une démarche DevOps de bout en bout :** Docker, Kubernetes et Jenkins pour un déploiement reproductible et un travail d'équipe en parallèle.
