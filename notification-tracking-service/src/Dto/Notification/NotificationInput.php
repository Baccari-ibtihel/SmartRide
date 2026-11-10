<?php

namespace App\Dto\Notification;

use App\Enum\Notification\NotificationType;
use Symfony\Component\Validator\Constraints as Assert;

class NotificationInput
{
    #[Assert\NotBlank]
    public ?string $userId = null;

    #[Assert\NotNull]
    public ?NotificationType $type = null;

    #[Assert\NotBlank]
    #[Assert\Length(max: 150)]
    public ?string $title = null;

    #[Assert\NotBlank]
    #[Assert\Length(max: 1000)]
    public ?string $message = null;

    public array $data = [];

    /** @var string[] */
    #[Assert\All([new Assert\Choice(choices: ['in_app', 'email', 'push'])])]
    #[Assert\Count(min: 1)]
    public array $channels = ['in_app'];
}
