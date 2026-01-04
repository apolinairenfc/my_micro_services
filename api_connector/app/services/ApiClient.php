<?php

declare(strict_types=1);

namespace App\Services;

use GuzzleHttp\Client;

final class ApiClient
{
    private Client $client;
    private string $api1BaseUrl;
    private string $api2BaseUrl;

    public function __construct(array $config)
    {
        $timeoutMs = (int) ($config['timeoutMs'] ?? 5000);

        $this->client = new Client([
            'timeout' => $timeoutMs / 1000,
            'http_errors' => false,
        ]);

        $this->api1BaseUrl = rtrim((string) ($config['api1BaseUrl'] ?? ''), '/');
        $this->api2BaseUrl = rtrim((string) ($config['api2BaseUrl'] ?? ''), '/');
    }

    public function requestApi1(string $method, string $path, array $options = [])
    {
        return $this->client->request($method, $this->api1BaseUrl . $path, $options);
    }

    public function requestApi2(string $method, string $path, array $options = [])
    {
        return $this->client->request($method, $this->api2BaseUrl . $path, $options);
    }
}
