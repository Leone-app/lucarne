import fs from 'fs';
import path from 'path';
import type { Config } from './types';

export const CONFIG_FILE = path.join(__dirname, '..', 'config.json');

export function loadConfig(): Config {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8')) as Config;
    }
  } catch {}
  return { loopFolder: '', featureFile: '', featureTime: '', status: 'idle' };
}

export function saveConfig(config: Config): void {
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}
