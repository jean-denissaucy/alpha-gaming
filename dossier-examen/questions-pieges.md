# Questions pieges du jury - Alpha Gaming

## 1. Pourquoi avoir choisi React + Node.js + MySQL ?

Reponse courte:
J'ai choisi cette stack car elle couvre bien un projet web dynamique complet: React pour l'interface reactive, Node.js/Express pour l'API, et MySQL pour la persistence relationnelle.

## 2. Qu'est-ce qui prouve que le front est dynamique ?

Reponse courte:
L'interface reagit aux etats utilisateur et aux donnees API: login, register, dashboard protege, affichage conditionnel, chargement des news et de l'esport.

## 3. Qu'est-ce qui prouve que tu as fait du statique ?

Reponse courte:
J'ai aussi cree une page de presentation en HTML/CSS pure avec structure fixe, style dedie et comportement responsive.

## 4. Comment as-tu securise l'acces au dashboard ?

Reponse courte:
Avec un JWT cote backend, un middleware de verification, et une route protegee cote frontend via PrivateRoute.

## 5. Comment la base de donnees est-elle relationnelle ?

Reponse courte:
La base contient des relations entre utilisateurs et favoris, avec cles primaires, cles etrangeres, contraintes d'unicite et index.

## 6. Comment le backend est-il organise ?

Reponse courte:
J'ai separe les couches en routes, controleurs, modeles et middleware. Cela rend le code plus lisible et plus simple a maintenir.

## 7. Comment gères-tu les erreurs API ?

Reponse courte:
Le service API centralise les requetes et remonte des erreurs explicites. Cote UI, j'affiche un message d'erreur et je garde des donnees de secours quand c'est necessaire.

## 8. Qu'as-tu fait pour le deploiement ?

Reponse courte:
J'ai documente l'installation, la configuration, le build frontend, le lancement backend, et ajoute des fichiers .env.example pour la production.

## 9. Quelles sont les limites actuelles du projet ?

Reponse courte:
Il manque encore des tests automatises et une validation serveur plus poussee sur certaines entrees. La base est fonctionnelle mais peut encore etre etendue.

## 10. Si tu avais plus de temps, que ferais-tu ?

Reponse courte:
J'ajouterais des tests front et back, des endpoints CRUD supplementaires pour les favoris, et un niveau de validation/securite plus complet.

## 11. Comment montrer rapidement que le projet fonctionne ?

Reponse courte:
Je montre le lancement, la page d'accueil, l'inscription ou connexion, l'acces au dashboard protege, puis un appel API de news ou d'esport.

## 12. Pourquoi ce projet est pertinent pour l'examen ?

Reponse courte:
Parce qu'il couvre les points attendus: interfaces statiques et dynamiques, API, authentification, base relationnelle, documentation et deploiement.
