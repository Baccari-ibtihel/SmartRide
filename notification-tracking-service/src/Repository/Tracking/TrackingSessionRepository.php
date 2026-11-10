<?php

namespace App\Repository\Tracking;

use App\Document\Tracking\TrackingSession;
use Doctrine\Bundle\MongoDBBundle\ManagerRegistry;
use Doctrine\Bundle\MongoDBBundle\Repository\ServiceDocumentRepository;

/** @extends ServiceDocumentRepository<TrackingSession> */
class TrackingSessionRepository extends ServiceDocumentRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, TrackingSession::class);
    }

    /** @return TrackingSession[] */
    public function search(?string $driverId, ?string $status, int $page, int $limit): array
    {
        $qb = $this->createQueryBuilder()->sort('createdAt', 'desc');

        if (null !== $driverId) {
            $qb->field('driverId')->equals($driverId);
        }
        if (null !== $status) {
            $qb->field('status')->equals($status);
        }

        return $qb->skip(($page - 1) * $limit)->limit($limit)->getQuery()->execute()->toArray(false);
    }
}
