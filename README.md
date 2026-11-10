# SmartRide — Rating + Chat Service (Spring Boot + Eureka + MySQL/XAMPP)

Backend du microservice **Évaluations + Messagerie** de SmartRide, avec son **serveur Eureka** et une **API Gateway** pour tester l'intégration de bout en bout.

| Projet | Port | Rôle |
|---|---|---|
| `eureka-server` | 8761 | Annuaire des microservices (Service Discovery) |
| `api-gateway` | 8080 | Point d'entrée unique : route `lb://nom-du-service` via Eureka (REST + WebSocket) |
| `rating-chat-service` | 8085 | Évaluations passager ⇄ conducteur + chat temps réel (WebSocket/STOMP) |

Stack : **Java 17+, Spring Boot 4.0.8, Spring Cloud 2025.1.3** (Eureka, Gateway, LoadBalancer), Spring Data JPA, **MySQL de XAMPP**, WebSocket STOMP, Swagger.

> `eureka-server` et `api-gateway` sont de l'infrastructure **partagée par toute l'équipe**. Si un autre membre les héberge déjà, gardez seulement `rating-chat-service` et pointez-le vers leur Eureka.

---

## 1. Architecture

```
          Angular (4200)
               │  HTTP + WebSocket
               ▼
        ┌──────────────┐   « où est rating-chat-service ? »   ┌───────────────┐
        │ API Gateway  │ ───────────────────────────────────► │ Eureka Server │
        │    :8080     │ ◄──────────── 192.168.x.x:8085 ───── │     :8761     │
        └──────┬───────┘                                      └───────▲───────┘
               │ lb://rating-chat-service                             │ s'enregistre
               ▼                                                      │ (heartbeat 30 s)
        ┌──────────────────────┐   http://booking-service/…   ┌───────┴────────┐
        │ Rating-Chat Service  │ ───────────(optionnel)─────► │ Booking Service│
        │        :8085         │                              └────────────────┘
        └──────────┬───────────┘
                   ▼
        MySQL XAMPP :3306  →  base « smartride_rating_chat »
```

## 2. Contenu du dossier

```
smartride-backend/
├── pom.xml                         # agrégateur : ouvre les 3 projets d'un coup dans IntelliJ
├── docker-compose.yml              # MySQL + Eureka + Rating-Chat Service + Gateway
├── eureka-server/                  # @EnableEurekaServer + Dockerfile
├── api-gateway/                    # routes dans application.yml + Dockerfile
├── rating-chat-service/            # + Dockerfile
│   └── src/main/java/com/smartride/ratingchat/
│       ├── controllers/            # RatingController, ChatController, ChatWebSocketController
│       ├── services/               # RatingService, ChatService, BookingVerifier
│       ├── repositories/           # RatingRepository, ConversationRepository, ChatMessageRepository
│       ├── entities/               # Rating, RaterRole, Conversation, ChatMessage
│       ├── dto/                    # objets JSON d'entrée/sortie (requêtes, réponses, pagination)
│       ├── clients/                # BookingClient : appel du Booking Service VIA EUREKA
│       ├── config/                 # WebSocketConfig, OpenApiConfig, BookingVerificationProperties
│       ├── websocket/              # sécurité STOMP, noms des canaux
│       ├── events/                 # événements + diffusion temps réel après commit
│       ├── exceptions/             # exceptions métier + GlobalExceptionHandler
│       └── utils/                  # Timestamps, UserHeaders (X-User-Id)
│   └── src/main/resources/
│       ├── application.yml         # MySQL XAMPP + Eureka
│       └── static/chat-test.html   # page pour tester le chat sans frontend
├── postman/SmartRide-Rating-Chat.postman_collection.json
└── exemples/booking-service-node/  # exemple de Booking Service Node.js enregistré dans Eureka
```

Le code est organisé **par type de classe** : un package par rôle (controllers, services, repositories, entities, dto…). Chaque projet a son propre `pom.xml`, son wrapper Maven (`mvnw`) et son `Dockerfile` : vous pouvez donc les séparer en un dépôt Git par microservice.

## 3. Prérequis

- **JDK 17 ou plus** (`java -version`). Le JDK 21 fonctionne aussi.
- **XAMPP** : démarrez **MySQL** dans le panneau de contrôle (port 3306, utilisateur `root`, sans mot de passe).
  La base `smartride_rating_chat` et ses tables sont **créées automatiquement** au premier démarrage.
- IntelliJ IDEA (recommandé). Maven n'a pas besoin d'être installé : le wrapper `mvnw` le télécharge.

## 4. Démarrage — respectez l'ordre

