import express from 'express';
import http from 'http';
import path from 'path';
import { WebSocketServer, WebSocket } from 'ws';

import { loadConfig, saveConfig as persistConfig } from './config';
import { clients, broadcast } from './broadcast';
import { getVideosInFolder, watchFolder as doWatchFolder } from './watcher';
import { scheduleFeature as doScheduleFeature, cancelSchedule } from './scheduler';
import { createApiRouter } from './routes/api';
import { videoRouter } from './routes/video';
import type { AppState, WSMessage } from './types';

const PORT = 3000;

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const config = loadConfig();

const notifyFolderChange = (): void => {
  const videos = getVideosInFolder(config.loopFolder);
  broadcast({ type: 'folder_update', videos });
};

const state: AppState = {
  config,
  saveConfig: () => persistConfig(config),
  getVideosInFolder,
  watchFolder: (folderPath: string) => doWatchFolder(folderPath, notifyFolderChange),
  scheduleFeature: (timeStr: string) => doScheduleFeature(timeStr, () => {
    config.status = 'feature';
    persistConfig(config);
    broadcast({ type: 'play_feature', file: config.featureFile, audioTrack: config.featureAudioTrack ?? undefined, delay: config.filmAudio.delay });
  }),
  cancelSchedule,
  broadcast,
};

async function main() {
  app.use(express.json());
  app.use('/video', videoRouter);
  app.use('/api', createApiRouter(state));

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: 'spa' });
    // Serve player.html and other static files before Vite's SPA fallback
    app.use(express.static(path.join(__dirname, '..', 'public'), { index: false }));
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, '..', 'public')));
  }

  wss.on('connection', (ws: WebSocket) => {
    clients.add(ws);
    const stateMsg: WSMessage = { type: 'state', config };
    ws.send(JSON.stringify(stateMsg));
    ws.on('close', () => clients.delete(ws));
    ws.on('error', () => clients.delete(ws));
  });

  server.listen(PORT, () => {
    console.log(`\n🎬 Cinema Player running`);
    console.log(`   Config UI  → http://localhost:${PORT}`);
    console.log(`   Player     → http://localhost:${PORT}/player.html\n`);
    if (config.loopFolder) doWatchFolder(config.loopFolder, notifyFolderChange);
  });
}

main();
