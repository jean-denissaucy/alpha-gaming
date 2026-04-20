# Dossier Examen - Jury

Date: 20/04/2026
Projet: Actu Gaming
Type: Application web dynamique (React + Node.js + MySQL)

## 1. Presentation rapide du projet

Actu Gaming est une application full-stack qui propose:
- Une partie publique (actualites gaming + esport)
- Une partie authentifiee (login/register + dashboard)
- Une API backend securisee par JWT
- Une base de donnees relationnelle MySQL

## 2. Environnement de travail

Statut: VALIDE

Preuves:
- Installation et configuration documentees: ../README.md
- Configuration backend: ../backend/README.md
- Configuration frontend: ../frontend/README.md
- Variables d'environnement exemples: ../backend/.env.example, ../frontend/.env.example
- Scripts d'execution et build: ../package.json, ../backend/package.json, ../frontend/package.json

## 3. Competences Front-end

### 3.1 Realiser des interfaces utilisateur statiques web
Statut: VALIDE

Preuves:
- Page statique de presentation: ../frontend/public/presentation.html
- Styles dedies responsive: ../frontend/public/presentation.css
- Structure UI avec header/footer/layout: ../frontend/src/components/Header.jsx, ../frontend/src/components/Footer.jsx, ../frontend/src/layouts/MainLayout.jsx

### 3.2 Developper la partie dynamique des interfaces utilisateur
Statut: VALIDE

Preuves:
- Gestion d'etat et rendu dynamique: ../frontend/src/pages/Home.jsx, ../frontend/src/pages/Dashboard.jsx
- Formulaires dynamiques login/register: ../frontend/src/pages/Login.jsx, ../frontend/src/pages/Register.jsx
- Contexte d'authentification global: ../frontend/src/contexts/AuthContext.jsx
- Services API centralises: ../frontend/src/services/api.js
- Protection de routes: ../frontend/src/components/PrivateRoute.jsx, ../frontend/src/App.jsx

## 4. Competences Back-end

### 4.1 Mettre en place une base de donnees relationnelle
Statut: VALIDE

Preuves:
- Schema SQL, contraintes, index, FK: ../init.sql
- Connexion MySQL et pool: ../backend/config/db.js
- Requetes utilisateur cote serveur: ../backend/models/user.model.js

### 4.2 Developper des composants metier cote serveur
Statut: VALIDE (avec ameliorations possibles)

Preuves:
- Auth metier (register/login/profile): ../backend/controllers/auth.controller.js
- Logique metier news/esport: ../backend/controllers/news.controller.js
- Separation des couches routes/controllers/models:
  - ../backend/routes/auth.routes.js
  - ../backend/routes/news.routes.js
  - ../backend/models/user.model.js
- Middleware de securite JWT: ../backend/middlewares/auth.middleware.js

Ameliorations conseillees:
- Ajouter tests automatises backend
- Ajouter validation d'entrees plus stricte (payloads)

## 5. Documentation de deploiement

Statut: VALIDE

Preuves:
- Procedure de deploiement global: ../README.md
- Procedure de deploiement backend: ../backend/README.md
- Procedure de deploiement frontend: ../frontend/README.md

## 6. Checklist de demonstration jury

1. Lancer l'application
- npm run dev

2. Verifier la partie publique
- Accueil chargee
- News et bloc esport visibles

3. Verifier l'authentification
- Creation de compte
- Connexion
- Acces dashboard protege

4. Verifier les endpoints backend
- GET /
- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/me
- GET /api/news
- GET /api/news/esport

## 7. Conclusion

Le projet couvre les competences professionnelles demandees sur:
- Front-end statique
- Front-end dynamique
- Base de donnees relationnelle
- Composants metier serveur
- Documentation d'installation et de deploiement

Points de progression pour renforcer le dossier:
- Ajouter des tests front et back
- Ajouter une validation plus stricte des donnees
