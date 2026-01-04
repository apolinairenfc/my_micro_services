<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Services\ApiClient;
use App\Services\UpstreamResponse;
use App\Validators\DiscussionValidator;
use GuzzleHttp\Exception\RequestException;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

final class ChatDiscussionController
{
    private ApiClient $apiClient;
    private UpstreamResponse $upstream;
    private array $upstreamConfig;

    public function __construct(ApiClient $apiClient, UpstreamResponse $upstream, array $upstreamConfig)
    {
        $this->apiClient = $apiClient;
        $this->upstream = $upstream;
        $this->upstreamConfig = $upstreamConfig;
    }

    public function create(Request $request, Response $response): Response
    {
        $data = $this->getJsonBody($request);
        $errors = DiscussionValidator::validateCreate($data);

        if ($errors !== []) {
            return $this->jsonResponse($response, 400, [
                'error' => 'validation_error',
                'details' => $errors,
            ]);
        }

        $userId = (int) $request->getAttribute('userId');
        $userIds = $data['userIds'] ?? [];
        if (!is_array($userIds)) {
            $userIds = [];
        }

        $userIds = DiscussionValidator::normalizeUserIds($userIds, $userId);

        $payload = [
            'title' => trim((string) ($data['title'] ?? '')),
            'userIds' => $userIds,
        ];

        try {
            $upstreamResponse = $this->apiClient->requestApi2('POST', '/discussions', [
                'json' => $payload,
            ]);
        } catch (RequestException $exception) {
            return $this->upstream->upstreamFailure('api2', 502, 'Failed to reach API2.');
        }

        return $this->upstream->forward($upstreamResponse, 'api2');
    }

    public function list(Request $request, Response $response): Response
    {
        $queryParams = $request->getQueryParams();
        $userId = $queryParams['userId'] ?? null;
        $limit = $queryParams['limit'] ?? null;
        $offset = $queryParams['offset'] ?? null;

        if ($userId === null || $userId === '') {
            $userId = (string) $request->getAttribute('userId');
        }

        $query = ['userId' => $userId];

        if ($limit !== null) {
            $query['limit'] = $limit;
        }

        if ($offset !== null) {
            $query['offset'] = $offset;
        }

        try {
            $upstreamResponse = $this->apiClient->requestApi2('GET', '/discussions', [
                'query' => $query,
            ]);
        } catch (RequestException $exception) {
            return $this->upstream->upstreamFailure('api2', 502, 'Failed to reach API2.');
        }

        return $this->upstream->forward($upstreamResponse, 'api2');
    }

    public function get(Request $request, Response $response, array $args): Response
    {
        $discussionId = $args['id'] ?? '';

        try {
            $discussionResponse = $this->apiClient->requestApi2('GET', '/discussions/' . $discussionId);
        } catch (RequestException $exception) {
            return $this->upstream->upstreamFailure('api2', 502, 'Failed to reach API2.');
        }

        if ($discussionResponse->getStatusCode() >= 400) {
            return $this->upstream->forward($discussionResponse, 'api2');
        }

        $discussionPayload = json_decode((string) $discussionResponse->getBody(), true);

        if (!is_array($discussionPayload)) {
            return $this->upstream->upstreamFailure('api2', 502, 'Invalid discussion response from API2.');
        }

        $paramName = $this->upstreamConfig['messagesDiscussionParam'] ?? 'discussionId';

        try {
            $messagesResponse = $this->apiClient->requestApi1('GET', '/messages', [
                'query' => [$paramName => $discussionId],
                'headers' => $this->buildAuthHeader($request),
            ]);
        } catch (RequestException $exception) {
            return $this->upstream->upstreamFailure('api1', 502, 'Failed to reach API1.');
        }

        if ($messagesResponse->getStatusCode() >= 400) {
            return $this->upstream->upstreamFailure('api1', 502, 'Failed to fetch messages from API1.');
        }

        $messagesPayload = json_decode((string) $messagesResponse->getBody(), true);

        if (!is_array($messagesPayload)) {
            return $this->upstream->upstreamFailure('api1', 502, 'Invalid messages response from API1.');
        }

        return $this->jsonResponse($response, 200, [
            'data' => [
                'discussion' => $discussionPayload['data'] ?? $discussionPayload,
                'messages' => $messagesPayload['data'] ?? $messagesPayload,
            ],
        ]);
    }

    public function update(Request $request, Response $response, array $args): Response
    {
        $data = $this->getJsonBody($request);
        $errors = DiscussionValidator::validateUpdate($data);

        if ($errors !== []) {
            return $this->jsonResponse($response, 400, [
                'error' => 'validation_error',
                'details' => $errors,
            ]);
        }

        $discussionId = $args['id'] ?? '';

        try {
            $upstreamResponse = $this->apiClient->requestApi2('PUT', '/discussions/' . $discussionId, [
                'json' => $data,
            ]);
        } catch (RequestException $exception) {
            return $this->upstream->upstreamFailure('api2', 502, 'Failed to reach API2.');
        }

        return $this->upstream->forward($upstreamResponse, 'api2');
    }

    public function delete(Request $request, Response $response, array $args): Response
    {
        $discussionId = $args['id'] ?? '';

        try {
            $upstreamResponse = $this->apiClient->requestApi2('DELETE', '/discussions/' . $discussionId);
        } catch (RequestException $exception) {
            return $this->upstream->upstreamFailure('api2', 502, 'Failed to reach API2.');
        }

        return $this->upstream->forward($upstreamResponse, 'api2');
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
