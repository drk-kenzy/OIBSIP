# WebDev-L2-TodoApp

## Objectif
Gestionnaire de tâches (en attente / terminées), réalisé dans le cadre du stage OIBSIP, piste Développement Web, Niveau 2.

## Stack
- HTML5 (`<template>` pour la génération des tâches)
- CSS3 (Grid pour les deux colonnes)
- JavaScript vanilla (aucune dépendance)

## Fonctionnalités
- Champ de saisie + bouton "Ajouter" (aussi déclenché par Entrée)
- Les nouvelles tâches apparaissent immédiatement en tête de la liste "En attente"
- Bouton rond à cocher pour marquer une tâche comme terminée (et la décocher pour la remettre en attente)
- Bouton "Modifier" pour une édition inline du texte (Entrée pour valider, Échap pour annuler)
- Bouton "Supprimer" pour une suppression définitive
- Compteurs live "En attente (X)" / "Terminées (Y)" au-dessus de chaque colonne
- Persistance complète via `localStorage` (les tâches survivent au rafraîchissement de la page)
- Message d'état vide convivial dans chaque colonne quand elle ne contient aucune tâche
- Horodatage sur chaque tâche : date/heure d'ajout, remplacée par la date/heure de complétion une fois terminée
- Mise en page à deux colonnes (Grid), qui passe en une seule colonne sur mobile

## Lancer le projet
Aucune dépendance ni build requis.

```bash
start index.html   # Windows
```

## Captures d'écran
Voir le dossier [`/screenshots`](./screenshots).
