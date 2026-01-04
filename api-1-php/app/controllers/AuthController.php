<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Models\User;
use App\Services\JwtService;
use App\Validators\AuthValidator;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Throwable;

final class AuthController
{
    private JwtService $jwtService;

    public function __construct(JwtService $jwtService)
    {
        $this->jwtService = $jwtService;
    }

    public function register(Request $request, Response $response): Response
    {
        $data = $this->getJsonBody($request);
        $errors = AuthValidator::validateRegister($data);

        if ($errors !== []) {
            return $this->jsonResponse($response, 400, [
                'error' => 'validation_error',
                'details' => $errors,
            ]);
        }

        $username = trim((string) $data['username']);
        $email = trim((string) $data['email']);

        $existingUser = User::where('username', $username)
            ->orWhere('email', $email)
            ->first();

        if ($existingUser !== null) {
            return $this->jsonResponse($response, 400, [
                'error' => 'validation_error',
                'details' => [
                    ['field' => 'username', 'message' => 'Username or email already exists.'],
                ],
            ]);
        }

        try {
            $user = new User();
            $user->username = $username;
            $user->email = $email;
            $user->password_hash = password_hash((string) $data['password'], PASSWORD_BCRYPT);
            $user->save();
        } catch (Throwable $e) {
            return $this->jsonResponse($response, 500, ['error' => 'server_error']);
        }

        return $this->jsonResponse($response, 201, [
            'user' => $user->toPublicArray(),
        ]);
    }

    public function login(Request $request, Response $response): Response
    {
        $data = $this->getJsonBody($request);
        $errors = AuthValidator::validateLogin($data);

        if ($errors !== []) {
            return $this->jsonResponse($response, 400, [
                'error' => 'validation_error',
                'details' => $errors,
            ]);
        }

        $login = trim((string) $data['login']);
        $password = (string) $data['password'];

        $user = User::where('username', $login)
            ->orWhere('email', $login)
            ->first();

        if ($user === null || !password_verify($password, (string) $user->password_hash)) {
            return $this->jsonResponse($response, 401, ['error' => 'invalid_credentials']);
        }

        try {
            $token = $this->jwtService->createToken((int) $user->id, (string) $user->username);
        } catch (Throwable $e) {
            return $this->jsonResponse($response, 500, ['error' => 'server_error']);
        }

        return $this->jsonResponse($response, 200, [
            'token' => $token,
            'tokenType' => 'Bearer',
            'expiresIn' => $this->jwtService->getExpirationSeconds(),
            'user' => [
                'id' => $user->id,
                'username' => $user->username,
                'email' => $user->email,
            ],
        ]);
    }

    private function getJsonBody(Request $request): array
    {
        $parsedBody = $request->getParsedBody();

        if (is_array($parsedBody)) {
            return $parsedBody;
        }

        $rawBody = (string) $request->getBody();
        $decoded = json_decode($rawBody, true);

        return is_array($decoded) ? $decoded : [];
    }

    private function jsonResponse(Response $response, int $status, array $data): Response
    {
        $payload = json_encode($data, JSON_UNESCAPED_SLASHES);
        $response->getBody()->write($payload);

        return $response
            ->withHeader('Content-Type', 'application/json')
            ->withStatus($status);
    }
}
