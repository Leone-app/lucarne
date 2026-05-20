# Cinema Player

Player de cinéma local pour macOS. Gère une boucle de vidéos et lance automatiquement un film à heure fixe.

## Installation

```bash
npm install
```

## Lancement

```bash
npm start
```

Puis ouvrir :
- **Régie** → http://localhost:3000 (sur l'écran Mac)
- **Projecteur** → http://localhost:3000/player.html (à déplacer sur le projecteur, puis F pour plein écran)

## Utilisation

1. Dans la régie, choisir le **dossier de boucle** (toutes les vidéos dedans tournent en boucle)
2. Choisir le **film principal**
3. Définir l'**heure de début** du film (ex: 20:30)
4. Ouvrir la fenêtre projecteur sur l'écran du projecteur
5. Appuyer sur **▶ Lancer la séance**

La boucle démarre immédiatement. À l'heure configurée, le film se lance automatiquement avec un fondu. À la fin du film, la boucle reprend.

## Formats supportés

MP4, MOV, MKV, AVI, M4V, WebM — tous les formats supportés nativement par macOS/Safari.

## Contrôles manuels

- **Relancer la boucle** : bascule immédiatement en mode boucle
- **Lancer le film maintenant** : démarre le film sans attendre l'heure prévue
- **Arrêter** : stoppe tout

## Notes

- La config est sauvegardée dans `config.json` et persiste entre les relances
- Le serveur surveille le dossier de boucle — ajouter/supprimer des vidéos est pris en compte à chaud
- La fenêtre projecteur se reconnecte automatiquement si le serveur redémarre
