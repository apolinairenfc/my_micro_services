# Frontend (React + TypeScript + Vite)

## Prerequisites
- Node.js 18+
- API #3 running on http://localhost:8000 (or update VITE_API_BASE_URL)

## Setup
```bash
cd /Users/apo/Desktop/WAC2026/microservice/W-WEB-300-PAR-3-1-microservices-31
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install
npm install tailwindcss postcss autoprefixer
npx tailwindcss init -p
npm install react-router-dom axios @tanstack/react-query react-hook-form zod @hookform/resolvers clsx
npm run dev
```

## Environment
```bash
cp .env.example .env
```

Set `VITE_API_BASE_URL` to your API #3 base URL.

Vite dev server proxies:
- `/api1` -> `http://localhost:8001` (API #1)
- `/api2` -> `http://localhost:8002` (API #2)
- `/api3` -> `http://localhost:8003` (API #3)

La console admin utilise `/api1` et `/api2` pour tester toutes les routes sans soucis CORS.

## Scripts
- `npm run dev` - start Vite dev server
- `npm run build` - build for production
- `npm run preview` - preview build
