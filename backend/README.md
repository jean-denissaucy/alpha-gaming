# Backend - Alpha Gaming

API REST Node.js/Express pour l'application Alpha Gaming.

## Table des matieres

- [Role](#role)
- [Stack](#stack)
- [Installation](#installation)
- [Configuration](#configuration)
- [Demarrage](#demarrage)
- [Endpoints API](#endpoints-api)
- [Structure](#structure)

## Role

- Authentification utilisateur avec JWT
- Exposition des endpoints de news gaming, tests rapides et esport
- Connexion MySQL pour gestion des utilisateurs
- Lecture des tests rapides depuis la table MySQL `tests_rapides`
- Gestion CORS avec liste d'origines autorisees
- Service RSS pour recuperer les actualites

## Stack

- **Node.js**: Runtime JavaScript
- **Express 5**: Framework web
- **MySQL 8**: Base de donnees (mysql2)
- **jsonwebtoken**: Gestion JWT
- **bcrypt**: Hachage des mots de passe
- **rss-parser**: Parsing des flux RSS
- **dotenv**: Gestion des variables d'environnement
- **cors**: Gestion des requetes cross-origin

## Installation

Depuis le dossier backend:

```bash
npm install
```

## Configuration

Creer un fichier `backend/.env` a la racine du dossier backend:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=alpha-gaming
# Alternative pour Render : MYSQL_URL=mysql://user:password@host:3306/alpha-gaming
# DB_SSL=true si la base distante exige TLS
JWT_SECRET=your-secret-key-here-min-32-chars
JWT_EXPIRES_IN=7d
CORS_ORIGINS=http://localhost:5173
```

### Parametre de configuration

| Param | Type | Description |
|-------|------|-------------|
| PORT | number | Port d'ecoute du serveur (defaut: 5000) |
| DB_HOST | string | Hote MySQL (defaut: localhost) |
| DB_PORT | number | Port MySQL (defaut: 3306) |
| DB_USER | string | Utilisateur MySQL (defaut: root) |
| DB_PASSWORD | string | Mot de passe MySQL (defaut: vide) |
| DB_NAME | string | Nom de la base de donnees |
| JWT_SECRET | string | Cle secrete JWT (min 32 caracteres pour prod) |
| JWT_EXPIRES_IN | string | Duree de validite du token (ex: 7d, 24h) |
| CORS_ORIGINS | string | Origines autorisees (separees par des virgules) |
| MYSQL_URL | string | URL complete MySQL, prioritaire sur les variables DB_* |
| DB_SSL | boolean | Active TLS avec `true` pour une base distante |

### Connexion Render

Render ne fournit pas de serveur MySQL gere pour ce projet. Utiliser une base MySQL externe, puis ajouter dans **Render > Service backend > Environment** :

```env
MYSQL_URL=mysql://utilisateur:mot_de_passe@hote:3306/alpha-gaming
DB_SSL=true
JWT_SECRET=une-cle-secrete-longue
JWT_EXPIRES_IN=7d
CORS_ORIGINS=https://votre-frontend.vercel.app
```

Executer ensuite `init.sql` sur cette base distante. Le service Render doit utiliser `backend` comme Root Directory, `npm install` comme Build Command et `npm start` comme Start Command.

## Demarrage

### Mode developpement

```bash
npm run dev
```
 
Le serveur redemarrera automatiquement a chaque changement (watch mode).

### Mode production

```bash
npm start
```

### Tests

```bash
npm test
```

Le serveur demarre sur `http://localhost:5000` (ou le PORT configure).

## Endpoints API

### Authentification

- **POST** `/api/auth/register` - Creer un compte utilisateur
- **POST** `/api/auth/login` - Se connecter (retourne JWT)
- **GET** `/api/auth/me` - Recuperer le profil courant (JWT requis)

### News

- **GET** `/api/news` - Recuperer les actualites gaming
- **GET** `/api/news/esport` - Recuperer les actualites esport
- **GET** `/api/news/tests-rapides?limit=9` - Recuperer les tests rapides depuis MySQL (limite de 1 a 20)

## Structure

```
backend/
├── config/
│   └── db.js             # Configuration et pool MySQL
├── controllers/
│   ├── auth.controller.js    # Logique authentification
│   └── news.controller.js    # Logique news
├── middlewares/
│   └── auth.middleware.js    # Verification JWT
├── models/
│   └── user.model.js         # Modele utilisateur
├── routes/
│   ├── auth.routes.js        # Routes /api/auth
│   └── news.routes.js        # Routes /api/news
├── db.js                 # Connexion MySQL
├── server.js             # Point d'entree
├── .env                  # Variables d'environnement (a creer)
├── package.json
└── README.md
```

## Notes importantes

- La base de donnees doit etre initialisee via `init.sql` a la racine du projet (base par defaut creee: `alpha-gaming`)
- Les tokens JWT sont valides pendant la duree specifiee par `JWT_EXPIRES_IN`
- CORS_ORIGINS accepte plusieurs origines separees par des virgules
- JWT_SECRET doit etre une chaine longue et aleatoire en production

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
- GET /api/news/tests-rapides: tests rapides dynamiques depuis MySQL

## Structure utile

- server.js: bootstrap Express, CORS, routes
- config/db.js: connexion MySQL
- controllers/auth.controller.js: logique register/login/me
- controllers/news.controller.js: logique flux RSS et lecture des tests rapides
- routes/auth.routes.js: routes auth
- routes/news.routes.js: routes news
- middlewares/auth.middleware.js: validation JWT

## Depannage rapide

- Erreur CORS: verifier CORS_ORIGINS
- Erreur auth register/login: verifier JWT_SECRET et schema users
- Erreur DB Unknown database: verifier DB_NAME et reexecuter init.sql
- Tests rapides absents: verifier que la table `tests_rapides` est initialisee avec `init.sql`