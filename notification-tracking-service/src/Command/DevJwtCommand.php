<?php

namespace App\Command;

use Lexik\Bundle\JWTAuthenticationBundle\Security\User\JWTUser;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;

#[AsCommand(name: 'app:jwt:dev-token', description: 'DEV ONLY : génère un JWT de test (simule le User Service)')]
class DevJwtCommand extends Command
{
    public function __construct(private readonly JWTTokenManagerInterface $jwt)
    {
        parent::__construct();
    }

    protected function configure(): void
    {
        $this->addOption('user', null, InputOption::VALUE_REQUIRED, 'Identifiant (claim sub)', 'u45');
        $this->addOption('roles', null, InputOption::VALUE_REQUIRED, 'Rôles séparés par des virgules', 'ROLE_USER');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $roles = array_filter(array_map('trim', explode(',', (string) $input->getOption('roles'))));
        $user = new JWTUser((string) $input->getOption('user'), $roles);
        $output->writeln($this->jwt->create($user));

        return Command::SUCCESS;
    }
}
