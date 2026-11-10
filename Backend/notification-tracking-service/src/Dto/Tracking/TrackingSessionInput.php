<?php

namespace App\Dto\Tracking;

use Symfony\Component\Validator\Constraints as Assert;

class TrackingSessionInput
{
    #[Assert\NotBlank]
    public ?string $tripId = null;

    #[Assert\NotBlank]
    public ?string $driverId = null;

    /** Destination optionnelle : si elle est fournie, l'ETA est recalculée à chaque nouvelle position. */
    #[Assert\Range(min: -90, max: 90)]
    public ?float $destinationLatitude = null;

    #[Assert\Range(min: -180, max: 180)]
    public ?float $destinationLongitude = null;
}
