<?php

namespace App\Document\Tracking;

use App\Enum\Tracking\TrackingStatus;
use App\Repository\Tracking\TrackingSessionRepository;
use Doctrine\ODM\MongoDB\Mapping\Annotations as ODM;

#[ODM\Document(collection: 'tracking_sessions', repositoryClass: TrackingSessionRepository::class)]
#[ODM\UniqueIndex(keys: ['tripId' => 'asc'])]
class TrackingSession
{
    #[ODM\Id]
    private ?string $id = null;

    #[ODM\Field(type: 'string')]
    private string $tripId;

    #[ODM\Field(type: 'string')]
    private string $driverId;

    #[ODM\Field(enumType: TrackingStatus::class)]
    private TrackingStatus $status = TrackingStatus::PENDING;

    /** Dernière position connue (GeoJSON Point) */
    #[ODM\Field(type: 'hash', nullable: true)]
    private ?array $lastPosition = null;

    /** Destination du trajet (GeoJSON Point), utilisée pour calculer l'ETA automatiquement */
    #[ODM\Field(type: 'hash', nullable: true)]
    private ?array $destination = null;

    #[ODM\Field(type: 'date_immutable', nullable: true)]
    private ?\DateTimeImmutable $eta = null;

    #[ODM\Field(type: 'date_immutable', nullable: true)]
    private ?\DateTimeImmutable $startedAt = null;

    #[ODM\Field(type: 'date_immutable', nullable: true)]
    private ?\DateTimeImmutable $endedAt = null;

    #[ODM\Field(type: 'date_immutable')]
    private \DateTimeImmutable $createdAt;

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
    }

    public function getId(): ?string { return $this->id; }

    public function getTripId(): string { return $this->tripId; }
    public function setTripId(string $tripId): self { $this->tripId = $tripId; return $this; }

    public function getDriverId(): string { return $this->driverId; }
    public function setDriverId(string $driverId): self { $this->driverId = $driverId; return $this; }

    public function getStatus(): TrackingStatus { return $this->status; }

    public function setStatus(TrackingStatus $status): self
    {
        $this->status = $status;

        if (TrackingStatus::STARTED === $status && null === $this->startedAt) {
            $this->startedAt = new \DateTimeImmutable();
        }
        if (\in_array($status, [TrackingStatus::FINISHED, TrackingStatus::CANCELLED], true)) {
            $this->endedAt = new \DateTimeImmutable();
        }

        return $this;
    }

    public function getLastPosition(): ?array { return $this->lastPosition; }
    public function setLastPosition(?array $lastPosition): self { $this->lastPosition = $lastPosition; return $this; }

    public function getDestination(): ?array { return $this->destination; }

    public function setDestination(float $latitude, float $longitude): self
    {
        $this->destination = ['type' => 'Point', 'coordinates' => [$longitude, $latitude]];

        return $this;
    }

    public function getEta(): ?\DateTimeImmutable { return $this->eta; }
    public function setEta(?\DateTimeImmutable $eta): self { $this->eta = $eta; return $this; }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'tripId' => $this->tripId,
            'driverId' => $this->driverId,
            'status' => $this->status->value,
            'lastPosition' => $this->lastPosition,
            'destination' => $this->destination,
            'eta' => $this->eta?->format(\DATE_ATOM),
            'startedAt' => $this->startedAt?->format(\DATE_ATOM),
            'endedAt' => $this->endedAt?->format(\DATE_ATOM),
            'createdAt' => $this->createdAt->format(\DATE_ATOM),
        ];
    }
}
