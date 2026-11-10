package handler

import (
	"context"
	"encoding/json"
	"errors"
	"io"
	"log"
	"net/http"
	"regexp"
	"strconv"
	"strings"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/Baccari-ibtihel/SmartRide/Backend/trip-service/internal/model"
	"github.com/Baccari-ibtihel/SmartRide/Backend/trip-service/internal/repository"
)

// TripHandler exposes the trips REST API.
type TripHandler struct {
	repo *repository.TripRepository
	pool *pgxpool.Pool
}

func NewTripHandler(repo *repository.TripRepository, pool *pgxpool.Pool) *TripHandler {
	return &TripHandler{repo: repo, pool: pool}
}

func writeJSON(w http.ResponseWriter, code int, body any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	if err := json.NewEncoder(w).Encode(body); err != nil {
		log.Printf("encode response: %v", err)
	}
}

func writeError(w http.ResponseWriter, code int, msg string) {
	writeJSON(w, code, map[string]string{"error": msg})
}

// uuidRegexp matches a canonical UUID (the format gen_random_uuid produces).
var uuidRegexp = regexp.MustCompile(`^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$`)

// checkTripID validates the {id} path parameter before it reaches SQL.
func checkTripID(w http.ResponseWriter, id string) bool {
	if !uuidRegexp.MatchString(id) {
		writeError(w, http.StatusBadRequest, "invalid trip id")
		return false
	}
	return true
}

// mapRepoError translates repository sentinel errors to HTTP codes.
func mapRepoError(w http.ResponseWriter, err error) {
	switch {
	case errors.Is(err, repository.ErrNotFound):
		writeError(w, http.StatusNotFound, "trip not found")
	case errors.Is(err, repository.ErrSeatsConflict):
		writeError(w, http.StatusConflict, err.Error())
	case errors.Is(err, repository.ErrInvalidStatus):
		writeError(w, http.StatusConflict, err.Error())
	default:
		writeError(w, http.StatusInternalServerError, "internal server error")
	}
	log.Printf("request failed: %v", err)
}

// decodeTrip reads a trip from the request body.
func decodeTrip(r *http.Request) (model.Trip, error) {
	var t model.Trip
	dec := json.NewDecoder(io.LimitReader(r.Body, 1<<20))
	if err := dec.Decode(&t); err != nil {
		return t, err
	}
	return t, nil
}

// validateTrip checks the fields a driver must provide.
// onCreate enforces available_seats == total_seats; on update the body's
// available_seats is ignored (recomputed from the reserved seats instead).
func validateTrip(t *model.Trip, onCreate bool) string {
	if onCreate && strings.TrimSpace(t.DriverID) == "" {
		return "driver_id is required"
	}
	if strings.TrimSpace(t.OriginCity) == "" {
		return "origin_city is required"
	}
	if strings.TrimSpace(t.DestinationCity) == "" {
		return "destination_city is required"
	}
	if t.DepartureTime.IsZero() {
		return "departure_time is required"
	}
	if !t.DepartureTime.After(time.Now()) {
		return "departure_time must be in the future"
	}
	if t.TotalSeats <= 0 {
		return "total_seats must be greater than 0"
	}
	if onCreate {
		if t.AvailableSeats < 0 {
			return "available_seats must be greater than or equal to 0"
		}
		if t.AvailableSeats != t.TotalSeats {
			return "available_seats must equal total_seats when publishing a trip"
		}
	}
	if t.PricePerSeat < 0 {
		return "price_per_seat must be greater than or equal to 0"
	}
	return ""
}

// Create handles POST /api/trips.
func (h *TripHandler) Create(w http.ResponseWriter, r *http.Request) {
	t, err := decodeTrip(r)
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid JSON body")
		return
	}
	if msg := validateTrip(&t, true); msg != "" {
		writeError(w, http.StatusBadRequest, msg)
		return
	}

	t.Status = model.StatusOpen
	if len(t.Preferences) == 0 {
		t.Preferences = json.RawMessage("{}")
	}

	created, err := h.repo.Insert(r.Context(), t)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to create trip")
		log.Printf("insert trip: %v", err)
		return
	}
	writeJSON(w, http.StatusCreated, created)
}

