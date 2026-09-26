<?php

header('Content-Type: application/json');

echo json_encode([
    'status' => 'UP',
    'service' => 'Notification/Tracking Service (Symfony PHP)'
]);
