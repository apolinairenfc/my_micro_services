<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Services\ApiClient;
use App\Services\UpstreamResponse;
use GuzzleHttp\Exception\RequestException;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

final class ChatAuthController
{
    private ApiClient $apiClient;
    private UpstreamResponse $upstream;

    public function __construct(ApiClient $apiClient, UpstreamResponse $upstream)
    {
        $this->apiClient = $apiClient;
        $this->upstream = $upstream;
    }

    public function register(Request $request, Response $response): Response
    {
        $body = $this->getJsonBody($request);

        try {
            $upstreamResponse = $this->apiClient->requestApi1('POST', '/auth/register', [
                'json' => $body,
            ]);
        } catch (RequestException $exception) {
            return $this->upstream->upstreamFailure('api1', 502, 'Failed to reach API1.');
        }

        return $this->upstream->forward($upstreamResponse, 'api1');
    }

    public function login(Request $request, Response $response): Response
    {
        $body = $this->getJsonBody($request);

        try {
            $upstreamResponse = $this->apiClient->requestApi1('POST', '/auth/login', [
                'json' => $body,
            ]);
        } catch (RequestException $exception) {
            return $this->upstream->upstreamFailure('api1', 502, 'Failed to reach API1.');
        }

        return $this->upstream->forward($upstreamResponse, 'api1');
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
}
