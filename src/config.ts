import fs from 'fs';
import path from 'path';
import type { Config } from './types';

export const CONFIG_FILE = path.join(__dirname, '..', 'config.json');

const DEFAULTS: Config = {
  loopFolder: '', featureFile: '', featureTime: '', featureAudioTrack: null, status: 'idle',
  welcomePageInterval: null,
  welcomePageDuration: 30,
  welcomePage: {
    mode: 'time', bg: '#0b0908', fg: '#ece6d5', accent: '#e8c878',
    brandText: 'LUCARNE', showBrand: true, showDate: true,
    eventName: '', title: '', subtitle: '', logos: [],
  },
  loopMusic: {
    enabled: false, file: '', muteVideos: false, loop: true,
    volume: 80, fadeIn: 2, fadeOut: 2,
  },
  filmAudio: {
    subtitles: 'none', output: 'auto', volume: 100, normalize: false, delay: 0,
  },
};

export function loadConfig(): Config {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const saved = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8')) as Partial<Config>;
      return {
        ...DEFAULTS,
        ...saved,
        welcomePage: { ...DEFAULTS.welcomePage, ...(saved.welcomePage ?? {}) },
        loopMusic: { ...DEFAULTS.loopMusic, ...(saved.loopMusic ?? {}) },
        filmAudio: { ...DEFAULTS.filmAudio, ...(saved.filmAudio ?? {}) },
      };
    }
  } catch {}
  return { ...DEFAULTS };
}

export function saveConfig(config: Config): void {
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}
