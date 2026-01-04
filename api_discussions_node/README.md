# API #2 Discussions (Node.js + Express + MongoDB)

## Prerequisites
- Node.js 18+
- MongoDB (local)

## Project creation (commands)
```bash
mkdir api_discussions_node && cd api_discussions_node
npm init -y
npm install --save express body-parser mongoose dotenv cors
npm install --save-dev nodemon
```

## Environment setup
```bash
cp .env.example .env
```

Edit `.env` if needed.

## Run the API
```bash
npm run dev
```

Base URL: `http://localhost:8002`

## cURL examples
Create discussion:
```bash
curl -i -X POST http://localhost:8002/discussions \
  -H 'Content-Type: application/json' \
  -d '{"title":"Discussion A","userIds":[1,2,3]}'
```

List discussions:
```bash
curl -i http://localhost:8002/discussions
```

Filter by userId:
```bash
curl -i 'http://localhost:8002/discussions?userId=2&limit=10&offset=0'
```

Get by id:
```bash
curl -i http://localhost:8002/discussions/REPLACE_ID
```

Update:
```bash
curl -i -X PUT http://localhost:8002/discussions/REPLACE_ID \
  -H 'Content-Type: application/json' \
  -d '{"title":"New title","userIds":[1,2]}'
```

Delete:
```bash
curl -i -X DELETE http://localhost:8002/discussions/REPLACE_ID
```

Health DB:
```bash
curl -i http://localhost:8002/health/db
```
