# Frontend - Alpha Gaming

Application React/Vite d'Alpha Gaming.

## Fonctionnalités

- Pages publiques : accueil, actualités, jeux, esports et tests.
- Inscription et connexion avec contexte d'authentification.
- Routes protégées avec `PrivateRoute`.
- Dashboard, profil et favoris persistants.
- Interface responsive avec Tailwind CSS et Lucide React.
- Appels JSON avec `fetch` via `src/services/api.js`.

## Installation

Depuis `frontend/` :

```bash
npm install
```

En local, le service API utilise par défaut `http://localhost:5000/api`. Pour le remplacer, créer `frontend/.env.local` :

```env
VITE_API_URL=http://localhost:5000/api
```

## Commandes

```bash
npm run dev
npm run build
npm run preview
npm run lint
```

Le serveur Vite est disponible sur `http://localhost:5173` par défaut. Le build est généré dans `dist/`.

## Pages et routes

| Route | Accès | Page |
|---|---|---|
| `/` | Public | Accueil |
| `/news` | Public | Actualités |
| `/games` | Public | Catalogue de jeux |
| `/esport` | Public | Esport |
| `/tests` | Public | Notes et tests |
| `/register` | Public | Inscription |
| `/login` | Public | Connexion |
| `/dashboard` | Protégé | Tableau de bord |
| `/profile` | Protégé | Profil |
| `/admin` | Protégé + admin | Administration |

## Structure

```text
src/
├── assets/branding/          # Ressources de marque
├── components/               # Header, footer, logo et routes privées
├── contexts/                 # Contexte d'authentification
├── hooks/                    # Hooks personnalisés
├── layouts/                  # Layouts principal et authentification
├── pages/                    # Vues de l'application
├── services/api.js           # Accès à l'API
├── App.jsx                   # Déclaration des routes
└── main.jsx                  # Point d'entrée React
```

## API consommée

```text
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me
GET    /api/news
GET    /api/news/esport
GET    /api/news/notes
GET    /api/news/tests
GET    /api/games
GET    /api/users/favorites
POST   /api/users/favorites/:gameId
DELETE /api/users/favorites/:gameId
```

Les appels privés transmettent le JWT dans l'en-tête `Authorization`. En production, le proxy `api/[...path].js` relaie `/api/*` vers le backend Render; sa cible est configurée avec `BACKEND_API_URL`.

## Déploiement

Le projet est configuré pour Vercel avec `vercel.json`, `outputDirectory: dist` et le proxy serverless dans `api/`. Définir `BACKEND_API_URL` dans l'environnement Vercel avant le déploiement.