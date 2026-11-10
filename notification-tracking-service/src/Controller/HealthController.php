<?php

namespace App\Controller;

use Doctrine\ODM\MongoDB\DocumentManager;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

/** Utilisé par Eureka / Docker pour savoir si le service (et sa base) sont vivants. Public. */
class HealthController
{
    public function __construct(
        private readonly DocumentManager $dm,
        #[Autowire('%env(MONGODB_DB)%')] private readonly string $dbName,
    ) {
    }

    #[Route('/health', methods: ['GET'])]
    public function health(): JsonResponse
    {
        try {
            $this->dm->getClient()->selectDatabase($this->dbName)->command(['ping' => 1]);
            return new JsonResponse(['status' => 'UP', 'mongo' => 'UP']);
        } catch (\Throwable $e) {
            return new JsonResponse(['status' => 'DOWN', 'mongo' => 'DOWN'], Response::HTTP_SERVICE_UNAVAILABLE);
        }
    }
}
