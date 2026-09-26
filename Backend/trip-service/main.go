package main

import (
	"encoding/json"
	"fmt"
	"net/http"
)

type TripResponse struct {
	Status  string `json:"status"`
	Service string `json:"service"`
}

func main() {
	http.HandleFunc("/api/trips/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(TripResponse{
			Status:  "UP",
			Service: "Trip Service (Go)",
		})
	})

	fmt.Println("Trip Service running on port 8082...")
	http.ListenAndServe(":8082", nil)
}
