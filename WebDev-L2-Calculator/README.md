# WebDev-L2-Calculator

## Objectif
Calculatrice en ligne entièrement fonctionnelle, réalisée dans le cadre du stage OIBSIP (Oasis Infobyte Student Internship Program), piste Développement Web, Niveau 2.

## Stack
- HTML5
- CSS3 (Grid)
- JavaScript vanilla (aucune dépendance, aucun `eval()`)

## Fonctionnalités
- Écran à deux lignes : opération en cours (petite ligne du haut) + saisie/résultat (grande ligne, texte en dégradé)
- Boutons numériques 0-9 et point décimal
- Opérateurs `+`, `-`, `×`, `÷` (l'opérateur actif est mis en surbrillance)
- Bouton `=` pour évaluer l'expression
- Bouton `C` pour tout réinitialiser
- Bouton `⌫` pour effacer le dernier caractère saisi
- Division par zéro gérée proprement : message d'erreur affiché à l'écran, aucun crash, la calculatrice se réinitialise dès la saisie suivante
- Enchaînement d'opérateurs sans réinitialisation complète (ex. `5 + 3 × 2` évalue chaque étape séquentiellement sans tout effacer)
- Disposition des touches en CSS Grid (4 colonnes, `=` sur 2 lignes, `0` sur 2 colonnes)
- Tous les gestionnaires d'événements sont attachés via `addEventListener` (aucun `onclick` dans le HTML)
- Logique de calcul écrite à la main (`+`, `-`, `*`, `/` conditionnels), pas de `eval()`
- Support clavier (chiffres, `+ - * /`, `Entrée`/`=`, `Retour arrière`, `Échap` pour effacer)

## Design
Interface "glassmorphism" moderne : fond dégradé sombre avec halos violets/roses, carte semi-transparente avec flou d'arrière-plan (`backdrop-filter`), boutons opérateurs en dégradé avec ombre lumineuse, animation de pulsation légère à chaque mise à jour de l'écran.

## Lancer le projet
Aucune dépendance ni build requis.

```bash
# ouvrir directement le fichier
start index.html   # Windows

# ou servir en local
python -m http.server 8000
# puis ouvrir http://localhost:8000
```

## Captures d'écran
Voir le dossier [`/screenshots`](./screenshots).
