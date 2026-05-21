import React from 'react';

/* ── icons (Lucide style) ── */
const Icon = ({ size = 16, sw = 1.75, children, ...rest }: { size?: number; sw?: number; children: React.ReactNode; [k: string]: unknown }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }} {...(rest as React.SVGProps<SVGSVGElement>)}>
    {children}
  </svg>
);

export const FolderIcon = (p: { size?: number }) => <Icon {...p}><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/></Icon>;
export const ClapIcon = (p: { size?: number }) => <Icon {...p}><path d="M20.2 6 3 11l-.9-2.4c-.3-1.1.3-2.2 1.3-2.5l13.5-4c1.1-.3 2.2.3 2.5 1.3Z"/><path d="m6.2 5.3 3.1 3.9"/><path d="m12.4 3.4 3.1 4"/><path d="M3 11h18v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/></Icon>;
export const ClockIcon = (p: { size?: number }) => <Icon {...p}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></Icon>;
export const SpeakerIcon = (p: { size?: number }) => <Icon {...p}><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></Icon>;
export const CaptionIcon = (p: { size?: number }) => <Icon {...p}><rect width="18" height="14" x="3" y="5" rx="2" ry="2"/><path d="M7 15h4M15 15h2M7 11h2M13 11h4"/></Icon>;
export const MusicIcon = (p: { size?: number }) => <Icon {...p}><circle cx="8" cy="18" r="4"/><path d="M12 18V2l7 4"/></Icon>;
export const LockIcon = (p: { size?: number }) => <Icon size={12} {...p}><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></Icon>;
export const PlayIcon = (p: { size?: number; strokeWidth?: number }) => <Icon {...p}><polygon points="6 3 20 12 6 21 6 3"/></Icon>;
export const SquareIcon = (p: { size?: number }) => <Icon {...p}><rect width="18" height="18" x="3" y="3" rx="2"/></Icon>;
export const RotateIcon = (p: { size?: number }) => <Icon {...p}><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></Icon>;
export const MonitorIcon = (p: { size?: number }) => <Icon {...p}><rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/></Icon>;
export const PlusIcon = (p: { size?: number }) => <Icon {...p}><path d="M5 12h14M12 5v14"/></Icon>;
export const XIcon = (p: { size?: number; strokeWidth?: number }) => <Icon {...p}><path d="M18 6 6 18M6 6l12 12"/></Icon>;
export const GripIcon = (p: { size?: number }) => <Icon {...p}><circle cx="9" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="19" r="1"/></Icon>;

/* ── Leone wordmark ── */
export const LeoneWordmark = ({ height = 16, color = 'currentColor' }: { height?: number; color?: string }) => (
  <svg height={height} viewBox="0 0 1175 220" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
    <path d="M82.54,57.14v78.59c0,17.94,14.52,32.46,32.46,32.46h86.01" stroke={color} strokeWidth="14" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="304.98" y1="57.14" x2="418.7" y2="57.14" stroke={color} strokeWidth="14" strokeLinecap="round"/>
    <line x1="292.37" y1="111.62" x2="395.91" y2="111.62" stroke={color} strokeWidth="14" strokeLinecap="round"/>
    <path d="M303.17,164.31c2.38,2.73,6.82,3.87,12.67,3.87h102.86" stroke={color} strokeWidth="14" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="572" cy="111" r="54" stroke={color} strokeWidth="14"/>
    <circle cx="572" cy="111" r="8" fill={color}/>
    <path d="M857.01,167.54v-75.26c0-19.43-14.11-35.14-31.54-35.14h-58.76c-18.5,0-33.47,14.38-33.47,32.16v78.25" stroke={color} strokeWidth="14" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M967.92,59.29c2.75-2.48,9.55-2.48,12.3-2.48h101.09" stroke={color} strokeWidth="14" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="954.98" y1="111.3" x2="1058.52" y2="111.3" stroke={color} strokeWidth="14" strokeLinecap="round"/>
    <path d="M965.78,163.99c2.38,2.73,6.82,3.87,12.67,3.87h102.86" stroke={color} strokeWidth="14" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const LEONE_SVG = `<svg viewBox="0 0 1175 220" xmlns="http://www.w3.org/2000/svg">
  <path d="M82.54,57.14v78.59c0,17.94,14.52,32.46,32.46,32.46h86.01" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="14"/>
  <line x1="304.98" y1="57.14" x2="418.7" y2="57.14" stroke="currentColor" stroke-linecap="round" stroke-width="14"/>
  <line x1="292.37" y1="111.62" x2="395.91" y2="111.62" stroke="currentColor" stroke-linecap="round" stroke-width="14"/>
  <path d="M303.17,164.31c2.38,2.73,6.82,3.87,12.67,3.87h102.86" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="14"/>
  <circle cx="572" cy="111" r="54" stroke="currentColor" stroke-width="14" fill="none"/>
  <circle cx="572" cy="111" r="8" fill="currentColor"/>
  <path d="M857.01,167.54v-75.26c0-19.43-14.11-35.14-31.54-35.14h-58.76c-18.5,0-33.47,14.38-33.47,32.16v78.25" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="14"/>
  <path d="M967.92,59.29c2.75-2.48,9.55-2.48,12.3-2.48h101.09" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="14"/>
  <line x1="954.98" y1="111.3" x2="1058.52" y2="111.3" stroke="currentColor" stroke-linecap="round" stroke-width="14"/>
  <path d="M965.78,163.99c2.38,2.73,6.82,3.87,12.67,3.87h102.86" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="14"/>
</svg>`;

/* ── primitives ── */
export function Field({ label, hint, children }: { label?: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="field">
      {label && <label>{label}</label>}
      {children}
      {hint && <span className="hint">{hint}</span>}
    </div>
  );
}

export function Toggle({ on, onChange, disabled }: { on: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <div
      className={`toggle${on ? ' on' : ''}`}
      onClick={() => !disabled && onChange(!on)}
      style={disabled ? { opacity: 0.4, pointerEvents: 'none' } : undefined}
    />
  );
}

export function ToggleRow({ label, desc, on, onChange, disabled }: { label: string; desc?: string; on: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <div className="toggle-row">
      <div>
        <div className="t-label">{label}</div>
        {desc && <div className="t-desc">{desc}</div>}
      </div>
      <Toggle on={on} onChange={onChange} disabled={disabled} />
    </div>
  );
}

export function Segmented({ value, onChange, options, disabled }: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  disabled?: boolean;
}) {
  return (
    <div className="segmented" style={disabled ? { opacity: 0.5, pointerEvents: 'none' } : undefined}>
      {options.map((o) => (
        <div key={o.value} className={`seg${value === o.value ? ' active' : ''}`} onClick={() => onChange(o.value)}>
          {o.label}
        </div>
      ))}
    </div>
  );
}

export function SummaryRow({ k, v, gold }: { k: string; v: React.ReactNode; gold?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderTop: '1px solid var(--line)', fontSize: 13 }}>
      <span style={{ color: 'var(--cream-dim)' }}>{k}</span>
      <span style={{ color: gold ? 'var(--gold)' : 'var(--cream)', fontWeight: 500 }}>{v}</span>
    </div>
  );
}