// Search handles GET /api/trips.
func (h *TripHandler) Search(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query()
	f := repository.SearchFilters{
		Origin:      strings.TrimSpace(q.Get("origin")),
		Destination: strings.TrimSpace(q.Get("destination")),
		Date:        strings.TrimSpace(q.Get("date")),
	}

	if f.Date != "" {
		if _, err := time.Parse("2006-01-02", f.Date); err != nil {
			writeError(w, http.StatusBadRequest, "date must be YYYY-MM-DD")
			return
		}
	}
	if s := strings.TrimSpace(q.Get("seats")); s != "" {
		n, err := strconv.Atoi(s)
		if err != nil || n < 1 {
			writeError(w, http.StatusBadRequest, "seats must be a positive integer")
			return
		}
		f.Seats = n
	}

	trips, err := h.repo.Search(r.Context(), f)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to search trips")
		log.Printf("search trips: %v", err)
		return
	}
	writeJSON(w, http.StatusOK, trips)
}

// Get handles GET /api/trips/{id}.
func (h *TripHandler) Get(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	if !checkTripID(w, id) {
		return
	}
	t, err := h.repo.GetByID(r.Context(), id)
	if err != nil {
		mapRepoError(w, err)
		return
	}
	writeJSON(w, http.StatusOK, t)
}

// GetByDriver handles GET /api/trips/driver/{driverId}.
func (h *TripHandler) GetByDriver(w http.ResponseWriter, r *http.Request) {
	trips, err := h.repo.ListByDriver(r.Context(), r.PathValue("driverId"))
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to list trips")
		log.Printf("list trips by driver: %v", err)
		return
	}
	writeJSON(w, http.StatusOK, trips)
}

// Update handles PUT /api/trips/{id}. Only OPEN trips can be updated.
func (h *TripHandler) Update(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	if !checkTripID(w, id) {
		return
	}

	existing, err := h.repo.GetByID(r.Context(), id)
	if err != nil {
		mapRepoError(w, err)
		return
	}
	if existing.Status != model.StatusOpen {
		writeError(w, http.StatusConflict, "only OPEN trips can be updated")
		return
	}

	t, err := decodeTrip(r)
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid JSON body")
		return
	}
	t.ID = id
	if msg := validateTrip(&t, false); msg != "" {
		writeError(w, http.StatusBadRequest, msg)
		return
	}

	// Keep seats consistent with existing bookings: the body's
	// available_seats is ignored and recomputed from the reserved count.
	reserved := existing.TotalSeats - existing.AvailableSeats
	if t.TotalSeats < reserved {
		writeError(w, http.StatusBadRequest, "total_seats cannot be lower than the already reserved seats")
		return
	}
	t.AvailableSeats = t.TotalSeats - reserved
	t.DriverID = existing.DriverID // driver_id never changes
	if len(t.Preferences) == 0 {
		t.Preferences = existing.Preferences
	}

	updated, err := h.repo.Update(r.Context(), t)
	if err != nil {
		mapRepoError(w, err)
		return
	}
	writeJSON(w, http.StatusOK, updated)
}

// seatsRequest is the body of PATCH /api/trips/{id}/seats.
type seatsRequest struct {
	Delta *int `json:"delta"`
}

// UpdateSeats handles PATCH /api/trips/{id}/seats.
func (h *TripHandler) UpdateSeats(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	if !checkTripID(w, id) {
		return
	}

	var req seatsRequest
	if err := json.NewDecoder(io.LimitReader(r.Body, 1<<20)).Decode(&req); err != nil || req.Delta == nil {
		writeError(w, http.StatusBadRequest, `body must be {"delta": <integer>}`)
		return
	}

	updated, err := h.repo.UpdateSeats(r.Context(), id, *req.Delta)
	if err != nil {
		mapRepoError(w, err)
		return
	}
	writeJSON(w, http.StatusOK, updated)
}

// Cancel handles DELETE /api/trips/{id} (soft delete).
func (h *TripHandler) Cancel(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	if !checkTripID(w, id) {
		return
	}
	t, err := h.repo.Cancel(r.Context(), id)
	if err != nil {
		mapRepoError(w, err)
		return
	}
	writeJSON(w, http.StatusOK, t)
}

// Health handles GET /health.
func (h *TripHandler) Health(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 2*time.Second)
	defer cancel()

	if err := h.pool.Ping(ctx); err != nil {
		log.Printf("health db ping failed: %v", err)
		writeJSON(w, http.StatusServiceUnavailable, map[string]string{"status": "DOWN"})
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{"status": "UP"})
}
