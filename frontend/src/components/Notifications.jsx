import React, { useState } from 'react';
import { FileText, CheckCircle2, MessageCircle, Bell, Trash2 } from 'lucide-react';

const ALL_NOTIFS = [
  {
    id: 1,
    type: 'parse',
    title: 'CV Parsing Complete',
    desc: "Sarah Chen's profile is now available in the intelligence pool.",
    time: '2 min ago',
    icon: FileText,
    iconColor: 'var(--primary)',
    iconBg: 'var(--primary-subtle)',
    unread: true,
  },
  {
    id: 2,
    type: 'match',
    title: 'High Potential Match',
    desc: 'James Wilson has a 92% match score for the DevOps Lead position.',
    time: '1 hr ago',
    icon: CheckCircle2,
    iconColor: 'var(--success)',
    iconBg: 'rgba(16,185,129,0.1)',
    unread: false,
  },
  {
    id: 3,
    type: 'message',
    title: 'New Message',
    desc: 'Anuruddha sent you a message regarding the Neo4j schema update.',
    time: '3 hr ago',
    icon: MessageCircle,
    iconColor: 'var(--info)',
    iconBg: 'rgba(59,130,246,0.1)',
    unread: false,
  },
  {
    id: 4,
    type: 'parse',
    title: 'Batch Processing Done',
    desc: '5 new CVs have been parsed and added to the candidate pool.',
    time: 'Yesterday',
    icon: FileText,
    iconColor: 'var(--primary)',
    iconBg: 'var(--primary-subtle)',
    unread: false,
  },
];

const Notifications = () => {
  const [items, setItems] = useState(ALL_NOTIFS);

  const clearAll = () => setItems([]);
  const dismiss  = (id) => setItems(prev => prev.filter(n => n.id !== id));

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
          <Bell size={32} color="var(--text-tertiary)" style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
          <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>No notifications</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {items.map(n => {
            const Icon = n.icon;
            return (
              <div
                key={n.id}
                className="card"
                style={{
                  padding: '1rem 1.25rem',
                  display: 'flex', gap: '1rem', alignItems: 'flex-start',
                  borderLeft: n.unread ? '3px solid var(--primary)' : '3px solid transparent',
                }}
              >
                <div style={{
                  width: '38px', height: '38px',
                  borderRadius: 'var(--radius-md)',
                  background: n.iconBg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <Icon size={17} color={n.iconColor} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <p style={{ fontSize: '0.875rem', fontWeight: n.unread ? '700' : '600' }}>{n.title}</p>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', flexShrink: 0 }}>{n.time}</span>
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
