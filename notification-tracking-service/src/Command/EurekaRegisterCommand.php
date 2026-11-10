<?php

namespace App\Command;

use App\Service\EurekaService\EurekaClient;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\DependencyInjection\Attribute\Autowire;

#[AsCommand(name: 'app:eureka:register', description: 'Enregistre le service dans Eureka et envoie un heartbeat toutes les 30 s')]
class EurekaRegisterCommand extends Command
{
    private bool $stop = false;

    public function __construct(
        private readonly EurekaClient $eureka,
        #[Autowire('%env(EUREKA_URL)%')] private readonly string $eurekaUrl,
        #[Autowire('%env(EUREKA_APP_NAME)%')] private readonly string $app,
        #[Autowire('%env(SERVICE_HOST)%')] private readonly string $host,
        #[Autowire('%env(int:SERVICE_PORT)%')] private readonly int $port,
    ) {
        parent::__construct();
    }

    protected function configure(): void
    {
        $this->addOption('port', null, InputOption::VALUE_REQUIRED, 'Port de cette instance (2e instance : --port=8001)');
        $this->addOption('interval', null, InputOption::VALUE_REQUIRED, 'Secondes entre deux heartbeats', '30');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $port = (int) ($input->getOption('port') ?: $this->port);
        $interval = max(1, (int) $input->getOption('interval'));
        $id = $this->eureka->instanceId($this->host, $this->app, $port);

        if (function_exists('pcntl_async_signals')) {
            pcntl_async_signals(true);
            pcntl_signal(SIGTERM, fn () => $this->stop = true);
            pcntl_signal(SIGINT, fn () => $this->stop = true);
        } else {
            $output->writeln('<comment>pcntl absent : à l\'arrêt, Eureka retirera l\'instance après ~90 s.</comment>');
        }

        // 1. Register, avec réessai tant qu'Eureka ne répond pas
        while (!$this->stop) {
            try {
                $this->eureka->register($this->eurekaUrl, $this->app, $this->host, $port);
                $output->writeln(sprintf('<info>Enregistré : %s (%s) sur %s</info>', $this->app, $id, $this->eurekaUrl));
                break;
            } catch (\Throwable $e) {
                $output->writeln('<comment>Eureka indisponible ('.$e->getMessage().'), nouvel essai dans 5 s...</comment>');
                $this->sleep(5);
            }
        }

        // 2. Heartbeat
        while (!$this->stop) {
            $this->sleep($interval);
            if ($this->stop) {
                break;
            }
            try {
                if (404 === $this->eureka->heartbeat($this->eurekaUrl, $this->app, $id)) {
                    $output->writeln('<comment>Instance inconnue d\'Eureka, ré-enregistrement</comment>');
                    $this->eureka->register($this->eurekaUrl, $this->app, $this->host, $port);
                } else {
                    $output->writeln('heartbeat OK');
                }
            } catch (\Throwable $e) {
                $output->writeln('<error>heartbeat échoué : '.$e->getMessage().'</error>');
            }
        }

        // 3. Cancel
        $this->eureka->cancel($this->eurekaUrl, $this->app, $id);
        $output->writeln('Désinscrit d\'Eureka.');

        return Command::SUCCESS;
    }

    /** Sommeil découpé en tranches d'1 s pour réagir vite à SIGTERM. */
    private function sleep(int $seconds): void
    {
        for ($i = 0; $i < $seconds && !$this->stop; ++$i) {
            sleep(1);
        }
    }
}
