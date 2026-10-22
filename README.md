# Alpha Gaming

Alpha Gaming est une application web full-stack consacrée aux actualités gaming, aux notes de jeux et à l'esport. Le projet associe un frontend React/Vite, une API Node.js/Express et une base MySQL.

## Fonctionnalités

- Actualités gaming, notes de jeux et contenus esports.
- Catalogue de jeux classés par catégories.
- Inscription et connexion avec JWT et bcrypt.
- Affichage ou masquage du mot de passe dans les formulaires d'authentification.
- Dashboard et profil protégés.
- Favoris persistants par utilisateur.
- Espace administrateur protégé par rôle.
- Synchronisation RSS quotidienne à 04:00 hors environnement Vercel.
- En-têtes HTTP de sécurité et politique CSP au déploiement Vercel.

## Stack

- **Frontend** : React 19, React Router 7, Vite 7, Tailwind CSS 4, Lucide React
- **Backend** : Node.js, Express 5, MySQL 8, JWT, bcrypt, rss-parser, node-cron
- **Qualité** : ESLint et test runner natif Node.js
- **Production** : Vercel pour le frontend, proxy serverless vers Render pour l'API

## Structure

```text
.
├── backend/          # API Express, modèles, routes, jobs et tests
├── frontend/         # Application React et proxy Vercel
├── dossier-exam/     # Documentation technique et présentation
├── init.sql           # Schéma MySQL et 11 catégories initiales
└── package.json       # Scripts de développement
```

## Prérequis

- Node.js 18 ou supérieur
- npm 9 ou supérieur
- MySQL 8 ou supérieur

## Installation

```bash
npm install
npm --prefix backend install
npm --prefix frontend install
mysql -u root -p < init.sql
```

Créer `backend/.env` à partir de vos paramètres locaux :

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
ADMIN_EMAILS=admin@example.com
CORS_ORIGINS=http://localhost:5173
```

`ADMIN_EMAILS` est une liste d'adresses séparées par des virgules. Ces adresses
obtiennent le rôle administrateur après authentification, en complément des utilisateurs
dont le rôle est `admin` en base de données.

Ne jamais publier les valeurs réelles de `DB_PASSWORD`, `JWT_SECRET` ou des autres variables sensibles.

## Démarrage

```bash
npm run dev
```

Frontend : `http://localhost:5173`
Backend : `http://localhost:5000` par défaut.

Commandes séparées :

```bash
npm run dev:backend
npm run dev:frontend
npm run build
npm run start:backend
```

## Tests et qualité

```bash
npm --prefix backend test
npm --prefix frontend run lint
npm run build
```

Les tests backend couvrent notamment la validation des inscriptions et changements de mot de passe,
la normalisation des favoris, le format des réponses API et la sécurisation des limites de pagination.

## API principale

```text
GET    /health/db
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me                         JWT
GET    /api/news
GET    /api/news/esport
GET    /api/news/notes
GET    /api/news/tests
GET    /api/games
GET    /api/users/favorites                 JWT
POST   /api/users/favorites/:gameId        JWT
DELETE /api/users/favorites/:gameId        JWT
GET    /api/admin/*                         JWT + rôle admin
```

Les routes protégées utilisent l'en-tête HTTP suivant :

```http
Authorization: Bearer [JWT]
```

Le middleware d'authentification vérifie la signature et l'expiration du JWT, exige un
identifiant utilisateur dans le token, puis recharge l'utilisateur depuis MySQL avant
de laisser la requête continuer. Un utilisateur supprimé ou un token invalide est refusé.

## Déploiement

Le frontend se déploie sur Vercel. La fonction `frontend/api/[...path].js` relaie les requêtes vers Render.
Définir `BACKEND_API_URL` dans Vercel avec l'URL publique de l'API et configurer les variables MySQL,
JWT et CORS dans Render.

Les fichiers `vercel.json` configurent une politique de sécurité du contenu (CSP) ainsi que les en-têtes
`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy` et `Permissions-Policy`.
La CSP autorise uniquement les ressources nécessaires au frontend : scripts locaux, Google Fonts,
images et médias HTTPS, ainsi que l'API Render.

Consulter [dossier-exam/INSTALLATION.md](dossier-exam/INSTALLATION.md), [dossier-exam/ARCHITECTURE.md](dossier-exam/ARCHITECTURE.md) et [dossier-exam/DEPLOYMENT.md](dossier-exam/DEPLOYMENT.md) pour les détails.