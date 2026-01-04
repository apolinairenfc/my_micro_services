<?php

declare(strict_types=1);

function envValue(string $key, string $default = ''): string
{
    if (isset($_ENV[$key]) && $_ENV[$key] !== '') {
        return (string) $_ENV[$key];
    }

    if (isset($_SERVER[$key]) && $_SERVER[$key] !== '') {
        return (string) $_SERVER[$key];
    }

    $value = getenv($key);

    return $value !== false ? (string) $value : $default;
}

return [
    'displayErrorDetails' => envValue('APP_DEBUG') === 'true',
    'db' => [
        'driver' => 'mysql',
        'host' => envValue('DB_HOST'),
        'port' => envValue('DB_PORT'),
        'database' => envValue('DB_NAME'),
        'username' => envValue('DB_USER'),
        'password' => envValue('DB_PASS'),
        'charset' => 'utf8mb4',
        'collation' => 'utf8mb4_unicode_ci',
        'prefix' => '',
    ],
    'jwt' => [
        'secret' => envValue('JWT_SECRET'),
        'exp' => envValue('JWT_EXP'),
    ],
];
