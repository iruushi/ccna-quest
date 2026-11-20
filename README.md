# CCNA Quest

PWA de révision CCNA : le suivi du cours NetAcad avec un objectif de modules par semaine, un défi court chaque jour (faisable sur téléphone), des labos
Packet Tracer scénarisés (campagne Ar Mor Logistique), de l'XP, une série de jours avec
mode pause, et des récompenses jeu que tu choisis. Fonctionne hors ligne une fois installée.

## Avancer dans le cours NetAcad

- **Parcours** : coche les modules déjà faits (sans XP) et règle ta date de fin des cours
  (30 juin 2027 par défaut) et ta date d'examen si tu la connais. L'appli calcule l'objectif
  de modules de la semaine et te dit si tu es en avance ou en retard.
- **Aujourd'hui** : le prochain module à faire. « Contenu lu » (+40 XP) puis le score du quiz
  du module (+30 XP, +10 si 80 % ou plus). Les deux faits = module terminé (+20 XP),
  ses défis et son labo se débloquent.

## Mettre en ligne sur GitHub Pages (5 min)

1. Crée un dépôt sur GitHub, par exemple `ccna-quest` (public, ou privé avec GitHub Pro).
2. Envoie le contenu de ce dossier à la racine du dépôt :
   ```bash
   cd ccna-quest
   git init && git add . && git commit -m "CCNA Quest v1.0"
   git branch -M main
   git remote add origin https://github.com/<ton-pseudo>/ccna-quest.git
   git push -u origin main
   ```
   (ou glisse-dépose les fichiers dans l'interface web de GitHub : « Add file › Upload files »)
3. Dans le dépôt : **Settings › Pages › Source : Deploy from a branch › main / (root) › Save**.
4. Après une minute, l'appli est sur `https://<ton-pseudo>.github.io/ccna-quest/`.

## Installer l'appli

- **Android (Chrome)** : ouvre l'adresse, menu ⋮ › **Installer l'application** (ou « Ajouter à l'écran d'accueil »).
- **Windows (Edge)** : ouvre l'adresse, menu … › **Applications › Installer ce site en tant qu'application**.
  Avec Chrome : icône d'installation à droite de la barre d'adresse.

## Ludothèque (onglet Jeux)

1. Dans Playnite : exporte ta bibliothèque en CSV.
2. Dans l'appli, onglet **Jeux** : choisis le fichier, puis **Importer**.
3. Si la synchro est connectée, l'appli demande à ton serveur les genres Steam de chaque jeu
   (grâce à `steamAppId`) et trie tout seule les jeux à histoire. Le reste va dans « À trier » :
   touche le bouton du jeu pour le classer.
4. « Commencer » / « Terminé ! » pour suivre le jeu en cours. La récompense
   « Lancer un nouveau jeu solo » te propose les prochains jeux de la liste.

## Synchro téléphone ↔ PC

- **Automatique** (recommandé) : installe le serveur du dossier `ccna-sync/` sur ton Proxmox
  (voir son README), puis dans l'appli **Réglages › Synchronisation automatique**.
  L'appli se synchronise à l'ouverture, après chaque action, toutes les 5 min et au retour du réseau,
  et fusionne sans perte ce que chaque appareil a fait hors ligne.
- **Manuelle** (secours) : Réglages › « Copier le code » sur un appareil, « Importer » sur l'autre.

## Mettre à jour l'appli

Modifie les fichiers, puis change `VERSION` dans `sw.js` (ex. `ccna-quest-1.0.1`) et pousse
sur GitHub. Les appareils récupèrent la nouvelle version à la prochaine ouverture avec réseau.

## Ajouter du contenu

Tout est dans `data.js` :
- `mcq` : questions à choix multiples (`m` = module qui les débloque, ex. `srwe:3`).
- `cmd` : défis de commandes IOS. Motifs : `interface:3` = mot abrégeable dès 3 lettres,
  `@g0/0/0` = nom d'interface sous toutes ses formes, `/regex/` = morceau d'expression régulière.
- `labs` : labos. Chaque étape demande la sortie d'une commande `show` et la vérifie
  avec des expressions régulières (`re`) ou par bloc de config (`block: [en-tête, doit contenir, ne doit pas contenir]`).

## Fichiers

| Fichier | Rôle |
|---|---|
| `index.html` | page et styles |
| `app.js` | interface, XP, série, récompenses, sauvegarde |
| `logic.js` | générateurs (sous-réseaux, binaire, IPv6, wildcard) et vérifications |
| `data.js` | modules NetAcad, défis, labos |
| `sw.js`, `manifest.webmanifest`, `icons/` | partie PWA (hors ligne, installation) |
