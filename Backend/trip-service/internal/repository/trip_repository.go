package repository

import (
	"context"
	"errors"
	"fmt"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/Baccari-ibtihel/SmartRide/Backend/trip-service/internal/model"
)

// ErrNotFound is returned when a trip does not exist.
var ErrNotFound = errors.New("trip not found")

const tripColumns = `id, driver_id, origin_city, origin_lat, origin_lng,
	destination_city, destination_lat, destination_lng, departure_time,
	available_seats, total_seats, price_per_seat, status, preferences,
	created_at, updated_at`

// TripRepository provides access to the trips table.
type TripRepository struct {
	pool *pgxpool.Pool
}

func NewTripRepository(pool *pgxpool.Pool) *TripRepository {
	return &TripRepository{pool: pool}
}

func scanTrip(row pgx.Row) (model.Trip, error) {
	var t model.Trip
	err := row.Scan(&t.ID, &t.DriverID, &t.OriginCity, &t.OriginLat, &t.OriginLng,
		&t.DestinationCity, &t.DestLat, &t.DestLng, &t.DepartureTime,
		&t.AvailableSeats, &t.TotalSeats, &t.PricePerSeat, &t.Status,
		&t.Preferences, &t.CreatedAt, &t.UpdatedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return t, ErrNotFound
	}
	if err != nil {
		return t, fmt.Errorf("scan trip: %w", err)
	}
	return t, nil
}

func (r *TripRepository) Insert(ctx context.Context, t model.Trip) (model.Trip, error) {
	q := `INSERT INTO trips (
		driver_id, origin_city, origin_lat, origin_lng,
		destination_city, destination_lat, destination_lng,
		departure_time, available_seats, total_seats, price_per_seat,
		status, preferences
	) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
	RETURNING ` + tripColumns

	return scanTrip(r.pool.QueryRow(ctx, q,
		t.DriverID, t.OriginCity, t.OriginLat, t.OriginLng,
		t.DestinationCity, t.DestLat, t.DestLng,
		t.DepartureTime, t.AvailableSeats, t.TotalSeats, t.PricePerSeat,
		t.Status, t.Preferences))
}

func (r *TripRepository) GetByID(ctx context.Context, id string) (model.Trip, error) {
	q := `SELECT ` + tripColumns + ` FROM trips WHERE id = $1`
	return scanTrip(r.pool.QueryRow(ctx, q, id))
}

// SearchFilters holds the optional query parameters of GET /api/trips.
type SearchFilters struct {
	Origin      string
	Destination string
	Date        string // YYYY-MM-DD
	Seats       int    // minimum available seats
}

func (r *TripRepository) Search(ctx context.Context, f SearchFilters) ([]model.Trip, error) {
	q := `SELECT ` + tripColumns + ` FROM trips
		WHERE status = 'OPEN' AND departure_time > now()`
	args := []any{}
	n := 1

	if f.Origin != "" {
		q += fmt.Sprintf(` AND lower(origin_city) = lower($%d)`, n)
		args = append(args, f.Origin)
		n++
	}
	if f.Destination != "" {
		q += fmt.Sprintf(` AND lower(destination_city) = lower($%d)`, n)
		args = append(args, f.Destination)
		n++
	}
	if f.Date != "" {
		q += fmt.Sprintf(` AND (departure_time AT TIME ZONE 'Africa/Tunis')::date = $%d::date`, n)
		args = append(args, f.Date)
		n++
	}
	if f.Seats > 0 {
		q += fmt.Sprintf(` AND available_seats >= $%d`, n)
		args = append(args, f.Seats)
		n++
	}
	q += ` ORDER BY departure_time ASC`

	rows, err := r.pool.Query(ctx, q, args...)
	if err != nil {
		return nil, fmt.Errorf("search trips: %w", err)
	}
	defer rows.Close()

	trips := []model.Trip{}
	for rows.Next() {
		t, err := scanTrip(rows)
		if err != nil {
			return nil, err
		}
		trips = append(trips, t)
	}
	return trips, rows.Err()
}

