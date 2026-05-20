import { Router } from 'express';
import type { Request, Response } from 'express';
import type { AppState } from '../types';

export function createConfigRouter(state: AppState): Router {
  const router = Router();

  router.get('/config', (_req: Request, res: Response) => {
    const videos = state.getVideosInFolder(state.config.loopFolder);
    res.json({ ...state.config, videos });
  });

  router.post('/config', (req: Request, res: Response) => {
    const { loopFolder, featureFile, featureTime } = req.body as {
      loopFolder?: string;
      featureFile?: string;
      featureTime?: string;
    };

    if (loopFolder !== undefined) state.config.loopFolder = loopFolder;
    if (featureFile !== undefined) state.config.featureFile = featureFile;
    if (featureTime !== undefined) state.config.featureTime = featureTime;

    state.saveConfig();
    state.broadcast({ type: 'config_update', config: state.config });

    if (state.config.loopFolder) state.watchFolder(state.config.loopFolder);

    res.json({ ok: true, config: state.config });
  });

  return router;
}
