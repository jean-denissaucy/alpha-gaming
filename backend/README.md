# Backend - Alpha Gaming

API REST Node.js/Express de l'application Alpha Gaming.

## Responsabilités

- Authentification et profils utilisateur avec JWT.
- Gestion des rôles `user` et `admin`.
- Accès MySQL aux utilisateurs, jeux, catégories et favoris.
- Exposition des actualités, notes de jeux et contenus esports.
- Synchronisation des flux RSS avec `rss-parser` et `node-cron`.

## Installation

Depuis `backend/` :

```bash
npm install
```

## Configuration

Créer `backend/.env` :

```env
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=jean-denis-saucy_alpha-gaming
JWT_SECRET=remplacer_par_un_secret_aleatoire
JWT_EXPIRES_IN=7d
CORS_ORIGINS=http://localhost:5173
```

Les secrets de production doivent rester dans les variables d'environnement et ne doivent pas être versionnés.

| Variable | Rôle |
|---|---|
| `PORT` | Port d'écoute, 5000 par défaut |
| `DB_HOST`, `DB_PORT` | Adresse et port MySQL |
| `DB_USER`, `DB_PASSWORD`, `DB_NAME` | Accès à la base |
| `JWT_SECRET` | Signature des tokens |
| `JWT_EXPIRES_IN` | Durée de validité du JWT |
| `CORS_ORIGINS` | Origines autorisées séparées par des virgules |
| `CRON_SCHEDULE` | Expression cron personnalisée, `0 4 * * *` par défaut |

## Démarrage

```bash
npm run dev
npm start
```

Le serveur écoute sur `http://localhost:5000` par défaut.

## Tests

```bash
npm test
```

Le script utilise le test runner natif de Node.js et exécute les tests présents dans `tests/`.

## Endpoints

### Authentification

- `POST /api/auth/register` : créer un compte avec `email`, `firstname`, `lastname` et `password`.
- `POST /api/auth/login` : obtenir un JWT.
- `GET /api/auth/me` : récupérer le profil courant et ses favoris avec `Authorization: Bearer <token>`.

### Contenus

- `GET /api/news` : actualités gaming.
- `GET /api/news/esport` : contenus esports.
- `GET /api/news/notes` : notes de jeux.
- `GET /api/news/tests` : compatibilité de lecture des tests.
- `GET /api/games` : catalogue des jeux et catégories.

### Favoris

- `GET /api/users/favorites` : favoris de l'utilisateur connecté.
- `POST /api/users/favorites/:gameId` : ajouter un jeu.
- `DELETE /api/users/favorites/:gameId` : retirer un jeu.

### Administration

Les routes `/api/admin/*` nécessitent un JWT et un rôle administrateur, ou une adresse présente dans `ADMIN_EMAILS`.

### Diagnostic

- `GET /` : état de l'API.
- `GET /health/db` : vérification de la connexion MySQL.

## Structure

```text
backend/
├── config/db.js             # Pool et connexion MySQL
├── controllers/             # Logique métier
├── jobs/news.cron.js        # Synchronisation RSS
├── middlewares/             # Authentification et administration
├── models/                  # Accès aux données
├── queries/                 # Requêtes SQL centralisées
├── routes/                  # Routes REST
├── tests/                   # Tests Node.js
└── server.js                # Point d'entrée Express
```