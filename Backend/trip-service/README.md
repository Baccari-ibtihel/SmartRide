# SmartRide Trip Service (Go + PostgreSQL)

Trip publishing and search for SmartRide. Drivers publish trips, passengers
search open trips, and booking-service reserves/releases seats atomically.
No auth here: the API gateway / user-service handles identity; `driver_id`
is simply stored as given.

## Stack

- Go 1.22+, standard `net/http` with method+path patterns
- PostgreSQL 16 via `pgx/v5` (pgxpool); migrations run automatically at startup
- Configuration via environment variables only (see `.env.example`)
- Listens on port `8082`

## Run locally

Start a Postgres 16 (any way you like), then the service from this folder:

```bash
docker run -d --name trip-db -e POSTGRES_DB=trip_db -e POSTGRES_USER=trip \
  -e POSTGRES_PASSWORD=trip -p 5432:5432 postgres:16-alpine
go run ./cmd/server                       # or: docker build -t trip-service .
curl http://localhost:8082/health         # {"status":"UP"}
```

Without Docker: start a Postgres named in `.env.example`, then
`go run ./cmd/server` from this folder.

## Endpoints

| Method | Path | Description |
|---|---|---|
| POST | `/api/trips` | Publish a trip (validation, 201 + trip) |
| GET | `/api/trips` | Search open future trips: `origin`, `destination`, `date` (YYYY-MM-DD), `seats` |
| GET | `/api/trips/{id}` | Get one trip (404 if missing) |
| GET | `/api/trips/driver/{driverId}` | All trips of a driver |
| PUT | `/api/trips/{id}` | Update a trip (only while `OPEN`) |
| PATCH | `/api/trips/{id}/seats` | Reserve/release seats atomically: `{"delta": -1}` (409 if not enough seats) |
| DELETE | `/api/trips/{id}` | Soft delete: status becomes `CANCELLED` |
| GET | `/health` | `{"status":"UP"}`, pings the DB |

Errors are `{"error": "message"}` with codes 400/404/409/500.

## curl examples

Create a trip:

```bash
curl -X POST http://localhost:8082/api/trips \
  -H "Content-Type: application/json" \
  -d '{
    "driver_id": "driver-42",
    "origin_city": "Tunis",
    "origin_lat": 36.8065, "origin_lng": 10.1815,
    "destination_city": "Sousse",
    "destination_lat": 35.8256, "destination_lng": 10.6370,
    "departure_time": "2026-12-01T08:00:00Z",
    "available_seats": 3, "total_seats": 3,
    "price_per_seat": 15.50,
    "preferences": {"smoking": false, "music": true}
  }'
```

Search trips (use the returned `<id>` for the next call):

```bash
curl "http://localhost:8082/api/trips?origin=tunis&destination=sousse&date=2026-12-01&seats=2"
```

Reserve 1 seat (booking-service):

```bash
curl -X PATCH http://localhost:8082/api/trips/<id>/seats \
  -H "Content-Type: application/json" \
  -d '{"delta": -1}'
```

## Known behaviour

- `PUT /api/trips/{id}` ignores `available_seats` from the body: it is
  recomputed as `total_seats - reserved`, where `reserved` = the seats already
  taken by bookings (`old total_seats - old available_seats`). A new
  `total_seats` lower than `reserved` is rejected with 400. `driver_id` is not
  required in the PUT body; it never changes.
- The search `date` parameter is compared against the departure date in
  `Africa/Tunis` time, not UTC: `departure_time AT TIME ZONE 'Africa/Tunis'`.

## Design notes (simplest option chosen where the spec was ambiguous)

- The seat update is a single atomic `UPDATE ... WHERE available_seats + $delta
  BETWEEN 0 AND total_seats`; status flips to `FULL` at 0 seats and back to
  `OPEN` when seats are freed.
- `PATCH /seats` and `DELETE` return 409 when the trip exists but is in a
  state that rejects the change; 404 only when the trip is missing.
- `PUT /api/trips/{id}` expects the full trip object (cities, departure time,
  seats, price); `preferences` falls back to the stored value if omitted.
- `GET /api/trips` with no filters returns all open future trips.
- `/health` returns `{"status":"DOWN"}` with 503 if the DB ping fails.
- Smoke test = start the DB as above + the three curl examples in this
  README (no test files, per the task rules).
