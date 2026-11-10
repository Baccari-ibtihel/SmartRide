<?php

namespace App\Repository\Tracking;

use App\Document\Tracking\Location;
use Doctrine\Bundle\MongoDBBundle\ManagerRegistry;
use Doctrine\Bundle\MongoDBBundle\Repository\ServiceDocumentRepository;

/** @extends ServiceDocumentRepository<Location> */
class LocationRepository extends ServiceDocumentRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Location::class);
    }

    /** @return Location[] */
    public function findByTrip(string $tripId, int $limit = 500): array
    {
        return $this->createQueryBuilder()
            ->field('tripId')->equals($tripId)
            ->sort('timestamp', 'asc')
            ->limit($limit)
            ->getQuery()->execute()->toArray(false);
    }

    public function findLatest(string $tripId): ?Location
    {
        return $this->createQueryBuilder()
            ->field('tripId')->equals($tripId)
            ->sort('timestamp', 'desc')
            ->limit(1)
            ->getQuery()->getSingleResult();
    }

    public function deleteByTrip(string $tripId): int
    {
        $result = $this->createQueryBuilder()
            ->remove()
            ->field('tripId')->equals($tripId)
            ->getQuery()->execute();

        return $result->getDeletedCount();
    }
}
