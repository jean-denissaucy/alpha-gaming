# User Stories - Alpha Gaming

## Contexte
Application full-stack d'actualites gaming/esport avec authentification JWT et dashboard utilisateur.

## Echelle de priorite
- P1: Critique (MVP)
- P2: Important
- P3: Confort

## Epic 1 - Consultation des actualites

### US-01 - Voir la home publique
**En tant que** visiteur  
**Je veux** acceder a une page d'accueil publique  
**Afin de** consulter rapidement les actus gaming et esport.

**Priorite:** P1  
**Estimation:** 3 points

**Criteres d'acceptation**
- Etant donne que je suis non connecte, quand j'ouvre `/`, alors la page Home s'affiche.
- Etant donne que la page se charge, quand les APIs repondent, alors les blocs news gaming et esport sont visibles.
- Etant donne une erreur API, quand les donnees distantes echouent, alors un contenu de secours est affiche sans crash de l'interface.

### US-02 - Rafraichissement hebdomadaire de la home
**En tant que** utilisateur  
**Je veux** que les informations de la Home se rafraichissent chaque semaine  
**Afin de** voir des contenus recents.

**Priorite:** P2  
**Estimation:** 5 points

**Criteres d'acceptation**
- Etant donne que la Home est ouverte, quand la condition "lundi 00h00" est atteinte cote navigateur, alors les blocs news et esport sont recharges.
- Etant donne que le navigateur est ferme, quand lundi 00h00 passe, alors la mise a jour est executee lors de la prochaine ouverture de la Home.

## Epic 2 - Gestion du compte utilisateur

### US-03 - Creer un compte
**En tant que** visiteur  
**Je veux** creer un compte avec email et mot de passe  
**Afin de** acceder a l'espace membre.

**Priorite:** P1  
**Estimation:** 5 points

**Criteres d'acceptation**
- Etant donne que je saisis des informations valides, quand je valide le formulaire d'inscription, alors mon compte est cree.
- Etant donne que l'email existe deja, quand je valide, alors un message d'erreur explicite est affiche.
- Etant donne une inscription reussie, quand la reponse revient, alors je peux me connecter.

### US-04 - Se connecter
**En tant que** utilisateur inscrit  
**Je veux** me connecter avec mes identifiants  
**Afin de** recuperer un token JWT et acceder au dashboard.

**Priorite:** P1  
**Estimation:** 3 points

**Criteres d'acceptation**
- Etant donne des identifiants valides, quand je soumets le formulaire, alors je suis authentifie.
- Etant donne une authentification reussie, quand je suis connecte, alors le token JWT est conserve cote client.
- Etant donne des identifiants invalides, quand je tente la connexion, alors un message d'erreur est affiche.

### US-05 - Consulter mon profil courant
**En tant que** utilisateur connecte  
**Je veux** recuperer mes informations de profil  
**Afin de** verifier que ma session est active.

**Priorite:** P2  
**Estimation:** 2 points

**Criteres d'acceptation**
- Etant donne un JWT valide, quand j'appelle le profil courant, alors mes informations utilisateur sont retournees.
- Etant donne un JWT invalide ou absent, quand j'appelle le profil courant, alors l'acces est refuse (401/403).

## Epic 3 - Acces protege et experience membre

### US-06 - Acceder au dashboard protege
**En tant que** utilisateur connecte  
**Je veux** acceder a une page dashboard reservee  
**Afin de** consulter mon espace personnalise.

**Priorite:** P1  
**Estimation:** 3 points

**Criteres d'acceptation**
- Etant donne que je suis connecte, quand je vais sur `/dashboard`, alors la page s'affiche.
- Etant donne que je ne suis pas connecte, quand je vais sur `/dashboard`, alors je suis redirige vers la page de connexion.

### US-07 - Voir des favoris par categories
**En tant que** utilisateur connecte  
**Je veux** visualiser des jeux favoris classes par categories  
**Afin de** acceder rapidement a mes centres d'interet.

**Priorite:** P2  
**Estimation:** 8 points

**Criteres d'acceptation**
- Etant donne que je suis dans le dashboard, quand la section favoris s'affiche, alors 12 categories sont disponibles.
- Etant donne une categorie selectionnee, quand je consulte la liste, alors jusqu'a 10 jeux sont affiches pour cette categorie.

### US-08 - Ouvrir le site officiel d'un jeu favori
**En tant que** utilisateur connecte  
**Je veux** cliquer sur un jeu favori  
**Afin de** visiter son site officiel.

**Priorite:** P2  
**Estimation:** 2 points

**Criteres d'acceptation**
- Etant donne un jeu affiche dans Favoris, quand je clique dessus, alors le site officiel du jeu s'ouvre.
- Etant donne un lien invalide, quand je clique, alors l'application ne plante pas et informe l'utilisateur.

## Epic 4 - Qualite et accessibilite de l'application

### US-09 - Consulter une page de presentation statique
**En tant que** visiteur  
**Je veux** acceder a une page de presentation independante  
**Afin de** comprendre rapidement le projet.

**Priorite:** P3  
**Estimation:** 2 points

**Criteres d'acceptation**
- Etant donne l'URL `/presentation.html`, quand je l'ouvre, alors la page statique se charge avec son CSS.
- Etant donne un affichage mobile, quand je consulte la page, alors le contenu reste lisible.

### US-10 - API disponible pour le frontend
**En tant que** frontend  
**Je veux** disposer d'endpoints stables pour auth et news  
**Afin de** charger et proteger les donnees cote client.

**Priorite:** P1  
**Estimation:** 5 points

**Criteres d'acceptation**
- Etant donne le backend demarre, quand j'appelle `GET /api/news`, alors une liste d'actualites gaming est retournee.
- Etant donne le backend demarre, quand j'appelle `GET /api/news/esport`, alors une liste d'actualites esport est retournee.
- Etant donne un appel `POST /api/auth/login` valide, quand la reponse revient, alors un JWT est fourni.

## Definition of Done (DoD) proposee
- User story comprise et validee par le product owner.
- Criteres d'acceptation verifies manuellement en local.
- Aucun bug bloquant sur le parcours nominal.
- Documentation de la fonctionnalite mise a jour (README ou dossier examen).

## Decoupage MVP recommande
- Sprint 1 (MVP): US-01, US-03, US-04, US-06, US-10
- Sprint 2: US-05, US-07, US-08
- Sprint 3: US-02, US-09
