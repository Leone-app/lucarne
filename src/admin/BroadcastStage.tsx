import React, { useState, useEffect } from 'react';
import type { WelcomePageConfig } from './types';
import { LeoneWordmark } from './ui';

interface BroadcastStageProps {
  config: WelcomePageConfig;
  filmTime: string;
  scheduledTimeMs: number;
}

export function BroadcastStage({ config, filmTime, scheduledTimeMs }: BroadcastStageProps) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const stageStyle = { '--stage-bg': config.bg, '--stage-fg': config.fg, '--stage-accent': config.accent } as React.CSSProperties;

  let centerNode: React.ReactNode;
  if (config.mode === 'time') {
    centerNode = (
      <div className="center">
        <div className="label">Séance à</div>
        <div className="big">{filmTime}</div>
      </div>
    );
  } else if (config.mode === 'countdown') {
    const diff = Math.max(0, scheduledTimeMs - now);
    const hours = Math.floor(diff / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    const secs = Math.floor((diff % 60000) / 1000);
    const display = hours > 0
      ? `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
      : `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    centerNode = (
      <div className="center">
        <div className="label">Début dans</div>
        <div className="big" style={hours > 0 ? { fontSize: '10cqw' } : undefined}>{display}</div>
      </div>
    );
  } else {
    centerNode = (
      <div className="center">
        <div className="big" style={{ fontSize: '8cqw' }}>★</div>
      </div>
    );
  }

  const dateStr = new Date(now).toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long' }).toUpperCase();

  return (
    <div className="stage" style={stageStyle}>
      <div className="head">
        <div className="brand" style={{ visibility: config.showBrand ? 'visible' : 'hidden' }}>
          <div>{config.brandText}</div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '1cqw', marginTop: '0.3cqw',
            fontFamily: '"JetBrains Mono", monospace', fontSize: '0.9cqw',
            letterSpacing: '0.3em', textTransform: 'uppercase',
            color: config.fg, opacity: 0.7, fontStyle: 'normal', fontWeight: 400,
          }}>
            <span>by</span>
            <LeoneWordmark height={22} color={config.fg} />
          </div>
        </div>
        <div className="meta">
          {config.showDate && <div className="date">{dateStr}</div>}
          {config.eventName && <div>{config.eventName}</div>}
        </div>
      </div>
      {centerNode}
      {config.title && (
        <div style={{ textAlign: 'center', zIndex: 1, marginTop: '-2cqw' }}>
          <div style={{ fontFamily: '"Cormorant Garamond", serif', fontStyle: 'italic', fontWeight: 500, fontSize: '4cqw', color: config.fg }}>
            {config.title}
          </div>
          {config.subtitle && (
            <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '1.1cqw', letterSpacing: '0.4em', textTransform: 'uppercase', color: config.fg, opacity: 0.6, marginTop: '1cqw' }}>
              {config.subtitle}
            </div>
          )}
        </div>
      )}
      <div className="foot">
        {config.logos.map((l, i) => (
          <div key={i} className="logo-box" dangerouslySetInnerHTML={{ __html: l }} />
        ))}
        {config.logos.length === 0 && <div className="placeholder">Logo</div>}
      </div>
    </div>
  );
}

export function PreviewPane({ config, filmTime, scheduledTimeMs, label = "Aperçu · Page d'accueil" }: BroadcastStageProps & { label?: string }) {
  return (
    <div className="preview-card">
      <div className="preview-bar">
        <div className="dots"><span /><span /><span /></div>
        <span className="label">{label}</span>
        <span>16:9</span>
      </div>
      <div className="preview-frame">
        <div className="preview-stage">
          <BroadcastStage config={config} filmTime={filmTime} scheduledTimeMs={scheduledTimeMs} />
        </div>
      </div>
    </div>
  );
}
