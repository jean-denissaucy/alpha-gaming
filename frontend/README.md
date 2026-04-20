# Frontend - Actu Gaming

Frontend React/Vite de l'application Actu Gaming.

## Fonctionnalites

- Home publique avec sections news et esport.
- Chargement initial des contenus au montage de la page.
- Mise a jour automatique de la Home chaque lundi a 00h00 (news + esport).
- Authentification (register/login) et routes protegees.
- Dashboard utilisateur avec onglet Favoris.
- Favoris: 12 categories, 10 jeux par categorie.
- Chaque jeu des Favoris est cliquable vers son site officiel.
- Page statique de presentation disponible sur /presentation.html.

## Stack

- React 19
- React Router 7
- Vite 7
- Tailwind CSS 4

## Demarrage local

Depuis le dossier frontend:

```bash
npm install
npm run dev
```

Application disponible sur http://localhost:5173.

## Configuration

Creer frontend/.env (optionnel):

```env
VITE_API_URL=http://localhost:5000/api
```

Si VITE_API_URL n'est pas defini, le frontend utilise http://localhost:5000/api.

## Scripts

- npm run dev: demarre Vite
- npm run build: build production
- npm run lint: lance ESLint
- npm run preview: sert le build localement

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

- src/pages/Home.jsx: logique de chargement news/esport et rafraichissement hebdomadaire
- src/pages/Dashboard.jsx: profil utilisateur et favoris (categories + liens officiels)
- src/services/api.js: couche d'appel API (auth, news, esport)
- public/presentation.html: page de presentation statique
- public/presentation.css: styles de la page statique

## API consommee

- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/me
- GET /api/news
- GET /api/news/esport

## Notes

- Le dashboard est protege par PrivateRoute et requiert un JWT valide.
- En cas d'echec API, la Home garde un contenu de secours local.
