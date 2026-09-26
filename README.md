# SmartRide — Plateforme de Covoiturage Intelligente avec Matching par IA

![SmartRide Banner](https://img.shields.io/badge/SmartRide-Séance%204-1e2454?style=for-the-badge&logo=angular&logoColor=white)
![Microservices Polyglottes](https://img.shields.io/badge/Architecture-Microservices%20Polyglottes-0d5c80?style=for-the-badge&logo=spring&logoColor=white)
![IA Matching](https://img.shields.io/badge/IA%20Matching-FastAPI%20%2B%20Python-0e85a3?style=for-the-badge&logo=python&logoColor=white)

---

## 📌 Présentation du Projet

**SmartRide** est une plateforme moderne de covoiturage conçue pour connecter intelligemment conducteurs et passagers réalisant des itinéraires complémentaires. Contrairement aux plateformes classiques reposant sur une recherche stricte par filtres, SmartRide intègre un **moteur de Matching basé sur l'IA** qui analyse en temps réel les détours, horaires et préférences pour maximiser les correspondances pertinentes.

---

## 📁 Structure du Dépôt

Conformément aux exigences du projet, le dépôt est structuré comme suit :

```
SmartRide/
├── Backend/                            # Regroupement des microservices polyglottes & infrastructure
│   ├── api-gateway/                    # Spring Cloud Gateway (Port 8080)
│   ├── discovery-server/               # Eureka Service Discovery (Port 8761)
│   ├── config-server/                  # Spring Cloud Config Server (Port 8888)
│   ├── user-service/                   # Spring Boot (Java) - Auth JWT & Profils (Port 8081)
│   ├── trip-service/                   # Go - Trajets haute performance (Port 8082)
│   ├── booking-service/                # Node.js + Express - Réservations (Port 8083)
│   ├── payment-service/                # Python + FastAPI - Paiement & Facturation (Port 8084)
│   ├── rating-chat-service/            # NestJS (TypeScript) - Messagerie & Notes (Port 8085)
│   ├── notification-tracking-service/   # Symfony (PHP) - Tracking GPS & Notifications (Port 8086)
│   ├── matching-ia-service/            # Python + FastAPI - Moteur de Matching IA (Port 8087)
│   ├── docker-compose.yml              # Orchestration complète des containers & bases
│   └── README.md
├── Frontend/                           # Application cliente Angular 17+
│   ├── src/
│   ├── angular.json
│   └── package.json
├── Documentation/                      # Documentation complète & Séance 4
│   ├── Presentation/
│   │   ├── Presentation_Seance4.md     # Support Markdown complet de la présentation
│   │   └── Presentation_Seance4.html   # Présentation interactive web (Visionneuse de slides)
│   └── Diagrams/
│       ├── Architecture_Globale.mermaid
│       ├── Diagramme_Cas_Utilisation.mermaid
│       ├── Diagramme_Sequence_Reservation.mermaid
│       └── Diagramme_Classes.mermaid
└── README.md                           # Documentation générale & Fiche de rendu Blackboard
```

---

## 🛠️ Architecture Technique & Microservices Polyglottes

SmartRide adopte une **architecture Microservices Polyglotte avec Database Per Service** :

| Service | Technologie | Rôle & Responsabilités |
| :--- | :--- | :--- |
| **User Service** | **Spring Boot (Java)** | Authentification, profils, vérification d'identité |
| **Trip Service** | **Go** | Publication et recherche de trajet |
| **Booking Service** | **Node.js + Express** | Réservation, confirmation |
| **Payment Service** | **Python + FastAPI** | Paiement en ligne |
| **Rating/Chat Service** | **NestJS (TypeScript)** | Évaluations, messagerie |
| **Notification/Tracking Service** | **Symfony (PHP)** | Notifications, suivi en temps réel |
| **Matching Service (IA)** | **Python + FastAPI** | Scoring et suggestions de trajets compatibles |

---

## 🌿 Organisation Git & Workflow

Le développement s'appuie sur le workflow Git :
- `main` : Branche principale de production stable.
- Branches de fonctionnalités isolées (`feature/*`).

**Compte GitHub Officiel :** [Baccari-ibtihel](https://github.com/Baccari-ibtihel)

---

## 📝 Fiche de Rendu pour Blackboard (Séance 4)

- **Lien du dépôt Git public :** [https://github.com/Baccari-ibtihel/SmartRide](https://github.com/Baccari-ibtihel/SmartRide)
- **Nom du projet :** `SmartRide — Plateforme de covoiturage intelligente avec matching par IA`
- **Liste des membres de l’équipe :**
  1. **Baccari Ibtihel** — *Chef d'équipe / Lead Frontend & Matching IA*
  2. **Membre 2** — *Lead Backend Microservices & Infrastructure Cloud*
  3. **Membre 3** — *Développeur Backend Microservices & Base de Données*
  4. **Membre 4** — *Développeur Fullstack & Documentation / Assurance Qualité*
- **Lien vers la présentation :** [https://github.com/Baccari-ibtihel/SmartRide/blob/main/Documentation/Presentation/Presentation_Seance4.md](https://github.com/Baccari-ibtihel/SmartRide/blob/main/Documentation/Presentation/Presentation_Seance4.md)
- **Lien vers le diagramme d’architecture globale :** [https://github.com/Baccari-ibtihel/SmartRide/blob/main/Documentation/Diagrams/Architecture_Globale.mermaid](https://github.com/Baccari-ibtihel/SmartRide/blob/main/Documentation/Diagrams/Architecture_Globale.mermaid)
