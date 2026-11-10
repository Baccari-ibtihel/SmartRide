# SmartRide – Notification + Tracking Service

Microservice Symfony 7.4 + MongoDB (Doctrine ODM). Base dédiée (Database per Service).

## Architecture (séparée par domaine : tracking / notification)

```
src/
 ├─ Controller/
 │   ├─ TrackingController/       TrackingController      couche HTTP (routes /api/tracking)
 │   └─ NotificationController/   NotificationController  couche HTTP (routes /api/notifications)
 ├─ Service/                      logique métier
 │   ├─ TrackingService/          TrackingService, EtaCalculator
 │   └─ NotificationService/      NotificationService
 ├─ Document/                     collections MongoDB (Doctrine ODM)
 │   ├─ Tracking/                 Location, TrackingSession
 │   └─ Notification/             Notification
 ├─ Repository/                   requêtes MongoDB
 │   ├─ Tracking/                 LocationRepository, TrackingSessionRepository
 │   └─ Notification/             NotificationRepository
 ├─ Dto/                          données d'entrée validées
 │   ├─ Tracking/                 LocationInput, TrackingSessionInput, TrackingSessionUpdate
 │   └─ Notification/             NotificationInput, NotificationUpdate
 ├─ Enum/
 │   ├─ Tracking/                 TrackingStatus
 │   └─ Notification/             NotificationType
 └─ Kernel.php
```

Flux d'une requête : `Controller → (DTO validé) → Service → Repository / DocumentManager → MongoDB`.
Les contrôleurs ne contiennent plus de logique métier : tout est dans les services.

**EtaCalculator** : si une session a une destination (`destinationLatitude` / `destinationLongitude`
à la création ou en PATCH), l'ETA est recalculée à chaque nouvelle position (distance de Haversine
÷ vitesse du conducteur, 50 km/h par défaut). Sans destination, l'ETA reste celle définie à la main.

## Démarrage (le plus simple : Docker uniquement)

Seul **Docker Desktop** est nécessaire (pas de PHP, Composer ni extension à installer).

```bash
docker compose up --build
```

Au premier lancement, Docker installe PHP + l'extension mongodb, lance `composer install`,
crée les collections/index, puis démarre l'API sur http://localhost:8000.
Arrêt : `Ctrl+C` puis `docker compose down`.

## API

### Notifications – `/api/notifications`
| Méthode | Route | Description |
|---|---|---|
| POST | `/api/notifications` | Créer |
| GET | `/api/notifications?userId=&read=&type=&page=&limit=` | Lister / filtrer |
| GET | `/api/notifications/unread-count?userId=` | Nombre de non lues |
| PATCH | `/api/notifications/read-all?userId=` | Tout marquer comme lu |
| GET | `/api/notifications/{id}` | Détail |
| PATCH | `/api/notifications/{id}` | Modifier (title, message, data, channels, read) |
| DELETE | `/api/notifications/{id}` | Supprimer |

### Tracking – `/api/tracking`
| Méthode | Route | Description |
|---|---|---|
| POST | `/api/tracking` | Créer la session d'un trajet |
| GET | `/api/tracking?driverId=&status=` | Lister |
| GET | `/api/tracking/{tripId}` | Détail |
| PATCH | `/api/tracking/{tripId}` | Changer statut / ETA |
| DELETE | `/api/tracking/{tripId}` | Supprimer session + positions |
| POST | `/api/tracking/{tripId}/locations` | Envoyer une position (statut STARTED requis) |
| GET | `/api/tracking/{tripId}/locations` | Historique du parcours |
| GET | `/api/tracking/{tripId}/locations/latest` | Dernière position |
| DELETE | `/api/tracking/{tripId}/locations/{locationId}` | Supprimer une position |

## Exemples curl

```bash
curl -X POST localhost:8000/api/notifications -H 'Content-Type: application/json' -d '{
  "userId":"u78","type":"BOOKING_CONFIRMED","title":"Réservation confirmée",
  "message":"Votre trajet Tunis → Sousse est confirmé","data":{"bookingId":"b9","tripId":"t123"},
  "channels":["in_app","email"]}'

curl -X POST localhost:8000/api/tracking -H 'Content-Type: application/json' \
  -d '{"tripId":"t123","driverId":"u45"}'
curl -X PATCH localhost:8000/api/tracking/t123 -H 'Content-Type: application/json' -d '{"status":"STARTED"}'
curl -X POST localhost:8000/api/tracking/t123/locations -H 'Content-Type: application/json' \
  -d '{"latitude":36.80,"longitude":10.18,"speed":42,"heading":90}'
curl localhost:8000/api/tracking/t123/locations/latest
```
