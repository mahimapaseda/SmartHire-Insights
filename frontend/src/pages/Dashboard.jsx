import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  FileUp, 
  Users, 
  Zap, 
  Search, 
  Bell, 
  User
} from 'lucide-react';
import Overview from '../components/Overview';
import CVIngestion from '../components/CVIngestion';
import Candidates from '../components/Candidates';
import ThemeToggle from '../components/ThemeToggle';


const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Overview />;
      case 'upload': return <CVIngestion />;
      case 'candidates': return <Candidates />;
      case 'search': return <div className="glass animate-fade" style={{ padding: '4rem', borderRadius: '24px', textAlign: 'center' }}><Search size={48} color="var(--text-muted)" style={{ marginBottom: '1rem' }} /><h3>Knowledge Graph Search</h3><p style={{ color: 'var(--text-muted)' }}>Graph visualization coming soon...</p></div>;
      default: return <Overview />;
    }
  };

  return (
    <div className="dashboard-container" style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside className="glass" style={{
        width: '260px',
        borderRight: '1px solid var(--glass-border)',
        padding: '2rem 1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem',
        position: 'sticky',
        top: 0,
        height: '100vh'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingLeft: '0.5rem' }}>
          <div style={{ background: 'var(--primary)', padding: '0.5rem', borderRadius: '8px' }}>
            <Zap size={20} color="white" />
          </div>
          <span style={{ fontWeight: '600', fontSize: '1.25rem' }}>SmartHire</span>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <NavItem icon={<LayoutDashboard size={20} />} label="Overview" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <NavItem icon={<FileUp size={20} />} label="CV Ingestion" active={activeTab === 'upload'} onClick={() => setActiveTab('upload')} />
          <NavItem icon={<Users size={20} />} label="Candidates" active={activeTab === 'candidates'} onClick={() => setActiveTab('candidates')} />
          <NavItem icon={<Search size={20} />} label="Graph Search" active={activeTab === 'search'} onClick={() => setActiveTab('search')} />
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
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#334155', display: 'flex', alignItems: 'center', justifySelf: 'center' }}>
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
      <main style={{ flex: 1, padding: '2rem 3rem' }}>
        {/* Header */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
          <div>
            <h2 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>
              {activeTab === 'dashboard' ? 'Overview' : activeTab === 'upload' ? 'Ingestion' : activeTab === 'candidates' ? 'Intelligence Pool' : 'Graph Analysis'}
            </h2>
            <p style={{ color: 'var(--text-muted)' }}>Logged in as Mahima • System ID: SH-2026</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <ThemeToggle />
            <div className="glass" style={{ padding: '0.75rem', borderRadius: '12px', cursor: 'pointer' }}>
              <Bell size={20} />
            </div>
            <button className="primary-btn" onClick={() => setActiveTab('upload')}>+ Ingest Resumes</button>
          </div>
        </header>

        {/* Dynamic Content */}
        {renderContent()}
      </main>
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
      color: active ? 'white' : 'var(--text-muted)',
      background: active ? 'rgba(255,255,255,0.05)' : 'transparent',
      border: active ? '1px solid var(--glass-border)' : '1px solid transparent'
    }}
  >
    {icon}
    <span style={{ fontSize: '0.95rem', fontWeight: active ? '500' : '400' }}>{label}</span>
  </div>
);

export default Dashboard;
