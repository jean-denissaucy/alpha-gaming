# Frontend - Alpha-Gaming

Frontend React/Vite de l'application Alpha-Gaming.

## Table des matieres

- [Fonctionnalites](#fonctionnalites)
- [Stack technique](#stack-technique)
- [Installation](#installation)
- [Configuration](#configuration)
- [Demarrage](#demarrage)
- [Scripts npm](#scripts-npm)
- [Structure des dossiers](#structure-des-dossiers)
- [Pages et routes](#pages-et-routes)

## Fonctionnalites

- **Accueil public**: Home avec sections news gaming, tests rapides et esport
- **Chargement dynamique**: Contenu charge au montage de la page
- **Tests rapides dynamiques**: Jeux, scores et verdicts recuperes depuis l'API et MySQL
- **Mise a jour automatique**: Actualisation de la Home chaque lundi a 00h00 (cote navigateur)
- **Authentification complète**: Register, login avec JWT
- **Routes protegees**: Dashboard accessible uniquement apres connexion
- **Dashboard utilisateur**: Espace personnalise avec onglet Favoris
- **Favoris sophistiques**: 12 categories, 10 jeux par categorie
- **Navigation vers jeux**: Chaque jeu des Favoris est cliquable vers son site officiel
- **Page de presentation**: Statique et publique via `/presentation.html`

## Stack technique

- **React**: 19 (composants fonctionnels, hooks)
- **React Router**: 7 (routage client-side)
- **Vite**: 7 (bundler et dev server)
- **Tailwind CSS**: 4 (styles utilitaires)
- **ESLint**: Linting JavaScript/JSX

## Installation

Depuis le dossier frontend:

```bash
npm install
```

## Configuration

Creer un fichier `frontend/.env` a la racine du dossier frontend (optionnel):

```env
VITE_API_URL=http://localhost:5000/api
```

**Note**: Si VITE_API_URL n'est pas defini, le frontend utilise par defaut `http://localhost:5000/api`.

## Demarrage

### Mode developpement

Depuis le dossier frontend:

```bash
npm run dev
```

L'application est disponible sur `http://localhost:5173`.

### Build pour production

```bash
npm run build
```

Genere les fichiers optimises dans le dossier `dist/`.

### Apercu du build

```bash
npm run preview
```

Sert localement le build de production pour test.

## Scripts npm

| Script | Description |
|--------|-------------|
| `npm run dev` | Demarre le serveur Vite en mode developpement |
| `npm run build` | Build production optimise (dist/) |
| `npm run lint` | Lance ESLint sur le code |
| `npm run preview` | Sert localement le build de production |

## Structure des dossiers

```
src/
├── assets/              # Ressources statiques
│   └── branding/
├── components/          # Composants React reutilisables
│   ├── BackgroundAnimation.jsx
│   ├── BrandLogo.jsx
│   ├── Footer.jsx
│   ├── Header.jsx
│   └── PrivateRoute.jsx
├── contexts/            # React Contexts
│   ├── auth-context.js      # Logique du contexte auth
│   └── AuthContext.jsx      # Provider du contexte auth
├── hooks/               # Hooks personnalises
│   └── useAuth.js       # Hook pour acceder au contexte auth
├── layouts/             # Layouts (structures de page)
│   ├── AuthLayout.jsx   # Layout pour pages auth
│   └── MainLayout.jsx   # Layout principal
├── pages/               # Pages/vues
│   ├── Home.jsx
│   ├── Login.jsx
│   ├── Register.jsx
│   └── Dashboard.jsx
├── services/            # Services API
│   └── api.js           # Appels API
├── App.jsx              # Composant racine avec routing
├── main.jsx             # Point d'entree
├── index.css
└── App.css

public/                 # Fichiers statiques
├── presentation.html    # Page statique
└── presentation.css     # Styles de la presentation
```

## Pages et routes

| Route | Page | Acces | Description |
|-------|------|-------|-------------|
| `/` | Home | Public | Accueil avec news et esport |
| `/register` | Register | Public | Inscription utilisateur |
| `/login` | Login | Public | Connexion utilisateur |
| `/dashboard` | Dashboard | Protege | Tableau de bord utilisateur avec Favoris |
| `/presentation.html` | Presentation | Public | Page statique HTML |

## Notes importantes

- Les routes protegees utilisent le composant `PrivateRoute` qui verifie le JWT
- L'authentification est geree via le contexte React `AuthContext`
- Le hook `useAuth()` permet d'acceder au contexte auth dans les composants
- La mise a jour automatique de la Home chaque lundi a 00h00 est declenchee cote navigateur (pas de cron backend)
- Le backend API doit etre en cours d'execution sur `http://localhost:5000` (ou l'URL configuree)

## Deploiement production

### Configuration

Copier .env.example vers .env, puis definir:

- VITE_API_URL=https://api.votre-domaine.tld/api

### Build

```bash
npm install
npm run build
```

Les fichiers statiques sont generes dans dist/.

### Publication

- Deployer le contenu de dist/ sur votre hebergement statique
- Verifier que l'URL API configuree est accessible depuis le navigateur
- Tester login, register et dashboard apres mise en ligne

## Structure utile

- src/pages/Home.jsx: logique de chargement news, tests rapides, esport et rafraichissement hebdomadaire
- src/pages/Dashboard.jsx: profil utilisateur et favoris (categories + liens officiels)
- src/services/api.js: couche d'appel API (auth, news, tests rapides, esport)
- public/presentation.html: page de presentation statique
- public/presentation.css: styles de la page statique

## API consommee

- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/me
- GET /api/news
- GET /api/news/esport
- GET /api/news/tests-rapides?limit=9

## Notes

- Le dashboard est protege par PrivateRoute et requiert un JWT valide.
- En cas d'echec API, la Home garde un contenu de secours local.

- Fichiers de branding: `src/assets/branding/` contient les nouveaux fichiers de la marque: `logo alpha-gaming .png`, `bannier Alpha-Gaming.png`, `espace game.mp4`.
