export interface WelcomePageConfig {
  mode: 'time' | 'countdown' | 'none';
  bg: string;
  fg: string;
  accent: string;
  brandText: string;
  showBrand: boolean;
  showDate: boolean;
  eventName: string;
  title: string;
  subtitle: string;
  logos: string[];
}

export interface LoopMusicConfig {
  enabled: boolean;
  file: string;
  muteVideos: boolean;
  loop: boolean;
  volume: number;
  fadeIn: number;
  fadeOut: number;
}

export interface FilmAudioConfig {
  subtitles: string;
  output: string;
  volume: number;
  normalize: boolean;
  delay: number;
}

export interface Config {
  loopFolder: string;
  featureFile: string;
  featureTime: string;
  featureAudioTrack: number | null;
  featureSubtitleTrack: number | null;
  status: 'idle' | 'running' | 'feature' | 'paused';
  welcomePage: WelcomePageConfig;
  welcomePageInterval: number | null;
  welcomePageDuration: number;
  loopMusic: LoopMusicConfig;
  filmAudio: FilmAudioConfig;
}

export interface AudioTrackInfo {
  index: number;
  language: string;
  title: string;
  codec: string;
}

export interface SubtitleTrackInfo {
  index: number;
  language: string;
  title: string;
  codec: string;
}

export interface VideoFile {
  name: string;
  path: string;
}

export type LoopItem =
  | { type: 'video'; name: string; path: string }
  | { type: 'welcome_page'; duration: number; config: WelcomePageConfig };

export type WSMessage =
  | { type: 'state'; config: Config }
  | { type: 'config_update'; config: Config }
  | { type: 'folder_update'; videos: VideoFile[] }
  | { type: 'play_loop'; items: LoopItem[] }
  | { type: 'play_feature'; file: string; audioTrack?: number; subtitleTrack?: number; delay?: number }
  | { type: 'live_phase'; phase: 'loop' | 'feature' }
  | { type: 'pause_feature' }
  | { type: 'feature_paused'; time: number }
  | { type: 'resume_feature'; file: string; audioTrack?: number; subtitleTrack?: number; startTime: number; delay?: number }
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
