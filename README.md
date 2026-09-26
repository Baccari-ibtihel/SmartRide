# SmartRide — Plateforme de Covoiturage Intelligente avec Matching par IA

![SmartRide Banner](https://img.shields.io/badge/SmartRide-Plateforme-1e2454?style=for-the-badge&logo=angular&logoColor=white)
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
├── Backend/
│   ├── api-gateway/
│   ├── discovery-server/
│   ├── config-server/
│   ├── user-service/
│   ├── trip-service/
│   ├── booking-service/
│   ├── payment-service/
│   ├── rating-chat-service/
│   ├── notification-tracking-service/
│   ├── matching-ia-service/
│   └── docker-compose.yml
├── Frontend/
│   ├── src/
│   ├── angular.json
│   └── package.json
├── Documentation/
│   ├── Presentation/
│   │   ├── Presentation_Seance4.md
│   │   └── Presentation_Seance4.html
│   └── Diagrams/
│       ├── Architecture_Globale.mermaid
│       ├── Diagramme_Cas_Utilisation.mermaid
│       ├── Diagramme_Sequence_Reservation.mermaid
│       └── Diagramme_Classes.mermaid
└── README.md
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
