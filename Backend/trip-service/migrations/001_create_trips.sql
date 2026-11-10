-- 001_create_trips.sql
-- Idempotent: safe to run on every startup.

CREATE TABLE IF NOT EXISTS trips (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_id        VARCHAR(64) NOT NULL,
    origin_city      VARCHAR(100) NOT NULL,
    origin_lat       DOUBLE PRECISION,
    origin_lng       DOUBLE PRECISION,
    destination_city VARCHAR(100) NOT NULL,
    destination_lat  DOUBLE PRECISION,
    destination_lng  DOUBLE PRECISION,
    departure_time   TIMESTAMPTZ NOT NULL,
    available_seats  INT NOT NULL CHECK (available_seats >= 0),
    total_seats      INT NOT NULL CHECK (total_seats > 0),
    price_per_seat   NUMERIC(10,2) NOT NULL CHECK (price_per_seat >= 0),
    status           VARCHAR(20) NOT NULL DEFAULT 'OPEN'
        CHECK (status IN ('OPEN', 'FULL', 'CANCELLED', 'COMPLETED')),
    preferences      JSONB DEFAULT '{}',
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_trips_search
    ON trips (origin_city, destination_city, departure_time);

CREATE INDEX IF NOT EXISTS idx_trips_driver_id
    ON trips (driver_id);
