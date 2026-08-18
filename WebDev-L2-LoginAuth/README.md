# WebDev-L2-LoginAuth

## Objectif
Système d'authentification complet (inscription, connexion, tableau de bord protégé), réalisé dans le cadre du stage OIBSIP, piste Développement Web, Niveau 2.

## Stack
- Node.js + Express
- `express-session` pour la gestion de session (cookie httpOnly)
- `bcryptjs` pour le hachage des mots de passe (implémentation pure JS de bcrypt, sans compilation native, plus simple à installer, même algorithme)
- Stockage simple par fichier JSON (`data/users.json`), pas de base de données requise
- HTML généré côté serveur (aucun moteur de template externe), CSS3 maison

## Fonctionnalités
- **Inscription** (`GET/POST /register`) : nom d'utilisateur, email, mot de passe
  - Validation du mot de passe : 8 caractères minimum + au moins un chiffre
  - Vérification d'unicité séparée pour le nom d'utilisateur et l'email, avec message d'erreur clair pour chaque cas
  - Aucun champ vide accepté (validation serveur, pas seulement côté client)
- **Connexion** (`GET/POST /login`) : identifiant (nom d'utilisateur ou email) + mot de passe
  - Message d'erreur **générique** ("Identifiants incorrects.") que l'échec vienne d'un mauvais identifiant ou d'un mauvais mot de passe, aucune information n'est donnée sur le champ fautif
- **Dashboard protégé** (`GET /dashboard`) : accessible uniquement avec une session active, redirection automatique vers `/login` sinon
- **Déconnexion** (`POST /logout`) : détruit la session et le cookie, puis redirige vers `/login`
- Mots de passe hachés avec bcrypt (jamais stockés en clair, vérifié manuellement dans `data/users.json` pendant le développement)
- Aucun secret en dur : la clé de session vient de `.env` (voir `.env.example`), `.env` est ignoré par git

## Lancer le projet
```bash
npm install
cp .env.example .env    # puis éditer SESSION_SECRET si besoin
npm start
```
Ouvrir [http://localhost:3000](http://localhost:3000).

## Structure
```
server.js     routes Express + validations
store.js      lecture/écriture des utilisateurs dans data/users.json
views.js      génération du HTML (layout + pages inscription/connexion/dashboard)
public/       CSS partagé
data/         fichier users.json (créé automatiquement, ignoré par git)
```

## Captures d'écran
Voir le dossier [`/screenshots`](./screenshots) : inscription, connexion, message d'erreur de connexion, dashboard protégé.
