<?php

declare(strict_types=1);

use App\Controllers\ChatAuthController;
use App\Controllers\ChatDiscussionController;
use App\Controllers\ChatMessageController;
use App\Middleware\JwtAuthMiddleware;
use App\Services\ApiClient;
use App\Services\JwtService;
use App\Services\UpstreamResponse;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Slim\Routing\RouteCollectorProxy;

$jwtService = $container->get(JwtService::class);
$apiClient = $container->get(ApiClient::class);
$upstream = $container->get(UpstreamResponse::class);

$app->get('/health', function (Request $request, Response $response) {
    $payload = ['status' => 'ok'];
    $response->getBody()->write(json_encode($payload, JSON_UNESCAPED_SLASHES));

    return $response->withHeader('Content-Type', 'application/json');
});

$app->get('/health/services', function (Request $request, Response $response) use ($apiClient, $upstream) {
    try {
        $api1Response = $apiClient->requestApi1('GET', '/health/db');
    } catch (Throwable $e) {
        $api1Response = null;
    }

    try {
        $api2Response = $apiClient->requestApi2('GET', '/health/db');
    } catch (Throwable $e) {
        $api2Response = null;
    }

    $api1Ok = $api1Response !== null && $api1Response->getStatusCode() < 400;
    $api2Ok = $api2Response !== null && $api2Response->getStatusCode() < 400;

    $payload = [
        'status' => $api1Ok && $api2Ok ? 'ok' : 'degraded',
        'services' => [
            'api1' => $api1Ok ? 'ok' : 'error',
            'api2' => $api2Ok ? 'ok' : 'error',
        ],
    ];

    $statusCode = $api1Ok && $api2Ok ? 200 : 502;

    $response->getBody()->write(json_encode($payload, JSON_UNESCAPED_SLASHES));

    return $response->withHeader('Content-Type', 'application/json')->withStatus($statusCode);
});

$app->post('/chat/register', [ChatAuthController::class, 'register']);
$app->post('/chat/login', [ChatAuthController::class, 'login']);

$app->group('/chat', function (RouteCollectorProxy $group) {
    $group->post('/discussions', [ChatDiscussionController::class, 'create']);
    $group->get('/discussions', [ChatDiscussionController::class, 'list']);
    $group->get('/discussions/{id}', [ChatDiscussionController::class, 'get']);
    $group->put('/discussions/{id}', [ChatDiscussionController::class, 'update']);
    $group->delete('/discussions/{id}', [ChatDiscussionController::class, 'delete']);

    $group->post('/discussions/{id}/messages', [ChatMessageController::class, 'create']);
    $group->put('/messages/{id}', [ChatMessageController::class, 'update']);
    $group->delete('/messages/{id}', [ChatMessageController::class, 'delete']);
})->add(new JwtAuthMiddleware($jwtService));
