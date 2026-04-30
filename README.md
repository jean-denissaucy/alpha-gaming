# Alpha Gaming

Alpha Gaming est une application full-stack d'actualites gaming et esport.
Le projet combine un frontend React/Vite, un backend Node.js/Express et une base MySQL initialisee via init.sql.

## Table des matieres

- [Fonctionnalites](#fonctionnalites)
- [Stack technique](#stack-technique)
- [Structure du projet](#structure-du-projet)
- [Prerequis](#prerequis)
- [Installation](#installation)
- [Configuration](#configuration)
- [Demarrage](#demarrage)
- [Scripts disponibles](#scripts-disponibles)
- [Deploiement](#deploiement)
- [API principale](#api-principale)
- [Depannage](#depannage)

## Fonctionnalites

- **Accueil public**: News gaming et bloc esport avec contenu dynamique
- **Rafraichissement planifie**: Mise a jour de la Home chaque lundi a 00h00 (declenchee cote navigateur)
- **Authentification JWT**: Register, login, profil utilisateur courant
- **Dashboard protege**: Accessible apres connexion utilisateur
- **Favoris personnalises**: 12 categories et 10 jeux par categorie
- **Navigation vers les jeux**: Chaque jeu des Favoris ouvre son site officiel au clic
- **Page de presentation**: Accessible via `/presentation.html`

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

## Configuration

### Backend

Creer un fichier `backend/.env`:

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

### Frontend

Creer un fichier `frontend/.env.local` (optionnel, utilise `http://localhost:5000/api` par defaut):

```env
VITE_API_URL=http://localhost:5000/api
```

## Demarrage

### Mode developpement (backend + frontend simultanement)

Depuis la racine du projet:

```bash
npm run dev
```

Cela lance:
- **Backend** sur `http://localhost:5000`
- **Frontend** sur `http://localhost:5173`

### Modes alternatifs

```bash
# Backend seul (lancer d'abord init.sql)
npm run dev:backend

# Frontend seul (require backend en execution)
npm run dev:frontend

# Build frontend pour production
npm run build

# Lancer backend en production
npm run start:backend
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
| `npm run dev` | Dev server Node.js avec nodemon |
| `npm run start` | Prod server Node.js |

## Deploiement

Cette section documente un deploiement classique (frontend statique + backend Node.js + MySQL).

### Etapes

1. **Preparer le serveur**
   - Installer Node.js 20+ et npm 10+
   - Installer MySQL 8+
   - Ouvrir les ports 80/443 et 5000 (interne)

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

## API principale

| Route | Methode | Description |
|-------|---------|-------------|
| `/` | GET | Status serveur |
| `/api/auth/register` | POST | Enregistrement (email, password, firstname, lastname) |
| `/api/auth/login` | POST | Connexion (email, password) → token JWT |
| `/api/auth/me` | GET | Profil courant (require Authorization header) |
| `/api/news` | GET | Toutes les news gaming |
| `/api/news/esport` | GET | Evenements esport en direct |

## Depannage

| Probleme | Solution |
|----------|----------|
| "Unknown database" au demarrage | Verifier DB_NAME dans backend/.env, relancer `init.sql` |
| Erreur CORS | Verifier CORS_ORIGINS dans backend/.env |
| Port 5000 deja occupe | Changer `PORT=5001` dans backend/.env |
| JWT non accepte | Verifier `JWT_SECRET` identique partout, re-login |
| Favoris/Tests/Live vides | Verifier seed dans init.sql, relancer `mysql -u root < init.sql` |
| Frontend ne se connecte pas au backend | Verifier VITE_API_URL pointe sur le bon port/host |

---

**Last Updated**: Avril 2026
**Version**: 1.0.0
