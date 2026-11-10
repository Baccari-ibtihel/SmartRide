<?php

namespace App\EventListener;

use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\EventDispatcher\Attribute\AsEventListener;
use Symfony\Component\HttpKernel\Event\ResponseEvent;

#[AsEventListener]
class ServedByListener
{
    public function __construct(
        #[Autowire('%env(SERVICE_HOST)%')] private readonly string $host,
        #[Autowire('%env(SERVICE_PORT)%')] private readonly string $port,
    ) {
    }

    public function __invoke(ResponseEvent $event): void
    {
        $event->getResponse()->headers->set('X-Served-By', $this->host.':'.$this->port);
    }
}
