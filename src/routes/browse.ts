import { Router } from 'express';
import type { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { VIDEO_EXTENSIONS } from '../watcher';
import type { AppState } from '../types';

export function createBrowseRouter(state: AppState): Router {
  const router = Router();

  router.post('/browse', (req: Request, res: Response) => {
    const { dir } = req.body as { dir?: string };
    const target = dir || os.homedir();

    try {
      const entries = fs.readdirSync(target, { withFileTypes: true });
      const folders = entries
        .filter(e => e.isDirectory() && !e.name.startsWith('.'))
        .map(e => ({ name: e.name, path: path.join(target, e.name) }));
      const videos = entries
        .filter(e => e.isFile() && VIDEO_EXTENSIONS.includes(path.extname(e.name).toLowerCase()))
        .map(e => ({ name: e.name, path: path.join(target, e.name) }));
      res.json({ current: target, parent: path.dirname(target), folders, videos });
    } catch (e) {
      res.status(400).json({ error: (e as Error).message });
    }
  });

  return router;
}
