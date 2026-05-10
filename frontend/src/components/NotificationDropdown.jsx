import React from 'react';
import { Clock, FileText, CheckCircle2, MessageCircle, X } from 'lucide-react';

const NOTIFS = [
  {
    id: 1,
    title: 'CV Parsing Complete',
    message: "Sarah Chen's profile is now available.",
    time: 'Today 15:56',
    unread: true,
    icon: <FileText size={15} />,
    iconColor: 'var(--primary)',
    iconBg: 'var(--primary-subtle)',
  },
  {
    id: 2,
    title: 'High Potential Match',
    message: 'James Wilson — 92% match for DevOps Lead.',
    time: 'Today 14:20',
    unread: false,
    icon: <CheckCircle2 size={15} />,
    iconColor: 'var(--success)',
    iconBg: 'rgba(34,197,94,0.1)',
  },
  {
    id: 3,
    title: 'New Message',
    message: 'Anuruddha sent you a message.',
    time: 'Today 11:30',
    unread: false,
    icon: <MessageCircle size={15} />,
    iconColor: 'var(--info)',
    iconBg: 'rgba(59,130,246,0.1)',
  },
];

const NotificationDropdown = ({ isOpen, onClose, onSeeAll }) => {
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
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '1px' }}>1 unread</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button style={{ fontSize: '0.75rem', color: 'var(--primary)', background: 'none', fontWeight: '600' }}>
            Mark all read
          </button>
          <button className="btn-icon" style={{ width: 26, height: 26 }} onClick={onClose}>
            <X size={13} />
          </button>
        </div>
      </div>

      {/* List */}
      <div style={{ padding: '0.5rem' }}>
        {NOTIFS.map(n => (
          <div key={n.id} style={{
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
              background: n.iconBg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: n.iconColor, flexShrink: 0,
            }}>
              {n.icon}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: '0.82rem', fontWeight: n.unread ? '700' : '600', marginBottom: '2px' }}>{n.title}</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.4', marginBottom: '4px' }}>{n.message}</p>
              <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Clock size={10} /> {n.time}
              </p>
            </div>
            {n.unread && (
              <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--primary)', flexShrink: 0, marginTop: '4px' }} />
            )}
          </div>
        ))}
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
