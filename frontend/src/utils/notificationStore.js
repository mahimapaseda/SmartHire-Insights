/**
 * Lightweight in-memory store for notifications.
 */

export const NOTIF_TYPES = {
  PARSE: 'parse',
  MATCH: 'match',
  MESSAGE: 'message',
  ERROR: 'error'
};

let _notifs = [
  {
    id: 100,
    type: 'message',
    title: 'System Initialized',
    desc: 'Notification engine is now live and waiting for events.',
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    unread: false,
  }
];
const _listeners = new Set();
let _nextNotifId = 101;

export const notificationStore = {
  getAll: () => [..._notifs].reverse(),
  getUnreadCount: () => _notifs.filter(n => n.unread).length,
  add: (type, title, desc) => {
    const notif = {
      id: _nextNotifId++,
      type,
      title,
      desc,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      unread: true,
    };
    _notifs.push(notif);
    if (_notifs.length > 50) _notifs.shift(); // Limit to 50
    _listeners.forEach(fn => fn());
  },
  markAllRead: () => {
    _notifs = _notifs.map(n => ({ ...n, unread: false }));
    _listeners.forEach(fn => fn());
  },
  dismiss: (id) => {
    _notifs = _notifs.filter(n => n.id !== id);
    _listeners.forEach(fn => fn());
  },
  clearAll: () => {
    _notifs = [];
    _listeners.forEach(fn => fn());
  },
  subscribe: (fn) => {
    _listeners.add(fn);
    return () => _listeners.delete(fn);
  }
};
