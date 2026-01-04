<?php

declare(strict_types=1);

use App\Controllers\AuthController;
use App\Controllers\MessageController;
use App\Controllers\UserController;
use App\Middleware\JwtAuthMiddleware;
use App\Services\JwtService;
use Illuminate\Database\Capsule\Manager as Capsule;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Slim\Routing\RouteCollectorProxy;

$jwtService = $container->get(JwtService::class);

$app->post('/auth/register', [AuthController::class, 'register']);
$app->post('/auth/login', [AuthController::class, 'login']);

$app->get('/health/db', function (Request $request, Response $response) {
    try {
        Capsule::connection()->select('SELECT 1');
    } catch (Throwable $e) {
        $payload = ['status' => 'ok', 'db' => 'error'];
        $response->getBody()->write(json_encode($payload, JSON_UNESCAPED_SLASHES));

        return $response
            ->withHeader('Content-Type', 'application/json')
            ->withStatus(500);
    }

    $payload = ['status' => 'ok', 'db' => 'ok'];
    $response->getBody()->write(json_encode($payload, JSON_UNESCAPED_SLASHES));

    return $response->withHeader('Content-Type', 'application/json');
});

$app->group('', function (RouteCollectorProxy $group) {
    $group->get('/users', [UserController::class, 'index']);
    $group->get('/users/{id}', [UserController::class, 'show']);
    $group->post('/users', [UserController::class, 'store']);
    $group->put('/users/{id}', [UserController::class, 'update']);
    $group->delete('/users/{id}', [UserController::class, 'delete']);

    $group->post('/messages', [MessageController::class, 'store']);
    $group->get('/messages', [MessageController::class, 'index']);
    $group->get('/messages/{id}', [MessageController::class, 'show']);
    $group->put('/messages/{id}', [MessageController::class, 'update']);
    $group->delete('/messages/{id}', [MessageController::class, 'delete']);
})->add(new JwtAuthMiddleware($jwtService));
