<?php

namespace App\Service\NotificationService;

use App\Document\Notification\Notification;
use App\Dto\Notification\NotificationInput;
use App\Dto\Notification\NotificationUpdate;
use App\Repository\Notification\NotificationRepository;
use Doctrine\ODM\MongoDB\DocumentManager;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

/**
 * Logique métier des notifications : création, consultation, lecture et suppression.
 * Chaque notification a un seul destinataire (userId) ; l'appelant crée une notification par destinataire.
 */
class NotificationService
{
    public function __construct(
        private readonly DocumentManager $dm,
        private readonly NotificationRepository $notifications,
    ) {
    }

    public function create(NotificationInput $input): Notification
    {
        $notification = (new Notification())
            ->setUserId($input->userId)
            ->setType($input->type)
            ->setTitle($input->title)
            ->setMessage($input->message)
            ->setData($input->data)
            ->setChannels($input->channels);

        $this->dm->persist($notification);
        $this->dm->flush();

        return $notification;
    }

    /** @return Notification[] */
    public function search(?string $userId, ?bool $read, ?string $type, int $page, int $limit): array
    {
        return $this->notifications->search($userId, $read, $type, $page, $limit);
    }

    public function get(string $id): Notification
    {
        return $this->notifications->find($id)
            ?? throw new NotFoundHttpException('Notification introuvable.');
    }

    public function update(string $id, NotificationUpdate $input): Notification
    {
        $notification = $this->get($id);

        if (null !== $input->title) {
            $notification->setTitle($input->title);
        }
        if (null !== $input->message) {
            $notification->setMessage($input->message);
        }
        if (null !== $input->data) {
            $notification->setData($input->data);
        }
        if (null !== $input->channels) {
            $notification->setChannels($input->channels);
        }
        if (null !== $input->read) {
            $input->read ? $notification->markAsRead() : $notification->markAsUnread();
        }

        $this->dm->flush();

        return $notification;
    }

    public function delete(string $id): void
    {
        $this->dm->remove($this->get($id));
        $this->dm->flush();
    }

    public function countUnread(string $userId): int
    {
        return $this->notifications->countUnread($userId);
    }

    /** @return int nombre de notifications passées à « lue » */
    public function markAllAsRead(string $userId): int
    {
        return $this->notifications->markAllAsRead($userId);
    }
}
