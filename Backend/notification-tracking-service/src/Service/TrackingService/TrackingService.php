<?php

namespace App\Service\TrackingService;

use App\Document\Tracking\Location;
use App\Document\Tracking\TrackingSession;
use App\Dto\Tracking\LocationInput;
use App\Dto\Tracking\TrackingSessionInput;
use App\Dto\Tracking\TrackingSessionUpdate;
use App\Enum\Tracking\TrackingStatus;
use App\Repository\Tracking\LocationRepository;
use App\Repository\Tracking\TrackingSessionRepository;
use Doctrine\ODM\MongoDB\DocumentManager;
use Symfony\Component\HttpKernel\Exception\ConflictHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

/**
 * Logique métier du suivi en temps réel : sessions de tracking et positions GPS.
 */
class TrackingService
{
    public function __construct(
        private readonly DocumentManager $dm,
        private readonly TrackingSessionRepository $sessions,
        private readonly LocationRepository $locations,
        private readonly EtaCalculator $etaCalculator,
    ) {
    }

    // ------------------------------------------------------------------
    // Sessions
    // ------------------------------------------------------------------

    public function createSession(TrackingSessionInput $input): TrackingSession
    {
        if ($this->sessions->findOneBy(['tripId' => $input->tripId])) {
            throw new ConflictHttpException('Une session de tracking existe déjà pour ce trajet.');
        }

        $session = (new TrackingSession())
            ->setTripId($input->tripId)
            ->setDriverId($input->driverId);

        $this->applyDestination($session, $input->destinationLatitude, $input->destinationLongitude);

        $this->dm->persist($session);
        $this->dm->flush();

        return $session;
    }

    /** @return TrackingSession[] */
    public function listSessions(?string $driverId, ?string $status, int $page, int $limit): array
    {
        return $this->sessions->search($driverId, $status, $page, $limit);
    }

    public function getSession(string $tripId): TrackingSession
    {
        return $this->sessions->findOneBy(['tripId' => $tripId])
            ?? throw new NotFoundHttpException('Session de tracking introuvable pour ce trajet.');
    }

    public function updateSession(string $tripId, TrackingSessionUpdate $input): TrackingSession
    {
        $session = $this->getSession($tripId);

        if (null !== $input->status) {
            $session->setStatus($input->status);
        }
        if (null !== $input->eta) {
            $session->setEta(new \DateTimeImmutable($input->eta));
        }
        $this->applyDestination($session, $input->destinationLatitude, $input->destinationLongitude);

        $this->dm->flush();

        return $session;
    }

    /** Supprime la session ET tout son historique de positions. */
    public function deleteSession(string $tripId): void
    {
        $session = $this->getSession($tripId);

        $this->locations->deleteByTrip($tripId);
        $this->dm->remove($session);
        $this->dm->flush();
    }

    // ------------------------------------------------------------------
    // Positions GPS
    // ------------------------------------------------------------------

    /**
     * Enregistre une position envoyée par le conducteur.
     * Met à jour la dernière position de la session et, si une destination est connue, l'ETA.
     */
    public function addLocation(string $tripId, LocationInput $input): Location
    {
        $session = $this->getSession($tripId);

        if (TrackingStatus::STARTED !== $session->getStatus()) {
            throw new ConflictHttpException('Le suivi n\'est pas démarré pour ce trajet (statut : '.$session->getStatus()->value.').');
        }

        $location = (new Location())
            ->setTripId($tripId)
            ->setDriverId($session->getDriverId())
            ->setPoint($input->latitude, $input->longitude)
            ->setSpeed($input->speed)
            ->setHeading($input->heading);

        if (null !== $input->timestamp) {
            $location->setTimestamp(new \DateTime($input->timestamp));
        }

        $session->setLastPosition($location->getPosition());

        if (null !== $session->getDestination()) {
            $session->setEta($this->etaCalculator->estimate(
                $location->getPosition(),
                $session->getDestination(),
                $input->speed,
            ));
        }

        $this->dm->persist($location);
        $this->dm->flush();

        return $location;
    }

    /** @return Location[] historique du parcours, dans l'ordre chronologique */
    public function getHistory(string $tripId, int $limit = 500): array
    {
        $this->getSession($tripId);

        return $this->locations->findByTrip($tripId, $limit);
    }

    public function getLatestLocation(string $tripId): Location
    {
        $this->getSession($tripId);

        return $this->locations->findLatest($tripId)
            ?? throw new NotFoundHttpException('Aucune position enregistrée pour ce trajet.');
    }

    public function deleteLocation(string $tripId, string $locationId): void
    {
        $location = $this->locations->find($locationId);
        if (!$location || $location->getTripId() !== $tripId) {
            throw new NotFoundHttpException('Position introuvable pour ce trajet.');
        }

        $this->dm->remove($location);
        $this->dm->flush();
    }

    private function applyDestination(TrackingSession $session, ?float $latitude, ?float $longitude): void
    {
        if (null === $latitude && null === $longitude) {
            return;
        }
        if (null === $latitude || null === $longitude) {
            throw new ConflictHttpException('La destination exige destinationLatitude ET destinationLongitude.');
        }

        $session->setDestination($latitude, $longitude);
    }
}
