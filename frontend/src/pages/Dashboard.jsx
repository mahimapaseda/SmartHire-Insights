import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  FileUp, 
  Users, 
  Zap, 
  Search, 
  Bell, 
  User,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="dashboard-container" style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside className="glass" style={{
        width: '260px',
        borderRight: '1px solid var(--glass-border)',
        padding: '2rem 1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem'
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
            <h2 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Welcome back, Mahima</h2>
            <p style={{ color: 'var(--text-muted)' }}>System status: All services operational</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div className="glass" style={{ padding: '0.75rem', borderRadius: '12px', cursor: 'pointer' }}>
              <Bell size={20} />
            </div>
            <button className="primary-btn">+ New Analysis</button>
          </div>
        </header>

        {/* Stats Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
          <StatCard title="Parsed CVs" value="128" change="+12%" icon={<CheckCircle2 color="#22c55e" />} />
          <StatCard title="Active Interviews" value="14" change="3 pending" icon={<Clock color="#eab308" />} />
          <StatCard title="Neo4j Nodes" value="2,405" change="+84 today" icon={<Zap color="#3b82f6" />} />
        </div>

        {/* Content Area */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
          {/* Main Activity */}
          <section className="glass" style={{ padding: '2rem', borderRadius: '24px' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>Recent Activity</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <ActivityItem name="Software Engineer CV" status="Completed" time="2 mins ago" />
              <ActivityItem name="Data Scientist Profile" status="Processing" time="15 mins ago" />
              <ActivityItem name="DevOps Lead Resume" status="Completed" time="1 hour ago" />
            </div>
          </section>

          {/* System Health */}
          <section className="glass" style={{ padding: '2rem', borderRadius: '24px' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>Backend Connectivity</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <HealthCheck label="Python NLP Engine" status="Online" color="#22c55e" />
              <HealthCheck label="Neo4j Graph Database" status="Online" color="#22c55e" />
              <HealthCheck label="Behavioral Analysis API" status="Standby" color="#94a3b8" />
            </div>
          </section>
        </div>
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

const StatCard = ({ title, value, change, icon }) => (
  <div className="glass" style={{ padding: '1.5rem', borderRadius: '20px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
      <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{title}</span>
      {icon}
    </div>
    <p style={{ fontSize: '2rem', fontWeight: '600', marginBottom: '0.25rem' }}>{value}</p>
    <p style={{ fontSize: '0.75rem', color: '#22c55e' }}>{change}</p>
  </div>
);

const ActivityItem = ({ name, status, time }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 0', borderBottom: '1px solid var(--glass-border)' }}>
    <div>
      <p style={{ fontWeight: '500' }}>{name}</p>
      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{time}</p>
    </div>
    <div style={{ 
      padding: '0.25rem 0.75rem', 
      borderRadius: '20px', 
      fontSize: '0.75rem', 
      background: status === 'Completed' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(234, 179, 8, 0.1)',
      color: status === 'Completed' ? '#22c55e' : '#eab308'
    }}>
      {status}
    </div>
  </div>
);

const HealthCheck = ({ label, status, color }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <span style={{ fontSize: '0.875rem' }}>{label}</span>
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: color }}></div>
      <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{status}</span>
    </div>
  </div>
);

export default Dashboard;
