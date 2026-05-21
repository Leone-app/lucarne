import React from 'react';
import type { Config, VideoFile, WelcomePageConfig, LoopMusicConfig, FilmAudioConfig, AudioTrackInfo, SubtitleTrackInfo } from './types';
import {
  Field, ToggleRow, Segmented, SummaryRow,
  FolderIcon, ClapIcon, SpeakerIcon, CaptionIcon, MusicIcon,
  MonitorIcon, PlayIcon, PlusIcon, XIcon, GripIcon, LEONE_SVG,
} from './ui';
import { PreviewPane } from './BroadcastStage';

const PALETTE = [
  { name: 'Cinéma',   bg: '#0b0908', fg: '#ece6d5', accent: '#e8c878' },
  { name: 'Noir',     bg: '#000000', fg: '#ffffff',  accent: '#ffffff' },
  { name: 'Bordeaux', bg: '#1a0a0a', fg: '#f5e6d3',  accent: '#c89a6b' },
  { name: 'Nuit',     bg: '#0a0e1a', fg: '#dde6f0',  accent: '#7fa2c9' },
  { name: 'Crème',    bg: '#ece6d5', fg: '#1a1410',  accent: '#8a3a2f' },
];


const OUTPUT_OPTIONS = [
  { id: 'auto',     label: 'Sortie système par défaut' },
  { id: 'hdmi',     label: 'HDMI · Projecteur' },
  { id: 'optical',  label: 'Optique · Ampli' },
];

interface IdleViewProps {
  config: Config;
  videos: VideoFile[];
  audioTracks: AudioTrackInfo[];
  subtitleTracks: SubtitleTrackInfo[];
  tab: 'programmation' | 'accueil';
  setTab: (t: 'programmation' | 'accueil') => void;
  saveConfig: (patch: Partial<Config>) => void;
  scheduledTimeMs: number;
  timeUntil: string;
  startSession: () => void;
}

