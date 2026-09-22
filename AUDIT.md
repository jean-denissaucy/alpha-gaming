# Audit du site Alpha Gaming

**Date :** 22 septembre 2026
**Périmètre :** backend Express/MySQL, frontend React/Vite, schéma SQL, configuration de déploiement (Vercel/Render).
**Verdict global :** application saine dans l'ensemble, build et tests verts, mais **5 vulnérabilités** et quelques dette technique à corriger en priorité.

> **Mise à jour 22/09/2026 :** les failles critiques 1, 3 et 4 sont **corrigées** (routes jeux réservées aux admins, `sanitizeLimit` + validation d'inscription avec tests unitaires — 14/14 tests verts). Les failles 2 (JWT en localStorage) et 5 (endpoints d'infrastructure) restent ouvertes, voir plan d'action.

---

## ✅ Ce qui est bien fait

- **Mots de passe** : bcrypt avec coût 10, comparaison en temps constant (`bcrypt.compare`), jamais de mot de passe renvoyé par l'API (`findById` exclut la colonne `password`).
- **Injections SQL** : toutes les requêtes passent par `pool.execute()` avec des paramètres `?` — aucune concaténation de valeurs utilisateur. (Voir nuance §3 pour `LIMIT`.)
- **Routes protégées** : favoris derrière `authMiddleware`, admin derrière `authMiddleware` + `adminMiddleware` (rôle SQL **ou** email dans `ADMIN_EMAILS`).
- **CORS** : liste blanche côté backend, origines localhost autorisées uniquement en dev ; le proxy Vercel ne reflète l'origine que si elle est dans `CORS_ORIGINS`.
- **JWT** : expiration 7 jours, secret vérifié présent au démarrage, invalidation côté client en cas de profil inaccessible.
- **Gestion d'erreurs homogène** : `buildSuccessResponse` / `buildErrorResponse`, codes HTTP cohérents (400/401/403/404/409/503).
- **Anti-doublons contenu RSS** : clés uniques SQL (`uq_news_url`, `uq_live_esport_href`) + `ON DUPLICATE KEY UPDATE` + déduplication applicative.
- **Qualité** : ESLint frontend sans erreur, 5/5 tests backend verts, build Vite OK (9.5 s).
- **Secrets** : aucun `.env` committé (`.gitignore` correct), `dist/` ignoré, proxy qui ne transmet que `Authorization` et `Content-Type`.

---

## 🔴 Vulnérabilités (à corriger en priorité)

### 1. CRITICAL — Écriture/ suppression de jeux ouverts à tout utilisateur connecté
`backend/routes/games.routes.js` :

```js
router.post('/', authMiddleware, gameController.createGame);
router.put('/:id', authMiddleware, gameController.updateGame);
router.delete('/:id', authMiddleware, gameController.deleteGame);
```

Un simple compte « user » peut créer, modifier ou supprimer n'importe quel jeu du catalogue. Le README et le design (dashboard admin) laissent entendre que c'est réservé aux admins. Le backend `admin.routes.js` expose déjà les mêmes opérations derrière `adminMiddleware` — les lignes ci-dessus sont donc soit une faille, soit un doublon inutile.

**Correctif recommandé** : supprimer ces 3 routes (ou ajouter `adminMiddleware`).

### 2. HIGH — JWT stocké dans localStorage
Le token est stocké dans `localStorage` (`frontend/src/services/api.js`, `AuthContext.jsx`) : toute XSS le vole. Avec React (pas de `dangerouslySetInnerHTML`) le risque XSS est faible aujourd'hui, mais c'est la cible classique.

**Correctif recommandé** : passer à un cookie `httpOnly` + `SameSite` (ou à défaut, garder localStorage mais réduire la durée de vie du token et ajouter une CSP stricte).

### 3. HIGH — `LIMIT` interpolé dans 3 requêtes SQL
`backend/controllers/news.controller.js` : `getNewsFromDatabase(limit)`, `getEsportFromDatabase(limit, …)`, `getLatestNotes` et `getLatestQuickTests` interpolent `LIMIT ${limit}`. Les valeurs sont plafonnées via `Math.min` en amont, donc **non exploitable en l'état**, mais fragile : tout refactore qui enlève le clamp crée une injection.

**Correctif recommandé** : `mysql2` supporte `LIMIT ?` avec `execute()` si on passe un entier — ou garder l'interpolation mais avec un `Number.parseInt` + clamp **dans la fonction SQL elle-même** (défense en profondeur).

### 4. MEDIUM — Inscription sans validation serveur des champs
`register` n'accepte que « tous les champs requis » : pas de longueur minimale du mot de passe, pas de format d'email, pas de longueur max. On peut créer `password: "a"` ou `firstname` de 10 000 caractères.

**Correctif recommandé** : valider email (regex), `password.length >= 8`, troncature des champs (la colonne est `varchar(100)` pour nom/prénom).

### 5. MEDIUM — `/health/db` et stats admin exposent l'état de l'infra
- `GET /health/db` (public) renvoie `database: connected` — mineur mais divulgue l'état d'infrastructure.
- `GET /api/admin/stats` compte les lignes `users/news/games/live_esport` sans pagination — acceptable, mais le nombre d'utilisateurs est une métrique sensible.

**Correctif recommandé** : garder `/health/db` pour le monitoring interne (Render) mais ne pas l'indexer publiquement ; éventuellement restreindre `stats` aux admins (c'est déjà le cas) — à documenter.

