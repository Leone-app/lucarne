import React, { useState, useEffect, useMemo } from 'react';
import type { Config, LoopItem, AudioTrackInfo } from './types';
import { SummaryRow, PlayIcon, SquareIcon, RotateIcon, MusicIcon, LockIcon } from './ui';
import { BroadcastStage } from './BroadcastStage';

interface LiveViewProps {
  config: Config;
  loopItems: LoopItem[];
  audioTracks: AudioTrackInfo[];
  livePhase: 'loop' | 'feature' | 'paused';
  setLivePhase: (p: 'loop' | 'feature' | 'paused') => void;
  scheduledTimeMs: number;
  timeUntil: string;
  stopSession: () => void;
  playFeatureNow: () => void;
  pauseFeature: () => void;
  resumeFeature: () => void;
}

function LiveScreen({ phase, loopItems, config }: {
  phase: 'loop' | 'feature' | 'paused';
  loopItems: LoopItem[];
  config: Config;
}) {
  let content: React.ReactNode;
  if (phase === 'loop' || phase === 'paused') {
    content = (
      <div style={{ width: '100%', height: '100%', background: '#000', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, #1a1a1a 0%, #000 80%)' }} />
        <div style={{ position: 'relative', textAlign: 'center' }}>
          {phase === 'paused' && (
            <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '1.2cqw', color: '#e8c878', letterSpacing: '0.3em', marginBottom: '1.2cqw' }}>⏸ FILM EN PAUSE</div>
          )}
          <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '1.5cqw', color: 'rgba(255,255,255,0.65)', letterSpacing: '0.3em' }}>► BOUCLE EN COURS</div>
          <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '1cqw', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.2em', marginTop: '1.2cqw' }}>
            {loopItems.filter(i => i.type === 'video').length} vidéo{loopItems.filter(i => i.type === 'video').length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>
    );
  } else {
    content = (
      <div style={{ width: '100%', height: '100%', background: '#000', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: '"Cormorant Garamond", serif', fontStyle: 'italic', fontSize: '6.5cqw', color: '#e8c878' }}>
          {config.featureFile?.split('/').pop()?.replace(/\.[^.]+$/, '') || 'Film'}
        </div>
      </div>
    );
  }

  return (
    <div className="preview-card">
      <div className="preview-bar">
        <div className="dots"><span /><span /><span /></div>
        <span className="label">⦿ EN DIRECT · Sortie projecteur</span>
        <span>16:9</span>
      </div>
      <div className="preview-frame">
        <div className="preview-stage">
          {content}
        </div>
      </div>
    </div>
  );
}

