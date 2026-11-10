<?php

namespace App\Enum\Tracking;

enum TrackingStatus: string
{
    case PENDING = 'PENDING';
    case STARTED = 'STARTED';
    case ARRIVED = 'ARRIVED';
    case FINISHED = 'FINISHED';
    case CANCELLED = 'CANCELLED';
}
