<?php

namespace App\Service\EurekaService;

use Symfony\Contracts\HttpClient\HttpClientInterface;

/** Client minimal de l'API REST d'Eureka : register, heartbeat, cancel. */
class EurekaClient
{
    public function __construct(private readonly HttpClientInterface $http)
    {
    }

    public function instanceId(string $host, string $app, int $port): string
    {
        return sprintf('%s:%s:%d', $host, strtolower($app), $port);
    }

    public function register(string $eurekaUrl, string $app, string $host, int $port): void
    {
        $ip = gethostbyname($host);
        $base = sprintf('http://%s:%d', $host, $port);

        $this->http->request('POST', rtrim($eurekaUrl, '/').'/apps/'.$app, [
            'headers' => ['Accept' => 'application/json'],
            'json' => ['instance' => [
                'instanceId' => $this->instanceId($host, $app, $port),
                'hostName' => $host,
                'app' => $app,
                'ipAddr' => $ip,
                'vipAddress' => strtolower($app),
                'status' => 'UP',
                'port' => ['$' => $port, '@enabled' => 'true'],
                'securePort' => ['$' => 443, '@enabled' => 'false'],
                'homePageUrl' => $base.'/',
                'statusPageUrl' => $base.'/api/health',
                'healthCheckUrl' => $base.'/api/health',
                'dataCenterInfo' => [
                    '@class' => 'com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo',
                    'name' => 'MyOwn',
                ],
            ]],
            'timeout' => 5,
        ])->getContent(); // lève une exception si Eureka répond une erreur
    }

    /** @return int code HTTP (200 = ok, 404 = Eureka ne connaît plus l'instance) */
    public function heartbeat(string $eurekaUrl, string $app, string $instanceId): int
    {
        return $this->http->request('PUT', rtrim($eurekaUrl, '/').'/apps/'.$app.'/'.$instanceId, ['timeout' => 5])
            ->getStatusCode();
    }

    public function cancel(string $eurekaUrl, string $app, string $instanceId): void
    {
        try {
            $this->http->request('DELETE', rtrim($eurekaUrl, '/').'/apps/'.$app.'/'.$instanceId, ['timeout' => 3])
                ->getStatusCode();
        } catch (\Throwable) {
            // Eureka retirera l'instance seul après ~90 s sans heartbeat
        }
    }
}
