# MY_MICRO_SERVICES

Projet réalisé dans le cadre de ma formation **Web@cadémie by Epitech** (projet solo de 1 mois en décembre 2025).
Objectif : mettre en place une architecture **micro-services** autour d’une application de messagerie, en séparant clairement les responsabilités (SQL / NoSQL) et en ajoutant une API de **connexion/orchestration**.

Un **frontend React** a été ajouté en bonus pour rendre les tests plus concrets (et éviter de tout faire via Postman).

---

## Objectifs pédagogiques

- Comprendre et mettre en place une architecture **micro-services**
- Manipuler **2 types de bases de données** :
  - SQL (MySQL) pour la gestion des utilisateurs + messages
  - NoSQL (MongoDB) pour la gestion des discussions
- Mettre en place une authentification **JWT**
- Créer une **API connecteur (gateway)** qui orchestre les appels entre services et agrège les données
- Produire un système testable facilement en local ou via Docker

---

## Architecture

Le projet est composé de **3 APIs** + un frontend :

- **API #1 (PHP + MySQL)**
  Gestion des **users** + **messages** + authentification **JWT**.

- **API #2 (Node.js + MongoDB)**
  Gestion des **discussions** (CRUD). Les participants sont stockés sous forme de `userIds` (ids SQL).

- **API #3 (PHP – Connecteur / Gateway)**
  Expose les routes `/chat/*`, appelle API #1 et API #2, et renvoie une réponse agrégée (ex: discussion + messages).

- **Frontend (React + Vite) – Bonus**
  UI moderne (dark/light), responsive, qui consomme l’API #3.
  Inclut une **console admin** pour tester également certaines routes des APIs #1 et #2 plus facilement.

---

## Ports (par défaut)

### Docker
- API #1: http://localhost:8001
- API #2: http://localhost:8002
- API #3: http://localhost:8004
- Frontend: http://localhost:5173

### Local (sans Docker)
- API #1: http://localhost:8001
- API #2: http://localhost:8002
- API #3: http://localhost:8000
- Frontend: http://localhost:5173

> En local, pense à mettre `VITE_API_BASE_URL` sur `http://localhost:8000`.
> En Docker, sur `http://localhost:8004`.

## Démarrage rapide (Docker – recommandé)

1) Copier le fichier d’environnement racine
```bash
cp .env.example .env
```

2) Lancer tous les services
```bash
docker compose up --build
```

## Démarrage local (sans Docker)

### API #1
```bash
cd api-1-php
composer install
cp .env.example .env
# Adapter DB_USER / DB_PASS / JWT_SECRET
php -S 127.0.0.1:8001 -t public
```

### API #2
```bash
cd api_discussions_node
npm install
cp .env.example .env
npm run dev
```

### API #3
```bash
cd api_connector
composer install
cp .env.example .env
# Mettre le meme JWT_SECRET que l'API #1
php -S 127.0.0.1:8000 -t public
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env
# VITE_API_BASE_URL doit pointer vers l'API #3
npm run dev
```

## Test end-to-end rapide
1) Register via API #3: `POST /chat/register`
2) Login via API #3: `POST /chat/login`
3) Create discussion via API #3: `POST /chat/discussions`
4) Post message via API #3: `POST /chat/discussions/:id/messages`
5) Get aggregation: `GET /chat/discussions/:id`

## Checklist release (GitHub)
- [ ] `docker compose up --build` fonctionne sans erreur
- [ ] `http://localhost:8004/health` => ok
- [ ] `http://localhost:8004/health/services` => ok
- [ ] `http://localhost:5173` => front OK
- [ ] Register/Login via le front OK
- [ ] Création discussion + message + agrégation OK
- [ ] Aucun `.env` commité

## Notes
- La console admin du frontend permet de tester toutes les routes API #1 et #2.
- Les fichiers `.env` ne doivent pas etre commités.
