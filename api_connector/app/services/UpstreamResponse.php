<?php

declare(strict_types=1);

namespace App\Services;

use Psr\Http\Message\ResponseInterface;
use Slim\Psr7\Response as SlimResponse;

final class UpstreamResponse
{
    public function forward(ResponseInterface $upstreamResponse, string $serviceName): ResponseInterface
    {
        $statusCode = $upstreamResponse->getStatusCode();
        $body = (string) $upstreamResponse->getBody();
        $contentType = $upstreamResponse->getHeaderLine('Content-Type');

        if (stripos($contentType, 'application/json') !== false) {
            $response = new SlimResponse($statusCode);
            $response->getBody()->write($body);

            return $response->withHeader('Content-Type', 'application/json');
        }

        $payload = [
            'error' => 'upstream_error',
            'service' => $serviceName,
            'status' => $statusCode,
            'message' => $body !== '' ? $body : 'Upstream returned non-JSON response.',
        ];

        $response = new SlimResponse($statusCode);
        $response->getBody()->write(json_encode($payload, JSON_UNESCAPED_SLASHES));

        return $response->withHeader('Content-Type', 'application/json');
    }

    public function upstreamFailure(string $serviceName, int $statusCode, string $message): ResponseInterface
    {
        $payload = [
            'error' => 'upstream_error',
            'service' => $serviceName,
            'status' => $statusCode,
            'message' => $message,
        ];

        $response = new SlimResponse($statusCode);
        $response->getBody()->write(json_encode($payload, JSON_UNESCAPED_SLASHES));

        return $response->withHeader('Content-Type', 'application/json');
    }
}