| # | Quoi | Windows | Linux / macOS |
|---|---|---|---|
| 1 | XAMPP → **Start MySQL** | | |
| 2 | Eureka | `cd eureka-server` puis `mvnw.cmd spring-boot:run` | `./mvnw spring-boot:run` |
| 3 | Rating-Chat Service | `cd rating-chat-service` puis `mvnw.cmd spring-boot:run` | idem |
| 4 | Gateway | `cd api-gateway` puis `mvnw.cmd spring-boot:run` | idem |

Dans IntelliJ : **File → Open** sur le dossier `smartride-backend`, puis lancez `EurekaServerApplication`, `RatingChatServiceApplication` et `ApiGatewayApplication`.

### Variante : tout lancer avec Docker

Prérequis : **Docker Desktop** démarré. Inutile d'avoir XAMPP ou Java : MySQL et la compilation tournent dans les conteneurs.

```bash
cd smartride-backend
docker compose up --build      # 1er lancement : quelques minutes (téléchargement de Maven et des dépendances)
docker compose down            # arrêt (ajoutez -v pour effacer aussi la base)
```

| Conteneur | Port sur votre machine | Image |
|---|---|---|
| `smartride-mysql` | 3307 (pas de conflit avec XAMPP sur 3306) | `mysql:8.4` |
| `smartride-eureka` | 8761 | `smartride/eureka-server:1.0.0` |
| `smartride-rating-chat` | 8085 | `smartride/rating-chat-service:1.0.0` |
| `smartride-gateway` | 8080 | `smartride/api-gateway:1.0.0` |

Chaque `Dockerfile` construit le jar avec Maven, puis ne garde que Java (JRE 17) dans l'image finale. Dans Docker, le service lit l'adresse de MySQL et d'Eureka dans des variables d'environnement (`DB_HOST`, `DB_USER`, `DB_PASSWORD`, `EUREKA_URL`) fournies par `docker-compose.yml`. Sans Docker, elles prennent leurs valeurs par défaut (XAMPP et `localhost`).

**Vérification :** ouvrez http://localhost:8761. `RATING-CHAT-SERVICE` et `API-GATEWAY` doivent apparaître avec le statut **UP**. Ensuite, http://localhost:8080/api/ratings/users/1/summary doit répondre en JSON.

| URL | Description |
|---|---|
| http://localhost:8761 | Tableau de bord Eureka |
| http://localhost:8085/swagger-ui.html | Swagger de l'API (accès direct au service) |
| http://localhost:8085/chat-test.html | Page de test du chat temps réel |
| http://localhost:8080/actuator/gateway/routes | Routes actives de la Gateway |
| http://localhost/phpmyadmin | Voir les tables (XAMPP) |

## 5. Utilisateur connecté : l'en-tête `X-User-Id`

Il n'y a pas encore d'authentification : le client envoie l'id de l'utilisateur connecté dans l'en-tête **`X-User-Id`** (ex. `X-User-Id: 1`).
Plus tard, la Gateway validera le JWT du User Service et remplira elle-même cet en-tête. Le code du service ne changera pas.

Les erreurs sont toujours au format standard *Problem Details* :

```json
{ "status": 400, "title": "Bad Request", "detail": "Donnees invalides",
  "errors": { "score": "La note maximale est 5" }, "timestamp": "2026-10-22T23:06:41" }
```

## 6. API REST (via la Gateway : `http://localhost:8080`)

### Évaluations — `/api/ratings`

| Méthode | URL | X-User-Id | Description |
|---|---|---|---|
| POST | `/api/ratings` | ✔ | Noter l'autre participant d'une réservation → **201** |
| GET | `/api/ratings/{id}` | | Détail |
| PUT | `/api/ratings/{id}` | ✔ auteur | Modifier sa note `{ "score": 4, "comment": "..." }` |
| DELETE | `/api/ratings/{id}` | ✔ auteur | Supprimer sa note → **204** |
| GET | `/api/ratings/users/{userId}/summary` | | Moyenne, nombre d'avis, répartition 1–5★, moyenne *en tant que conducteur* / *passager* |
| GET | `/api/ratings/users/{userId}/received?page=0&size=10` | | Avis reçus (paginés) |
| GET | `/api/ratings/users/{userId}/given` | | Avis donnés |
| GET | `/api/ratings/trips/{tripId}` | | Avis d'un trajet |
| GET | `/api/ratings/bookings/{bookingId}` | | Avis d'une réservation (pour savoir si on a déjà noté) |

Corps de `POST /api/ratings` :

```json
{ "bookingId": 10, "tripId": 100, "ratedUserId": 2, "raterRole": "PASSENGER", "score": 5, "comment": "Très ponctuel" }
```

