import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, FileUp, Users, ClipboardList,
  Bell, Settings as SettingsIcon, HelpCircle, LogOut, X, Camera, Mic, BarChart2,
  CheckCircle2, AlertCircle, RefreshCw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API_URL, getHeaders } from '../config';

const Logo = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
    <circle cx="16" cy="16" r="16" fill="#1a5c38"/>
    <circle cx="16" cy="16" r="9.5" stroke="#fff" strokeWidth="1.8" fill="none"/>
    <circle cx="16" cy="16" r="4.5" fill="#fff"/>
    <path d="M16 6.5 Q19.5 11 16 16 Q12.5 11 16 6.5Z" fill="#22c55e" opacity="0.75"/>
  </svg>
);

const PulseStyles = () => (
  <style dangerouslySetInnerHTML={{__html: `
    @keyframes pulse-green {
      0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.8); }
      70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(34, 197, 94, 0); }
      100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
    }
    @keyframes pulse-red {
      0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.8); }
      70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(239, 68, 68, 0); }
      100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
    }
  `}} />
);

const MENU_NAV = [
  { id: 'dashboard',     label: 'Dashboard',    icon: LayoutDashboard },
  { id: 'requirements',  label: 'Requirements', icon: ClipboardList },
  { id: 'upload',        label: 'CV Ingestion', icon: FileUp },
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
  const [status, setStatus] = useState('checking'); // 'checking' | 'online' | 'offline'

  useEffect(() => {
    let active = true;
    const checkStatus = async () => {
      try {
        const res = await fetch(`${API_URL}/api/ping`, { headers: getHeaders() });
        if (res.ok && active) {
          setStatus('online');
        } else if (active) {
          setStatus('offline');
        }
      } catch {
        if (active) setStatus('offline');
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 10000); // Check every 10 seconds

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

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
      <PulseStyles />
      
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

      {/* Dynamic Connection Status Card */}
      <div style={{
        marginTop: 'auto',
        paddingTop: '2rem',
        borderRadius: 'var(--r-xl)',
        background: status === 'online'
          ? 'linear-gradient(145deg, #1b4d3e 0%, #0c2b22 100%)'
          : status === 'offline'
            ? 'linear-gradient(145deg, #7f1d1d 0%, #450a0a 100%)'
            : 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)',
        padding: '1.25rem',
        color: '#fff',
        position: 'relative',
        overflow: 'hidden',
        border: status === 'online'
          ? '1px solid rgba(34, 197, 94, 0.2)'
          : status === 'offline'
            ? '1px solid rgba(239, 68, 68, 0.2)'
            : '1px solid rgba(148, 163, 184, 0.1)',
        transition: 'all 0.4s ease',
      }}>
        {/* Decorative circle shapes */}
        <div style={{
          position: 'absolute',
          top: '-20px',
          right: '-20px',
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: status === 'online'
            ? 'rgba(34,197,94,0.12)'
            : status === 'offline'
              ? 'rgba(239,68,68,0.1)'
              : 'rgba(148,163,184,0.06)',
          transition: 'all 0.4s ease',
        }} />

        {/* Pulse indicator & title row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem', position: 'relative' }}>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: status === 'online' ? '#22c55e' : status === 'offline' ? '#ef4444' : '#94a3b8',
            animation: status === 'online' ? 'pulse-green 2s infinite' : status === 'offline' ? 'pulse-red 2s infinite' : 'none',
          }} />
          <span style={{ fontSize: '0.85rem', fontWeight: '800', letterSpacing: '-0.01em' }}>
            {status === 'online' ? 'System Online' : status === 'offline' ? 'System Offline' : 'Verifying Link...'}
          </span>
        </div>

        {/* Status description text */}
        <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.7)', marginBottom: '1rem', lineHeight: '1.4', position: 'relative' }}>
          {status === 'online'
            ? 'Connected to Neo4j & Python NLP pipeline.'
            : status === 'offline'
              ? 'Unable to reach the backend services.'
              : 'Checking API health & database nodes.'}
        </p>

        {/* Dynamic button action */}
        <button style={{
          background: status === 'online' ? 'rgba(255,255,255,0.1)' : '#ef4444',
          color: '#fff',
          border: status === 'online' ? '1px solid rgba(255,255,255,0.2)' : 'none',
          borderRadius: 'var(--r-sm)',
          padding: '0.45rem 1rem',
          fontSize: '0.78rem',
          fontWeight: '700',
          cursor: 'pointer',
          position: 'relative',
          transition: 'all 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
        }}
          onClick={() => goTo('settings')}
        >
          {status === 'online' ? (
            <>
              <CheckCircle2 size={13} />
              Settings
            </>
          ) : status === 'offline' ? (
            <>
              <AlertCircle size={13} />
              Configure
            </>
          ) : (
            <>
              <RefreshCw size={13} className="animate-spin" />
              Settings
            </>
          )}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
