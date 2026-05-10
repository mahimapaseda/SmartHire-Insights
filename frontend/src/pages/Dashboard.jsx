import React, { useState, useRef, useEffect } from 'react';
import {
  LayoutDashboard, FileUp, Users, Share2,
  Bell, Settings as SettingsIcon, HelpCircle, LogOut,
  Menu, X, Search, Mail, Camera, Mic, BarChart2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Overview             from '../components/Overview';
import CVIngestion          from '../components/CVIngestion';
import Candidates           from '../components/Candidates';
import MacroKnowledgeGraph  from '../components/MacroKnowledgeGraph';
import CandidateDeepDive    from '../components/CandidateDeepDive';
import Notifications        from '../components/Notifications';
import ThemeToggle          from '../components/ThemeToggle';
import NotificationDropdown from '../components/NotificationDropdown';
import FaceRecognition      from '../components/FaceRecognition';
import VoiceAnalysis        from '../components/VoiceAnalysis';
import ResultAnalysis       from '../components/ResultAnalysis';
import Settings             from '../components/Settings';
import Help                 from '../components/Help';

/* SVG logo mark */
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
  { id: 'candidates',    label: 'Candidates',   icon: Users },
  { id: 'search',        label: 'Graph Search', icon: Share2 },
  { id: 'notifications', label: 'Notifications',icon: Bell, badge: 1 },
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

const PAGE_TITLES = {
  dashboard:     { title: 'Dashboard',          sub: 'AI-powered recruitment intelligence.' },
  upload:        { title: 'CV Ingestion',        sub: 'Upload and parse candidate resumes.' },
  candidates:    { title: 'Candidates',          sub: 'AI-ranked candidate intelligence pool.' },
  search:        { title: 'Graph Search',        sub: 'Explore the knowledge graph.' },
  notifications: { title: 'Notifications',       sub: 'Real-time activity feed.' },
  face:          { title: 'Face Recognition',    sub: 'Emotion detection from interview footage.' },
  voice:         { title: 'Voice Analysis',      sub: 'Vocal stress and confidence detection.' },
  results:       { title: 'Result Analysis',     sub: 'Combined interview and CV scoring.' },
  settings:      { title: 'Settings',            sub: 'Configure your workspace and integrations.' },
  help:          { title: 'Help',                sub: 'Documentation, guides, and support.' },
};

const Dashboard = () => {
  const navigate  = useNavigate();
  const [activeTab, setActiveTab]                 = useState('dashboard');
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [sidebarOpen, setSidebarOpen]             = useState(false);
  const [notifOpen, setNotifOpen]                 = useState(false);
  const notifRef = useRef(null);

  // Route guard — redirect to login if not authenticated
  useEffect(() => {
    const isAuth = sessionStorage.getItem('sh_auth');
    if (!isAuth) navigate('/login', { replace: true });
  }, [navigate]);

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const goTo = (tab) => {
    setActiveTab(tab);
    setSidebarOpen(false);
    setSelectedCandidate(null);
  };

  const renderContent = () => {
    if (selectedCandidate) {
      return <CandidateDeepDive candidate={selectedCandidate} onBack={() => setSelectedCandidate(null)} />;
    }
    switch (activeTab) {
      case 'dashboard':     return <Overview onIngest={() => goTo('upload')} />;
      case 'upload':        return <CVIngestion />;
      case 'candidates':    return <Candidates onSelectCandidate={setSelectedCandidate} />;
      case 'search':        return <MacroKnowledgeGraph />;
      case 'notifications': return <Notifications />;
      case 'face':          return <FaceRecognition candidate={selectedCandidate} />;
      case 'voice':         return <VoiceAnalysis candidate={selectedCandidate} />;
      case 'results':       return <ResultAnalysis />;
      case 'settings':      return <Settings />;
      case 'help':          return <Help />;
      default:              return <Overview onIngest={() => goTo('upload')} />;
    }
  };

  const meta = selectedCandidate
    ? { title: selectedCandidate.name, sub: 'Deep-dive graph analysis' }
    : (PAGE_TITLES[activeTab] || PAGE_TITLES.dashboard);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-page)' }}>

      {/* ── Mobile overlay ── */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(3px)', zIndex: 90 }}
        />
      )}

      {/* ══════════════════════════════════════
          SIDEBAR
      ══════════════════════════════════════ */}
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
          {MENU_NAV.map(({ id, label, icon: Icon, badge }) => (
            <button
              key={id}
              className={`nav-item ${activeTab === id && !selectedCandidate ? 'active' : ''}`}
              onClick={() => goTo(id)}
            >
              <Icon size={17} strokeWidth={1.8} />
              <span style={{ flex: 1 }}>{label}</span>
              {badge && (
                <span style={{
                  background: 'var(--danger)', color: '#fff',
                  fontSize: '0.6rem', fontWeight: '700',
                  minWidth: '18px', height: '18px', borderRadius: '99px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '0 4px',
                }}>{badge}</span>
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
        </p>        <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
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

        {/* Bottom promo card — dark green, matches image */}
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
          {/* decorative circles */}
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
            onMouseEnter={e => e.target.style.background = '#16a34a'}
            onMouseLeave={e => e.target.style.background = '#22c55e'}
          >
            Configure
          </button>
        </div>
      </aside>

      {/* ══════════════════════════════════════
          MAIN AREA
      ══════════════════════════════════════ */}
      <div className="main-area" style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        {/* Top bar */}
        <header style={{
          height: '64px',
          background: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 1.75rem',
          gap: '1rem',
          position: 'sticky',
          top: 0,
          zIndex: 50,
          boxShadow: 'var(--shadow-xs)',
        }}>
          {/* Left: hamburger + search */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
            <button className="btn-icon hide-desktop" onClick={() => setSidebarOpen(true)}>
              <Menu size={18} />
            </button>

            {/* Search bar — matches image */}
            <div style={{ position: 'relative', maxWidth: '280px', width: '100%' }} className="hide-mobile">
              <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
              <input
                className="input"
                type="text"
                placeholder="Search candidates, skills…"
                style={{ paddingLeft: '2.25rem', paddingTop: '0.5rem', paddingBottom: '0.5rem', fontSize: '0.82rem', borderRadius: 'var(--r-md)' }}
              />
            </div>
          </div>

          {/* Right: actions + user */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ThemeToggle />

            <button className="btn-icon">
              <Mail size={17} />
            </button>

            {/* Bell */}
            <div ref={notifRef} style={{ position: 'relative' }}>
              <button className="btn-icon" onClick={() => setNotifOpen(o => !o)} style={{ position: 'relative' }}>
                <Bell size={17} />
                <span style={{
                  position: 'absolute', top: '6px', right: '6px',
                  width: '7px', height: '7px',
                  background: 'var(--danger)', borderRadius: '50%',
                  border: '1.5px solid var(--bg-surface)',
                }} />
              </button>
              <NotificationDropdown
                isOpen={notifOpen}
                onClose={() => setNotifOpen(false)}
                onSeeAll={() => { goTo('notifications'); setNotifOpen(false); }}
              />
            </div>

            {/* User avatar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', paddingLeft: '0.5rem', borderLeft: '1px solid var(--border)' }}>
              <div style={{
                width: '34px', height: '34px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #1a5c38, #22c55e)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.8rem', fontWeight: '800', color: '#fff', flexShrink: 0,
              }}>M</div>
              <div className="hide-mobile">
                <p style={{ fontSize: '0.82rem', fontWeight: '700', lineHeight: 1.2 }}>Mahima</p>
                <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>mahima@smarthire.ai</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, padding: '2rem 1.75rem', overflowY: 'auto' }}>
          {/* Page heading — matches image layout */}
          <div className="animate-fade-down" key={`heading-${activeTab}-${selectedCandidate?.id}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={{ fontSize: '1.75rem', marginBottom: '0.3rem' }}>{meta.title}</h1>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{meta.sub}</p>
            </div>
            {!selectedCandidate && activeTab === 'dashboard' && (
              <div style={{ display: 'flex', gap: '0.625rem' }}>
                <button className="btn-primary" onClick={() => goTo('upload')}>
                  + Ingest CVs
                </button>
                <button className="btn-outline">
                  Import Data
                </button>
              </div>
            )}
          </div>

          <div key={`content-${activeTab}-${selectedCandidate?.id}`} className="page-enter">
            {renderContent()}
          </div>
        </main>
      </div>

      {/* Desktop sidebar always visible */}
      <style>{`
        @media (min-width: 769px) {
          .sidebar {
            transform: translateX(0) !important;
            position: sticky !important;
            top: 0 !important;
            height: 100vh !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
