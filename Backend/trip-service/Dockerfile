# Build stage
FROM golang:1.22-alpine AS build
WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o /trip-service ./cmd/server

# Run stage
FROM alpine:latest
WORKDIR /app

COPY --from=build /trip-service /app/trip-service
COPY --from=build /app/migrations /app/migrations

EXPOSE 8082
CMD ["/app/trip-service"]
