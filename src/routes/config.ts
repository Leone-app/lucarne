import { Router } from 'express';
import type { Request, Response } from 'express';
import type { AppState } from '../types';
import { getAudioTracks } from '../ffprobe';

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
    const { loopFolder, featureFile, featureTime, featureAudioTrack } = req.body as {
      loopFolder?: string;
      featureFile?: string;
      featureTime?: string;
      featureAudioTrack?: number | null;
    };

    if (loopFolder !== undefined) state.config.loopFolder = loopFolder;
    if (featureFile !== undefined) state.config.featureFile = featureFile;
    if (featureTime !== undefined) state.config.featureTime = featureTime;
    if (featureAudioTrack !== undefined) state.config.featureAudioTrack = featureAudioTrack;

    state.saveConfig();
    state.broadcast({ type: 'config_update', config: state.config });

    if (state.config.loopFolder) state.watchFolder(state.config.loopFolder);

    res.json({ ok: true, config: state.config });
  });

  return router;
}
