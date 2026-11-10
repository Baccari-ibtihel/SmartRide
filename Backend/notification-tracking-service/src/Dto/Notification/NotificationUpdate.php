<?php

namespace App\Dto\Notification;

use Symfony\Component\Validator\Constraints as Assert;

/** Mise à jour partielle (PATCH) : seuls les champs fournis sont modifiés. */
class NotificationUpdate
{
    #[Assert\Length(min: 1, max: 150)]
    public ?string $title = null;

    #[Assert\Length(min: 1, max: 1000)]
    public ?string $message = null;

    public ?array $data = null;

    #[Assert\Choice(choices: ['in_app', 'email', 'push'], multiple: true, min: 1)]
    public ?array $channels = null;

    public ?bool $read = null;
}
