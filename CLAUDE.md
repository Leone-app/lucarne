# Lucarne — Projecteur Cinéma

Système de diffusion pour projecteur cinéma. Deux interfaces :
- **`/player.html`** — l'écran de projection (plein écran, WebSocket)
- **`/`** — la régie opérateur (config, lancement de séance, sélection de film)

## Commandes

```bash
npm run dev    # développement avec rechargement automatique (tsx)
npm run build  # compilation TypeScript → dist/
npm start      # production (node dist/server.js)
```

Le serveur écoute sur le port 3000. La config est persistée dans `config.json` à la racine.

## Architecture

```
src/
  server.ts          # point d'entrée, WebSocket, AppState
  types.ts           # Config, AppState, WSMessage, AudioTrackInfo
  config.ts          # loadConfig / saveConfig (config.json)
  broadcast.ts       # diffusion WebSocket à tous les clients connectés
  watcher.ts         # surveillance du dossier boucle (chokidar)
  scheduler.ts       # planification heure de diffusion du film
  ffprobe.ts         # détection des pistes audio d'un fichier (ffprobe bundlé)
  routes/
    api.ts           # assembleur — monte config + session + browse
    config.ts        # GET /api/config, POST /api/config, GET /api/audio-tracks
    session.ts       # POST /api/start|stop|play-feature-now|feature-ended
    browse.ts        # POST /api/browse (navigation fichiers)
    video.ts         # GET /video?path=&audioTrack= (streaming vidéo)

public/
  index.html         # régie opérateur (SPA vanilla JS)
  player.html        # écran de projection (WebSocket client)
```

## Comportements importants

**MKV → transcoding FFmpeg obligatoire**
Les MKV cinéma ont souvent de l'audio AC3/DTS que Chrome ne sait pas décoder. `src/routes/video.ts` intercepte les `.mkv` et les pipe via ffmpeg (`@ffmpeg-installer/ffmpeg`, binaire bundlé — pas de dépendance système). La commande utilise `-ac 2 -ar 48000` pour forcer le downmix stéréo : sans ça, Chrome reçoit un flux AAC multi-canal et l'ignore silencieusement (image OK, pas de son).

Les autres formats (`.mp4`, `.mov`, etc.) sont servis en streaming brut avec support des range requests.

**WebSocket**
Le serveur envoie un message `state` à chaque nouvelle connexion. Les messages principaux : `play_loop`, `play_feature`, `stop`, `config_update`, `folder_update`.

**Sélection de piste audio**
`config.featureAudioTrack` (number | null) est persisté. Quand null, ffmpeg utilise la piste 0. La piste choisie est passée comme query param `?audioTrack=N` dans l'URL `/video`.

**AppState**
Pattern factory pour éviter les dépendances circulaires. `server.ts` crée un objet `AppState` avec des closures et le passe à tous les routers — ni `scheduler.ts` ni `watcher.ts` n'importent depuis `server.ts`.

## Code style
- All code comments must be written in English.
