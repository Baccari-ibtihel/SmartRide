# SmartRide — Plateforme de Covoiturage Intelligente avec Matching par IA

![SmartRide Banner](https://img.shields.io/badge/SmartRide-Séance%204-1e2454?style=for-the-badge&logo=angular&logoColor=white)
![Microservices Architecture](https://img.shields.io/badge/Architecture-Microservices-0d5c80?style=for-the-badge&logo=spring&logoColor=white)
![AI Engine](https://img.shields.io/badge/IA%20Matching-FastAPI%20%2B%20Python-0e85a3?style=for-the-badge&logo=python&logoColor=white)

---

## 📌 Présentation du Projet

**SmartRide** est une plateforme moderne de covoiturage conçue pour connecter intelligemment conducteurs et passagers réalisant des itinéraires complémentaires. Contrairement aux plateformes classiques reposant sur une recherche stricte par filtres, SmartRide intègre un **moteur de Matching basé sur l'IA** qui analyse en temps réel les détours, horaires et préférences pour maximiser les correspondances pertinentes.

---

## 📁 Structure du Dépôt

Conformément aux exigences du projet, le dépôt est structuré comme suit :

```
SmartRide/
├── Backend/                            # Regroupement des microservices & infrastructure
│   ├── api-gateway/                    # Spring Cloud Gateway (Port 8080)
│   ├── discovery-server/               # Eureka Service Discovery (Port 8761)
│   ├── config-server/                  # Spring Cloud Config Server (Port 8888)
│   ├── user-service/                   # Authentification JWT, Profils, Identités (Port 8081)
│   ├── trip-service/                   # Publication & Recherche de trajets (Port 8082)
│   ├── booking-service/                # Gestion des réservations (Port 8083)
│   ├── payment-service/                # Gestion des paiements en ligne (Port 8084)
│   ├── rating-chat-service/            # Évaluations & Messagerie instantanée (Port 8085)
│   ├── notification-tracking-service/   # Tracking GPS temps réel & Notifications (Port 8086)
│   ├── matching-ia-service/            # Moteur d'IA & Scoring de correspondances (Port 8087)
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
│       └── Diagramme_Sequence_Reservation.mermaid
└── README.md                           # Documentation générale & Fiche de rendu Blackboard
```

---

## 🛠️ Architecture Technique & Microservices

SmartRide adopte une **architecture Microservices réparties avec Database Per Service** :

1. **Frontend (Angular SPA) :** Interface utilisateur fluide, responsive et dynamique.
2. **API Gateway (Spring Cloud Gateway) :** Point d'entrée unique sécurisé par JWT et routage dynamique.
3. **Service Discovery (Eureka) & Config Server :** Gestion dynamique du réseau et des configurations.
4. **Bases de Données Découplées :** PostgreSQL (données relationnelles), MongoDB (chat & notes), Redis (cache & GPS).
5. **Moteur d'IA (FastAPI / Python) :** Calcul de correspondance géographique et temporelle avec scoring.

---

## 🌿 Organisation Git & Workflow

Le développement s'appuie sur le workflow **GitFlow** :
- `main` : Branche principale stable et de production.
- `develop` : Branche d'intégration globale.
- `feature/*` : Branches de fonctionnalités isolées.
- `fix/*` : Branches de correctifs d'anomalies.

**Compte GitHub Officiel :** [Baccari-ibtihel](https://github.com/Baccari-ibtihel)

---

## 📝 Fiche de Rendu pour Blackboard (Séance 4)

> [!IMPORTANT]
> **Veuillez copier-coller les informations ci-dessous directement dans le formulaire de rendu Blackboard :**

- **Lien du dépôt Git public :** [https://github.com/Baccari-ibtihel/SmartRide](https://github.com/Baccari-ibtihel/SmartRide)
- **Nom du projet :** `SmartRide — Plateforme de covoiturage intelligente avec matching par IA`
- **Liste des membres de l’équipe :**
  1. **Baccari Ibtihel** — *Chef d'équipe / Lead Frontend & Matching IA*
  2. **Membre 2** — *Lead Backend Microservices & Infrastructure Cloud*
  3. **Membre 3** — *Développeur Backend Microservices & Base de Données*
  4. **Membre 4** — *Développeur Fullstack & Documentation / Assurance Qualité*
- **Lien vers la présentation :** [https://github.com/Baccari-ibtihel/SmartRide/blob/main/Documentation/Presentation/Presentation_Seance4.md](https://github.com/Baccari-ibtihel/SmartRide/blob/main/Documentation/Presentation/Presentation_Seance4.md)
- **Lien vers le diagramme d’architecture globale :** [https://github.com/Baccari-ibtihel/SmartRide/blob/main/Documentation/Diagrams/Architecture_Globale.mermaid](https://github.com/Baccari-ibtihel/SmartRide/blob/main/Documentation/Diagrams/Architecture_Globale.mermaid)
