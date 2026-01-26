# API Port de plaisance Russell

Application de gestion des **catways**, des **réservations** et des **utilisateurs** pour la capitainerie du port de plaisance Russell.

## Technologies

- Node.js / Express  
- MongoDB / Mongoose  
- EJS (vues côté serveur)  
- Swagger (documentation API)

## Installation

Cloner le dépôt puis installer les dépendances :

```bash
git clone https://github.com/Maygae/port-russell-api.git
cd port-russell-api
npm install
```

## Configuration

Créer un fichier `.env` à la racine avec le contenu suivant :

```env
MONGODB_URI=mongodb://127.0.0.1:27017/port_russell
PORT=3000
JWT_SECRET=unSuperSecretPourLesTokens
SESSION_SECRET=unSuperSecretPourLesSessions
```

## Lancement

Démarrer l’application :

```bash
npm start
```

## Accès

Une fois l’application lancée :

- Accueil / connexion : http://localhost:3000/
- Tableau de bord : http://localhost:3000/dashboard
- Doc API Swagger : http://localhost:3000/api-docs

## Fonctionnalités

- CRUD catways (/catways, /catways/:number)
- CRUD réservations (sous /catways/:catwayId/reservations/...)
- CRUD utilisateurs (/users, /users/:email)
- Authentification avec formulaire, sessions et middleware de protection

## Compte de test

- Email : admin@example.com
- Mot de passe : admin123
