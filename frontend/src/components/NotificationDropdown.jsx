import React from 'react';
import { Bell, Check, Volume2, Clock, X } from 'lucide-react';

const NotificationDropdown = ({ isOpen, onClose, onSeeAll }) => {
  if (!isOpen) return null;

  const notifications = [
    {
      id: 1,
      title: 'CV Parsing Complete',
      message: "Sarah Chen's profile is now available.",
      time: 'Today 15:56',
      unread: true,
      initial: 's'
    },
    {
      id: 2,
      title: 'High Potential Match',
      message: 'James Wilson has a 92% match score.',
      time: 'Today 14:20',
      unread: false,
      initial: 'j'
    },
    {
      id: 3,
      title: 'New Message',
      message: 'Anuruddha sent you a message.',
      time: 'Today 11:30',
      unread: false,
      initial: 'a'
    }
  ];

  return (
    <div className="glass animate-fade" style={{
      position: 'absolute',
      top: 'calc(100% + 10px)',
      right: '0',
      width: '380px',
      borderRadius: '24px',
      padding: '1.5rem',
      zIndex: 2000,
      boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
      border: '1px solid var(--glass-border)',
      background: 'var(--bg-darker)',
      backdropFilter: 'blur(20px)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Notifications</h3>
        <button style={{ color: 'var(--primary)', fontSize: '0.85rem', fontWeight: '600', background: 'none', border: 'none', cursor: 'pointer' }}>
          Mark all as read
        </button>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
        <span>You have 1 unread message</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <input type="checkbox" id="sound-notif" defaultChecked style={{ accentColor: 'var(--primary)' }} />
          <label htmlFor="sound-notif" style={{ color: 'var(--primary)', fontWeight: '600' }}>Sound Notifications</label>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {notifications.map(n => (
          <div key={n.id} className={n.unread ? "glass-hover" : ""} style={{
            padding: '1rem',
            borderRadius: '16px',
            display: 'flex',
            gap: '1rem',
            background: n.unread ? 'rgba(59, 130, 246, 0.08)' : 'transparent',
            border: n.unread ? '1px solid rgba(59, 130, 246, 0.2)' : '1px solid transparent',
            transition: 'all 0.2s'
          }}>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              borderRadius: '12px', 
              background: n.unread ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '700',
              textTransform: 'uppercase',
              color: n.unread ? 'white' : 'var(--text-muted)',
              flexShrink: 0
            }}>
              {n.initial}
            </div>
            <div style={{ flex: 1 }}>
              <h4 style={{ fontSize: '0.9rem', marginBottom: '0.2rem', fontWeight: n.unread ? '700' : '600' }}>{n.title}</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem', lineHeight: '1.4' }}>{n.message}</p>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Clock size={12} /> {n.time}
              </div>
            </div>
          </div>
        ))}
      </div>

      <button 
        onClick={onSeeAll}
        style={{ 
          width: '100%', 
          marginTop: '1.5rem', 
          padding: '0.75rem', 
          background: 'transparent', 
          border: 'none', 
          color: 'var(--text-muted)', 
          fontSize: '0.9rem', 
          fontWeight: '600',
          cursor: 'pointer',
          textDecoration: 'underline'
        }}>
        See more
      </button>
    </div>
  );
};

export default NotificationDropdown;
