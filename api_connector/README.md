# API #3 Connector (Slim 4 + Guzzle + JWT)

## Prerequisites
- PHP 8.1+
- Composer
- API #1 running on http://localhost:8001
- API #2 running on http://localhost:8002

## Project creation (commands)
```bash
composer create-project slim/slim-skeleton api_connector
cd api_connector
composer require guzzlehttp/guzzle vlucas/phpdotenv firebase/php-jwt
```

## Environment setup
```bash
cp .env.example .env
```

Edit `.env` and set the same `JWT_SECRET` as API #1.

## Run the API
```bash
composer start
```

Base URL: `http://localhost:8000`

## cURL examples
Register (via API3 -> API1):
```bash
curl -i -X POST http://localhost:8000/chat/register \
  -H 'Content-Type: application/json' \
  -d '{"username":"john","email":"john@mail.com","password":"Password123!","passwordConfirm":"Password123!"}'
```

Login (via API3 -> API1):
```bash
curl -i -X POST http://localhost:8000/chat/login \
  -H 'Content-Type: application/json' \
  -d '{"login":"john","password":"Password123!"}'
```

Create discussion (via API3 -> API2):
```bash
curl -i -X POST http://localhost:8000/chat/discussions \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer TOKEN' \
  -d '{"title":"Discussion A","userIds":[2,3]}'
```

Post message (via API3 -> API1):
```bash
curl -i -X POST http://localhost:8000/chat/discussions/REPLACE_ID/messages \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer TOKEN' \
  -d '{"content":"Hello"}'
```

Get aggregated discussion + messages:
```bash
curl -i http://localhost:8000/chat/discussions/REPLACE_ID \
  -H 'Authorization: Bearer TOKEN'
```

Health services:
```bash
curl -i http://localhost:8000/health/services
```
