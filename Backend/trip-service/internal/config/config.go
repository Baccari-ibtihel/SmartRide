package config

import (
	"fmt"
	"os"
)

// Config holds settings read from environment variables only.
type Config struct {
	ServerPort    string
	DBHost        string
	DBPort        string
	DBName        string
	DBUser        string
	DBPassword    string
	MigrationsDir string
}

func Load() Config {
	return Config{
		ServerPort:    getEnv("SERVER_PORT", "8082"),
		DBHost:        getEnv("DB_HOST", "localhost"),
		DBPort:        getEnv("DB_PORT", "5432"),
		DBName:        getEnv("DB_NAME", "trip_db"),
		DBUser:        getEnv("DB_USER", "trip"),
		DBPassword:    getEnv("DB_PASSWORD", "trip"),
		MigrationsDir: getEnv("MIGRATIONS_DIR", "migrations"),
	}
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

// DSN builds the PostgreSQL connection string.
func (c Config) DSN() string {
	return fmt.Sprintf("postgres://%s:%s@%s:%s/%s?sslmode=disable",
		c.DBUser, c.DBPassword, c.DBHost, c.DBPort, c.DBName)
}