Règles métier : note de 1 à 5, interdiction de se noter soi-même, **une seule note par réservation et par auteur** (sinon **409**), seul l'auteur peut modifier ou supprimer sa note (**403**).

### Messagerie — `/api/chat`

| Méthode | URL | Description |
|---|---|---|
| POST | `/api/chat/conversations` | Ouvre (ou récupère) la conversation `{ "tripId", "passengerId", "driverId" }` |
| GET | `/api/chat/conversations` | Mes conversations, la plus récente d'abord, avec `unreadCount` |
| GET | `/api/chat/conversations/{id}` | Détail |
| GET | `/api/chat/conversations/{id}/messages?page=0&size=20` | Historique, du plus récent au plus ancien |
| POST | `/api/chat/conversations/{id}/messages` | Envoie `{ "content": "..." }`, également diffusé en WebSocket |
| PATCH | `/api/chat/conversations/{id}/read` | Marque comme lus les messages reçus |
| GET | `/api/chat/unread-count` | Badge : total des messages non lus |

Toutes ces routes exigent `X-User-Id`. Seuls le passager et le conducteur de la conversation y ont accès (sinon **403**).

## 7. Chat temps réel (WebSocket + STOMP)

- URL : **`ws://localhost:8080/ws/chat`** (via la Gateway) ou `ws://localhost:8085/ws/chat` (accès direct).
- À la connexion, envoyez l'en-tête STOMP **`userId`**. Sans lui, le serveur répond par une trame `ERROR`.

| Le client **envoie** sur | Corps JSON |
|---|---|
| `/app/chat.send` | `{ "conversationId": 1, "content": "Bonjour" }` |
| `/app/chat.typing` | `{ "conversationId": 1, "typing": true }` |
| `/app/chat.read` | `{ "conversationId": 1 }` |

| Le client **s'abonne** à | Il reçoit |
|---|---|
| `/topic/conversations/{id}` | chaque nouveau message de la conversation |
| `/topic/conversations/{id}/typing` | « X est en train d'écrire » |
| `/topic/conversations/{id}/read` | accusés de lecture |
| `/user/queue/messages` | tous les messages qui me sont adressés (badge, liste des conversations) |
| `/user/queue/errors` | les erreurs de mes envois (message vide, non participant…) |

On ne peut s'abonner qu'à **ses propres** conversations. Les messages d'un même client sont traités **dans l'ordre d'envoi**.

Exemple Angular (`npm i @stomp/stompjs`) :

```ts
import { Client } from '@stomp/stompjs';

const client = new Client({
  brokerURL: 'ws://localhost:8080/ws/chat',
  connectHeaders: { userId: String(currentUserId) },
  reconnectDelay: 5000,
});

client.onConnect = () => {
  client.subscribe(`/topic/conversations/${conversationId}`, frame => {
    const message = JSON.parse(frame.body);   // { id, conversationId, senderId, content, sentAt, readAt }
    this.messages.push(message);
  });
  client.subscribe('/user/queue/errors', frame => console.error(JSON.parse(frame.body).message));
};
client.activate();

// envoyer
client.publish({ destination: '/app/chat.send', body: JSON.stringify({ conversationId, content: 'Bonjour !' }) });
```

**Tester sans frontend :** ouvrez http://localhost:8085/chat-test.html dans **deux onglets**. Prenez `userId` 1 dans le premier (passager) et 2 dans le second (conducteur). Cliquez sur *Se connecter* puis sur *Ouvrir la conversation*, et discutez.

## 8. Base de données (MySQL XAMPP)

Les tables sont générées par Hibernate (`ddl-auto: update`) :

| Table | Contenu | Contraintes |
|---|---|---|
| `ratings` | notes 1–5 + commentaire | unique (`booking_id`, `rater_id`) |
| `conversations` | 1 par (trajet, passager, conducteur) | unique (`trip_id`, `passenger_id`, `driver_id`) |
| `chat_messages` | messages, `read_at` = null si non lu | clé étrangère → `conversations` |

Les `userId`, `tripId` et `bookingId` sont les identifiants des autres microservices : on ne fait pas de jointure entre bases (*database per service*).
Mot de passe MySQL différent ? Modifiez `spring.datasource.password` dans `rating-chat-service/src/main/resources/application.yml`.

## 9. Intégration Eureka

**Enregistrement.** Le service s'inscrit sous le nom `spring.application.name` (`rating-chat-service`) auprès de `http://localhost:8761/eureka/`. La Gateway le retrouve avec `uri: lb://rating-chat-service` (et `lb:ws://` pour le WebSocket). Aucune adresse IP n'est écrite en dur.

