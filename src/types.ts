export interface Config {
  loopFolder: string;
  featureFile: string;
  featureTime: string;
  status: 'idle' | 'running' | 'feature';
}

export interface VideoFile {
  name: string;
  path: string;
}

export type WSMessage =
  | { type: 'state'; config: Config }
  | { type: 'config_update'; config: Config }
  | { type: 'folder_update'; videos: VideoFile[] }
  | { type: 'play_loop'; videos: VideoFile[] }
  | { type: 'play_feature'; file: string }
  | { type: 'stop' };

export interface AppState {
  config: Config;
  saveConfig: () => void;
  getVideosInFolder: (folderPath: string) => VideoFile[];
  watchFolder: (folderPath: string) => void;
  scheduleFeature: (timeStr: string) => void;
  cancelSchedule: () => void;
  broadcast: (msg: WSMessage) => void;
}
