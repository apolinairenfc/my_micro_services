<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Models\User;
use App\Validators\UserValidator;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Throwable;

final class UserController
{
    public function index(Request $request, Response $response): Response
    {
        $users = User::all();
        $data = [];

        foreach ($users as $user) {
            $data[] = $user->toPublicArray();
        }

        return $this->jsonResponse($response, 200, ['data' => $data]);
    }

    public function show(Request $request, Response $response, array $args): Response
    {
        $user = User::find((int) $args['id']);

        if ($user === null) {
            return $this->jsonResponse($response, 404, ['error' => 'not_found']);
        }

        return $this->jsonResponse($response, 200, ['data' => $user->toPublicArray()]);
    }

    public function store(Request $request, Response $response): Response
    {
        $data = $this->getJsonBody($request);
        $errors = UserValidator::validateCreate($data);

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

        return $this->jsonResponse($response, 201, ['data' => $user->toPublicArray()]);
    }

    public function update(Request $request, Response $response, array $args): Response
    {
        $user = User::find((int) $args['id']);

        if ($user === null) {
            return $this->jsonResponse($response, 404, ['error' => 'not_found']);
        }

        $data = $this->getJsonBody($request);
        $errors = UserValidator::validateUpdate($data);

        if ($errors !== []) {
            return $this->jsonResponse($response, 400, [
                'error' => 'validation_error',
                'details' => $errors,
            ]);
        }

        if (array_key_exists('username', $data)) {
            $username = trim((string) $data['username']);
            $exists = User::where('username', $username)
                ->where('id', '!=', $user->id)
                ->exists();

            if ($exists) {
                return $this->jsonResponse($response, 400, [
                    'error' => 'validation_error',
                    'details' => [
                        ['field' => 'username', 'message' => 'Username already exists.'],
                    ],
                ]);
            }

            $user->username = $username;
        }

        if (array_key_exists('email', $data)) {
            $email = trim((string) $data['email']);
            $exists = User::where('email', $email)
                ->where('id', '!=', $user->id)
                ->exists();

            if ($exists) {
                return $this->jsonResponse($response, 400, [
                    'error' => 'validation_error',
                    'details' => [
                        ['field' => 'email', 'message' => 'Email already exists.'],
                    ],
                ]);
            }

            $user->email = $email;
        }

        if (array_key_exists('password', $data)) {
            $user->password_hash = password_hash((string) $data['password'], PASSWORD_BCRYPT);
        }

        try {
            $user->save();
        } catch (Throwable $e) {
            return $this->jsonResponse($response, 500, ['error' => 'server_error']);
        }

        return $this->jsonResponse($response, 200, ['data' => $user->toPublicArray()]);
    }

    public function delete(Request $request, Response $response, array $args): Response
    {
        $user = User::find((int) $args['id']);

        if ($user === null) {
            return $this->jsonResponse($response, 404, ['error' => 'not_found']);
        }

        try {
            $user->delete();
        } catch (Throwable $e) {
            return $this->jsonResponse($response, 500, ['error' => 'server_error']);
        }

        return $response->withStatus(204);
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
