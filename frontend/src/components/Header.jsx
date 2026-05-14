import React, { useState, useEffect } from 'react';
import { Search, Mail, Bell, Menu } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import NotificationDropdown from './NotificationDropdown';
import { notificationStore } from '../utils/notificationStore';

const Header = ({ setSidebarOpen, notifOpen, setNotifOpen, notifRef, goTo }) => {
  const [unreadCount, setUnreadCount] = useState(notificationStore.getUnreadCount());

  useEffect(() => {
    return notificationStore.subscribe(() => {
      setUnreadCount(notificationStore.getUnreadCount());
    });
  }, []);
  return (
    <header style={{
      height: '64px',
      background: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 1.75rem',
      gap: '1rem',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      boxShadow: 'var(--shadow-xs)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
        <button className="btn-icon hide-desktop" onClick={() => setSidebarOpen(true)}>
          <Menu size={18} />
        </button>

        <div style={{ position: 'relative', maxWidth: '280px', width: '100%' }} className="hide-mobile">
          <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
          <input
            className="input"
            type="text"
            placeholder="Search candidates, skills…"
            style={{ paddingLeft: '2.25rem', paddingTop: '0.5rem', paddingBottom: '0.5rem', fontSize: '0.82rem', borderRadius: 'var(--r-md)' }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <ThemeToggle />
        <button className="btn-icon">
          <Mail size={17} />
        </button>
        <div ref={notifRef} style={{ position: 'relative' }}>
          <button className="btn-icon" onClick={() => setNotifOpen(o => !o)} style={{ position: 'relative' }}>
            <Bell size={17} />
            {/* L-4: Only show badge when there are unread notifications */}
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute', top: '6px', right: '6px',
                width: '7px', height: '7px',
                background: 'var(--danger)', borderRadius: '50%',
                border: '1.5px solid var(--bg-surface)',
              }} />
            )}
          </button>
          <NotificationDropdown
            isOpen={notifOpen}
            onClose={() => setNotifOpen(false)}
            onSeeAll={() => { goTo('notifications'); setNotifOpen(false); }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', paddingLeft: '0.5rem', borderLeft: '1px solid var(--border)' }}>
          <div style={{
            width: '34px', height: '34px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #1a5c38, #22c55e)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.8rem', fontWeight: '800', color: '#fff', flexShrink: 0,
          }}>M</div>
          <div className="hide-mobile">
            <p style={{ fontSize: '0.82rem', fontWeight: '700', lineHeight: 1.2 }}>Mahima</p>
            <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>mahima@smarthire.ai</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
