<?php

namespace App\Controller\NotificationController;

use App\Document\Notification\Notification;
use App\Dto\Notification\NotificationInput;
use App\Dto\Notification\NotificationUpdate;
use App\Service\NotificationService\NotificationService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Attribute\MapRequestPayload;
use Symfony\Component\Routing\Attribute\Route;

/** Couche HTTP uniquement : lit la requête, appelle NotificationService, renvoie du JSON. */
#[Route('/notifications')]
class NotificationController extends AbstractController
{
    public function __construct(private readonly NotificationService $service)
    {
    }

    /** CREATE */
    #[Route('', methods: ['POST'])]
    public function create(#[MapRequestPayload] NotificationInput $input): JsonResponse
    {
        return $this->json($this->service->create($input)->toArray(), Response::HTTP_CREATED);
    }

    /** READ (liste) : ?userId=&read=true|false&type=&page=&limit= */
    #[Route('', methods: ['GET'])]
    public function list(Request $request): JsonResponse
    {
        $page = max(1, $request->query->getInt('page', 1));
        $limit = min(100, max(1, $request->query->getInt('limit', 20)));
        $read = $request->query->has('read') ? $request->query->getBoolean('read') : null;

        $items = $this->service->search(
            $request->query->get('userId'),
            $read,
            $request->query->get('type'),
            $page,
            $limit,
        );

        return $this->json([
            'page' => $page,
            'limit' => $limit,
            'items' => array_map(static fn (Notification $n) => $n->toArray(), $items),
        ]);
    }

    /** Nombre de notifications non lues d'un utilisateur */
    #[Route('/unread-count', methods: ['GET'], priority: 10)]
    public function unreadCount(Request $request): JsonResponse
    {
        $userId = $request->query->get('userId');
        if (!$userId) {
            return $this->json(['error' => 'Le paramètre userId est obligatoire.'], Response::HTTP_BAD_REQUEST);
        }

        return $this->json(['userId' => $userId, 'unread' => $this->service->countUnread($userId)]);
    }

    /** Marquer toutes les notifications d'un utilisateur comme lues */
    #[Route('/read-all', methods: ['PATCH'], priority: 10)]
    public function readAll(Request $request): JsonResponse
    {
        $userId = $request->query->get('userId');
        if (!$userId) {
            return $this->json(['error' => 'Le paramètre userId est obligatoire.'], Response::HTTP_BAD_REQUEST);
        }

        return $this->json(['userId' => $userId, 'updated' => $this->service->markAllAsRead($userId)]);
    }

    /** READ (détail) */
    #[Route('/{id}', methods: ['GET'])]
    public function show(string $id): JsonResponse
    {
        return $this->json($this->service->get($id)->toArray());
    }

    /** UPDATE (partiel) */
    #[Route('/{id}', methods: ['PATCH', 'PUT'])]
    public function update(string $id, #[MapRequestPayload] NotificationUpdate $input): JsonResponse
    {
        return $this->json($this->service->update($id, $input)->toArray());
    }

    /** DELETE */
    #[Route('/{id}', methods: ['DELETE'])]
    public function delete(string $id): JsonResponse
    {
        $this->service->delete($id);

        return new JsonResponse(null, Response::HTTP_NO_CONTENT);
    }
}
