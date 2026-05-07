import React from 'react';
import { CheckCircle2, Clock, Zap } from 'lucide-react';

const Overview = () => {
  return (
    <div className="overview animate-fade">
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
    </div>
  );
};

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

export default Overview;
