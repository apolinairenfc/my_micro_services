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
    'port' => envValue('PORT', '8000'),
    'jwt' => [
        'secret' => envValue('JWT_SECRET'),
        'algo' => envValue('JWT_ALGO', 'HS256'),
    ],
    'upstream' => [
        'api1BaseUrl' => envValue('API1_BASE_URL'),
        'api2BaseUrl' => envValue('API2_BASE_URL'),
        'messagesDiscussionParam' => envValue('API1_MESSAGES_DISCUSSION_PARAM', 'discussionId'),
        'timeoutMs' => (int) envValue('API_TIMEOUT_MS', '5000'),
    ],
];
