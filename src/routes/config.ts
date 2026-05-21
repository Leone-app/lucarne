import { Router } from 'express';
import type { Request, Response } from 'express';
import type { AppState, Config } from '../types';
import { getAudioTracks } from '../ffprobe';

const UPDATABLE_KEYS: (keyof Config)[] = [
  'loopFolder', 'featureFile', 'featureTime', 'featureAudioTrack',
  'welcomePage', 'welcomePageInterval', 'welcomePageDuration',
  'loopMusic', 'filmAudio',
];

export function createConfigRouter(state: AppState): Router {
  const router = Router();

  router.get('/config', (_req: Request, res: Response) => {
    const videos = state.getVideosInFolder(state.config.loopFolder);
    res.json({ ...state.config, videos });
  });

  router.get('/audio-tracks', (req: Request, res: Response) => {
    const filePath = req.query.path as string | undefined;
    if (!filePath) {
      res.status(400).json({ error: 'Missing path' });
      return;
    }
    res.json(getAudioTracks(filePath));
  });

  router.post('/config', (req: Request, res: Response) => {
    const body = req.body as Partial<Config>;

    for (const key of UPDATABLE_KEYS) {
      if (body[key] !== undefined) {
        (state.config as unknown as Record<string, unknown>)[key] = body[key];
      }
    }

    state.saveConfig();
    state.broadcast({ type: 'config_update', config: state.config });

    if (state.config.loopFolder) state.watchFolder(state.config.loopFolder);

    res.json({ ok: true, config: state.config });
  });

  return router;
}
