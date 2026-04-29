# Alpha Gaming

Alpha Gaming est une application full-stack d'actualites gaming et esport.
Le projet combine un frontend React/Vite, un backend Node.js/Express et une base MySQL initialisee via init.sql.

## Table des matieres

- [Fonctionnalites](#fonctionnalites)
- [Stack technique](#stack-technique)
- [Structure du projet](#structure-du-projet)
- [Prerequis](#prerequis)
- [Installation](#installation)
- [Demarrage](#demarrage)
- [Configuration](#configuration)

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
DB_NAME=starter_kit
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d
CORS_ORIGINS=http://localhost:5173
```

### Frontend

Creer un fichier `frontend/.env` (optionnel):

```env
VITE_API_URL=http://localhost:5000/api
```

## Demarrage

### Mode developpement (backend + frontend)

Depuis la racine du projet:

```bash
npm run dev
```

Cela lance simultanement:
- Backend sur `http://localhost:5000`
- Frontend sur `http://localhost:5173`

### Modes alternatifs

```bash
# Backend seul
npm run dev:backend

# Frontend seul
npm run dev:frontend

# Build frontend pour production
npm run build

# Lancer backend en production
npm run start:backend
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

Creer frontend/.env (optionnel):

```env
VITE_API_URL=http://localhost:5000/api
```

## Lancement

Depuis la racine:

```bash
npm run dev
```

Ou separement:

```bash
npm run dev:backend
npm run dev:frontend
```

Par defaut:

- Backend: http://localhost:5000
- Frontend: http://localhost:5173

## Scripts

Racine:

- npm run dev
- npm run dev:backend
- npm run dev:frontend
- npm run build
- npm run start:backend

Frontend:

- npm run dev
- npm run build
- npm run lint
- npm run preview

Backend:

- npm run dev
- npm run start

## Deploiement (production)

Cette section documente un deploiement classique avec frontend statique + backend Node.js + MySQL.

### 1) Preparer le serveur

- Installer Node.js 20+
- Installer MySQL 8+
- Ouvrir les ports necessaires (ex: 80/443)

### 2) Configurer la base de donnees

- Creer la base et les tables:
  - mysql -u <user> -p < init.sql
- Verifier la presence de la table users

### 3) Configurer le backend

- Copier backend/.env.example vers backend/.env
- Renseigner les variables de production:
  - DB_HOST
  - DB_USER
  - DB_PASSWORD
  - DB_NAME
  - JWT_SECRET (fort et unique)
  - JWT_EXPIRES_IN
  - CORS_ORIGINS (URL frontend de production)

### 4) Configurer le frontend

- Copier frontend/.env.example vers frontend/.env
- Renseigner VITE_API_URL avec l'URL API publique (ex: https://api.example.com/api)

### 5) Build et lancement

- Installer les dependances:
  - npm install
  - npm --prefix backend install
  - npm --prefix frontend install
- Build frontend:
  - npm run build
- Lancer le backend en mode production:
  - npm run start:backend

### 6) Verification post-deploiement

- Verifier l'API:
  - GET / doit repondre status online
  - GET /api/news doit renvoyer des items
- Verifier le frontend:
  - la home charge
  - login/register fonctionnent
  - dashboard est protege

### 7) Rollback minimal

- Garder une copie du dernier build frontend valide
- Garder une sauvegarde SQL avant migration
- En cas d'erreur, restaurer le build precedent et la sauvegarde SQL

## API principale

- GET /
- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/me
- GET /api/news
- GET /api/news/esport

## Depannage

- Erreur serveur au register/login:
  - verifier JWT_SECRET et JWT_EXPIRES_IN dans backend/.env
  - verifier le schema users (firstname, lastname)
- Erreur CORS:
  - verifier CORS_ORIGINS
- Unknown database:
  - verifier DB_NAME et relancer init.sql
- Port backend occupe:
  - changer PORT ou liberer le port
