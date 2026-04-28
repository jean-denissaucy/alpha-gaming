# Fiche memo - Alpha Gaming

## Projet

- Application web dynamique full-stack
- Frontend: React / Vite
- Backend: Node.js / Express
- Base: MySQL
- Authentification: JWT

## Competences valides

- Interfaces statiques web
- Interfaces utilisateur dynamiques
- Base de donnees relationnelle
- Composants metier cote serveur
- Installation et configuration de l'environnement
- Documentation de deploiement

## Preuves rapides

- Front statique: `frontend/public/presentation.html`
- Front dynamique: `frontend/src/pages/Home.jsx`, `frontend/src/pages/Dashboard.jsx`
- Auth: `frontend/src/contexts/AuthContext.jsx`, `backend/controllers/auth.controller.js`
- DB relationnelle: `init.sql`
- Metier serveur: `backend/controllers/news.controller.js`
- Deploiement: `README.md`, `backend/README.md`, `frontend/README.md`

## Ce que je dois dire au jury

- J'ai separe le front, le back et la base de donnees
- J'ai securise le dashboard avec JWT
- J'ai documente l'installation et le deploiement
- J'ai ajoute des fichiers `.env.example`
- Le projet est fonctionnel en local et preparable pour la production

## Limites actuelles

- Pas encore de tests automatises
- Validation serveur encore a renforcer
- Pas encore d'API CRUD complete pour les favoris

## Note API (mise a jour hebdomadaire)

- La mise a jour du lundi a 00h00 est implementee uniquement cote frontend (page Home)
- Cette logique met a jour les blocs news et esport, mais seulement si un navigateur est ouvert sur la Home
- Il n'y a pas de tache cron globale cote backend pour forcer une mise a jour serveur a heure fixe
- Les endpoints news/esport recuperent les flux au moment de chaque appel API

## Ordre de demonstration

1. Lancer le projet
2. Montrer la page d'accueil
3. Faire l'inscription / connexion
4. Ouvrir le dashboard protege
5. Montrer un endpoint API
6. Montrer la page statique de presentation
