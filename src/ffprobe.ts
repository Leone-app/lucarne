import { spawnSync } from 'child_process';
import ffprobeInstaller from '@ffprobe-installer/ffprobe';
import type { AudioTrackInfo } from './types';

interface FfprobeStream {
  codec_name?: string;
  tags?: {
    language?: string;
    title?: string;
    handler_name?: string;
  };
}

interface FfprobeOutput {
  streams?: FfprobeStream[];
}

export function getAudioTracks(filePath: string): AudioTrackInfo[] {
  try {
    const result = spawnSync(ffprobeInstaller.path, [
      '-v', 'quiet',
      '-print_format', 'json',
      '-show_streams',
      '-select_streams', 'a',
      filePath,
    ], { encoding: 'utf8', timeout: 10000 });

    if (result.status !== 0 || !result.stdout) return [];

    const output = JSON.parse(result.stdout) as FfprobeOutput;
    const streams = output.streams ?? [];

    return streams.map((s, i) => ({
      index: i,
      language: s.tags?.language ?? '',
      title: s.tags?.title ?? s.tags?.handler_name ?? '',
      codec: s.codec_name ?? '',
    }));
  } catch {
    return [];
  }
}
