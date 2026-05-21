import { Router } from 'express';
import type { Request, Response } from 'express';
import { spawn } from 'child_process';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import fs from 'fs';
import type { AppState, Config } from '../types';
import { getAudioTracks, getSubtitleTracks } from '../ffprobe';

const UPDATABLE_KEYS: (keyof Config)[] = [
  'loopFolder', 'featureFile', 'featureTime', 'featureAudioTrack', 'featureSubtitleTrack',
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

  router.get('/subtitle-tracks', (req: Request, res: Response) => {
    const filePath = req.query.path as string | undefined;
    if (!filePath) {
      res.status(400).json({ error: 'Missing path' });
      return;
    }
    res.json(getSubtitleTracks(filePath));
  });

  router.get('/subtitles', (req: Request, res: Response) => {
    const filePath = req.query.path as string | undefined;
    const track = parseInt(req.query.track as string ?? '0', 10);

    if (!filePath || !fs.existsSync(filePath)) {
      res.status(404).send('Not found');
      return;
    }

    res.setHeader('Content-Type', 'text/vtt; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache');

    const ffmpeg = spawn(ffmpegInstaller.path, [
      '-loglevel', 'warning',
      '-i', filePath,
      '-map', `0:s:${track}`,
      '-c:s', 'webvtt',
      '-f', 'webvtt',
      'pipe:1',
    ]);

    ffmpeg.stdout.pipe(res);
    ffmpeg.stderr.on('data', (d: Buffer) => console.error('[ffmpeg-sub]', d.toString()));
    req.on('close', () => ffmpeg.kill('SIGTERM'));
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
