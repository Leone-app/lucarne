import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { Config, LoopItem, VideoFile, AudioTrackInfo } from './types';
import { IdleView } from './IdleView';
import { LiveView } from './LiveView';
import { LeoneWordmark } from './ui';

const DEFAULT_CONFIG: Config = {
  loopFolder: '',
  featureFile: '',
  featureTime: '',
  featureAudioTrack: null,
  status: 'idle',
  welcomePage: {
    mode: 'time',
    bg: '#0b0908', fg: '#ece6d5', accent: '#e8c878',
    brandText: 'LUCARNE', showBrand: true, showDate: true,
    eventName: '', title: '', subtitle: '', logos: [],
  },
  welcomePageInterval: null,
  welcomePageDuration: 30,
  loopMusic: { enabled: false, file: '', muteVideos: false, loop: true, volume: 80, fadeIn: 2, fadeOut: 2 },
  filmAudio: { subtitles: 'none', output: 'auto', volume: 100, normalize: false, delay: 0 },
};

export function App() {
  const [config, setConfig] = useState<Config>(DEFAULT_CONFIG);
  const [videos, setVideos] = useState<VideoFile[]>([]);
  const [audioTracks, setAudioTracks] = useState<AudioTrackInfo[]>([]);
  const [sessionState, setSessionState] = useState<'idle' | 'running'>('idle');
  const [livePhase, setLivePhase] = useState<'loop' | 'feature' | 'paused'>('loop');
  const [loopItems, setLoopItems] = useState<LoopItem[]>([]);
  const [tab, setTab] = useState<'programmation' | 'accueil'>('programmation');

  /* ── WS ── */
  useEffect(() => {
    let ws: WebSocket;
    const connect = () => {
      ws = new WebSocket(`ws://${location.host}`);
      ws.onmessage = (e) => {
        const msg = JSON.parse(e.data as string);
        if (msg.type === 'state') {
          setConfig(msg.config);
          if (msg.config.status === 'running') setSessionState('running');
          else if (msg.config.status === 'idle') setSessionState('idle');
        } else if (msg.type === 'config_update') {
          setConfig(msg.config);
        } else if (msg.type === 'folder_update') {
          setVideos(msg.videos);
        } else if (msg.type === 'play_loop') {
          setLoopItems(msg.items || []);
          setSessionState('running');
          setLivePhase('loop');
        } else if (msg.type === 'play_feature') {
          setLivePhase('feature');
        } else if (msg.type === 'feature_paused') {
          setLivePhase('paused');
        } else if (msg.type === 'resume_feature') {
          setLivePhase('feature');
        } else if (msg.type === 'stop') {
          setSessionState('idle');
          setLoopItems([]);
        }
      };
      ws.onclose = () => setTimeout(connect, 2000);
    };
    connect();
    return () => ws?.close();
  }, []);

  /* ── config fetch on mount ── */
  useEffect(() => {
    fetch('/api/config')
      .then((r) => r.json())
      .then((data) => {
        setConfig(data);
        setVideos(data.videos || []);
        if (data.status === 'running') setSessionState('running');
      })
      .catch(() => {});
  }, []);

  /* ── fetch audio tracks when feature file changes ── */
  useEffect(() => {
    if (!config.featureFile) { setAudioTracks([]); return; }
    fetch(`/api/audio-tracks?path=${encodeURIComponent(config.featureFile)}`)
      .then(r => r.json())
      .then(setAudioTracks)
      .catch(() => setAudioTracks([]));
  }, [config.featureFile]);

  /* ── save config (debounced per call site) ── */
  const saveConfig = useCallback((patch: Partial<Config>) => {
    setConfig((c) => ({ ...c, ...patch }));
    fetch('/api/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    }).catch(() => {});
  }, []);

  /* ── session actions ── */
  const startSession = useCallback(() => {
    fetch('/api/start', { method: 'POST' }).catch(() => {});
  }, []);

  const stopSession = useCallback(() => {
    fetch('/api/stop', { method: 'POST' }).catch(() => {});
  }, []);

  const playFeatureNow = useCallback(() => {
    fetch('/api/play-feature-now', { method: 'POST' }).catch(() => {});
  }, []);

  const pauseFeature = useCallback(() => {
    fetch('/api/pause-feature', { method: 'POST' }).catch(() => {});
  }, []);

  const resumeFeature = useCallback(() => {
    fetch('/api/resume-feature', { method: 'POST' }).catch(() => {});
  }, []);

  /* ── derived ── */
  const scheduledTimeMs = useMemo(() => {
    if (!config.featureTime) return Date.now() + 3600000;
    const [hh, mm] = config.featureTime.split(':').map(Number);
    const d = new Date();
    d.setHours(hh, mm, 0, 0);
    if (d.getTime() < Date.now()) d.setDate(d.getDate() + 1);
    return d.getTime();
  }, [config.featureTime]);

  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const timeUntil = useMemo(() => {
    const diff = Math.max(0, scheduledTimeMs - now);
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    if (h > 0) return `${h}h ${String(m).padStart(2, '0')}m`;
    return `${m}m ${String(s).padStart(2, '0')}s`;
  }, [scheduledTimeMs, now]);

  const liveLabel = livePhase === 'loop' ? 'Boucle' : livePhase === 'paused' ? 'Pause · Boucle' : 'Film en cours';

  return (
    <div className="shell">
      <header className="top">
        <div className="wordmark">
          <span className="name">Lucarne</span>
          <span className="role">Régie événement</span>
        </div>
        <div className="top-status">
          {sessionState === 'idle' ? (
            <div className="pill">
              <span className="dot" />
              <span className="label">En attente</span>
              <span className="value">·</span>
              <span className="value">Séance à <span className="gold">{config.featureTime || '—'}</span></span>
            </div>
          ) : (
            <div className="pill live">
              <span className="dot" />
              <span className="label">En séance</span>
              <span className="value">·</span>
              <span className="value gold">{liveLabel}</span>
            </div>
          )}
        </div>
        <div style={{ width: 120 }} />
      </header>

      {sessionState === 'idle' ? (
        <IdleView
          config={config}
          videos={videos}
          audioTracks={audioTracks}
          tab={tab}
          setTab={setTab}
          saveConfig={saveConfig}
          scheduledTimeMs={scheduledTimeMs}
          timeUntil={timeUntil}
          startSession={startSession}
        />
      ) : (
        <LiveView
          config={config}
          loopItems={loopItems}
          audioTracks={audioTracks}
          livePhase={livePhase}
          setLivePhase={setLivePhase}
          scheduledTimeMs={scheduledTimeMs}
          timeUntil={timeUntil}
          stopSession={stopSession}
          playFeatureNow={playFeatureNow}
          pauseFeature={pauseFeature}
          resumeFeature={resumeFeature}
        />
      )}

      <footer className="foot">
        <div>Lucarne · {new Date().getFullYear()}</div>
        <div className="leone-foot">
          <span>Conçu par</span>
          <LeoneWordmark height={12} />
        </div>
      </footer>
    </div>
  );
}