export function LiveView({ config, loopItems, audioTracks, livePhase, setLivePhase, scheduledTimeMs, timeUntil, stopSession, playFeatureNow, pauseFeature, resumeFeature }: LiveViewProps) {
  const [liveLoopIdx, setLiveLoopIdx] = useState(0);
  const [liveElapsed, setLiveElapsed] = useState(0);

  const videoItems = useMemo(() => loopItems.filter(i => i.type === 'video'), [loopItems]);

  /* ── simulate loop progress ── */
  useEffect(() => {
    if (livePhase !== 'loop' && livePhase !== 'paused') return;
    const id = setInterval(() => {
      setLiveElapsed((e) => e + 1);
    }, 1000);
    return () => clearInterval(id);
  }, [livePhase]);

  /* ── advance loop index (UI only) ── */
  useEffect(() => {
    if (!videoItems.length) return;
    const cur = videoItems[liveLoopIdx % videoItems.length];
    if (!cur) return;
  }, [liveElapsed, liveLoopIdx, videoItems]);

  const currentItem = loopItems[liveLoopIdx % Math.max(1, loopItems.length)];
  const currentVideo = currentItem?.type === 'video' ? currentItem : videoItems[0];

  /* ── timeline ── */
  const timelineBlocks = useMemo(() => {
    const blocks = loopItems.map((item, i) => ({
      key: i,
      label: item.type === 'video' ? item.name : "Page d'accueil",
      isWelcome: item.type === 'welcome_page',
      width: item.type === 'welcome_page' ? 120 : 100,
    }));
    blocks.push({ key: -1, label: config.featureFile?.split('/').pop() || 'Film', isWelcome: false, width: 200 });
    return blocks;
  }, [loopItems, config.featureFile]);

  const handleFeatureToggle = () => {
    if (livePhase === 'loop') {
      playFeatureNow();
    } else if (livePhase === 'feature') {
      setLivePhase('loop');
    }
  };

  const SUBTITLE_OPTIONS = [
    { id: 'none', label: 'Aucun' },
    { id: 'fr',   label: 'Français' },
    { id: 'en',   label: 'Anglais' },
    { id: 'fr-sdh', label: 'Français · Malentendants' },
  ];

  return (
    <div className="live-shell">
      {/* ── live banner ── */}
      <div className="live-banner">
        <div className="info">
          <div className="stat">
            <span className="k">Phase</span>
            <span className="v gold">
              {livePhase === 'loop' ? 'Boucle d\'accueil' : livePhase === 'paused' ? '⏸ Pause · Boucle en cours' : 'Film principal'}
            </span>
          </div>
          <div className="stat">
            <span className="k">{livePhase === 'feature' ? 'Film' : livePhase === 'paused' ? 'Film pausé' : 'Film dans'}</span>
            <span className="v big">{livePhase === 'feature' ? (config.featureFile?.split('/').pop() || '—') : livePhase === 'paused' ? (config.featureFile?.split('/').pop() || '—') : timeUntil}</span>
          </div>
          <div className="stat">
            <span className="k">Séance</span>
            <span className="v gold">{config.featureTime || '—'}</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {livePhase === 'loop' && (
            <button className="btn" onClick={handleFeatureToggle}>
              <PlayIcon size={14} /> Lancer le film maintenant
            </button>
          )}
          {livePhase === 'feature' && (
            <>
              <button className="btn" onClick={pauseFeature}>
                ⏸ Pause
              </button>
              <button className="btn" onClick={handleFeatureToggle}>
                <RotateIcon size={14} /> Relancer la boucle
              </button>
            </>
          )}
          {livePhase === 'paused' && (
            <button className="btn" style={{ background: 'var(--gold)', color: '#000', fontWeight: 600 }} onClick={resumeFeature}>
              ▶ Reprendre le film
            </button>
          )}
          <button className="btn danger large" onClick={stopSession}>
            <SquareIcon size={13} /> Arrêter la séance
          </button>
        </div>
      </div>

      <div className="live-grid">
        {/* ── left col ── */}
        <div className="col">
          <LiveScreen
            phase={livePhase}
            loopItems={loopItems}
            config={config}
          />

          <section className="card">
            <div className="card-head">
              <h2>Déroulé de la séance</h2>
              <span className="meta">
                {livePhase === 'feature' ? 'Film en cours' : livePhase === 'paused' ? '⏸ Film en pause' : `Reste ${timeUntil} avant le film`}
              </span>
            </div>
            <div className="timeline-track">
              {timelineBlocks.map((b) => {
                const isFilm = b.key === -1;
                const isNow = !isFilm && (livePhase === 'loop' || livePhase === 'paused') && b.key === liveLoopIdx % Math.max(1, loopItems.length);
                const isFilmNow = isFilm && livePhase === 'feature';
                let cls = 'timeline-block';
                if (isFilm) cls += ' film';
                else if (b.isWelcome) cls += ' intro';
                if (isNow || isFilmNow) cls += ' now';
                return (
                  <div
                    key={b.key}
                    className={cls}
                    style={{ width: b.width, '--progress': isNow ? '40%' : '0%' } as React.CSSProperties}
                  >
                    <span className="t-name" title={b.label}>{b.label}</span>
                    <span className="t-dur">{isFilm ? '—' : b.isWelcome ? `${config.welcomePageDuration}s` : '—'}</span>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* ── right col ── */}
        <div className="col">
          <section className="card">
            <div className="card-head">
              <h2>En direct</h2>
              <span className="meta">⦿ Diffusion active</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <div style={{ fontSize: 10, letterSpacing: '0.18em', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 6 }}>Maintenant</div>
                {livePhase === 'loop' || livePhase === 'paused' ? (
                  currentVideo ? (
                    <>
                      <div style={{ fontSize: 14, color: 'var(--gold)', fontFamily: '"JetBrains Mono", monospace' }}>{currentVideo.name}</div>
                      {config.loopMusic.enabled && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, padding: '8px 10px', background: 'var(--surface-2)', border: '1px solid var(--line)', fontSize: 11 }}>
                          <span style={{ color: 'var(--gold)' }}><MusicIcon /></span>
                          <span style={{ color: 'var(--cream-dim)', fontFamily: '"JetBrains Mono", monospace' }}>{config.loopMusic.file || 'Musique active'}</span>
                          <span style={{ color: 'var(--muted)', marginLeft: 'auto' }}>{config.loopMusic.volume}%</span>
                        </div>
                      )}
                    </>
                  ) : (
                    <div style={{ fontSize: 14, color: 'var(--cream-dim)' }}>Boucle d'accueil en cours</div>
                  )
                ) : (
                  <div style={{ fontSize: 16, color: 'var(--gold)', fontFamily: '"JetBrains Mono", monospace' }}>
                    {config.featureFile?.split('/').pop() || '—'}
                  </div>
                )}
              </div>

              <div style={{ height: 1, background: 'var(--line)' }} />

              <div>
                <div style={{ fontSize: 10, letterSpacing: '0.18em', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 6 }}>Ensuite</div>
                {livePhase === 'loop' ? (
                  <div style={{ fontSize: 13, color: 'var(--cream-dim)' }}>
                    Film <span style={{ color: 'var(--cream)' }}>{config.featureFile?.split('/').pop() || '—'}</span>
                    {' '}à <span style={{ color: 'var(--gold)' }}>{config.featureTime || '—'}</span>
                  </div>
                ) : livePhase === 'paused' ? (
                  <div style={{ fontSize: 13, color: 'var(--cream-dim)' }}>
                    Reprise du film <span style={{ color: 'var(--gold)' }}>{config.featureFile?.split('/').pop() || '—'}</span>
                  </div>
                ) : (
                  <div style={{ fontSize: 13, color: 'var(--cream-dim)' }}>Fin de séance</div>
                )}
              </div>
            </div>
          </section>

          <section className="card">
            <div className="card-head">
              <h2>Boucle · {videoItems.length} vidéo{videoItems.length !== 1 ? 's' : ''}</h2>
              <span className="meta" style={{ color: livePhase === 'paused' ? '#e8c878' : 'var(--gold)' }}>
                {livePhase === 'paused' ? '⏸ Entracte' : 'En cours'}
              </span>
            </div>
            <div className="file-list">
              {videoItems.map((item, i) => {
                if (item.type !== 'video') return null;
                const isPlaying = (livePhase === 'loop' || livePhase === 'paused') && i === liveLoopIdx % Math.max(1, videoItems.length);
                return (
                  <div key={item.path} className={`file-row${isPlaying ? ' playing' : ''}`}>
                    <span className="idx">{isPlaying ? <PlayIcon size={11} strokeWidth={2.2} /> : String(i + 1).padStart(2, '0')}</span>
                    <span className="name">{item.name}</span>
                    <span className="dur" />
                    <span className="drag" />
                  </div>
                );
              })}
              {videoItems.length === 0 && (
                <div style={{ padding: 14, color: 'var(--muted)', fontSize: 12, fontFamily: '"JetBrains Mono", monospace' }}>Aucune vidéo</div>
              )}
            </div>
          </section>

          <section className="card">
            <div className="card-head">
              <h2>Configuration verrouillée</h2>
              <span className="meta"><LockIcon /> en séance</span>
            </div>
            <SummaryRow k="Film" v={config.featureFile?.split('/').pop() || '—'} />
            <SummaryRow k="Heure de début" v={config.featureTime || '—'} gold />
            {(audioTracks.length > 0 || config.featureAudioTrack !== null) && (() => {
              const t = audioTracks.find(a => a.index === (config.featureAudioTrack ?? 0));
              const label = t
                ? [t.language, t.title].filter(Boolean).join(' — ') || `Piste ${t.index}`
                : config.featureAudioTrack !== null ? `Piste ${config.featureAudioTrack}` : 'Auto';
              return <SummaryRow k="Piste audio" v={label} />;
            })()}
            <SummaryRow k="Sous-titres" v={SUBTITLE_OPTIONS.find(s => s.id === config.filmAudio.subtitles)?.label || '—'} />
            <SummaryRow k="Volume film" v={`${config.filmAudio.volume}%`} />
            <SummaryRow k="Musique boucle" v={config.loopMusic.enabled ? `${config.loopMusic.volume}%` : 'Désactivée'} />
            <SummaryRow k="Page d'accueil" v={config.welcomePageInterval ? `Toutes les ${config.welcomePageInterval} vidéos` : 'Désactivée'} />
          </section>
        </div>
      </div>
    </div>
  );
}
