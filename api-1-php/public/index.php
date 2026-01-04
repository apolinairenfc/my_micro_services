<?php

declare(strict_types=1);

use App\Controllers\AuthController;
use App\Controllers\MessageController;
use App\Controllers\UserController;
use App\Services\JwtService;
use DI\Container;
use Dotenv\Dotenv;
use Psr\Http\Message\ServerRequestInterface;
use Slim\Exception\HttpException;
use Slim\Factory\AppFactory;
use Slim\Psr7\Response;

require __DIR__ . '/../vendor/autoload.php';

$rootPath = dirname(__DIR__);

if (file_exists($rootPath . '/.env')) {
    Dotenv::createImmutable($rootPath)->load();
}

$settings = require $rootPath . '/config/settings.php';

$container = new Container();
AppFactory::setContainer($container);

$container->set('settings', $settings);

$container->set('db', function () use ($settings, $rootPath) {
    $dbFactory = require $rootPath . '/config/database.php';

    return $dbFactory($settings);
});

$container->set(JwtService::class, function () use ($settings) {
    return new JwtService($settings['jwt']);
});

$container->set(AuthController::class, function ($container) {
    return new AuthController($container->get(JwtService::class));
});

$container->set(UserController::class, function () {
    return new UserController();
});

$container->set(MessageController::class, function () {
    return new MessageController();
});

$app = AppFactory::create();
$app->addBodyParsingMiddleware();

$errorMiddleware = $app->addErrorMiddleware(
    $settings['displayErrorDetails'],
    true,
    true
);

$errorHandler = function (
    ServerRequestInterface $request,
    Throwable $exception,
    bool $displayErrorDetails
) {
    $statusCode = 500;
    $error = 'server_error';

    if ($exception instanceof HttpException) {
        $statusCode = $exception->getStatusCode();
        if ($statusCode === 404) {
            $error = 'not_found';
        } elseif ($statusCode === 405) {
            $error = 'method_not_allowed';
        } elseif ($statusCode === 401) {
            $error = 'unauthorized';
        } elseif ($statusCode === 403) {
            $error = 'forbidden';
        } else {
            $error = 'http_error';
        }
    }

    $payload = ['error' => $error];

    if ($displayErrorDetails) {
        $payload['message'] = $exception->getMessage();
    }

    $response = new Response($statusCode);
    $response->getBody()->write(json_encode($payload, JSON_UNESCAPED_SLASHES));

    return $response->withHeader('Content-Type', 'application/json');
};

$errorMiddleware->setDefaultErrorHandler($errorHandler);

require $rootPath . '/app/routes.php';

$app->run();
