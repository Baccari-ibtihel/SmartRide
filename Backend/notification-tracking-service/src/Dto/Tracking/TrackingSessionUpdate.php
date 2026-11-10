<?php

namespace App\Dto\Tracking;

use App\Enum\Tracking\TrackingStatus;
use Symfony\Component\Validator\Constraints as Assert;

class TrackingSessionUpdate
{
    public ?TrackingStatus $status = null;

    /** ETA au format ISO 8601, ex: 2026-10-21T12:30:00+01:00 */
    #[Assert\DateTime(format: \DATE_ATOM)]
    public ?string $eta = null;

    #[Assert\Range(min: -90, max: 90)]
    public ?float $destinationLatitude = null;

    #[Assert\Range(min: -180, max: 180)]
    public ?float $destinationLongitude = null;
}
