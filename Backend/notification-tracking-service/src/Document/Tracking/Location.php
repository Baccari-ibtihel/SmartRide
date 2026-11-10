<?php

namespace App\Document\Tracking;

use App\Repository\Tracking\LocationRepository;
use Doctrine\ODM\MongoDB\Mapping\Annotations as ODM;

#[ODM\Document(collection: 'locations', repositoryClass: LocationRepository::class)]
#[ODM\Index(keys: ['tripId' => 'asc', 'timestamp' => 'desc'])]
#[ODM\Index(keys: ['position' => '2dsphere'])]
#[ODM\Index(keys: ['timestamp' => 'asc'], options: ['expireAfterSeconds' => 2592000])] // TTL : 30 jours
class Location
{
    #[ODM\Id]
    private ?string $id = null;

    #[ODM\Field(type: 'string')]
    private string $tripId;

    #[ODM\Field(type: 'string')]
    private string $driverId;

    /** GeoJSON Point : {"type":"Point","coordinates":[longitude, latitude]} */
    #[ODM\Field(type: 'hash')]
    private array $position;

    #[ODM\Field(type: 'float', nullable: true)]
    private ?float $speed = null;

    #[ODM\Field(type: 'float', nullable: true)]
    private ?float $heading = null;

    #[ODM\Field(type: 'date')]
    private \DateTime $timestamp;

    public function __construct()
    {
        $this->timestamp = new \DateTime();
    }

    public function getId(): ?string { return $this->id; }

    public function getTripId(): string { return $this->tripId; }
    public function setTripId(string $tripId): self { $this->tripId = $tripId; return $this; }

    public function getDriverId(): string { return $this->driverId; }
    public function setDriverId(string $driverId): self { $this->driverId = $driverId; return $this; }

    public function getPosition(): array { return $this->position; }

    public function setPoint(float $latitude, float $longitude): self
    {
        $this->position = ['type' => 'Point', 'coordinates' => [$longitude, $latitude]];

        return $this;
    }

    public function getSpeed(): ?float { return $this->speed; }
    public function setSpeed(?float $speed): self { $this->speed = $speed; return $this; }

    public function getHeading(): ?float { return $this->heading; }
    public function setHeading(?float $heading): self { $this->heading = $heading; return $this; }

    public function getTimestamp(): \DateTime { return $this->timestamp; }
    public function setTimestamp(\DateTime $timestamp): self { $this->timestamp = $timestamp; return $this; }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'tripId' => $this->tripId,
            'driverId' => $this->driverId,
            'latitude' => $this->position['coordinates'][1],
            'longitude' => $this->position['coordinates'][0],
            'speed' => $this->speed,
            'heading' => $this->heading,
            'timestamp' => $this->timestamp->format(\DATE_ATOM),
        ];
    }
}
