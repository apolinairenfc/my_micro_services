<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Models\Message;
use App\Validators\MessageValidator;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Throwable;

final class MessageController
{
    public function index(Request $request, Response $response): Response
    {
        $queryParams = $request->getQueryParams();
        $discussionId = trim((string) ($queryParams['discussionId'] ?? ''));
        $userId = (string) ($queryParams['userId'] ?? '');
        $limit = isset($queryParams['limit']) ? (int) $queryParams['limit'] : null;
        $offset = isset($queryParams['offset']) ? (int) $queryParams['offset'] : null;

        $query = Message::query();

        if ($discussionId !== '') {
            $query->where('discussion_id', $discussionId);
        }

        if ($userId !== '' && ctype_digit($userId)) {
            $query->where('user_id', (int) $userId);
        }

        if ($limit !== null && $limit > 0) {
            $query->limit($limit);
        }

        if ($offset !== null && $offset >= 0) {
            $query->offset($offset);
        }

        $messages = $query->orderBy('id', 'desc')->get();
        $data = [];

        foreach ($messages as $message) {
            $data[] = $message->toPublicArray();
        }

        return $this->jsonResponse($response, 200, ['data' => $data]);
    }

    public function show(Request $request, Response $response, array $args): Response
    {
        $message = Message::find((int) $args['id']);

        if ($message === null) {
            return $this->jsonResponse($response, 404, ['error' => 'not_found']);
        }

        return $this->jsonResponse($response, 200, ['data' => $message->toPublicArray()]);
    }

    public function store(Request $request, Response $response): Response
    {
        $data = $this->getJsonBody($request);
        $errors = MessageValidator::validateCreate($data);

        if ($errors !== []) {
            return $this->jsonResponse($response, 400, [
                'error' => 'validation_error',
                'details' => $errors,
            ]);
        }

        $userId = (int) $request->getAttribute('userId');

        if ($userId <= 0) {
            return $this->jsonResponse($response, 401, ['error' => 'unauthorized']);
        }

        try {
            $message = new Message();
            $message->discussion_id = trim((string) $data['discussionId']);
            $message->user_id = $userId;
            $message->content = (string) $data['content'];
            $message->save();
        } catch (Throwable $e) {
            return $this->jsonResponse($response, 500, ['error' => 'server_error']);
        }

        return $this->jsonResponse($response, 201, ['data' => $message->toPublicArray()]);
    }

    public function update(Request $request, Response $response, array $args): Response
    {
        $message = Message::find((int) $args['id']);

        if ($message === null) {
            return $this->jsonResponse($response, 404, ['error' => 'not_found']);
        }

        $userId = (int) $request->getAttribute('userId');

        if ($message->user_id !== $userId) {
            return $this->jsonResponse($response, 403, ['error' => 'forbidden']);
        }

        $data = $this->getJsonBody($request);
        $errors = MessageValidator::validateUpdate($data);

        if ($errors !== []) {
            return $this->jsonResponse($response, 400, [
                'error' => 'validation_error',
                'details' => $errors,
            ]);
        }

        $message->content = (string) $data['content'];

        try {
            $message->save();
        } catch (Throwable $e) {
            return $this->jsonResponse($response, 500, ['error' => 'server_error']);
        }

        return $this->jsonResponse($response, 200, ['data' => $message->toPublicArray()]);
    }

    public function delete(Request $request, Response $response, array $args): Response
    {
        $message = Message::find((int) $args['id']);

        if ($message === null) {
            return $this->jsonResponse($response, 404, ['error' => 'not_found']);
        }

        $userId = (int) $request->getAttribute('userId');

        if ($message->user_id !== $userId) {
            return $this->jsonResponse($response, 403, ['error' => 'forbidden']);
        }

        try {
            $message->delete();
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
