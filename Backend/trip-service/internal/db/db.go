package db

import (
	"context"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/Baccari-ibtihel/SmartRide/Backend/trip-service/internal/config"
)

// Connect opens a pgxpool and verifies the database is reachable.
func Connect(ctx context.Context, cfg config.Config) (*pgxpool.Pool, error) {
	poolCfg, err := pgxpool.ParseConfig(cfg.DSN())
	if err != nil {
		return nil, fmt.Errorf("parse db config: %w", err)
	}

	// Retry briefly so the service tolerates the database still booting.
	var pool *pgxpool.Pool
	for attempt := 1; attempt <= 10; attempt++ {
		pingCtx, cancel := context.WithTimeout(ctx, 3*time.Second)
		pool, err = pgxpool.NewWithConfig(pingCtx, poolCfg)
		if err == nil {
			err = pool.Ping(pingCtx)
		}
		cancel()
		if err == nil {
			return pool, nil
		}
		if pool != nil {
			pool.Close()
			pool = nil
		}
		log.Printf("database not ready (attempt %d/10): %v", attempt, err)
		time.Sleep(2 * time.Second)
	}
	return nil, fmt.Errorf("connect database: %w", err)
}

// RunMigrations executes every .sql file in dir, sorted by name.
// The migrations themselves are idempotent (CREATE TABLE IF NOT EXISTS, etc.).
func RunMigrations(pool *pgxpool.Pool, dir string) error {
	entries, err := os.ReadDir(dir)
	if err != nil {
		return fmt.Errorf("read migrations dir %q: %w", dir, err)
	}

	var files []string
	for _, e := range entries {
		if !e.IsDir() && strings.HasSuffix(e.Name(), ".sql") {
			files = append(files, filepath.Join(dir, e.Name()))
		}
	}
	sort.Strings(files)

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	for _, f := range files {
		sql, err := os.ReadFile(f)
		if err != nil {
			return fmt.Errorf("read migration %q: %w", f, err)
		}
		if _, err := pool.Exec(ctx, string(sql)); err != nil {
			return fmt.Errorf("run migration %q: %w", f, err)
		}
		log.Printf("migration applied: %s", filepath.Base(f))
	}
	return nil
}
