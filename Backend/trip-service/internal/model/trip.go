package model

import (
	"encoding/json"
	"time"
)

// Trip statuses.
const (
	StatusOpen      = "OPEN"
	StatusFull      = "FULL"
	StatusCancelled = "CANCELLED"
	StatusCompleted = "COMPLETED"
)

// Trip is the core entity published by a driver.
type Trip struct {
	ID              string          `json:"id"`
	DriverID        string          `json:"driver_id"`
	OriginCity      string          `json:"origin_city"`
	OriginLat       *float64        `json:"origin_lat,omitempty"`
	OriginLng       *float64        `json:"origin_lng,omitempty"`
	DestinationCity string          `json:"destination_city"`
	DestLat         *float64        `json:"destination_lat,omitempty"`
	DestLng         *float64        `json:"destination_lng,omitempty"`
	DepartureTime   time.Time       `json:"departure_time"`
	AvailableSeats  int             `json:"available_seats"`
	TotalSeats      int             `json:"total_seats"`
	PricePerSeat    float64         `json:"price_per_seat"`
	Status          string          `json:"status"`
	Preferences     json.RawMessage `json:"preferences"`
	CreatedAt       time.Time       `json:"created_at"`
	UpdatedAt       time.Time       `json:"updated_at"`
}
