import React, { useState, useEffect } from 'react';
import { Clock, FileText, CheckCircle2, MessageCircle, AlertCircle, X, BellOff } from 'lucide-react';
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

const NotificationDropdown = ({ isOpen, onClose, onSeeAll }) => {
  const [items, setItems] = useState(notificationStore.getAll());
  const unreadCount = notificationStore.getUnreadCount();

  useEffect(() => {
    return notificationStore.subscribe(() => {
      setItems(notificationStore.getAll());
    });
  }, []);

  if (!isOpen) return null;

  return (
    <div
      className="card animate-fade"
      style={{
        position: 'absolute',
        top: 'calc(100% + 8px)',
        right: 0,
        width: '340px',
        zIndex: 2000,
        boxShadow: 'var(--shadow-lg)',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div style={{
        padding: '1rem 1.25rem',
        borderBottom: '1px solid var(--border)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div>
          <h4 style={{ fontSize: '0.9rem', fontWeight: '700' }}>Notifications</h4>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '1px' }}>{unreadCount} unread</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {unreadCount > 0 && (
            <button onClick={() => notificationStore.markAllRead()} style={{ fontSize: '0.75rem', color: 'var(--primary)', background: 'none', fontWeight: '600' }}>
              Mark all read
            </button>
          )}
          <button className="btn-icon" style={{ width: 26, height: 26 }} onClick={onClose}>
            <X size={13} />
          </button>
        </div>
      </div>

      {/* List */}
      <div style={{ padding: '0.5rem', maxHeight: '300px', overflowY: 'auto' }}>
        {items.length === 0 ? (
          <div style={{ padding: '2rem 1rem', textAlign: 'center' }}>
            <BellOff size={24} color="var(--text-muted)" style={{ margin: '0 auto 0.5rem', opacity: 0.5 }} />
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>You're all caught up!</p>
          </div>
        ) : (
          items.slice(0, 5).map(n => {
            const conf = getIconConfig(n.type);
            const Icon = conf.icon;
            return (
              <div key={n.id} onClick={() => notificationStore.dismiss(n.id)} style={{
                display: 'flex', gap: '0.75rem', alignItems: 'flex-start',
                padding: '0.75rem',
                borderRadius: 'var(--r-md)',
                background: n.unread ? 'var(--primary-subtle)' : 'transparent',
                border: `1px solid ${n.unread ? 'rgba(26,92,56,0.15)' : 'transparent'}`,
                marginBottom: '0.25rem',
                cursor: 'pointer',
                transition: 'var(--transition)',
              }}>
                <div style={{
                  width: '34px', height: '34px',
                  borderRadius: 'var(--r-sm)',
                  background: conf.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: conf.color, flexShrink: 0,
                }}>
                  <Icon size={15} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '0.82rem', fontWeight: n.unread ? '700' : '600', marginBottom: '2px' }}>{n.title}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.4', marginBottom: '4px' }}>{n.desc}</p>
                  <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Clock size={10} /> {n.time}
                  </p>
                </div>
                {n.unread && (
                  <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--primary)', flexShrink: 0, marginTop: '4px' }} />
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div style={{ padding: '0.75rem 1.25rem', borderTop: '1px solid var(--border)' }}>
        <button
          onClick={onSeeAll}
          style={{ width: '100%', background: 'none', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: '600', padding: '0.25rem' }}
        >
          View all notifications →
        </button>
      </div>
    </div>
  );
};

export default NotificationDropdown;
