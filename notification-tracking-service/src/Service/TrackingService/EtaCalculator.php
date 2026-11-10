<?php

namespace App\Service\TrackingService;

/**
 * Calcule la distance restante et l'heure d'arrivée estimée (ETA)
 * entre la position courante du conducteur et la destination du trajet.
 *
 * Les positions sont des GeoJSON Point : {"type":"Point","coordinates":[longitude, latitude]}.
 * La distance est à vol d'oiseau (formule de Haversine) : c'est une estimation, pas un itinéraire routier.
 */
final class EtaCalculator
{
    private const EARTH_RADIUS_KM = 6371.0088;

    /** Vitesse utilisée si la vitesse du conducteur est inconnue ou presque nulle (embouteillage, arrêt). */
    public const DEFAULT_SPEED_KMH = 50.0;
    public const MIN_SPEED_KMH = 5.0;

    /** Distance en kilomètres entre deux points GPS (formule de Haversine). */
    public function distanceKm(float $lat1, float $lng1, float $lat2, float $lng2): float
    {
        $dLat = deg2rad($lat2 - $lat1);
        $dLng = deg2rad($lng2 - $lng1);

        $a = sin($dLat / 2) ** 2
            + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin($dLng / 2) ** 2;

        return 2 * self::EARTH_RADIUS_KM * asin(min(1.0, sqrt($a)));
    }

    /**
     * Distance restante entre deux GeoJSON Point.
     *
     * @param array{coordinates: array{0: float, 1: float}} $from
     * @param array{coordinates: array{0: float, 1: float}} $to
     */
    public function remainingKm(array $from, array $to): float
    {
        return $this->distanceKm(
            (float) $from['coordinates'][1],
            (float) $from['coordinates'][0],
            (float) $to['coordinates'][1],
            (float) $to['coordinates'][0],
        );
    }

    /**
     * Heure d'arrivée estimée.
     *
     * @param array{coordinates: array{0: float, 1: float}} $position    position courante
     * @param array{coordinates: array{0: float, 1: float}} $destination  destination du trajet
     * @param float|null                                    $speedKmh     vitesse actuelle (km/h), si connue
     */
    public function estimate(
        array $position,
        array $destination,
        ?float $speedKmh = null,
        ?\DateTimeImmutable $now = null,
    ): \DateTimeImmutable {
        $now ??= new \DateTimeImmutable();

        $speed = (null === $speedKmh || $speedKmh < self::MIN_SPEED_KMH) ? self::DEFAULT_SPEED_KMH : $speedKmh;
        $seconds = (int) round($this->remainingKm($position, $destination) / $speed * 3600);

        return $now->modify(sprintf('+%d seconds', $seconds));
    }
}
