import React from 'react';
import { Bell, User, MessageCircle, FileText, CheckCircle } from 'lucide-react';

const Notifications = () => {
  const alerts = [
    { id: 1, type: 'parse', title: 'CV Parsing Complete', desc: 'Sarah Chen\'s profile is now available in the intelligence pool.', time: '2 mins ago', icon: <FileText size={18} color="var(--primary)" /> },
    { id: 2, type: 'match', title: 'High Potential Match', desc: 'New candidate James Wilson has a 92% match score for DevOps Lead.', time: '1 hour ago', icon: <CheckCircle size={18} color="#22c55e" /> },
    { id: 3, type: 'message', title: 'New Message', desc: 'Anuruddha sent you a message regarding the Neo4j schema update.', time: '3 hours ago', icon: <MessageCircle size={18} color="#8b5cf6" /> },
  ];

  return (
    <div className="notifications-portal animate-fade" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Recruiter Activity Feed</h2>
        <p style={{ color: 'var(--text-muted)' }}>Real-time updates from AI parsing and backend services.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {alerts.map(a => (
          <div key={a.id} className="glass glass-hover" style={{
            padding: '1.25rem',
            borderRadius: '18px',
            display: 'flex',
            gap: '1.25rem',
            alignItems: 'flex-start'
          }}>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              borderRadius: '12px', 
              background: 'rgba(255,255,255,0.05)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              {a.icon}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <h4 style={{ fontSize: '0.95rem' }}>{a.title}</h4>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{a.time}</span>
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>{a.desc}</p>
            </div>
          </div>
        ))}
      </div>
      
      <button className="glass glass-hover" style={{ 
        width: '100%', 
        marginTop: '2rem', 
        padding: '1rem', 
        borderRadius: '16px', 
        color: 'var(--text-muted)',
        fontSize: '0.9rem'
      }}>
        Clear All Notifications
      </button>
    </div>
  );
};

export default Notifications;
