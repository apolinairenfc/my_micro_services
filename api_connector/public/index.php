<?php

declare(strict_types=1);

use App\Controllers\ChatAuthController;
use App\Controllers\ChatDiscussionController;
use App\Controllers\ChatMessageController;
use App\Services\ApiClient;
use App\Services\JwtService;
use App\Services\UpstreamResponse;
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

$container->set(ApiClient::class, function () use ($settings) {
    return new ApiClient($settings['upstream']);
});

$container->set(JwtService::class, function () use ($settings) {
    return new JwtService($settings['jwt']);
});

$container->set(UpstreamResponse::class, function () {
    return new UpstreamResponse();
});

$container->set(ChatAuthController::class, function ($container) {
    return new ChatAuthController(
        $container->get(ApiClient::class),
        $container->get(UpstreamResponse::class)
    );
});

$container->set(ChatDiscussionController::class, function ($container) {
    return new ChatDiscussionController(
        $container->get(ApiClient::class),
        $container->get(UpstreamResponse::class),
        $container->get('settings')['upstream']
    );
});

$container->set(ChatMessageController::class, function ($container) {
    return new ChatMessageController(
        $container->get(ApiClient::class),
        $container->get(UpstreamResponse::class)
    );
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
