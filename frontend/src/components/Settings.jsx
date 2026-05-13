import React, { useState } from 'react';
import {
  User, Lock, Bell, Database, Brain, Palette,
  Globe, Shield, Save, RefreshCcw, CheckCircle2,
  Eye, EyeOff, ToggleLeft, ToggleRight,
  Trash2, Download, Upload, AlertTriangle,
} from 'lucide-react';
import { candidateStore } from '../utils/candidateStore';
import apiFetch from '../utils/api';

/* ── Section wrapper ──────────────────────────────────────────── */
const Section = ({ title, subtitle, children }) => (
  <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
    <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
      <h3 style={{ fontSize: '0.95rem', marginBottom: '0.2rem' }}>{title}</h3>
      {subtitle && <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{subtitle}</p>}
    </div>
    {children}
  </div>
);

/* ── Field row ────────────────────────────────────────────────── */
const Field = ({ label, hint, children }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '2rem', flexWrap: 'wrap' }}>
    <div style={{ minWidth: '200px' }}>
      <p style={{ fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.2rem' }}>{label}</p>
      {hint && <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{hint}</p>}
    </div>
    <div style={{ flex: 1, maxWidth: '360px' }}>{children}</div>
  </div>
);

/* ── Toggle ───────────────────────────────────────────────────── */
const Toggle = ({ value, onChange, label }) => (
  <button
    onClick={() => onChange(!value)}
    style={{
      display: 'flex', alignItems: 'center', gap: '0.625rem',
      background: 'none', padding: 0,
      color: value ? 'var(--primary)' : 'var(--text-muted)',
    }}
  >
    {value
      ? <ToggleRight size={28} color="var(--primary)" />
      : <ToggleLeft  size={28} color="var(--text-muted)" />}
    <span style={{ fontSize: '0.85rem', fontWeight: '500', color: 'var(--text-primary)' }}>{label}</span>
  </button>
);

/* ── Nav tabs ─────────────────────────────────────────────────── */
const TABS = [
  { id: 'profile',      label: 'Profile',       icon: User },
  { id: 'security',     label: 'Security',      icon: Lock },
  { id: 'notifications',label: 'Notifications', icon: Bell },
  { id: 'nlp',          label: 'NLP & Parsing', icon: Brain },
  { id: 'database',     label: 'Database',      icon: Database },
  { id: 'appearance',   label: 'Appearance',    icon: Palette },
  { id: 'data',         label: 'Data & Privacy',icon: Shield },
];

/* ══════════════════════════════════════════════════════════════
   SETTINGS PAGE
══════════════════════════════════════════════════════════════ */
const Settings = () => {
  const [tab, setTab]       = useState('profile');
  const [saved, setSaved]   = useState(false);
  const [backendStatus, setBackendStatus] = useState('unknown');
  const [neo4jStatus, setNeo4jStatus]     = useState('unknown');

  const pingBackend = async () => {
    setBackendStatus('checking');
    try {
      await apiFetch('/api/ping');
      setBackendStatus('online');
    } catch {
      setBackendStatus('offline');
    }
  };

  const testNeo4j = async () => {
    setNeo4jStatus('checking');
    try {
      await apiFetch('/api/neo4j-status');
      setNeo4jStatus('online');
    } catch {
      setNeo4jStatus('offline');
    }
  };

  const resetGraph = async () => {
    if (!window.confirm('Delete all nodes and relationships? This is irreversible.')) return;
    try {
      await apiFetch('/api/reset-graph', { method: 'DELETE' });
      alert('Graph reset successfully.');
      candidateStore.fetchFromNeo4j();
    } catch (err) {
      alert(`Failed to reset graph: ${err.message}`);
    }
  };

  const getSaved = (k, defaultVal) => {
    const v = localStorage.getItem('sh_settings_' + k);
    return v !== null ? JSON.parse(v) : defaultVal;
  };

  /* Profile */
  const [name,  setName]    = useState(getSaved('name', 'Mahima'));
  const [email, setEmail]   = useState(getSaved('email', 'mahima@smarthire.ai'));
  const [role,  setRole]    = useState(getSaved('role', 'Lead Recruiter'));
  const [org,   setOrg]     = useState(getSaved('org', 'SmartHire Inc.'));

  /* Security */
  const [showPw, setShowPw] = useState(false);
  const [twoFA,  setTwoFA]  = useState(getSaved('twoFA', false));
  const [sessionTimeout, setSessionTimeout] = useState(getSaved('sessionTimeout', '60'));

  /* Notifications */
  const [notifCV,      setNotifCV]      = useState(getSaved('notifCV', true));
  const [notifMatch,   setNotifMatch]   = useState(getSaved('notifMatch', true));
  const [notifMsg,     setNotifMsg]     = useState(getSaved('notifMsg', true));
  const [notifEmail,   setNotifEmail]   = useState(getSaved('notifEmail', false));
  const [notifSound,   setNotifSound]   = useState(getSaved('notifSound', true));

  /* NLP */
  const [nlpModel,     setNlpModel]     = useState(getSaved('nlpModel', 'spacy-en-lg'));
  const [minMatch,     setMinMatch]     = useState(getSaved('minMatch', '70'));
  const [maxFileSize,  setMaxFileSize]  = useState(getSaved('maxFileSize', '10'));
  const [autoGraph,    setAutoGraph]    = useState(getSaved('autoGraph', true));
  const [autoSummary,  setAutoSummary]  = useState(getSaved('autoSummary', true));
  const [batchSize,    setBatchSize]    = useState(getSaved('batchSize', '5'));

  /* Database */
  const [neo4jUri,     setNeo4jUri]     = useState(getSaved('neo4jUri', 'bolt://localhost:7687'));
  const [neo4jUser,    setNeo4jUser]    = useState(getSaved('neo4jUser', 'neo4j'));
  const [neo4jPw,      setNeo4jPw]      = useState('');
  const [showNeo4jPw,  setShowNeo4jPw]  = useState(false);
  const [backendUrl,   setBackendUrl]   = useState(getSaved('backendUrl', 'http://localhost:5000'));

  /* Appearance */
  const [accentColor,  setAccentColor]  = useState(getSaved('accentColor', '#1a5c38'));
  const [fontSize,     setFontSize]     = useState(getSaved('fontSize', 'medium'));
  const [compactMode,  setCompactMode]  = useState(getSaved('compactMode', false));
  const [animationsOn, setAnimationsOn] = useState(getSaved('animationsOn', true));

  const handleSave = () => {
    const settingsObj = {
      name, email, role, org,
      twoFA, sessionTimeout,
      notifCV, notifMatch, notifMsg, notifEmail, notifSound,
      nlpModel, minMatch, maxFileSize, autoGraph, autoSummary, batchSize,
      neo4jUri, neo4jUser, backendUrl,
      accentColor, fontSize, compactMode, animationsOn
    };
    Object.entries(settingsObj).forEach(([k, v]) => {
      localStorage.setItem('sh_settings_' + k, JSON.stringify(v));
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const renderTab = () => {
    switch (tab) {

      /* ── Profile ── */
      case 'profile': return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <Section title="Personal Information" subtitle="Your recruiter profile visible across the platform.">
            <Field label="Full Name" hint="Displayed in the sidebar and reports.">
              <input className="input" value={name} onChange={e => setName(e.target.value)} />
            </Field>
            <Field label="Email Address" hint="Used for login and notifications.">
              <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} />
            </Field>
            <Field label="Job Title" hint="Your role within the organisation.">
              <input className="input" value={role} onChange={e => setRole(e.target.value)} />
            </Field>
            <Field label="Organisation" hint="Company or team name.">
              <input className="input" value={org} onChange={e => setOrg(e.target.value)} />
            </Field>
          </Section>

          <Section title="Avatar" subtitle="Your profile avatar is generated from your initials.">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              <div style={{
                width: '64px', height: '64px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #1a5c38, #22c55e)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.25rem', fontWeight: '800', color: '#fff',
              }}>
                {name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p style={{ fontSize: '0.85rem', fontWeight: '600' }}>{name}</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{role} · {org}</p>
              </div>
            </div>
          </Section>
        </div>
      );

      /* ── Security ── */
      case 'security': return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <Section title="Change Access Key" subtitle="Use a strong key with letters, numbers, and symbols.">
            <Field label="Current Key">
              <div style={{ position: 'relative' }}>
                <input className="input" type={showPw ? 'text' : 'password'} placeholder="••••••••" style={{ paddingRight: '3rem' }} />
                <button type="button" onClick={() => setShowPw(p => !p)} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', color: 'var(--text-muted)' }}>
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </Field>
            <Field label="New Key">
              <input className="input" type="password" placeholder="Min. 8 characters" />
            </Field>
            <Field label="Confirm New Key">
              <input className="input" type="password" placeholder="Repeat new key" />
            </Field>
          </Section>

          <Section title="Two-Factor Authentication" subtitle="Add an extra layer of security to your account.">
            <Field label="Enable 2FA" hint="Requires a code from your authenticator app on login.">
              <Toggle value={twoFA} onChange={setTwoFA} label={twoFA ? 'Enabled' : 'Disabled'} />
            </Field>
          </Section>

          <Section title="Session" subtitle="Control how long your session stays active.">
            <Field label="Session Timeout" hint="Auto-logout after inactivity (minutes).">
              <select className="input" value={sessionTimeout} onChange={e => setSessionTimeout(e.target.value)}>
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
                <option value="60">1 hour</option>
                <option value="240">4 hours</option>
                <option value="0">Never</option>
              </select>
            </Field>
          </Section>
        </div>
      );

      /* ── Notifications ── */
      case 'notifications': return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <Section title="In-App Notifications" subtitle="Control which events trigger notifications.">
            <Field label="CV Parsing Complete" hint="Notify when a CV finishes processing.">
              <Toggle value={notifCV} onChange={setNotifCV} label={notifCV ? 'On' : 'Off'} />
            </Field>
            <Field label="High Match Detected" hint="Notify when a candidate scores above threshold.">
              <Toggle value={notifMatch} onChange={setNotifMatch} label={notifMatch ? 'On' : 'Off'} />
            </Field>
            <Field label="New Messages" hint="Notify on team messages.">
              <Toggle value={notifMsg} onChange={setNotifMsg} label={notifMsg ? 'On' : 'Off'} />
            </Field>
          </Section>

          <Section title="Delivery" subtitle="How you receive notifications.">
            <Field label="Email Notifications" hint="Send a daily digest to your email.">
              <Toggle value={notifEmail} onChange={setNotifEmail} label={notifEmail ? 'Enabled' : 'Disabled'} />
            </Field>
            <Field label="Sound Alerts" hint="Play a sound for new notifications.">
              <Toggle value={notifSound} onChange={setNotifSound} label={notifSound ? 'On' : 'Off'} />
            </Field>
          </Section>
        </div>
      );

      /* ── NLP & Parsing ── */
      case 'nlp': return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <Section title="NLP Model" subtitle="Configure the language model used for CV extraction.">
            <Field label="Active Model" hint="SpaCy model used for entity extraction.">
              <select className="input" value={nlpModel} onChange={e => setNlpModel(e.target.value)}>
                <option value="spacy-en-sm">spacy en_core_web_sm (fast)</option>
                <option value="spacy-en-md">spacy en_core_web_md (balanced)</option>
                <option value="spacy-en-lg">spacy en_core_web_lg (accurate)</option>
                <option value="spacy-en-trf">spacy en_core_web_trf (transformer)</option>
              </select>
            </Field>
            <Field label="Batch Size" hint="Number of CVs processed simultaneously.">
              <input className="input" type="number" min="1" max="20" value={batchSize} onChange={e => setBatchSize(e.target.value)} />
            </Field>
            <Field label="Max File Size (MB)" hint="Reject files larger than this.">
              <input className="input" type="number" min="1" max="50" value={maxFileSize} onChange={e => setMaxFileSize(e.target.value)} />
            </Field>
          </Section>

          <Section title="Extraction Behaviour" subtitle="Control what happens after a CV is parsed.">
            <Field label="Minimum Match Score (%)" hint="Candidates below this threshold are flagged.">
              <input className="input" type="number" min="0" max="100" value={minMatch} onChange={e => setMinMatch(e.target.value)} />
            </Field>
            <Field label="Auto-build Graph" hint="Automatically push extracted data to Neo4j.">
              <Toggle value={autoGraph} onChange={setAutoGraph} label={autoGraph ? 'Enabled' : 'Disabled'} />
            </Field>
            <Field label="Auto-generate Summary" hint="Generate AI summary after each CV parse.">
              <Toggle value={autoSummary} onChange={setAutoSummary} label={autoSummary ? 'Enabled' : 'Disabled'} />
            </Field>
          </Section>
        </div>
      );

      /* ── Database ── */
      case 'database': return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <Section title="Neo4j Connection" subtitle="Graph database for candidate relationship modelling.">
            <Field label="Bolt URI" hint="e.g. bolt://localhost:7687">
              <input className="input" value={neo4jUri} onChange={e => setNeo4jUri(e.target.value)} placeholder="bolt://localhost:7687" />
            </Field>
            <Field label="Username">
              <input className="input" value={neo4jUser} onChange={e => setNeo4jUser(e.target.value)} />
            </Field>
            <Field label="Password">
              <div style={{ position: 'relative' }}>
                <input className="input" type={showNeo4jPw ? 'text' : 'password'} value={neo4jPw} onChange={e => setNeo4jPw(e.target.value)} placeholder="••••••••" style={{ paddingRight: '3rem' }} />
                <button type="button" onClick={() => setShowNeo4jPw(p => !p)} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', color: 'var(--text-muted)' }}>
                  {showNeo4jPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </Field>
            <div style={{ display: 'flex', gap: '0.625rem' }}>
              <button className="btn-primary" style={{ fontSize: '0.82rem' }} onClick={testNeo4j}>
                <Database size={14} /> Test Connection
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span className={`status-dot ${neo4jStatus === 'online' ? 'active' : neo4jStatus === 'offline' ? 'offline' : 'standby'}`} />
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  {neo4jStatus === 'unknown' ? 'Unknown' : neo4jStatus === 'checking' ? 'Checking...' : neo4jStatus === 'online' ? 'Connected' : 'Connection failed'}
                </span>
              </div>
            </div>
          </Section>

          <Section title="Python Backend" subtitle="Flask API for NLP processing.">
            <Field label="Backend URL" hint="Base URL of the Flask server.">
              <input className="input" value={backendUrl} onChange={e => setBackendUrl(e.target.value)} placeholder="http://localhost:5000" />
            </Field>
            <div style={{ display: 'flex', gap: '0.625rem' }}>
              <button className="btn-primary" style={{ fontSize: '0.82rem' }} onClick={pingBackend}>
                <Globe size={14} /> Ping Backend
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span className={`status-dot ${backendStatus === 'online' ? 'active' : backendStatus === 'offline' ? 'offline' : 'standby'}`} />
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  {backendStatus === 'unknown' ? 'Unknown' : backendStatus === 'checking' ? 'Pinging...' : backendStatus === 'online' ? 'Online' : 'Unreachable'}
                </span>
              </div>
            </div>
          </Section>
        </div>
      );

      /* ── Appearance ── */
      case 'appearance': return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <Section title="Theme" subtitle="Visual preferences for the interface.">
            <Field label="Accent Colour" hint="Primary brand colour used across the UI.">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <input type="color" value={accentColor} onChange={e => setAccentColor(e.target.value)}
                  style={{ width: '44px', height: '36px', borderRadius: 'var(--r-sm)', border: '1px solid var(--border)', cursor: 'pointer', padding: '2px' }} />
                <input className="input" value={accentColor} onChange={e => setAccentColor(e.target.value)} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', width: '120px' }} />
              </div>
            </Field>
            <Field label="Font Size" hint="Base text size across the dashboard.">
              <select className="input" value={fontSize} onChange={e => setFontSize(e.target.value)}>
                <option value="small">Small (13px)</option>
                <option value="medium">Medium (14px)</option>
                <option value="large">Large (16px)</option>
              </select>
            </Field>
            <Field label="Compact Mode" hint="Reduce padding and spacing for more content.">
              <Toggle value={compactMode} onChange={setCompactMode} label={compactMode ? 'On' : 'Off'} />
            </Field>
            <Field label="Animations" hint="Enable fade and slide transitions.">
              <Toggle value={animationsOn} onChange={setAnimationsOn} label={animationsOn ? 'Enabled' : 'Disabled'} />
            </Field>
          </Section>
        </div>
      );

      /* ── Data & Privacy ── */
      case 'data': return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <Section title="Export Data" subtitle="Download your candidate data and analysis results.">
            <div style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap' }}>
              <button className="btn-outline" style={{ fontSize: '0.82rem' }}>
                <Download size={14} /> Export Candidates (CSV)
              </button>
              <button className="btn-outline" style={{ fontSize: '0.82rem' }}>
                <Download size={14} /> Export Results (JSON)
              </button>
              <button className="btn-outline" style={{ fontSize: '0.82rem' }}>
                <Download size={14} /> Export Graph (Cypher)
              </button>
            </div>
          </Section>

          <Section title="Import Data" subtitle="Restore or migrate candidate data.">
            <button className="btn-outline" style={{ fontSize: '0.82rem' }}>
              <Upload size={14} /> Import Candidates (CSV)
            </button>
          </Section>

          <Section title="Danger Zone" subtitle="Irreversible actions — proceed with caution.">
            <div style={{
              padding: '1rem',
              borderRadius: 'var(--r-md)',
              background: 'rgba(239,68,68,0.05)',
              border: '1px solid rgba(239,68,68,0.2)',
              display: 'flex', flexDirection: 'column', gap: '0.875rem',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <p style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--danger)' }}>Clear Candidate Pool</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Remove all parsed candidates from the system.</p>
                </div>
                <button
                  onClick={() => {
                    if (window.confirm('Remove all candidates? This cannot be undone.')) {
                      candidateStore.getAll().forEach(c => candidateStore.remove(c.id));
                    }
                  }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.4rem',
                    padding: '0.5rem 1rem', borderRadius: 'var(--r-sm)',
                    background: 'rgba(239,68,68,0.1)', color: 'var(--danger)',
                    border: '1px solid rgba(239,68,68,0.25)', fontSize: '0.82rem', fontWeight: '600',
                  }}>
                  <Trash2 size={13} /> Clear All
                </button>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <p style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--danger)' }}>Reset Neo4j Graph</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Delete all nodes and relationships from the database.</p>
                </div>
                <button onClick={resetGraph} style={{
                  display: 'flex', alignItems: 'center', gap: '0.4rem',
                  padding: '0.5rem 1rem', borderRadius: 'var(--r-sm)',
                  background: 'rgba(239,68,68,0.1)', color: 'var(--danger)',
                  border: '1px solid rgba(239,68,68,0.25)', fontSize: '0.82rem', fontWeight: '600',
                }}>
                  <AlertTriangle size={13} /> Reset Graph
                </button>
              </div>
            </div>
          </Section>
        </div>
      );

      default: return null;
    }
  };

  return (
    <div className="animate-fade-up" style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>

      {/* ── Left nav ── */}
      <div className="card" style={{ width: '200px', flexShrink: 0, padding: '0.75rem', position: 'sticky', top: '1rem' }}>
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={`nav-item ${tab === id ? 'active' : ''}`}
            onClick={() => setTab(id)}
            style={{ marginBottom: '2px' }}
          >
            <Icon size={15} strokeWidth={1.8} />
            <span style={{ fontSize: '0.82rem' }}>{label}</span>
          </button>
        ))}
      </div>

      {/* ── Right content ── */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {renderTab()}

        {/* Save bar */}
        <div style={{
          display: 'flex', justifyContent: 'flex-end', alignItems: 'center',
          gap: '0.75rem', padding: '1rem 1.5rem',
          borderRadius: 'var(--r-xl)',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          position: 'sticky', bottom: '1rem',
          boxShadow: 'var(--shadow-md)',
        }}>
          {saved && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: 'var(--success)' }}>
              <CheckCircle2 size={15} /> Settings saved
            </span>
          )}
          <button className="btn-ghost" style={{ fontSize: '0.82rem' }}>
            <RefreshCcw size={13} /> Reset
          </button>
          <button className="btn-primary" onClick={handleSave} style={{ fontSize: '0.82rem' }}>
            <Save size={13} /> Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
