# SmartRide – Eureka, API Gateway, Sécurité JWT (Lexik) – version corrigée

## Ce qui n'allait pas dans ton zip

| # | Problème | Correction |
|---|----------|-----------|
| 1 | `config/routes.yaml` ne contenait que la route proxy : **tes contrôleurs Notification/Tracking n'étaient plus chargés** (aucune route `/api/...`) | Route `controllers` rétablie avec le préfixe `/api` |
| 2 | Il restait du projet « JobBoard » : `GatewayController` (candidats/jobs), `KeycloakJwtAuthenticator`, realm `JobBoardKeycloack`, `CANDIDATE_SERVICE_URL`… | Supprimés |
| 3 | La « gateway » était **un contrôleur dans le service Notification** : une gateway est un service à part | Vraie Gateway Spring Cloud (`api-gateway/`) + serveur Eureka (`eureka-server/`) |
| 4 | `composer.json` sans `security-bundle`, `http-client`, ni Lexik ; `bundles.php` sans SecurityBundle → le conteneur ne démarrait pas | Dépendances et bundles ajoutés |
| 5 | Keycloak à remplacer par **LexikJWTAuthenticationBundle** | `security.yaml` + `lexik_jwt_authentication.yaml` (firewall `jwt: ~`) |
| 6 | Docker : `host.docker.internal`, IP en dur (`172.20.10.2`), `.:/app` écrasait `vendor/`, un seul conteneur pour tout | Un réseau Compose unique, noms de services (`mongo`, `eureka-server`…), `vendor` dans l'image |
| 7 | Eureka : enregistrement par script shell, app `NOTIFICATION-TRACKING` | Commande `app:eureka:register` (register + heartbeat + cancel), nom `NOTIFICATION-TRACKING-SERVICE` |
| 8 | CORS dans Symfony **et** dans la Gateway = en-têtes en double (le navigateur refuse) | CORS uniquement dans la Gateway |
| 9 | `bin/console` absent du zip | Ajouté |

## Architecture

```
Angular/Postman ──► api-gateway :8085 ──(lb://NOTIFICATION-TRACKING-SERVICE)──► notification-tracking :8000 ──► mongo
                         │                                                          │
                         └──────────────► eureka-server :8761 ◄──── registrar ─────┘
```

JWT : émis par le **User Service** (clé privée). Le service Notification ne fait que **vérifier**
avec la clé publique (`config/jwt/public.pem`). La Gateway transmet l'en-tête `Authorization` sans le toucher.
Rôles : le token doit contenir un claim `roles` (ex. `["ROLE_USER"]`) et `sub` pour l'identifiant.
`DELETE` exige `ROLE_ADMIN` (voir `access_control`).

## Lancer (tout dans Docker)

```bash
docker compose up -d --build
docker compose logs -f notification-tracking-registrar   # doit afficher "Enregistré : NOTIFICATION-TRACKING-SERVICE"
```
Dashboard Eureka : http://localhost:8761 (le service doit apparaître en UP).

## Tester

```bash
# 1. public, directement puis via la Gateway
curl http://localhost:8000/api/health
curl http://localhost:8085/api/health        # {"status":"UP","mongo":"UP"} + en-tête X-Served-By

# 2. sans token -> 401
curl -i http://localhost:8085/api/notifications

# 3. token de test (simule le User Service)
TOKEN=$(docker compose exec -T notification-tracking php bin/console app:jwt:dev-token --user=u45 --roles=ROLE_USER)
curl -H "Authorization: Bearer $TOKEN" http://localhost:8085/api/notifications        # 200

# 4. DELETE avec ROLE_USER -> 403 ; avec ROLE_ADMIN -> OK
ADMIN=$(docker compose exec -T notification-tracking php bin/console app:jwt:dev-token --user=a1 --roles=ROLE_ADMIN)
```
Postman : ajoute `Authorization: Bearer {{token}}` au niveau de la collection, `base_url = http://localhost:8085`.

## Partager la clé publique avec le User Service
```bash
docker compose exec notification-tracking cat config/jwt/public.pem
```
En production, le User Service garde la clé privée ; ici la commande `app:jwt:dev-token` est réservée au développement.

## Lancer sans Docker (local)
`composer install`, `php bin/console lexik:jwt:generate-keypair`, `php bin/console doctrine:mongodb:schema:create`,
Eureka et Gateway avec `mvn spring-boot:run` (dans leurs dossiers), puis `php -S 0.0.0.0:8000 -t public`
et `php bin/console app:eureka:register`. Le `.env` est déjà réglé sur `localhost`.
Ne mélange pas : soit tout en Docker, soit tout en local (sinon `localhost` ne désigne plus la même machine).

## 2e instance (load balancing)
Local : `php -S 0.0.0.0:8001 -t public` + `php bin/console app:eureka:register --port=8001`, puis appelle plusieurs fois
`/api/health` via la Gateway et regarde `X-Served-By`.

## Non vérifié (ni PHP, ni Composer, ni Maven dans mon environnement)
Rien n'a été exécuté : j'ai seulement validé la syntaxe des YAML/XML. Premier réflexe en cas d'erreur :
`docker compose logs <service>` et `docker compose exec notification-tracking php bin/console debug:router`.
