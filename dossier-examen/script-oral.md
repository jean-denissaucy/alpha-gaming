# Script oral - 5 minutes (Jury)

## 1. Introduction (30 secondes)

Bonjour, je vais vous presenter mon projet Alpha Gaming.
C'est une application web dynamique full-stack qui combine:
- Un frontend React/Vite
- Un backend Node.js/Express
- Une base de donnees relationnelle MySQL

L'objectif est de proposer une plateforme d'actualites gaming et esport, avec une partie publique et une partie membre securisee.

## 2. Besoin et fonctionnalites (45 secondes)

Le besoin etait de creer une application moderne avec:
- Une page d'accueil publique
- Des contenus dynamiques (news et esport)
- Une authentification utilisateur
- Un espace membre protege

Fonctionnalites principales:
- Consultation des actualites gaming et esport
- Inscription et connexion utilisateur
- Dashboard accessible uniquement apres authentification
- Gestion de preferences de categories cote utilisateur

## 3. Partie front-end (1 minute)

Sur la partie front-end, j'ai realise:
- Des interfaces statiques structurees (header, footer, sections)
- Une interface dynamique avec gestion d'etat React
- Des formulaires interactifs login/register
- Des routes protegees avec redirection si non connecte

Concretement:
- Le contexte d'authentification centralise l'etat utilisateur
- Les appels API sont centralises dans un service dedie
- Le dashboard adapte l'affichage selon l'utilisateur connecte

Cela valide les competences:
- Realiser des interfaces utilisateur statiques web
- Developper la partie dynamique des interfaces utilisateur

## 4. Partie back-end et base de donnees (1 minute 20)

Sur la partie back-end, j'ai mis en place:
- Une API REST avec Express
- Des routes, des controleurs et un middleware JWT
- Une logique metier separee par domaine (auth/news/esport)

Pour la base de donnees relationnelle:
- J'ai cree un schema MySQL avec des tables reliees
- J'ai defini des cles primaires, cles etrangeres, index et contraintes d'unicite
- Le backend utilise un pool de connexions et des requetes parametrees

Cela valide les competences:
- Mettre en place une base de donnees relationnelle
- Developper des composants metier cote serveur

## 5. Installation et deploiement (45 secondes)

J'ai documente:
- L'installation locale
- La configuration via variables d'environnement
- Le build frontend
- Le lancement backend en production
- Les controles post-deploiement

J'ai aussi ajoute:
- Des fichiers .env.example front et back
- Des scripts npm pour build et start production

Cela valide les competences:
- Installer et configurer son environnement de travail
- Documenter le deploiement d'une application dynamique web

## 6. Demonstration rapide (30 secondes)

Pendant la demonstration, je montre:
1. Le lancement du projet
2. L'accueil public
3. Une inscription/connexion
4. L'acces au dashboard protege
5. Un appel API fonctionnel

## 7. Conclusion (20 secondes)

Le projet couvre l'ensemble des competences professionnelles demandees pour ce bloc.
Les ameliorations prevues pour aller plus loin sont:
- Ajouter des tests automatises front/back
- Renforcer la validation des entrees serveur
- Completer certaines fonctionnalites metier par des endpoints supplementaires

Merci.
