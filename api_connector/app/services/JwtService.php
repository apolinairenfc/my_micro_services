<?php

declare(strict_types=1);

namespace App\Services;

use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use RuntimeException;

final class JwtService
{
    private string $secret;
    private string $algo;

    public function __construct(array $config)
    {
        $this->secret = (string) ($config['secret'] ?? '');
        $this->algo = (string) ($config['algo'] ?? 'HS256');

        if ($this->secret === '') {
            throw new RuntimeException('JWT_SECRET is not configured.');
        }
    }

    public function decodeToken(string $token): array
    {
        $decoded = JWT::decode($token, new Key($this->secret, $this->algo));

        return (array) $decoded;
    }
}
