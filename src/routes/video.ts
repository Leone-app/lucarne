import { Router } from 'express';
import type { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

const MIME_TYPES: Record<string, string> = {
  '.mp4': 'video/mp4',
  '.mov': 'video/quicktime',
  '.mkv': 'video/x-matroska',
  '.avi': 'video/x-msvideo',
  '.m4v': 'video/mp4',
  '.webm': 'video/webm',
};

export const videoRouter = Router();

videoRouter.get('/', (req: Request, res: Response) => {
  const filePath = req.query.path as string | undefined;
  if (!filePath || !fs.existsSync(filePath)) {
    res.status(404).send('Not found');
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  const mime = MIME_TYPES[ext] ?? 'video/mp4';
  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;

  if (range) {
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunkSize = end - start + 1;
    const file = fs.createReadStream(filePath, { start, end });
    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunkSize,
      'Content-Type': mime,
    });
    file.pipe(res);
  } else {
    res.writeHead(200, { 'Content-Length': fileSize, 'Content-Type': mime });
    fs.createReadStream(filePath).pipe(res);
  }
});
