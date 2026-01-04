# API #1 Users/Messages (Slim 4 + Eloquent)

## Prerequisites
- PHP 8.1+
- Composer
- MySQL 8+

## Project creation (commands)
```bash
composer create-project slim/slim-skeleton api-1-php
cd api-1-php
composer require illuminate/database vlucas/phpdotenv firebase/php-jwt slim/psr7
```

## Environment setup
```bash
cp .env.example .env
```

Edit `.env` to match your local MySQL credentials and JWT secret.

## Database
```bash
mysql -h 127.0.0.1 -P 3306 -u app -p my_micro_services < database/schema.sql
```

## Run the server
```bash
php -S 127.0.0.1:8001 -t public
```

Base URL: `http://localhost:8001`

## cURL examples
Register:
```bash
curl -i -X POST http://localhost:8001/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"username":"john","email":"john@mail.com","password":"Password123!","passwordConfirm":"Password123!"}'
```

Login:
```bash
curl -i -X POST http://localhost:8001/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"login":"john","password":"Password123!"}'
```

Create message (replace TOKEN):
```bash
curl -i -X POST http://localhost:8001/messages \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer TOKEN' \
  -d '{"discussionId":"64cfe0000000000000000000","content":"Hello"}'
```

List messages:
```bash
curl -i -X GET 'http://localhost:8001/messages?discussionId=64cfe0000000000000000000' \
  -H 'Authorization: Bearer TOKEN'
```

## Quick test checklist
- GET /health/db
- POST /auth/register
- POST /auth/login => recover token
- POST /messages (Bearer token)
- GET /messages?discussionId=xxx (Bearer token)
- PUT /messages/{id} (author)
- DELETE /messages/{id} (author)