export function IdleView({ config, videos, audioTracks, subtitleTracks, tab, setTab, saveConfig, scheduledTimeMs, timeUntil, startSession }: IdleViewProps) {
  const page = config.welcomePage;
  const music = config.loopMusic;
  const film = config.filmAudio;

  const setPage = (patch: Partial<WelcomePageConfig>) => saveConfig({ welcomePage: { ...page, ...patch } });
  const setMusic = (patch: Partial<LoopMusicConfig>) => saveConfig({ loopMusic: { ...music, ...patch } });
  const setFilm = (patch: Partial<FilmAudioConfig>) => saveConfig({ filmAudio: { ...film, ...patch } });

  const [hh, mm] = (config.featureTime || '19:00').split(':').map(Number);
  const setTime = (h: number, m: number) => {
    const hs = String(Math.max(0, Math.min(23, h))).padStart(2, '0');
    const ms = String(Math.max(0, Math.min(59, m))).padStart(2, '0');
    saveConfig({ featureTime: `${hs}:${ms}` });
  };

  const addLogo = () => setPage({ logos: [...page.logos, LEONE_SVG] });
  const removeLogo = (i: number) => setPage({ logos: page.logos.filter((_, k) => k !== i) });

  return (
    <>
      <div className="tabs">
        <div className={`tab${tab === 'programmation' ? ' active' : ''}`} onClick={() => setTab('programmation')}>
          Programmation
        </div>
        <div className={`tab${tab === 'accueil' ? ' active' : ''}`} onClick={() => setTab('accueil')}>
          Page d'accueil
        </div>
      </div>

      {tab === 'programmation' && (
        <div className="grid">
          <div className="col">
            {/* ── boucle ── */}
            <section className="card">
              <div className="card-head">
                <h2>Boucle d'accueil</h2>
                <span className="meta">{videos.length} vidéo{videos.length !== 1 ? 's' : ''}</span>
              </div>

              <Field label="Dossier source">
                <div className="input mono">
                  <span className="icon"><FolderIcon /></span>
                  <input
                    value={config.loopFolder}
                    onChange={(e) => saveConfig({ loopFolder: e.target.value })}
                    spellCheck={false}
                    placeholder="/chemin/vers/dossier"
                  />
                </div>
              </Field>

              <Field label="Vidéos détectées">
                <div className="file-list">
                  {videos.map((f, i) => (
                    <div key={f.path} className="file-row">
                      <span className="idx">{String(i + 1).padStart(2, '0')}</span>
                      <span className="name">{f.name}</span>
                      <span className="dur" />
                      <span className="drag"><GripIcon size={14} /></span>
                    </div>
                  ))}
                  {videos.length === 0 && (
                    <div style={{ padding: '14px', color: 'var(--muted)', fontSize: 12, fontFamily: '"JetBrains Mono", monospace' }}>
                      Aucune vidéo dans ce dossier
                    </div>
                  )}
                  <div className="file-list-add">
                    <span>Fichiers mp4/mkv/mov détectés automatiquement</span>
                  </div>
                </div>
              </Field>

              <div className="card-divider" />

              <ToggleRow
                label="Page d'accueil dans la boucle"
                desc={config.welcomePageInterval ? `Affichée toutes les ${config.welcomePageInterval} vidéo${config.welcomePageInterval !== 1 ? 's' : ''}` : 'Désactivée'}
                on={config.welcomePageInterval !== null}
                onChange={(v) => saveConfig({ welcomePageInterval: v ? 2 : null })}
              />

              {config.welcomePageInterval !== null && (
                <div className="row">
                  <Field label={`Intervalle · toutes les ${config.welcomePageInterval} vidéos`}>
                    <div className="slider-row">
                      <input
                        className="slider" type="range" min="1" max="10"
                        value={config.welcomePageInterval}
                        onChange={(e) => saveConfig({ welcomePageInterval: parseInt(e.target.value) })}
                      />
                    </div>
                  </Field>
                  <Field label={`Durée d'affichage · ${config.welcomePageDuration}s`}>
                    <div className="slider-row">
                      <input
                        className="slider" type="range" min="5" max="120" step="5"
                        value={config.welcomePageDuration}
                        onChange={(e) => saveConfig({ welcomePageDuration: parseInt(e.target.value) })}
                      />
                    </div>
                  </Field>
                </div>
              )}
            </section>

            {/* ── musique ── */}
            <section className="card">
              <div className="card-head">
                <h2>Musique d'ambiance</h2>
                <span className="meta">Jouée pendant la boucle · UI uniquement</span>
              </div>

              <ToggleRow
                label="Activer la musique de boucle"
                desc={music.enabled ? 'La musique se superpose au son des vidéos' : 'Désactivée'}
                on={music.enabled}
                onChange={(v) => setMusic({ enabled: v })}
              />

              <Field label="Fichier audio">
                <div className={`input mono${!music.enabled ? ' locked' : ''}`}>
                  <span className="icon"><MusicIcon /></span>
                  <input value={music.file} onChange={(e) => setMusic({ file: e.target.value })} spellCheck={false} placeholder="ambiance.mp3" />
                </div>
              </Field>

              <div style={!music.enabled ? { opacity: 0.5, pointerEvents: 'none' } : undefined}>
                <ToggleRow label="Couper le son des vidéos" desc="Les vidéos servent de visuel uniquement" on={music.muteVideos} onChange={(v) => setMusic({ muteVideos: v })} />
                <ToggleRow label="Lecture en boucle" desc="Reboucler si plus court que les vidéos" on={music.loop} onChange={(v) => setMusic({ loop: v })} />
                <div className="row" style={{ marginTop: 12 }}>
                  <Field label={`Volume · ${music.volume}%`}>
                    <div className="slider-row">
                      <input className="slider" type="range" min="0" max="100" value={music.volume} onChange={(e) => setMusic({ volume: parseInt(e.target.value) })} />
                    </div>
                  </Field>
                  <Field label={`Fondu entrée · ${music.fadeIn}s`}>
                    <div className="slider-row">
                      <input className="slider" type="range" min="0" max="10" step="0.5" value={music.fadeIn} onChange={(e) => setMusic({ fadeIn: parseFloat(e.target.value) })} />
                    </div>
                  </Field>
                </div>
              </div>
            </section>

            {/* ── film ── */}
            <section className="card">
              <div className="card-head">
                <h2>Film principal</h2>
                <span className="meta">Démarre à l'heure programmée</span>
              </div>

              <Field label="Fichier vidéo">
                <div className="input mono">
                  <span className="icon"><ClapIcon /></span>
                  <input value={config.featureFile} onChange={(e) => saveConfig({ featureFile: e.target.value })} spellCheck={false} placeholder="/chemin/vers/film.mkv" />
                </div>
              </Field>

              <Field label="Heure de début">
                <div className="time-block">
                  <div className="time-display">
                    <input className="num" type="number" value={String(hh).padStart(2, '0')} onChange={(e) => setTime(parseInt(e.target.value || '0'), mm)} />
                    <span className="colon">:</span>
                    <input className="num" type="number" value={String(mm).padStart(2, '0')} onChange={(e) => setTime(hh, parseInt(e.target.value || '0'))} />
                  </div>
                  <div className="time-aside">
                    <span className="k">Démarre dans</span>
                    <span className="v">{timeUntil}</span>
                  </div>
                </div>
              </Field>

              <div className="card-divider" />

              <Field label="Piste audio">
                <div className="input">
                  <span className="icon"><SpeakerIcon /></span>
                  {audioTracks.length > 0 ? (
                    <select
                      className="bare"
                      value={config.featureAudioTrack ?? 0}
                      onChange={(e) => saveConfig({ featureAudioTrack: parseInt(e.target.value) })}
                    >
                      {audioTracks.map((t) => (
                        <option key={t.index} value={t.index}>
                          {t.index} · {t.language} {t.title ? `— ${t.title}` : ''} ({t.codec})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span style={{ color: 'var(--muted)', fontSize: 12 }}>
                      {config.featureFile ? 'Chargement des pistes…' : 'Sélectionner un fichier'}
                    </span>
                  )}
                </div>
              </Field>

              <div className="row">
                <Field label="Sous-titres">
                  <div className="input">
                    <span className="icon"><CaptionIcon /></span>
                    <select
                      className="bare"
                      value={config.featureSubtitleTrack ?? -1}
                      onChange={(e) => {
                        const v = parseInt(e.target.value);
                        saveConfig({ featureSubtitleTrack: v === -1 ? null : v });
                      }}
                    >
                      <option value={-1}>Aucun</option>
                      {subtitleTracks.map((t) => (
                        <option key={t.index} value={t.index}>
                          {t.index} · {t.language}{t.title ? ` — ${t.title}` : ''} ({t.codec})
                        </option>
                      ))}
                      {subtitleTracks.length === 0 && config.featureFile && (
                        <option disabled value={-2}>Aucune piste détectée</option>
                      )}
                    </select>
                  </div>
                </Field>
                <Field label="Sortie audio">
                  <div className="input">
                    <select className="bare" value={film.output} onChange={(e) => setFilm({ output: e.target.value })}>
                      {OUTPUT_OPTIONS.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
                    </select>
                  </div>
                </Field>
              </div>

              <div className="row">
                <Field label={`Volume · ${film.volume}%`}>
                  <div className="slider-row">
                    <input className="slider" type="range" min="0" max="100" value={film.volume} onChange={(e) => setFilm({ volume: parseInt(e.target.value) })} />
                  </div>
                </Field>
                <Field label={`Délai audio · ${film.delay > 0 ? '+' : ''}${film.delay}ms`}>
                  <div className="slider-row">
                    <input className="slider" type="range" min="-300" max="300" step="10" value={film.delay} onChange={(e) => setFilm({ delay: parseInt(e.target.value) })} />
                  </div>
                </Field>
              </div>

              <ToggleRow label="Normaliser le volume" desc="Compense les écarts entre boucle et film" on={film.normalize} onChange={(v) => setFilm({ normalize: v })} />
            </section>
          </div>

          {/* ── right col: summary ── */}
          <div className="col">
            <section className="card bare">
              <div className="card-head">
                <h2>Récapitulatif</h2>
                <span className="meta">Vérification finale</span>
              </div>
              <div className="card">
                <SummaryRow k="Boucle" v={`${videos.length} vidéo${videos.length !== 1 ? 's' : ''}`} />
                <SummaryRow k="Page d'accueil" v={config.welcomePageInterval ? `Toutes les ${config.welcomePageInterval} vidéos · ${config.welcomePageDuration}s` : 'Désactivée'} />
                <SummaryRow k="Musique boucle" v={music.enabled ? (music.file || 'Activée') : 'Désactivée'} />
                <SummaryRow k="Film" v={config.featureFile ? config.featureFile.split('/').pop()! : '—'} />
                <SummaryRow k="Sous-titres" v={(() => {
                  if (config.featureSubtitleTrack === null) return 'Aucun';
                  const t = subtitleTracks.find(s => s.index === config.featureSubtitleTrack);
                  return t ? ([t.language, t.title].filter(Boolean).join(' — ') || `Piste ${t.index}`) : `Piste ${config.featureSubtitleTrack}`;
                })()} />
                <SummaryRow k="Démarrage" v={<span>{config.featureTime || '—'} <span style={{ color: 'var(--muted)' }}>· dans {timeUntil}</span></span>} gold />
              </div>
            </section>
          </div>
        </div>
      )}

      {tab === 'accueil' && (
        <div className="grid">
          <div className="col">
            <section className="card">
              <div className="card-head">
                <h2>Page d'accueil</h2>
                <span className="meta">Affichée dans la boucle d'accueil</span>
              </div>

              <Field label="Affichage central">
                <Segmented
                  value={page.mode}
                  onChange={(v) => setPage({ mode: v as WelcomePageConfig['mode'] })}
                  options={[
                    { value: 'time',      label: 'Heure de séance' },
                    { value: 'countdown', label: 'Décompte' },
                    { value: 'none',      label: 'Aucun' },
                  ]}
                />
              </Field>

              <div className="row">
                <Field label="Titre du film">
                  <div className="input"><input value={page.title} onChange={(e) => setPage({ title: e.target.value })} placeholder="Luck" /></div>
                </Field>
                <Field label="Sous-titre">
                  <div className="input"><input value={page.subtitle} onChange={(e) => setPage({ subtitle: e.target.value })} placeholder="Réalisateur · Durée" /></div>
                </Field>
              </div>

              <div className="row">
                <Field label="Marque">
                  <div className="input"><input value={page.brandText} onChange={(e) => setPage({ brandText: e.target.value })} /></div>
                </Field>
                <Field label="Nom de l'événement">
                  <div className="input"><input value={page.eventName} onChange={(e) => setPage({ eventName: e.target.value })} placeholder="Soirée d'ouverture" /></div>
                </Field>
              </div>

              <ToggleRow label="Afficher la marque" desc="Wordmark en haut à gauche" on={page.showBrand} onChange={(v) => setPage({ showBrand: v })} />
              <ToggleRow label="Afficher la date" desc="Jour et date du jour, en haut à droite" on={page.showDate} onChange={(v) => setPage({ showDate: v })} />
            </section>

            <section className="card">
              <div className="card-head">
                <h2>Logos · pied de page</h2>
                <span className="meta">{page.logos.length} / 8</span>
              </div>
              <div className="logos">
                {page.logos.map((l, i) => (
                  <div key={i} className="logo-slot filled" style={{ color: page.fg }}>
                    <div className="preview" dangerouslySetInnerHTML={{ __html: l }} />
                    <span className="x" onClick={() => removeLogo(i)}><XIcon size={11} strokeWidth={2.2} /></span>
                  </div>
                ))}
                {page.logos.length < 8 && (
                  <div className="logo-slot" onClick={addLogo}>
                    <span className="plus"><PlusIcon size={18} /></span>
                  </div>
                )}
                {Array.from({ length: Math.max(0, 3 - page.logos.length) }).map((_, i) => (
                  <div key={`pad-${i}`} className="logo-slot" style={{ opacity: 0.3 }}>
                    <span className="plus"><PlusIcon size={14} /></span>
                  </div>
                ))}
              </div>
            </section>

            <section className="card">
              <div className="card-head">
                <h2>Palette</h2>
                <span className="meta">Couleurs de la page</span>
              </div>
              <div className="palette">
                {PALETTE.map((p) => (
                  <div
                    key={p.name}
                    className={`swatch${page.bg === p.bg ? ' active' : ''}`}
                    title={p.name}
                    style={{ background: `linear-gradient(135deg, ${p.bg} 50%, ${p.accent} 50%)` }}
                    onClick={() => setPage({ bg: p.bg, fg: p.fg, accent: p.accent })}
                  />
                ))}
                <label className="color-input">
                  <span className="sw" style={{ background: page.accent }} />
                  <span>{page.accent}</span>
                  <input type="color" value={page.accent} onChange={(e) => setPage({ accent: e.target.value })} />
                </label>
              </div>
            </section>
          </div>

          <div className="col">
            <PreviewPane config={page} filmTime={config.featureTime || '19:00'} scheduledTimeMs={scheduledTimeMs} />
          </div>
        </div>
      )}

      {/* ── launch bar ── */}
      <div className="launch-bar">
        <div className="info">
          <span className="k">Prêt à lancer</span>
          <span className="v">
            Séance <span className="gold">{config.featureTime || '—'}</span>
            {' · '}{videos.length} vidéo{videos.length !== 1 ? 's' : ''}
            {config.featureFile ? ` · ${config.featureFile.split('/').pop()}` : ''}
          </span>
        </div>
        <div className="actions">
          <button className="btn" onClick={() => window.open('/player.html', '_blank')}>
            <MonitorIcon size={14} /> Ouvrir le projecteur
          </button>
          <button className="btn primary large" onClick={startSession} disabled={!config.loopFolder && !config.featureFile}>
            <PlayIcon size={14} strokeWidth={2} /> Lancer la séance
          </button>
        </div>
      </div>
    </>
  );
}