**Appel d'un autre microservice via Eureka** (`clients/BookingClient.java`, règles dans `services/BookingVerifier.java`). Avant d'accepter une note, le service peut vérifier la réservation avec `GET http://booking-service/api/bookings/{id}`. Le `LoadBalancerInterceptor` de Spring Cloud remplace `booking-service` par l'adresse réelle trouvée dans Eureka. Contrôles :
réservation `COMPLETED`, bon trajet, l'auteur et la personne notée sont bien le passager et le conducteur. Si le Booking Service est absent : **503**.

C'est **désactivé par défaut**. Quand le Booking Service est prêt, mettez dans `application.yml` :

```yaml
smartride:
  booking-verification:
    enabled: true
```

Contrat attendu du Booking Service (à valider avec l'équipe) : `{ "id": 10, "tripId": 100, "passengerId": 1, "driverId": 2, "status": "COMPLETED" }`.

### Pour les services non-Java (Go, Node, Python, PHP)

Ils doivent aussi s'enregistrer dans Eureka. **Point crucial : renseigner `vipAddress` avec le nom du service en minuscules.** Spring cherche les services par `vipAddress`. Sans lui, le service apparaît dans le tableau de bord mais reste introuvable (*No servers available*).

```http
POST http://localhost:8761/eureka/apps/BOOKING-SERVICE
Content-Type: application/json

{ "instance": {
    "instanceId": "booking-service:8083", "app": "BOOKING-SERVICE",
    "vipAddress": "booking-service", "secureVipAddress": "booking-service",
    "hostName": "127.0.0.1", "ipAddr": "127.0.0.1", "status": "UP",
    "port": { "$": 8083, "@enabled": "true" },
    "dataCenterInfo": { "@class": "com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo", "name": "MyOwn" } } }
```

Ensuite, envoyez un heartbeat toutes les 30 s : `PUT http://localhost:8761/eureka/apps/BOOKING-SERVICE/booking-service:8083`.
Bibliothèques existantes : **Node/NestJS** `eureka-js-client`, **Python/FastAPI** `py-eureka-client`. En Go et en PHP, ces deux appels HTTP suffisent.

Ports proposés pour l'équipe : user 8081 · trip 8082 · booking 8083 · payment 8084 · **rating-chat 8085** · notification 8086 · matching 8087.

## 10. Tests

```bash
cd rating-chat-service
mvnw.cmd test        # Windows   (./mvnw test sous Linux/macOS)
```

Il y a 12 tests : les services (Mockito) et l'API complète sur une base H2 en mémoire. **XAMPP n'a pas besoin d'être lancé.**

**Postman :** importez `postman/SmartRide-Rating-Chat.postman_collection.json`. Elle contient **34 requêtes et 76 vérifications automatiques**, réparties dans 3 dossiers : `0 - Infrastructure`, `1 - Ratings` et `2 - Chat`. Exécutez-les dans l'ordre, ou faites un clic droit sur la collection → **Run collection** : résultat attendu, 0 échec. Les id de la note et de la conversation sont mémorisés automatiquement entre les requêtes, et la collection peut être relancée autant de fois que nécessaire.

## 11. Problèmes fréquents

| Symptôme | Explication / solution |
|---|---|
| `WARN HHH000511: The 5.5.5 version for MySQLDialect is no longer supported` | **Normal avec XAMPP** : MariaDB s'annonce « 5.5.5 » au driver MySQL. Sans conséquence, le code en tient compte. |
| **503** via la Gateway juste après un (re)démarrage | Eureka met quelques secondes à propager la nouvelle adresse. Attendez ~10 s et réessayez. |
| `Communications link failure` au démarrage | MySQL n'est pas démarré dans XAMPP. |
| `Port 8085 was already in use` | Une autre instance tourne déjà : arrêtez-la, ou changez `server.port`. |
| Le service n'apparaît pas dans Eureka | Démarrez `eureka-server` **avant** les autres et vérifiez `eureka.client.service-url.defaultZone`. |
| Un **400** « Required header 'X-User-Id' » | Ajoutez l'en-tête `X-User-Id` à la requête. |

## 12. Prochaines étapes

- **JWT** : un filtre dans la Gateway valide le token et injecte `X-User-Id`. Pour le WebSocket, envoyez le token dans l'en-tête STOMP de connexion et validez-le dans `StompAuthChannelInterceptor`.
- **RabbitMQ** : publier `rating.created` / `message.sent` pour le Notification Service. Le chat peut aussi passer par RabbitMQ (`enableStompBrokerRelay`) quand il y aura plusieurs instances.
- **Kubernetes** : déployer les images Docker (déjà fournies) dans le cluster, avec un manifeste par service.
