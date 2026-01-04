<?php

declare(strict_types=1);

namespace App\Services;

use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use RuntimeException;

final class JwtService
{
    private string $secret;
    private int $exp;

    public function __construct(array $config)
    {
        $this->secret = (string) ($config['secret'] ?? '');
        $this->exp = (int) ($config['exp'] ?? 0);

        if ($this->secret === '') {
            throw new RuntimeException('JWT_SECRET is not configured.');
        }

        if ($this->exp <= 0) {
            throw new RuntimeException('JWT_EXP is not configured.');
        }
    }

    public function createToken(int $userId, string $username): string
    {
        $now = time();
        $payload = [
            'sub' => $userId,
            'username' => $username,
            'iat' => $now,
            'exp' => $now + $this->exp,
        ];

        return JWT::encode($payload, $this->secret, 'HS256');
    }

    public function decodeToken(string $token): array
    {
        $decoded = JWT::decode($token, new Key($this->secret, 'HS256'));

        return (array) $decoded;
    }

    public function getExpirationSeconds(): int
    {
        return $this->exp;
    }
}
