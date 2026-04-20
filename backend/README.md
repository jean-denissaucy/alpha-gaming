# Backend - Actu Gaming

API Node.js/Express pour Actu Gaming.

## Role du backend

- Authentification utilisateur avec JWT
- Exposition des endpoints de news gaming et esport
- Connexion MySQL pour utilisateurs et fallback local
- Gestion CORS avec liste d'origines autorisees

## Stack

- Node.js
- Express 5
- MySQL 8 (mysql2)
- jsonwebtoken
- bcrypt
- rss-parser
- dotenv

## Installation

Depuis le dossier backend:

```bash
npm install
```

## Configuration

Creer backend/.env:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=starter_kit
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
CORS_ORIGINS=http://localhost:5173
```

Notes:

- CORS_ORIGINS accepte plusieurs origines separees par des virgules.
- JWT_SECRET doit etre defini en environnement de dev/prod.

## Lancement

```bash
npm run dev
```

API disponible par defaut sur http://localhost:5000.

## Deploiement production

### Variables d'environnement

Copier .env.example vers .env, puis definir:

- PORT
- DB_HOST
- DB_USER
- DB_PASSWORD
- DB_NAME
- JWT_SECRET
- JWT_EXPIRES_IN
- CORS_ORIGINS

### Demarrage production

```bash
npm install
npm run start
```

### Recommandations exploitation

- Utiliser un reverse proxy (Nginx/Apache) devant Node
- Forcer HTTPS
- Restreindre CORS_ORIGINS a l'URL frontend de production
- Sauvegarder la base MySQL regulierement

## Endpoints

- GET /: etat API
- POST /api/auth/register: creation de compte
- POST /api/auth/login: connexion
- GET /api/auth/me: profil utilisateur (token requis)
- GET /api/news: actualites gaming
- GET /api/news/esport: actualites/matchs esport

## Structure utile

- server.js: bootstrap Express, CORS, routes
- config/db.js: connexion MySQL
- controllers/auth.controller.js: logique register/login/me
- controllers/news.controller.js: logique flux RSS + fallback
- routes/auth.routes.js: routes auth
- routes/news.routes.js: routes news
- middlewares/auth.middleware.js: validation JWT

## Depannage rapide

- Erreur CORS: verifier CORS_ORIGINS
- Erreur auth register/login: verifier JWT_SECRET et schema users
- Erreur DB Unknown database: verifier DB_NAME et reexecuter init.sql
