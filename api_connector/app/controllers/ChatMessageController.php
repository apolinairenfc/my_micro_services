<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Services\ApiClient;
use App\Services\UpstreamResponse;
use App\Validators\MessageValidator;
use GuzzleHttp\Exception\RequestException;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

final class ChatMessageController
{
    private ApiClient $apiClient;
    private UpstreamResponse $upstream;

    public function __construct(ApiClient $apiClient, UpstreamResponse $upstream)
    {
        $this->apiClient = $apiClient;
        $this->upstream = $upstream;
    }

    public function create(Request $request, Response $response, array $args): Response
    {
        $data = $this->getJsonBody($request);
        $errors = MessageValidator::validateContent($data);

        if ($errors !== []) {
            return $this->jsonResponse($response, 400, [
                'error' => 'validation_error',
                'details' => $errors,
            ]);
        }

        $discussionId = $args['id'] ?? '';

        $payload = [
            'discussionId' => $discussionId,
            'content' => (string) $data['content'],
        ];

        try {
            $upstreamResponse = $this->apiClient->requestApi1('POST', '/messages', [
                'json' => $payload,
                'headers' => $this->buildAuthHeader($request),
            ]);
        } catch (RequestException $exception) {
            return $this->upstream->upstreamFailure('api1', 502, 'Failed to reach API1.');
        }

        return $this->upstream->forward($upstreamResponse, 'api1');
    }

    public function update(Request $request, Response $response, array $args): Response
    {
        $data = $this->getJsonBody($request);
        $errors = MessageValidator::validateContent($data);

        if ($errors !== []) {
            return $this->jsonResponse($response, 400, [
                'error' => 'validation_error',
                'details' => $errors,
            ]);
        }

        $messageId = $args['id'] ?? '';

        try {
            $upstreamResponse = $this->apiClient->requestApi1('PUT', '/messages/' . $messageId, [
                'json' => $data,
                'headers' => $this->buildAuthHeader($request),
            ]);
        } catch (RequestException $exception) {
            return $this->upstream->upstreamFailure('api1', 502, 'Failed to reach API1.');
        }

        return $this->upstream->forward($upstreamResponse, 'api1');
    }

    public function delete(Request $request, Response $response, array $args): Response
    {
        $messageId = $args['id'] ?? '';

        try {
            $upstreamResponse = $this->apiClient->requestApi1('DELETE', '/messages/' . $messageId, [
                'headers' => $this->buildAuthHeader($request),
            ]);
        } catch (RequestException $exception) {
            return $this->upstream->upstreamFailure('api1', 502, 'Failed to reach API1.');
        }

        return $this->upstream->forward($upstreamResponse, 'api1');
    }

    private function buildAuthHeader(Request $request): array
    {
        $authHeader = $request->getHeaderLine('Authorization');

        return $authHeader !== '' ? ['Authorization' => $authHeader] : [];
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
