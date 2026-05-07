import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  FileUp, 
  Users, 
  Zap, 
  Search, 
  Bell, 
  User,
  Menu
} from 'lucide-react';

import Overview from '../components/Overview';
import CVIngestion from '../components/CVIngestion';
import Candidates from '../components/Candidates';
import GraphSearch from '../components/GraphSearch';
import Notifications from '../components/Notifications';
import ThemeToggle from '../components/ThemeToggle';
import NotificationDropdown from '../components/NotificationDropdown';





const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const renderContent = () => {

    switch (activeTab) {
      case 'dashboard': return <Overview />;
      case 'upload': return <CVIngestion />;
      case 'candidates': return <Candidates />;
      case 'search': return <GraphSearch />;
      case 'notifications': return <Notifications />;

      default: return <Overview />;

    }
  };

  return (
    <div className="dashboard-container" style={{ display: 'flex', minHeight: '100vh', position: 'relative' }}>
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          onClick={() => setIsMobileMenuOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 90, backdropFilter: 'blur(4px)' }}
        />
      )}

      {/* Sidebar */}
      <aside className={`glass ${isMobileMenuOpen ? 'mobile-menu-active' : ''}`} style={{
        width: '260px',
        borderRight: '1px solid var(--glass-border)',
        padding: '2rem 1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem',
        position: 'fixed',
        top: 0,
        bottom: 0,
        left: isMobileMenuOpen ? 0 : '-260px',
        height: '100vh',
        zIndex: 100,
        transition: 'left 0.3s ease',
        background: 'var(--bg-darker)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingLeft: '0.5rem' }}>
            <div style={{ background: 'var(--primary)', padding: '0.5rem', borderRadius: '8px' }}>
              <Zap size={20} color="white" />
            </div>
            <span style={{ fontWeight: '600', fontSize: '1.25rem' }}>SmartHire</span>
          </div>
          <button className="desktop-only" style={{ display: 'none' }}></button>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <NavItem icon={<LayoutDashboard size={20} />} label="Overview" active={activeTab === 'dashboard'} onClick={() => { setActiveTab('dashboard'); setIsMobileMenuOpen(false); }} />
          <NavItem icon={<FileUp size={20} />} label="CV Ingestion" active={activeTab === 'upload'} onClick={() => { setActiveTab('upload'); setIsMobileMenuOpen(false); }} />
          <NavItem icon={<Users size={20} />} label="Candidates" active={activeTab === 'candidates'} onClick={() => { setActiveTab('candidates'); setIsMobileMenuOpen(false); }} />
          <NavItem icon={<Search size={20} />} label="Graph Search" active={activeTab === 'search'} onClick={() => { setActiveTab('search'); setIsMobileMenuOpen(false); }} />
          <NavItem icon={<Bell size={20} />} label="Notifications" active={activeTab === 'notifications'} onClick={() => { setActiveTab('notifications'); setIsMobileMenuOpen(false); }} />
        </nav>


        <div style={{ marginTop: 'auto' }}>
          <div className="glass-hover" style={{
            padding: '1rem',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            cursor: 'pointer'
          }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifySelf: 'center' }}>
              <User size={20} style={{ margin: '0 auto' }} />
            </div>
            <div>
              <p style={{ fontSize: '0.875rem', fontWeight: '500' }}>Mahima</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Lead Frontend</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ 
        flex: 1, 
        padding: '2rem 3rem',
        marginLeft: '0', // Handle margin dynamically via CSS or style
        paddingLeft: 'max(3rem, env(safe-area-inset-left))'
      }} className="main-content">
        {/* Header */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button 
              className="glass" 
              onClick={() => setIsMobileMenuOpen(true)}
              style={{ padding: '0.5rem', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              id="mobile-toggle"
            >
              <Menu size={24} />
            </button>
            <div>
              <h2 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>
                {activeTab === 'dashboard' ? 'Overview' : activeTab === 'upload' ? 'Ingestion' : activeTab === 'candidates' ? 'Intelligence Pool' : activeTab === 'notifications' ? 'Activity Feed' : 'Graph Analysis'}
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>SH-2026</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <ThemeToggle />
            <div style={{ position: 'relative' }}>
              <div className="glass glass-hover mobile-hidden" 
                   onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                   style={{ padding: '0.75rem', borderRadius: '12px', cursor: 'pointer', position: 'relative' }}>
                <Bell size={20} />
                <span style={{ 
                  position: 'absolute', 
                  top: '-5px', 
                  right: '-5px', 
                  background: '#ef4444', 
                  color: 'white', 
                  fontSize: '0.65rem', 
                  width: '18px', 
                  height: '18px', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  fontWeight: '700',
                  border: '2px solid var(--bg-darker)'
                }}>1</span>
              </div>
              
              <NotificationDropdown 
                isOpen={isNotificationsOpen} 
                onClose={() => setIsNotificationsOpen(false)} 
                onSeeAll={() => { setActiveTab('notifications'); setIsNotificationsOpen(false); }}
              />
            </div>

            <button className="primary-btn" onClick={() => setActiveTab('upload')}>

              <span className="mobile-hidden">+ Ingest Resumes</span>
              <span className="desktop-only" style={{ display: 'none' }}>+ Ingest</span>
            </button>
          </div>
        </header>

        {/* Dynamic Content */}
        <div className="content-area">
          {renderContent()}
        </div>
      </main>

      <style>{`
        @media (min-width: 1025px) {
          aside {
            position: sticky !important;
            left: 0 !important;
          }
          #mobile-toggle {
            display: none !important;
          }
        }
        @media (max-width: 1024px) {
          main {
            padding: 1.5rem !important;
          }
        }
      `}</style>
    </div>
  );
};

const NavItem = ({ icon, label, active, onClick }) => (

  <div 
    onClick={onClick}
    className={`glass-hover ${active ? 'active-nav' : ''}`}
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      padding: '0.875rem 1rem',
      borderRadius: '12px',
      cursor: 'pointer',
      color: active ? 'var(--nav-active)' : 'var(--text-muted)',
      background: active ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
      border: active ? '1px solid var(--primary)' : '1px solid transparent',
      fontWeight: active ? '600' : '400'
    }}
  >
    {icon}
    <span style={{ fontSize: '0.95rem' }}>{label}</span>
  </div>
);


export default Dashboard;
