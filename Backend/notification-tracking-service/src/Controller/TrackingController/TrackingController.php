<?php

namespace App\Controller\TrackingController;

use App\Document\Tracking\Location;
use App\Document\Tracking\TrackingSession;
use App\Dto\Tracking\LocationInput;
use App\Dto\Tracking\TrackingSessionInput;
use App\Dto\Tracking\TrackingSessionUpdate;
use App\Service\TrackingService\TrackingService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Attribute\MapRequestPayload;
use Symfony\Component\Routing\Attribute\Route;

/** Couche HTTP uniquement : lit la requête, appelle TrackingService, renvoie du JSON. */
#[Route('/tracking')]
class TrackingController extends AbstractController
{
    public function __construct(private readonly TrackingService $service)
    {
    }

    // ------------------------------------------------------------------
    // Sessions de tracking (une session par trajet)
    // ------------------------------------------------------------------

    /** CREATE */
    #[Route('', methods: ['POST'])]
    public function createSession(#[MapRequestPayload] TrackingSessionInput $input): JsonResponse
    {
        return $this->json($this->service->createSession($input)->toArray(), Response::HTTP_CREATED);
    }

    /** READ (liste) : ?driverId=&status=&page=&limit= */
    #[Route('', methods: ['GET'])]
    public function listSessions(Request $request): JsonResponse
    {
        $page = max(1, $request->query->getInt('page', 1));
        $limit = min(100, max(1, $request->query->getInt('limit', 20)));

        $items = $this->service->listSessions(
            $request->query->get('driverId'),
            $request->query->get('status'),
            $page,
            $limit,
        );

        return $this->json([
            'page' => $page,
            'limit' => $limit,
            'items' => array_map(static fn (TrackingSession $s) => $s->toArray(), $items),
        ]);
    }

    /** READ (détail) */
    #[Route('/{tripId}', methods: ['GET'])]
    public function showSession(string $tripId): JsonResponse
    {
        return $this->json($this->service->getSession($tripId)->toArray());
    }

    /** UPDATE : statut (start, arrived, finished...), ETA, destination */
    #[Route('/{tripId}', methods: ['PATCH', 'PUT'])]
    public function updateSession(string $tripId, #[MapRequestPayload] TrackingSessionUpdate $input): JsonResponse
    {
        return $this->json($this->service->updateSession($tripId, $input)->toArray());
    }

    /** DELETE : supprime la session ET tout son historique de positions */
    #[Route('/{tripId}', methods: ['DELETE'])]
    public function deleteSession(string $tripId): JsonResponse
    {
        $this->service->deleteSession($tripId);

        return new JsonResponse(null, Response::HTTP_NO_CONTENT);
    }

    // ------------------------------------------------------------------
    // Positions GPS d'un trajet
    // ------------------------------------------------------------------

    /** CREATE : le conducteur envoie sa position */
    #[Route('/{tripId}/locations', methods: ['POST'])]
    public function addLocation(string $tripId, #[MapRequestPayload] LocationInput $input): JsonResponse
    {
        return $this->json($this->service->addLocation($tripId, $input)->toArray(), Response::HTTP_CREATED);
    }

    /** READ : historique du parcours */
    #[Route('/{tripId}/locations', methods: ['GET'])]
    public function history(string $tripId, Request $request): JsonResponse
    {
        $limit = min(1000, max(1, $request->query->getInt('limit', 500)));

        return $this->json(array_map(
            static fn (Location $l) => $l->toArray(),
            $this->service->getHistory($tripId, $limit),
        ));
    }

    /** READ : dernière position connue (utilisée par le passager) */
    #[Route('/{tripId}/locations/latest', methods: ['GET'], priority: 10)]
    public function latest(string $tripId): JsonResponse
    {
        return $this->json($this->service->getLatestLocation($tripId)->toArray());
    }

    /** DELETE : supprimer une position erronée */
    #[Route('/{tripId}/locations/{locationId}', methods: ['DELETE'])]
    public function deleteLocation(string $tripId, string $locationId): JsonResponse
    {
        $this->service->deleteLocation($tripId, $locationId);

        return new JsonResponse(null, Response::HTTP_NO_CONTENT);
    }
}
