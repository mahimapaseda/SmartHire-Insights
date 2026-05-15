import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import Overview from '../components/Overview';
import CVIngestion from '../components/CVIngestion';
import Candidates from '../components/Candidates';
import MacroKnowledgeGraph from '../components/MacroKnowledgeGraph';
import CandidateDeepDive from '../components/CandidateDeepDive';
import Notifications from '../components/Notifications';
import FaceRecognition from '../components/FaceRecognition';
import VoiceAnalysis from '../components/VoiceAnalysis';
import ResultAnalysis from '../components/ResultAnalysis';
import Settings from '../components/Settings';
import Help from '../components/Help';
import RequirementsImport from '../components/RequirementsImport';
import { candidateStore } from '../utils/candidateStore';
import { notificationStore } from '../utils/notificationStore';
import { AlertTriangle, RefreshCw, Network } from 'lucide-react';

const PAGE_TITLES = {
  dashboard:     { title: 'Dashboard',          sub: 'AI-powered recruitment intelligence.' },
  upload:        { title: 'CV Ingestion',        sub: 'Upload and parse candidate resumes.' },
  requirements:  { title: 'Requirements',       sub: 'Define and import recruiter requirements.' },
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
  const navigate = useNavigate();
  const location = useLocation();

  // M-2: Derive active tab from URL path (e.g. /dashboard/candidates)
  const activeTab = location.pathname.split('/')[2] || 'dashboard';
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(notificationStore.getUnreadCount());
  const notifRef = useRef(null);

  const [fetchError, setFetchError] = useState(candidateStore.getFetchError());

  useEffect(() => {
    return notificationStore.subscribe(() => {
      setUnreadCount(notificationStore.getUnreadCount());
    });
  }, []);

  useEffect(() => {
    const isAuth = sessionStorage.getItem('sh_auth');
    if (!isAuth) navigate('/login', { replace: true });
    candidateStore.fetchFromNeo4j();
  }, [navigate]);

  // Track fetchError from store
  useEffect(() => {
    return candidateStore.subscribe(() => {
      setFetchError(candidateStore.getFetchError());
    });
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const goTo = (tabId) => {
    navigate(`/dashboard/${tabId}`);
    setSidebarOpen(false);
    setSelectedCandidate(null);
    if (tabId === 'notifications') {
      notificationStore.markAllRead();
    }
  };

  const renderContent = () => {
    if (selectedCandidate) {
      return <CandidateDeepDive candidate={selectedCandidate} onBack={() => setSelectedCandidate(null)} />;
    }
    switch (activeTab) {
      case 'dashboard':     return <Overview onIngest={() => goTo('upload')} />;
      case 'upload':        return <CVIngestion />;
      case 'requirements':  return <RequirementsImport onComplete={() => goTo('candidates')} />;
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
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(3px)', zIndex: 90 }}
        />
      )}

      <Sidebar 
        activeTab={activeTab} 
        goTo={goTo} 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen} 
        unreadCount={unreadCount} 
        selectedCandidate={selectedCandidate} 
      />

      <div className="main-area" style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Header 
          setSidebarOpen={setSidebarOpen} 
          notifOpen={notifOpen} 
          setNotifOpen={setNotifOpen} 
          notifRef={notifRef} 
          goTo={goTo} 
        />

        <main style={{ flex: 1, padding: '2rem 1.75rem', overflowY: 'auto' }}>
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
                <button className="btn-outline" onClick={() => goTo('requirements')}>
                  Import Data
                </button>
              </div>
            )}
            {!selectedCandidate && activeTab === 'candidates' && (
              <div style={{ display: 'flex', gap: '0.625rem' }}>
                <button className="btn-primary" onClick={() => goTo('search')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Network size={16} /> View Intelligence Graph
                </button>
              </div>
            )}
          </div>

          {/* H-7: Error banner when Neo4j fetch fails */}
          {fetchError && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              padding: '0.875rem 1.25rem', marginBottom: '1.25rem',
              borderRadius: 'var(--r-lg)',
              background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.25)',
            }}>
              <AlertTriangle size={16} color="var(--danger)" />
              <p style={{ flex: 1, fontSize: '0.83rem', color: 'var(--danger)' }}>
                Could not connect to backend: <strong>{fetchError}</strong>
              </p>
              <button
                className="btn-ghost"
                style={{ fontSize: '0.78rem' }}
                onClick={() => { candidateStore.clearError(); candidateStore.fetchFromNeo4j(); }}
              >
                <RefreshCw size={13} /> Retry
              </button>
            </div>
          )}

          <div key={`content-${activeTab}-${selectedCandidate?.id}`} className="page-enter">
            {renderContent()}
          </div>
        </main>
      </div>

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
