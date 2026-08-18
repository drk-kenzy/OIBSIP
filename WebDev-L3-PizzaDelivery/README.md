# WebDev-L3-PizzaDelivery

## Objectif
Plateforme full-stack de commande de pizzas avec création personnalisée, paiement, suivi de commande en temps réel, et back-office admin pour la gestion des stocks et des commandes. Réalisée dans le cadre du stage OIBSIP, piste Développement Web, Niveau 3.

## Stack
- **Frontend** : React 18 (Vite), React Router, Axios, Socket.IO client
- **Backend** : Node.js, Express, Mongoose (MongoDB)
- **Auth** : JWT (jetons séparés utilisateur / admin), mots de passe hachés avec bcrypt
- **Emails** : Nodemailer (vérification de compte, réinitialisation de mot de passe, alertes de stock bas). Utilise un compte de test [Ethereal](https://ethereal.email/) en développement si aucun SMTP n'est configuré : les emails sont capturés et un lien d'aperçu est renvoyé par l'API/affiché dans l'UI, jamais réellement envoyés
- **Paiement** : Razorpay (mode test). Si aucune clé API n'est configurée, l'application bascule automatiquement sur un mode simulation ("Simuler le paiement réussi") pour rester testable sans compte Razorpay
- **Temps réel** : Socket.IO (statut de commande poussé instantanément côté client dès qu'un admin le modifie)
- **Tâche planifiée** : node-cron (vérification du stock bas toutes les 30 minutes + vérification immédiate après chaque commande)
- **Base de données** : MongoDB. Si `MONGODB_URI` n'est pas renseignée, le serveur démarre automatiquement une instance MongoDB locale en mémoire (`mongodb-memory-server`), pratique pour développer/tester sans rien installer

## Fonctionnalités

### Côté utilisateur
- Inscription avec vérification par email (lien de confirmation à durée limitée)
- Connexion impossible tant que l'email n'est pas confirmé
- Connexion avec JWT, message d'erreur générique en cas d'échec
- Mot de passe oublié → email de réinitialisation (lien à durée limitée, message identique que le compte existe ou non, pour ne pas révéler les emails enregistrés)
- Dashboard listant les variétés d'ingrédients disponibles
- Création de pizza personnalisée en 4 étapes : pâte (5 options) → sauce (5 options) → fromage (4 options) → légumes (sélection multiple parmi 8, optionnelle)
- Page récapitulative avant paiement (prix recalculé et validé côté serveur, jamais fait confiance au client)
- Paiement Razorpay en mode test, avec repli en mode simulation si aucune clé n'est configurée
- Statut de commande affiché en temps réel (Reçue → En cuisine → En livraison → Livrée), sans rechargement de page, via WebSocket

### Côté admin
- Connexion admin totalement séparée (`/admin/login`), pas de formulaire d'inscription accessible publiquement : le compte est créé uniquement via le script de seed
- Dashboard des stocks, groupé par catégorie, avec mise en évidence des ingrédients sous le seuil d'alerte
- Mise à jour manuelle du stock de chaque ingrédient
- Déduction automatique du stock à chaque commande payée (opération atomique pour éviter la survente en cas de requêtes concurrentes)
- Notification email automatique à l'admin quand un ingrédient passe sous son seuil configurable (au plus une alerte toutes les 12h par ingrédient, pour ne pas spammer)
- Panneau de gestion des commandes avec mise à jour du statut, répercutée instantanément côté client, séparé en deux sections "En cours" / "Commandes livrées"
- Email de confirmation automatique envoyé au client dès que sa commande passe à "Livrée" (envoyé une seule fois, pas de doublon si le statut est renvoyé à "Livrée" ou modifié puis remis)

## Lancer le projet

### Backend
```bash
cd server
npm install
cp .env.example .env      # fonctionne tel quel en dev (Mongo en mémoire + emails Ethereal + paiement simulé)
npm start
```
Au premier démarrage sur une base vide, le serveur crée automatiquement les ingrédients et un compte admin (`ADMIN_EMAIL` / `ADMIN_PASSWORD` dans `.env`, par défaut `admin@pizzadelivery.example` / `admin1234`). Pour re-seeder manuellement une base existante : `npm run seed`.

### Frontend
```bash
cd client
npm install
cp .env.example .env
npm run dev
```
Ouvrir [http://localhost:5173](http://localhost:5173).

### Pour une vraie mise en production
Renseigner dans `server/.env` :
- `MONGODB_URI` : une vraie instance MongoDB (Atlas ou autre)
- `SMTP_HOST` / `SMTP_USER` / `SMTP_PASS` : un vrai fournisseur SMTP pour que les emails partent réellement
- `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` : les clés de test (ou live) depuis le dashboard Razorpay

## Structure
```
server/
  models/        User, Admin, Ingredient, Order
  routes/        auth, adminAuth, ingredients, orders, payment
  middleware/    auth (JWT utilisateur / admin)
  cron/          verification du stock bas + envoi d'alerte
  config/        connexion MongoDB, configuration email
  sockets.js     mise à jour temps reel (Socket.IO)
  seed.js        creation des ingredients + compte admin

client/
  src/pages/         inscription, verification, connexion, mot de passe oublie,
                      dashboard, constructeur de pizza, recapitulatif, commandes
  src/pages/admin/   connexion admin, gestion des stocks, gestion des commandes
  src/context/       auth utilisateur / admin (JWT en localStorage)
  src/api/           client Axios
```

## Captures d'écran
Voir le dossier [`/screenshots`](./screenshots) : inscription, vérification d'email, dashboard, les 4 étapes du constructeur de pizza, récapitulatif, simulation de paiement, statut de commande, liste des commandes, connexion admin, gestion des commandes admin, gestion des stocks (avec alerte de rupture visible), et la mise à jour de statut en temps réel côté client.
