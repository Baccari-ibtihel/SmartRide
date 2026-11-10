# Build stage
FROM golang:1.22-alpine AS build
WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o /trip-service ./cmd/server

# Run stage
FROM alpine:latest

# Run as a non-root user
RUN adduser -D -H -h /app appuser

COPY --from=build /trip-service /trip-service
# Must match the Go config default (MIGRATIONS_DIR=migrations, relative to WORKDIR)
WORKDIR /app
COPY --from=build /app/migrations /app/migrations
RUN chown -R appuser:appuser /app /trip-service

USER appuser
EXPOSE 8082
CMD ["/trip-service"]
