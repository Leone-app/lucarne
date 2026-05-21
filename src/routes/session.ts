import { Router } from 'express';
import type { Request, Response } from 'express';
import type { AppState, Config, VideoFile, LoopItem } from '../types';

function buildLoopItems(videos: VideoFile[], config: Config): LoopItem[] {
  const { welcomePageInterval, welcomePageDuration, welcomePage } = config;
  const items: LoopItem[] = [];
  const wp: LoopItem = { type: 'welcome_page', duration: welcomePageDuration, config: welcomePage };

  if (welcomePageInterval) items.push(wp);

  videos.forEach((v, i) => {
    items.push({ type: 'video', ...v });
    if (welcomePageInterval && (i + 1) % welcomePageInterval === 0) items.push(wp);
  });

  return items.length ? items : videos.map(v => ({ type: 'video', ...v }));
}

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
    state.broadcast({ type: 'play_loop', items: buildLoopItems(videos, state.config) });

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
    state.broadcast({ type: 'play_loop', items: buildLoopItems(videos, state.config) });

    if (state.config.featureTime && state.config.featureFile) {
      state.scheduleFeature(state.config.featureTime);
    }

    res.json({ ok: true });
  });

  return router;
}
