package handler

import (
	"log"
	"net/http"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/Baccari-ibtihel/SmartRide/Backend/trip-service/internal/repository"
)

// NewRouter wires the REST API on Go 1.22 method+path patterns.
func NewRouter(repo *repository.TripRepository, pool *pgxpool.Pool) http.Handler {
	h := NewTripHandler(repo, pool)

	mux := http.NewServeMux()
	mux.HandleFunc("POST /api/trips", h.Create)
	mux.HandleFunc("GET /api/trips", h.Search)
	mux.HandleFunc("GET /api/trips/{id}", h.Get)
	mux.HandleFunc("GET /api/trips/driver/{driverId}", h.GetByDriver)
	mux.HandleFunc("PUT /api/trips/{id}", h.Update)
	mux.HandleFunc("PATCH /api/trips/{id}/seats", h.UpdateSeats)
	mux.HandleFunc("DELETE /api/trips/{id}", h.Cancel)
	mux.HandleFunc("GET /health", h.Health)

	return withLogging(mux)
}

// statusRecorder captures the response code for the access log.
type statusRecorder struct {
	http.ResponseWriter
	status int
}

func (r *statusRecorder) WriteHeader(code int) {
	r.status = code
	r.ResponseWriter.WriteHeader(code)
}

// withLogging logs method, path, status and duration of each request.
func withLogging(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, req *http.Request) {
		start := time.Now()
		rec := &statusRecorder{ResponseWriter: w, status: http.StatusOK}
		next.ServeHTTP(rec, req)
		log.Printf("%s %s %d %s", req.Method, req.URL.Path, rec.status,
			time.Since(start).Round(time.Microsecond))
	})
}
