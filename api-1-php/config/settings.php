<?php

declare(strict_types=1);

return [
    'displayErrorDetails' => getenv('APP_DEBUG') === 'true',
    'db' => [
        'driver' => 'mysql',
        'host' => getenv('DB_HOST') ?: '',
        'port' => getenv('DB_PORT') ?: '',
        'database' => getenv('DB_NAME') ?: '',
        'username' => getenv('DB_USER') ?: '',
        'password' => getenv('DB_PASS') ?: '',
        'charset' => 'utf8mb4',
        'collation' => 'utf8mb4_unicode_ci',
        'prefix' => '',
    ],
    'jwt' => [
        'secret' => getenv('JWT_SECRET') ?: '',
        'exp' => getenv('JWT_EXP') ?: '',
    ],
];