---

## 🟠 Points de vigilance

### Duplication de code massive
`backend/jobs/news.cron.js` copie-colle ~120 lignes de helpers RSS (`decodeEntities`, `stripHtml`, `extractImage`, `inferCategory`, `inferLeague`, `extractTeams`, `deduplicate`…) déjà présents dans `news.controller.js`. Le cron importe déjà `persistNewsItems` etc. depuis le contrôleur — il devrait aussi importer les helpers. Chaque bug doit être corrigé 2 fois.

### `syncTests` appelle un handler Express avec des mocks
`backend/jobs/news.cron.js` :

```js
const mockRes = { json: (payload) => ({ payload }), status: () => mockRes, send: () => mockRes };
await getGamekultTests(mockReq, mockRes);
```

Appeler un handler HTTP avec des objets factices est fragile (une modification du contrôleur casse le cron silencieusement). **Extraire la logique métier** (scraping + persistance) dans une fonction dédiée, appelée à la fois par la route et le cron.

### Scraping Gamekult : 430 pages à chaque visite froide
`fetchGamekultTests()` télécharge jusqu'à **430 pages** (lots de 8) avec un cache mémoire de 6 h. Sur Render free tier, la première requête après redémarrage peut prendre plusieurs minutes et risque le timeout. Le cache mémoire est perdu à chaque déploiement/restart. Envisager un cache persistant (table `notes_gaming` déjà en place — l'utiliser comme seule source et scraper uniquement dans le cron).

### Proxy Vercel : timeout 10 s
`frontend/api/[...path].js` : `AbortSignal.timeout(10000)`. Les endpoints Gamekult froids dépasseront ce délai (voir point précédent) → erreurs 502 côté site.

### Chemin `/admin` côté front protégé seulement par UI
`App.jsx` monte `<AdminDashboard />` derrière `PrivateRoute` mais **sans vérification de rôle**. Le backend refuse les appels non-admin, donc pas de fuite de données, mais un utilisateur standard qui devine l'URL voit l'interface (puis des erreurs 403). Ajouter un `AdminRoute` avec `user?.role === 'admin'` et un redirect vers `/dashboard`.

### Vidéo de 7,3 Mo dans le bundle
`frontend/src/assets/branding/espace-game.mp4` : 7,3 Mo importés par Vite. Sur mobile/4G, c'est le principal frein au LCP. Compresser (< 2 Mo), servir en `defer`/`poster`, ou héberger sur un CDN.

### `.env.local` frontend
`frontend/.env.local` existe en local (non committé ✓). Rien à signaler si `VITE_API_URL` n'y pointe pas vers la prod.

---

## 🟡 Dette technique / qualité

| Sujet | Détail |
|---|---|
| **Typo env vars** | `process.env.JTW_secret` / `JTW_EXPIRES_IN` (fallbacks) — typos de "JWT" à supprimer ou documenter. |
| **Champ `status` esport figé** | Toujours inséré à `'upcoming'`, jamais mis à jour vers `live`/`finished`. |
| **`getLatestQuickTests` jamais routé** | Le contrôleur l'exporte mais aucune route ne l'utilise (le fichier `frontend/api/news/tests-rapides.js` suggère un endpoint supprimé). |
| **`verdict` jamais alimenté** | `notes_gaming.verdict` est sélectionné mais jamais rempli par le scraping. |
| **`findAllFavoriteGames` doublon SQL** | `user.model.js` : `games.image, games.image` en double dans le SELECT, et la requête duplique `findFavoriteGamesByUserId` sans filtre user. |
| **Tests minces** | 5 tests unitaires seulement (helpers), aucun test d'intégration API (auth, favoris, admin). |
| **`dossier-exam` gitignoré** | La doc d'installation/déploiement citée par le README n'est pas versionnée. |
| **Deux dossiers `api/`** | `api/` à la racine **et** `frontend/api/` contiennent des proxies Vercel — seul celui du projet déployé compte ; vérifier lequel est réellement déployé (vercel.json racine → `frontend/dist` + rewrites `/api`). |

---

## 🧪 Résultats des vérifications exécutées

| Check | Résultat |
|---|---|
| `npx eslint .` (frontend) | ✅ 0 erreur |
| `npm test` (backend, node --test) | ✅ 5/5 pass |
| `npm run build` (Vite) | ✅ OK, 9.46 s — bundle JS 314 kB (96 kB gzip), CSS 73 kB |
| Secrets dans git | ✅ Aucun `.env` committé |

---

## 🎯 Plan d'action suggéré (ordre de priorité)

1. **Sécurité** : restreindre POST/PUT/DELETE `/api/games` aux admins (n°1).
2. **Sécurité** : validation des champs à l'inscription (email, mot de passe ≥ 8) (n°4).
3. **Robustesse** : remplacer `LIMIT ${limit}` par un entier validé dans chaque requête (n°3).
4. **Architecture** : factoriser les helpers RSS partagés contrôleur/cron ; extraire la logique Gamekult hors du handler (dette n°1-2).
5. **Perf** : compresser/remplacer la vidéo 7,3 Mo ; servir le catalogue tests depuis MySQL plutôt que re-scraper.
6. **Confort** : `AdminRoute` côté front (redirection propre au lieu de 403).
7. **Tests** : ajouter des tests d'intégration (register/login, favoris, 403 admin).
