import React, { useState, useEffect } from 'react';
import { FileText, CheckCircle2, MessageCircle, AlertCircle, Bell, Trash2 } from 'lucide-react';
import { notificationStore } from '../utils/notificationStore';

const getIconConfig = (type) => {
  switch (type) {
    case 'parse': return { icon: FileText, color: 'var(--primary)', bg: 'var(--primary-subtle)' };
    case 'match': return { icon: CheckCircle2, color: 'var(--success)', bg: 'rgba(16,185,129,0.1)' };
    case 'message': return { icon: MessageCircle, color: 'var(--info)', bg: 'rgba(59,130,246,0.1)' };
    case 'error': return { icon: AlertCircle, color: 'var(--danger)', bg: 'rgba(239,68,68,0.1)' };
    default: return { icon: MessageCircle, color: 'var(--text-muted)', bg: 'var(--bg-elevated)' };
  }
};

const Notifications = () => {
  const [items, setItems] = useState(notificationStore.getAll());

  useEffect(() => {
    return notificationStore.subscribe(() => {
      setItems(notificationStore.getAll());
    });
  }, []);

  const clearAll = () => notificationStore.clearAll();
  const dismiss  = (id) => notificationStore.dismiss(id);

  return (
    <div className="animate-fade-up" style={{ maxWidth: '640px', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.2rem' }}>Activity Feed</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Real-time updates from AI parsing and backend services.
          </p>
        </div>
        {items.length > 0 && (
          <button className="btn-ghost" onClick={clearAll} style={{ fontSize: '0.8rem' }}>
            <Trash2 size={13} /> Clear all
          </button>
        )}
      </div>

      {/* Items */}
      {items.length === 0 ? (
        <div className="card" style={{ padding: '4rem', textAlign: 'center' }}>
          <Bell size={32} color="var(--text-muted)" style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No notifications</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {items.map((n, i) => {
            const conf = getIconConfig(n.type);
            const Icon = conf.icon;
            return (
              <div
                key={n.id}
                className="card notif-enter"
                style={{
                  padding: '1rem 1.25rem',
                  display: 'flex', gap: '1rem', alignItems: 'flex-start',
                  borderLeft: n.unread ? '3px solid var(--primary)' : '3px solid transparent',
                  animationDelay: `${i * 50}ms`,
                }}
              >
                <div style={{
                  width: '38px', height: '38px',
                  borderRadius: 'var(--r-md)',
                  background: conf.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <Icon size={17} color={conf.color} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <p style={{ fontSize: '0.875rem', fontWeight: n.unread ? '700' : '600' }}>{n.title}</p>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', flexShrink: 0 }}>{n.time}</span>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.2rem', lineHeight: '1.5' }}>{n.desc}</p>
                </div>
                <button
                  className="btn-icon"
                  style={{ width: 26, height: 26, flexShrink: 0 }}
                  onClick={() => dismiss(n.id)}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Notifications;
