<?php

namespace App\Dto\Tracking;

use Symfony\Component\Validator\Constraints as Assert;

class LocationInput
{
    #[Assert\NotNull]
    #[Assert\Range(min: -90, max: 90)]
    public ?float $latitude = null;

    #[Assert\NotNull]
    #[Assert\Range(min: -180, max: 180)]
    public ?float $longitude = null;

    #[Assert\PositiveOrZero]
    public ?float $speed = null;

    #[Assert\Range(min: 0, max: 360)]
    public ?float $heading = null;

    /** Optionnel : sinon l'heure du serveur est utilisée (ISO 8601). */
    #[Assert\DateTime(format: \DATE_ATOM)]
    public ?string $timestamp = null;
}
