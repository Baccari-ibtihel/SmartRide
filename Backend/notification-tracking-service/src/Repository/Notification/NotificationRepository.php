<?php

namespace App\Repository\Notification;

use App\Document\Notification\Notification;
use Doctrine\Bundle\MongoDBBundle\ManagerRegistry;
use Doctrine\Bundle\MongoDBBundle\Repository\ServiceDocumentRepository;

/** @extends ServiceDocumentRepository<Notification> */
class NotificationRepository extends ServiceDocumentRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Notification::class);
    }

    /** @return Notification[] */
    public function search(?string $userId, ?bool $read, ?string $type, int $page, int $limit): array
    {
        $qb = $this->createQueryBuilder()->sort('createdAt', 'desc');

        if (null !== $userId) {
            $qb->field('userId')->equals($userId);
        }
        if (null !== $read) {
            $qb->field('read')->equals($read);
        }
        if (null !== $type) {
            $qb->field('type')->equals($type);
        }

        return $qb->skip(($page - 1) * $limit)->limit($limit)->getQuery()->execute()->toArray(false);
    }

    public function countUnread(string $userId): int
    {
        return (int) $this->createQueryBuilder()
            ->field('userId')->equals($userId)
            ->field('read')->equals(false)
            ->count()->getQuery()->execute();
    }

    public function markAllAsRead(string $userId): int
    {
        $result = $this->createQueryBuilder()
            ->updateMany()
            ->field('userId')->equals($userId)
            ->field('read')->equals(false)
            ->field('read')->set(true)
            ->field('readAt')->set(new \DateTime())
            ->getQuery()->execute();

        return $result->getModifiedCount();
    }
}
