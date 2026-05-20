import fs from 'fs';
import path from 'path';
import chokidar from 'chokidar';
import type { FSWatcher } from 'chokidar';
import type { VideoFile } from './types';

export const VIDEO_EXTENSIONS = ['.mp4', '.mov', '.mkv', '.avi', '.m4v', '.webm'];

let folderWatcher: FSWatcher | null = null;

export function getVideosInFolder(folderPath: string): VideoFile[] {
  try {
    if (!folderPath || !fs.existsSync(folderPath)) return [];
    return fs.readdirSync(folderPath)
      .filter(f => VIDEO_EXTENSIONS.includes(path.extname(f).toLowerCase()))
      .sort()
      .map(f => ({ name: f, path: path.join(folderPath, f) }));
  } catch {
    return [];
  }
}

export function watchFolder(folderPath: string, onChange: () => void): void {
  if (folderWatcher) folderWatcher.close();
  if (!folderPath || !fs.existsSync(folderPath)) return;

  folderWatcher = chokidar.watch(folderPath, { depth: 0, ignoreInitial: true });
  folderWatcher.on('add', onChange);
  folderWatcher.on('unlink', onChange);
}
