import { Router } from 'express';
import type { Request, Response } from 'express';
import { spawn } from 'child_process';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
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

  if (ext === '.mkv') {
    const audioTrackParam = req.query.audioTrack as string | undefined;
    const audioTrack = audioTrackParam !== undefined ? parseInt(audioTrackParam, 10) : 0;
    const startTime = parseFloat(req.query.startTime as string) || 0;
    const delay = parseFloat(req.query.delay as string) || 0;

    const args: string[] = ['-loglevel', 'warning'];
    if (startTime > 0) args.push('-ss', String(Math.floor(startTime)));
    args.push(
      '-i', filePath,
      '-map', '0:v:0',
      '-map', `0:a:${audioTrack}`,
    );

    // aresample=async=1 fixes initial PTS offset from MKV transcoding
    const audioFilters = ['aresample=async=1'];
    if (delay !== 0) {
      const delayMs = Math.round(delay * 1000);
      if (delayMs > 0) audioFilters.push(`adelay=${delayMs}:all=1`);
      // negative delay (advance audio): not supported without dual-input seek
    }

    const ffmpeg = spawn(ffmpegInstaller.path, [
      ...args,
      '-c:v', 'copy',
      '-c:a', 'aac',
      '-ac', '2',
      '-ar', '48000',
      '-af', audioFilters.join(','),
      '-movflags', 'frag_keyframe+empty_moov+default_base_moof',
      '-f', 'mp4',
      'pipe:1',
    ]);

    ffmpeg.on('error', () => {
      // ffmpeg absent — fallback sur le streaming brut (vidéo OK, codec audio peut échouer)
      if (!res.headersSent) {
        const stat = fs.statSync(filePath);
        res.writeHead(200, { 'Content-Length': stat.size, 'Content-Type': 'video/x-matroska' });
        fs.createReadStream(filePath).pipe(res);
      }
    });

    ffmpeg.on('spawn', () => {
      res.setHeader('Content-Type', 'video/mp4');
      res.setHeader('Cache-Control', 'no-cache');
      ffmpeg.stdout.pipe(res);
    });

    ffmpeg.stderr.on('data', (d: Buffer) => console.error('[ffmpeg]', d.toString()));
    req.on('close', () => ffmpeg.kill('SIGTERM'));
    return;
  }

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
