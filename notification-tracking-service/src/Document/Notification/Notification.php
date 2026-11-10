<?php

namespace App\Document\Notification;

use App\Enum\Notification\NotificationType;
use App\Repository\Notification\NotificationRepository;
use Doctrine\ODM\MongoDB\Mapping\Annotations as ODM;

#[ODM\Document(collection: 'notifications', repositoryClass: NotificationRepository::class)]
#[ODM\Index(keys: ['userId' => 'asc', 'read' => 'asc', 'createdAt' => 'desc'])]
class Notification
{
    #[ODM\Id]
    private ?string $id = null;

    #[ODM\Field(type: 'string')]
    private string $userId;

    #[ODM\Field(enumType: NotificationType::class)]
    private NotificationType $type;

    #[ODM\Field(type: 'string')]
    private string $title;

    #[ODM\Field(type: 'string')]
    private string $message;

    /** Payload libre : bookingId, tripId, ... */
    #[ODM\Field(type: 'hash')]
    private array $data = [];

    /** @var string[] in_app | email | push */
    #[ODM\Field(type: 'collection')]
    private array $channels = ['in_app'];

    #[ODM\Field(type: 'bool')]
    private bool $read = false;

    #[ODM\Field(type: 'date_immutable')]
    private \DateTimeImmutable $createdAt;

    #[ODM\Field(type: 'date_immutable', nullable: true)]
    private ?\DateTimeImmutable $readAt = null;

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
    }

    public function getId(): ?string { return $this->id; }

    public function getUserId(): string { return $this->userId; }
    public function setUserId(string $userId): self { $this->userId = $userId; return $this; }

    public function getType(): NotificationType { return $this->type; }
    public function setType(NotificationType $type): self { $this->type = $type; return $this; }

    public function getTitle(): string { return $this->title; }
    public function setTitle(string $title): self { $this->title = $title; return $this; }

    public function getMessage(): string { return $this->message; }
    public function setMessage(string $message): self { $this->message = $message; return $this; }

    public function getData(): array { return $this->data; }
    public function setData(array $data): self { $this->data = $data; return $this; }

    public function getChannels(): array { return $this->channels; }
    public function setChannels(array $channels): self { $this->channels = array_values($channels); return $this; }

    public function isRead(): bool { return $this->read; }

    public function markAsRead(): self
    {
        if (!$this->read) {
            $this->read = true;
            $this->readAt = new \DateTimeImmutable();
        }

        return $this;
    }

    public function markAsUnread(): self
    {
        $this->read = false;
        $this->readAt = null;

        return $this;
    }

    public function getCreatedAt(): \DateTimeImmutable { return $this->createdAt; }
    public function getReadAt(): ?\DateTimeImmutable { return $this->readAt; }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'userId' => $this->userId,
            'type' => $this->type->value,
            'title' => $this->title,
            'message' => $this->message,
            'data' => $this->data,
            'channels' => $this->channels,
            'read' => $this->read,
            'createdAt' => $this->createdAt->format(\DATE_ATOM),
            'readAt' => $this->readAt?->format(\DATE_ATOM),
        ];
    }
}
