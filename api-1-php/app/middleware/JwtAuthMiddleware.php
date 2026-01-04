<?php

declare(strict_types=1);

namespace App\Middleware;

use App\Services\JwtService;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface as RequestHandler;
use Slim\Psr7\Response as SlimResponse;
use Throwable;

final class JwtAuthMiddleware implements MiddlewareInterface
{
    private JwtService $jwtService;

    public function __construct(JwtService $jwtService)
    {
        $this->jwtService = $jwtService;
    }

    public function process(Request $request, RequestHandler $handler): Response
    {
        $authHeader = $request->getHeaderLine('Authorization');

        if ($authHeader === '' || !str_starts_with($authHeader, 'Bearer ')) {
            return $this->unauthorized('missing_token');
        }

        $token = trim(substr($authHeader, 7));

        if ($token === '') {
            return $this->unauthorized('missing_token');
        }

        try {
            $payload = $this->jwtService->decodeToken($token);
        } catch (Throwable $e) {
            return $this->unauthorized('invalid_token');
        }

        $request = $request
            ->withAttribute('userId', $payload['sub'] ?? null)
            ->withAttribute('username', $payload['username'] ?? null);

        return $handler->handle($request);
    }

    private function unauthorized(string $error): Response
    {
        $response = new SlimResponse(401);
        $response->getBody()->write(json_encode(['error' => $error], JSON_UNESCAPED_SLASHES));

        return $response->withHeader('Content-Type', 'application/json');
    }
}
