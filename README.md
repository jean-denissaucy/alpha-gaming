# Alpha Gaming

Alpha Gaming est une application web full-stack consacree aux actualites gaming, aux tests rapides et a l'esport.
Le projet combine une interface React/Vite, une API Node.js/Express et une base MySQL initialisee via `init.sql`.
Les visiteurs peuvent consulter les contenus publics; les utilisateurs inscrits disposent egalement d'un espace personnel protege.

## Table des matieres

- [Fonctionnalites](#fonctionnalites)
- [Stack technique](#stack-technique)
- [Structure du projet](#structure-du-projet)
- [Prerequis](#prerequis)
- [Installation](#installation)
- [Configuration](#configuration)
- [Demarrage](#demarrage)
- [Utilisation rapide](#utilisation-rapide)
- [Scripts disponibles](#scripts-disponibles)
- [Tests](#tests)
- [Deploiement](#deploiement)
- [API principale](#api-principale)
- [Depannage](#depannage)

## Fonctionnalites

- **Accueil public**: Actualites gaming, tests rapides et evenements esport
- **Tests rapides dynamiques**: Fiches de jeux, scores et verdicts charges depuis MySQL (`tests_rapides`), avec donnees de secours pour la route Vercel
- **Rafraichissement planifie**: Mise a jour de la Home chaque lundi a 00h00 cote navigateur
- **Authentification JWT**: Register, login et profil utilisateur courant
- **Dashboard protege**: Accessible apres connexion utilisateur
- **Favoris relies aux utilisateurs**: Catalogue `favorite_games` + liaison `user_favorite_games`
- **Fallback intelligent des favoris**: Si un utilisateur n'a pas encore de selection, le dashboard affiche tout le catalogue
- **Filtre par categorie dans le dashboard**: Volet deroulant avec scroll vertical pour parcourir les categories
- **Navigation vers les jeux**: Chaque jeu des Favoris ouvre son site officiel au clic
- **Page de presentation**: Accessible via `/presentation.html`
- **Interface responsive**: Consultation adaptee au desktop et au mobile

## Stack technique

- **Frontend**: React 19, React Router 7, Vite 7, Tailwind CSS 4
- **Backend**: Node.js, Express 5, MySQL 8, JWT (jsonwebtoken), bcrypt, rss-parser
- **Outillage**: npm, concurrently, ESLint

## Structure du projet

```
.
├── backend/                 # API Node.js/Express
│   ├── config/             # Configuration MySQL
│   ├── controllers/        # Logique metier (auth, news)
│   ├── middlewares/        # Middlewares Express (JWT, CORS)
│   ├── models/             # Modeles de donnees
│   ├── routes/             # Routes API
│   ├── server.js          # Point d'entree
│   ├── db.js              # Connexion BD
│   └── package.json
│
├── frontend/               # Application React
│   ├── src/
│   │   ├── components/    # Composants React
│   │   ├── contexts/      # React Contexts (auth)
│   │   ├── hooks/         # Hooks personnalises
│   │   ├── layouts/       # Layouts (Auth, Main)
│   │   ├── pages/         # Pages (Home, Login, Dashboard)
│   │   ├── services/      # Services API
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── public/
│   │   ├── presentation.html
│   │   └── presentation.css
│   ├── vite.config.js
│   └── package.json
│
├── init.sql               # Schema et seed MySQL
├── package.json           # Scripts root (concurrently)
└── README.md
```

## Prerequis

- **Node.js**: 20+ (avec npm 10+)
- **MySQL**: 8+ (ou compatible)
- **Gestionnaire de paquets**: npm
- **Navigateur moderne**: pour tester l'interface React

## Installation

### 1. Cloner/acceder au projet

```bash
cd c:\laragon\www\Alpha Gaming
```

### 2. Installer les dependances

```bash
npm install
npm --prefix backend install
npm --prefix frontend install
```

### 3. Initialiser la base de donnees

```bash
mysql -u root < init.sql
```

Sous PowerShell, utiliser plutot:

```powershell
Get-Content .\init.sql -Raw | mysql -u root
```

## Configuration

### Backend

Creer un fichier `backend/.env` :

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=alpha-gaming
JWT_SECRET=your-secret-key-here-change-in-production
JWT_EXPIRES_IN=7d
CORS_ORIGINS=http://localhost:5173
```

Le backend ecoute par defaut sur le port 5000 en local. L'API est ensuite exposee sous `/api`.


### Frontend

Creer un fichier `frontend/.env.local` (optionnel). En local, l'URL par defaut est `http://localhost:5000/api`; en production, le frontend utilise `/api` si aucune valeur n'est fournie.

```env
VITE_API_URL=http://localhost:5000/api
```

## Demarrage

### Mode developpement (backend + frontend simultanement)

Depuis la racine du projet :

```bash
npm run dev
```

Cela lance :
- **Backend** sur `http://localhost:5000`
- **Frontend** sur `http://localhost:5173`

### Modes alternatifs

```bash
# Backend seul (lancer d'abord init.sql)
npm run dev:backend

# Frontend seul (requiert le backend en execution)
npm run dev:frontend

# Build frontend pour production
npm run build

# Lancer backend en production
npm run start:backend
```

## Utilisation rapide

1. Installer les dependances avec `npm install`, puis dans `backend/` et `frontend/`.
2. Importer la base avec `mysql -u root < init.sql` (ou `Get-Content .\init.sql -Raw | mysql -u root` sous PowerShell).
3. Creer `backend/.env` et, si besoin, `frontend/.env.local`.
4. Lancer le projet avec `npm run dev`.
5. Ouvrir `http://localhost:5173`.
6. Creer un compte depuis `/register`, puis se connecter pour acceder au dashboard.

Pour verifier rapidement que l'API repond :

```bash
curl http://localhost:5000/
curl http://localhost:5000/api/news
```

## Scripts disponibles

### Racine du projet

| Script | Description |
|--------|-------------|
| `npm run dev` | Lance backend + frontend en mode dev |
| `npm run dev:backend` | Lance backend seul en dev |
| `npm run dev:frontend` | Lance frontend seul en dev |
| `npm run build` | Build frontend pour production |
| `npm run start:backend` | Lance backend en mode production |

### Frontend (`npm run` depuis `frontend/`)

| Script | Description |
|--------|-------------|
| `npm run dev` | Dev server Vite sur port 5173 |
| `npm run build` | Build production avec Vite |
| `npm run lint` | Lint avec ESLint |
| `npm run preview` | Preview du build production |

### Backend (`npm run` depuis `backend/`)

| Script | Description |
|--------|-------------|
| `npm run dev` | Dev server Node.js avec `node --watch` |
| `npm run start` | Prod server Node.js |

## Tests

Le backend utilise le test runner natif de Node.js. Depuis `backend/` :

```bash
node --test tests/*.test.js
```

Le script `npm test` du backend est encore un placeholder et retourne volontairement une erreur; utilisez la commande ci-dessus.

## Deploiement

Cette section documente un deploiement classique pour une application web dynamique : frontend statique, backend Node.js et base MySQL.

### Etapes

1. **Preparer le serveur**
   - Installer Node.js 20+ et npm 10+
   - Installer MySQL 8+
   - Installer Nginx et, si besoin, PM2
   - Ouvrir les ports 80/443 et conserver 5000 uniquement en interne

2. **Initialiser la base de donnees**
   ```bash
   mysql -u <user> -p < init.sql
   ```

3. **Configurer backend/.env (production)**
   ```env
   PORT=5000
   DB_HOST=db-server-internal-ip
   DB_USER=prod-user
   DB_PASSWORD=prod-password-secure
   DB_NAME=alpha-gaming
   JWT_SECRET=very-long-random-secret-min-32-chars
   JWT_EXPIRES_IN=7d
   CORS_ORIGINS=https://yourdomain.com
   NODE_ENV=production
   ```

4. **Configurer frontend/.env (production)**
   ```env
   VITE_API_URL=https://yourdomain.com/api
   ```

Pour un frontend heberge sur Vercel, le proxy `frontend/api/[...path].js` relaie toutes les routes `/api/*` vers le backend persistant. Definir `BACKEND_API_URL` dans Vercel avec l'URL publique du backend sans slash final, et definir le meme `JWT_SECRET` uniquement côté backend.

5. **Installer et builder**
   ```bash
   npm install
   npm --prefix backend install
   npm --prefix frontend install
   npm run build
   ```

6. **Deployer frontend (statique)**
   - Copier `frontend/dist/` sur serveur web (Nginx, Apache)
   - Configurer rewrite: `try_files $uri $uri/ /index.html;` pour React Router

7. **Lancer backend**
   ```bash
   npm run start:backend
   ```
   Ou avec PM2:
   ```bash
   pm2 start backend/server.js --name alpha-api
   ```

8. **Verifier post-deploiement**
   - GET `https://yourdomain.com/` → Frontend charge
   - GET `https://yourdomain.com/api/news` → API repond
   - Test login → JWT fonctionne

### Points de controle

- Le frontend doit charger sans erreur.
- L'API doit repondre sur `/api`.
- La connexion utilisateur doit generer un token JWT valide.
- Les routes protegees doivent rester inaccessibles sans authentification.
- La configuration Nginx doit rediriger correctement vers le frontend et le backend.

## API principale

Toutes les reponses suivent le format `{ success, data }` pour les succes et `{ success, error, statusCode }` pour les erreurs.

| Route | Methode | Description |
|-------|---------|-------------|
| `/` | GET | Status serveur |
| `/api/auth/register` | POST | Enregistrement avec `email`, `password`, `firstname`, `lastname` |
| `/api/auth/login` | POST | Connexion avec `email`, `password`; retourne un token JWT |
| `/api/auth/me` | GET | Profil courant avec `Authorization: Bearer <token>` |
| `/api/news` | GET | Toutes les news gaming |
| `/api/news/esport` | GET | Evenements esport en direct |
| `/api/news/tests-rapides?limit=9` | GET | Tests rapides depuis MySQL, avec limite de 1 a 20 |

Exemple d'inscription PowerShell :

```powershell
Invoke-RestMethod -Method Post -Uri http://localhost:5000/api/auth/register `
   -ContentType 'application/json' `
   -Body '{"email":"joueur@example.com","password":"secret","firstname":"Alex","lastname":"Joueur"}'
```

## Depannage

| Probleme | Solution |
|----------|----------|
| "Unknown database" au demarrage | Verifier DB_NAME dans backend/.env, relancer `init.sql` |
| Erreur CORS | Verifier CORS_ORIGINS dans backend/.env |
| Port 5000 deja occupe | Changer `PORT=5001` dans backend/.env |
| JWT non accepte | Verifier `JWT_SECRET` identique partout, re-login |
| Favoris/Tests/Live vides | Verifier seed dans init.sql, relancer l'import SQL (PowerShell: `Get-Content .\init.sql -Raw | mysql -u root`) |
| Frontend ne se connecte pas au backend | Verifier VITE_API_URL pointe sur le bon port/host |

---

**Derniere mise a jour**: Aout 2026
**Version**: 1.2.0