func (r *TripRepository) ListByDriver(ctx context.Context, driverID string) ([]model.Trip, error) {
	q := `SELECT ` + tripColumns + ` FROM trips WHERE driver_id = $1 ORDER BY departure_time DESC`
	rows, err := r.pool.Query(ctx, q, driverID)
	if err != nil {
		return nil, fmt.Errorf("list trips by driver: %w", err)
	}
	defer rows.Close()

	trips := []model.Trip{}
	for rows.Next() {
		t, err := scanTrip(rows)
		if err != nil {
			return nil, err
		}
		trips = append(trips, t)
	}
	return trips, rows.Err()
}

// Update applies changes to a trip that is still OPEN.
// ErrNotFound means the trip is missing or no longer OPEN.
func (r *TripRepository) Update(ctx context.Context, t model.Trip) (model.Trip, error) {
	q := `UPDATE trips SET
		origin_city = $1, origin_lat = $2, origin_lng = $3,
		destination_city = $4, destination_lat = $5, destination_lng = $6,
		departure_time = $7, available_seats = $8, total_seats = $9,
		price_per_seat = $10, preferences = $11, updated_at = now()
	WHERE id = $12 AND status = 'OPEN'
	RETURNING ` + tripColumns

	return scanTrip(r.pool.QueryRow(ctx, q,
		t.OriginCity, t.OriginLat, t.OriginLng,
		t.DestinationCity, t.DestLat, t.DestLng,
		t.DepartureTime, t.AvailableSeats, t.TotalSeats,
		t.PricePerSeat, t.Preferences, t.ID))
}

// ErrSeatsConflict is returned when a seat delta cannot be applied.
var ErrSeatsConflict = errors.New("not enough seats available")

// ErrInvalidStatus is returned when the trip status rejects the operation.
var ErrInvalidStatus = errors.New("trip status does not allow this operation")

// UpdateSeats atomically reserves (negative delta) or releases (positive delta)
// seats. It flips the status to FULL when the last seat is taken and back to
// OPEN when seats are freed on a FULL trip.
// Returns ErrNotFound if the trip does not exist, ErrInvalidStatus if its
// status rejects the change, or ErrSeatsConflict if the delta does not fit.
func (r *TripRepository) UpdateSeats(ctx context.Context, id string, delta int) (model.Trip, error) {
	q := `UPDATE trips SET
		available_seats = available_seats + $2,
		status = CASE
			WHEN available_seats + $2 = 0 THEN 'FULL'
			WHEN status = 'FULL' THEN 'OPEN'
			ELSE status
		END,
		updated_at = now()
	WHERE id = $1
		AND available_seats + $2 BETWEEN 0 AND total_seats
		AND status IN ('OPEN', 'FULL')
	RETURNING ` + tripColumns

	t, err := scanTrip(r.pool.QueryRow(ctx, q, id, delta))
	if errors.Is(err, ErrNotFound) {
		// No row updated: tell apart missing / wrong status / not enough seats.
		existing, getErr := r.GetByID(ctx, id)
		if getErr != nil {
			return t, ErrNotFound
		}
		if existing.Status != model.StatusOpen && existing.Status != model.StatusFull {
			return existing, fmt.Errorf("%w: trip is %s", ErrInvalidStatus, existing.Status)
		}
		return t, ErrSeatsConflict
	}
	return t, err
}

// Cancel soft-deletes a trip by setting its status to CANCELLED.
// Returns ErrInvalidStatus when the trip exists but is not OPEN/FULL.
func (r *TripRepository) Cancel(ctx context.Context, id string) (model.Trip, error) {
	q := `UPDATE trips SET status = 'CANCELLED', updated_at = now()
	WHERE id = $1 AND status IN ('OPEN', 'FULL')
	RETURNING ` + tripColumns

	t, err := scanTrip(r.pool.QueryRow(ctx, q, id))
	if errors.Is(err, ErrNotFound) {
		existing, getErr := r.GetByID(ctx, id)
		if getErr != nil {
			return t, ErrNotFound
		}
		return existing, fmt.Errorf("%w: trip is %s", ErrInvalidStatus, existing.Status)
	}
	return t, err
}
