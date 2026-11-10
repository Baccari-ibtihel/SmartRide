package main

import (
	"context"
	"errors"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/Baccari-ibtihel/SmartRide/Backend/trip-service/internal/config"
	"github.com/Baccari-ibtihel/SmartRide/Backend/trip-service/internal/db"
	"github.com/Baccari-ibtihel/SmartRide/Backend/trip-service/internal/handler"
	"github.com/Baccari-ibtihel/SmartRide/Backend/trip-service/internal/repository"
)

func main() {
	cfg := config.Load()

	pool, err := db.Connect(context.Background(), cfg)
	if err != nil {
		log.Fatalf("connect database: %v", err)
	}
	defer pool.Close()

	if err := db.RunMigrations(pool, cfg.MigrationsDir); err != nil {
		log.Fatalf("run migrations: %v", err)
	}

	repo := repository.NewTripRepository(pool)
	srv := &http.Server{
		Addr:              ":" + cfg.ServerPort,
		Handler:           handler.NewRouter(repo, pool),
		ReadHeaderTimeout: 5 * time.Second,
	}

	go func() {
		log.Printf("trip-service listening on :%s", cfg.ServerPort)
		if err := srv.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			log.Fatalf("serve: %v", err)
		}
	}()

	// Graceful shutdown on SIGINT/SIGTERM.
	stop := make(chan os.Signal, 1)
	signal.Notify(stop, syscall.SIGINT, syscall.SIGTERM)
	<-stop

	log.Println("shutting down...")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	if err := srv.Shutdown(ctx); err != nil {
		log.Printf("shutdown: %v", err)
	}
}
