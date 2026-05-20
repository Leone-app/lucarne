import { Router } from 'express';
import type { Request, Response } from 'express';
import type { AppState } from '../types';

export function createSessionRouter(state: AppState): Router {
  const router = Router();

  router.post('/start', (_req: Request, res: Response) => {
    if (!state.config.loopFolder) {
      res.status(400).json({ error: 'No loop folder configured' });
      return;
    }

    state.config.status = 'running';
    state.saveConfig();

    const videos = state.getVideosInFolder(state.config.loopFolder);
    state.broadcast({ type: 'play_loop', videos });

    if (state.config.featureTime && state.config.featureFile) {
      state.scheduleFeature(state.config.featureTime);
    }

    res.json({ ok: true });
  });

  router.post('/stop', (_req: Request, res: Response) => {
    state.config.status = 'idle';
    state.saveConfig();
    state.cancelSchedule();
    state.broadcast({ type: 'stop' });
    res.json({ ok: true });
  });

  router.post('/play-feature-now', (_req: Request, res: Response) => {
    if (!state.config.featureFile) {
      res.status(400).json({ error: 'No feature file configured' });
      return;
    }
    state.cancelSchedule();
    state.config.status = 'feature';
    state.saveConfig();
    state.broadcast({ type: 'play_feature', file: state.config.featureFile, audioTrack: state.config.featureAudioTrack ?? undefined });
    res.json({ ok: true });
  });

  router.post('/feature-ended', (_req: Request, res: Response) => {
    state.config.status = 'running';
    state.saveConfig();
    const videos = state.getVideosInFolder(state.config.loopFolder);
    state.broadcast({ type: 'play_loop', videos });

    if (state.config.featureTime && state.config.featureFile) {
      state.scheduleFeature(state.config.featureTime);
    }

    res.json({ ok: true });
  });

  return router;
}
