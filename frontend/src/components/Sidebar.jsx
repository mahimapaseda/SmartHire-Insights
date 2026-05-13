import React from 'react';
import {
  LayoutDashboard, FileUp, Users, ClipboardList,
  Bell, Settings as SettingsIcon, HelpCircle, LogOut, X, Camera, Mic, BarChart2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Logo = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
    <circle cx="16" cy="16" r="16" fill="#1a5c38"/>
    <circle cx="16" cy="16" r="9.5" stroke="#fff" strokeWidth="1.8" fill="none"/>
    <circle cx="16" cy="16" r="4.5" fill="#fff"/>
    <path d="M16 6.5 Q19.5 11 16 16 Q12.5 11 16 6.5Z" fill="#22c55e" opacity="0.75"/>
  </svg>
);

const MENU_NAV = [
  { id: 'dashboard',     label: 'Dashboard',    icon: LayoutDashboard },
  { id: 'upload',        label: 'CV Ingestion', icon: FileUp },
  { id: 'requirements',  label: 'Requirements', icon: ClipboardList },
  { id: 'candidates',    label: 'Candidates',   icon: Users },
  { id: 'notifications', label: 'Notifications',icon: Bell },
];

const INTERVIEW_NAV = [
  { id: 'face',    label: 'Face Recognition', icon: Camera },
  { id: 'voice',   label: 'Voice Analysis',   icon: Mic },
  { id: 'results', label: 'Result Analysis',  icon: BarChart2 },
];

const GENERAL_NAV = [
  { id: 'settings', label: 'Settings', icon: SettingsIcon },
  { id: 'help',     label: 'Help',     icon: HelpCircle },
];

const Sidebar = ({ activeTab, goTo, sidebarOpen, setSidebarOpen, unreadCount, selectedCandidate }) => {
  const navigate = useNavigate();

  return (
    <aside
      className="sidebar"
      style={{
        width: '220px',
        flexShrink: 0,
        background: 'var(--bg-sidebar)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        padding: '1.5rem 0.875rem',
        position: 'fixed',
        top: 0, bottom: 0, left: 0,
        zIndex: 100,
        transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.25s var(--ease)',
        overflowY: 'auto',
      }}
    >
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingLeft: '0.5rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <Logo />
          <span style={{ fontWeight: '800', fontSize: '1.05rem', letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>SmartHire</span>
        </div>
        <button className="btn-icon hide-desktop" onClick={() => setSidebarOpen(false)} style={{ width: 28, height: 28 }}>
          <X size={14} />
        </button>
      </div>

      {/* MENU section */}
      <p style={{ fontSize: '0.62rem', fontWeight: '700', color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', paddingLeft: '0.75rem', marginBottom: '0.5rem' }}>
        Menu
      </p>
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginBottom: '1.75rem' }} className="nav-stagger">
        {MENU_NAV.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={`nav-item ${activeTab === id && !selectedCandidate ? 'active' : ''}`}
            onClick={() => goTo(id)}
          >
            <Icon size={17} strokeWidth={1.8} />
            <span style={{ flex: 1 }}>{label}</span>
            {(id === 'notifications' && unreadCount > 0) && (
              <span style={{
                background: 'var(--danger)', color: '#fff',
                fontSize: '0.6rem', fontWeight: '700',
                minWidth: '18px', height: '18px', borderRadius: '99px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '0 4px',
              }}>{unreadCount}</span>
            )}
          </button>
        ))}
      </nav>

      {/* INTERVIEW ANALYSIS section */}
      <p style={{ fontSize: '0.62rem', fontWeight: '700', color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', paddingLeft: '0.75rem', marginBottom: '0.5rem', marginTop: '0.25rem' }}>
        Interview Analysis
      </p>
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginBottom: '1.75rem' }} className="nav-stagger">
        {INTERVIEW_NAV.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={`nav-item ${activeTab === id && !selectedCandidate ? 'active' : ''}`}
            onClick={() => goTo(id)}
          >
            <Icon size={17} strokeWidth={1.8} />
            <span style={{ flex: 1 }}>{label}</span>
          </button>
        ))}
      </nav>

      {/* GENERAL section */}
      <p style={{ fontSize: '0.62rem', fontWeight: '700', color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', paddingLeft: '0.75rem', marginBottom: '0.5rem' }}>
        General
      </p>
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {GENERAL_NAV.map(({ id, label, icon: Icon }) => (
          <button key={id} className={`nav-item ${activeTab === id ? 'active' : ''}`} onClick={() => goTo(id)}>
            <Icon size={17} strokeWidth={1.8} />
            <span>{label}</span>
          </button>
        ))}
        <button className="nav-item" onClick={() => { sessionStorage.removeItem('sh_auth'); navigate('/login'); }}>
          <LogOut size={17} strokeWidth={1.8} />
          <span>Logout</span>
        </button>
      </nav>

      {/* Bottom promo card */}
      <div style={{
        marginTop: 'auto',
        paddingTop: '2rem',
        borderRadius: 'var(--r-xl)',
        background: 'linear-gradient(145deg, #1a5c38 0%, #0d3320 100%)',
        padding: '1.25rem',
        color: '#fff',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(34,197,94,0.15)' }} />
        <div style={{ position: 'absolute', bottom: '-10px', left: '-10px', width: '50px', height: '50px', borderRadius: '50%', background: 'rgba(34,197,94,0.1)' }} />
        <p style={{ fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.3rem', lineHeight: '1.3', position: 'relative' }}>
          Connect your <span style={{ color: '#4ade80' }}>Backend</span>
        </p>
        <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.65)', marginBottom: '1rem', lineHeight: '1.4', position: 'relative' }}>
          Link Neo4j & Python NLP engine.
        </p>
        <button style={{
          background: '#22c55e', color: '#fff',
          border: 'none', borderRadius: 'var(--r-sm)',
          padding: '0.45rem 1rem', fontSize: '0.78rem', fontWeight: '700',
          cursor: 'pointer', position: 'relative',
          transition: 'var(--transition)',
        }}
          onClick={() => goTo('settings')}
        >
          Configure
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
