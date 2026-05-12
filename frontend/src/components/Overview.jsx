import React, { useState, useEffect } from 'react';
import { ArrowUpRight, FileCheck2, CalendarClock, Database, TrendingUp } from 'lucide-react';
import { candidateStore } from '../utils/candidateStore';

const ACTIVITY_PLACEHOLDER = [
  { name: 'Software Engineer CV',   status: 'Completed',  time: '2 min ago',  role: 'Full Stack' },
  { name: 'Data Scientist Profile', status: 'Processing', time: '15 min ago', role: 'ML / AI' },
  { name: 'DevOps Lead Resume',     status: 'Completed',  time: '1 hr ago',   role: 'Infrastructure' },
  { name: 'Product Manager CV',     status: 'Queued',     time: '2 hr ago',   role: 'Product' },
];

const SERVICES = [
  { label: 'Python NLP Engine',       status: 'online' },
  { label: 'Neo4j Graph Database',    status: 'online' },
  { label: 'Behavioral Analysis API', status: 'standby' },
  { label: 'CV Parser Service',       status: 'online' },
];

const STATUS_META = {
  Completed:  { cls: 'badge-success', label: 'Completed' },
  Processing: { cls: 'badge-warning', label: 'In Progress' },
  Queued:     { cls: 'badge-muted',   label: 'Pending' },
};

const Overview = ({ onIngest }) => {
  const [candidates, setCandidates] = useState(candidateStore.getAll());

  useEffect(() => {
    return candidateStore.subscribe(() => setCandidates([...candidateStore.getAll()]));
  }, []);

  const candidateCount = candidates.length;

  const ACTIVITY = candidates.length > 0 ? candidates.slice(-4).reverse().map(c => ({
    name: c.name,
    status: 'Completed',
    time: c.addedAt || 'Just now',
    role: c.role || 'Candidate'
  })) : ACTIVITY_PLACEHOLDER;

  const STATS = [
    { label: 'Parsed CVs',        value: String(candidateCount), delta: 'Increased from last month', icon: FileCheck2,    featured: true },
    { label: 'Active Interviews', value: '14',                   delta: 'Increased from last month', icon: CalendarClock, featured: false },
    { label: 'Neo4j Nodes',       value: String(candidateCount * 6 + 1200), delta: 'Increased from last month', icon: Database, featured: false },
    { label: 'Match Rate',        value: '94%',                  delta: 'On target',                 icon: TrendingUp,    featured: false },
  ];

  return (
    <div className="animate-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

    {/* ── Stats row ── */}
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '1rem' }}
         className="stagger">
      {STATS.map(s => <StatCard key={s.label} {...s} />)}
    </div>

    {/* ── Middle row: Analytics + Reminder + Projects ── */}
    <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr 1fr', gap: '1rem' }}>

      {/* Analytics chart placeholder */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '0.95rem' }}>CV Analytics</h3>
          <button className="btn-ghost" style={{ fontSize: '0.75rem', padding: '0.3rem 0.7rem' }}>
            Weekly <ArrowUpRight size={12} />
          </button>
        </div>
        <BarChart />
      </div>

      {/* Reminder card */}
      <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <h3 style={{ fontSize: '0.95rem' }}>Reminders</h3>
        <div style={{
          flex: 1,
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          gap: '0.5rem',
        }}>
          <p style={{ fontWeight: '700', fontSize: '1rem', lineHeight: '1.3' }}>Interview with<br />Sarah Chen</p>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Time: 02:00 pm – 04:00 pm</p>
        </div>
        <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', fontSize: '0.82rem' }}>
          Start Interview
        </button>
      </div>

      {/* Backend services */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '0.95rem' }}>Services</h3>
          <button className="btn-ghost" style={{ fontSize: '0.72rem', padding: '0.25rem 0.6rem' }}>+ New</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          {SERVICES.map(s => <ServiceRow key={s.label} {...s} />)}
        </div>
      </div>
    </div>

    {/* ── Bottom row: Activity + Progress ── */}
    <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '1rem' }}>

      {/* Activity */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '0.95rem' }}>Recent Activity</h3>
          <button className="btn-ghost" style={{ fontSize: '0.75rem', padding: '0.3rem 0.7rem' }}>
            View all <ArrowUpRight size={12} />
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {ACTIVITY.map((a, i) => (
            <ActivityRow key={i} {...a} last={i === ACTIVITY.length - 1} />
          ))}
        </div>
      </div>

      {/* Progress donut */}
      <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ fontSize: '0.95rem', marginBottom: '1.25rem' }}>Pipeline Progress</h3>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
          <DonutChart pct={41} />
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Legend color="var(--primary)" label="Completed" />
            <Legend color="var(--success)" label="In Progress" />
            <Legend color="var(--border-strong)" label="Pending" dashed />
          </div>
        </div>
      </div>
    </div>

    {/* Responsive */}
    <style>{`
      @media (max-width: 1100px) {
        .overview-mid  { grid-template-columns: 1fr 1fr !important; }
        .overview-bot  { grid-template-columns: 1fr !important; }
      }
      @media (max-width: 700px) {
        .overview-mid  { grid-template-columns: 1fr !important; }
      }
    `}</style>
  </div>
  );
};

/* ── Stat Card ── */
const StatCard = ({ label, value, delta, icon: Icon, featured }) => (
  <div className="card-lift" style={{
    padding: '1.25rem',
    borderRadius: 'var(--r-xl)',
    background: featured ? 'linear-gradient(145deg, #1a5c38 0%, #0d3320 100%)' : 'var(--bg-surface)',
    border: featured ? 'none' : '1px solid var(--border)',
    boxShadow: featured ? '0 4px 24px rgba(26,92,56,0.35)' : 'var(--shadow-sm)',
    color: featured ? '#fff' : 'var(--text-primary)',
    position: 'relative',
    overflow: 'hidden',
    transition: 'var(--transition)',
    cursor: 'default',
  }}>
    {/* Arrow link */}
    <div style={{
      position: 'absolute', top: '1rem', right: '1rem',
      width: '28px', height: '28px', borderRadius: '50%',
      background: featured ? 'rgba(255,255,255,0.15)' : 'var(--bg-elevated)',
      border: featured ? 'none' : '1px solid var(--border)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <ArrowUpRight size={13} color={featured ? '#fff' : 'var(--text-secondary)'} />
    </div>

    <p style={{ fontSize: '0.8rem', fontWeight: '500', color: featured ? 'rgba(255,255,255,0.75)' : 'var(--text-secondary)', marginBottom: '0.75rem' }}>
      {label}
    </p>
    <p className="animate-count" style={{ fontSize: '2rem', fontWeight: '800', letterSpacing: '-0.04em', lineHeight: 1, marginBottom: '0.5rem' }}>
      {value}
    </p>
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
      <Icon size={13} color={featured ? '#4ade80' : 'var(--success)'} />
      <p style={{ fontSize: '0.72rem', color: featured ? '#4ade80' : 'var(--success)', fontWeight: '500' }}>{delta}</p>
    </div>

    {/* Decorative circle for featured */}
    {featured && (
      <div style={{ position: 'absolute', bottom: '-20px', right: '-20px', width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(34,197,94,0.12)' }} />
    )}
  </div>
);

/* ── Bar Chart (visual only) ── */
const BARS = [
  { day: 'S', h: 45, active: false },
  { day: 'M', h: 72, active: false },
  { day: 'T', h: 88, active: true  },
  { day: 'W', h: 60, active: false },
  { day: 'T', h: 50, active: false },
  { day: 'F', h: 40, active: false },
  { day: 'S', h: 35, active: false },
];

const BarChart = () => (
  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.625rem', height: '100px' }}>
    {BARS.map((b, i) => (
      <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
        {b.active && (
          <span style={{ fontSize: '0.65rem', fontWeight: '700', color: 'var(--primary)', background: 'var(--primary-subtle)', padding: '1px 5px', borderRadius: '4px' }}>
            74%
          </span>
        )}
        <div style={{
          width: '100%',
          height: `${b.h}%`,
          borderRadius: '6px 6px 4px 4px',
          background: b.active
            ? 'var(--primary)'
            : 'repeating-linear-gradient(45deg, var(--border-strong) 0px, var(--border-strong) 1px, transparent 1px, transparent 5px)',
          border: b.active ? 'none' : '1.5px solid var(--border-strong)',
          transition: 'var(--transition)',
        }} />
        <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{b.day}</span>
      </div>
    ))}
  </div>
);

/* ── Activity Row ── */
const ActivityRow = ({ name, status, time, role, last }) => {
  const meta = STATUS_META[status] || STATUS_META.Queued;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0.8rem 0',
      borderBottom: last ? 'none' : '1px solid var(--border)',
      gap: '0.75rem',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{
          width: '34px', height: '34px', borderRadius: 'var(--r-sm)',
          background: 'var(--bg-elevated)', border: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.72rem', fontWeight: '800', color: 'var(--text-secondary)',
          flexShrink: 0,
        }}>
          {name.charAt(0)}
        </div>
        <div>
          <p style={{ fontSize: '0.84rem', fontWeight: '600' }}>{name}</p>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{role} · {time}</p>
        </div>
      </div>
      <span className={`badge ${meta.cls}`}>{meta.label}</span>
    </div>
  );
};

/* ── Service Row ── */
const ServiceRow = ({ label, status }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{label}</p>
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
      <span className={`status-dot ${status}`} />
      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{status}</span>
    </div>
  </div>
);

/* ── Donut Chart ── */
const DonutChart = ({ pct }) => {
  const r = 52, cx = 64, cy = 64;
  const circ = 2 * Math.PI * r;
  const filled = (pct / 100) * circ;
  return (
    <div style={{ position: 'relative', width: '128px', height: '128px' }}>
      <svg width="128" height="128" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--border-strong)" strokeWidth="14" />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--primary)" strokeWidth="14"
          strokeDasharray={`${filled} ${circ}`} strokeLinecap="round" />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontSize: '1.4rem', fontWeight: '800', letterSpacing: '-0.04em', lineHeight: 1 }}>{pct}%</p>
        <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '2px' }}>Pipeline</p>
      </div>
    </div>
  );
};

const Legend = ({ color, label, dashed }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
    <div style={{
      width: '10px', height: '10px', borderRadius: '50%',
      background: dashed ? 'transparent' : color,
      border: dashed ? `2px dashed ${color}` : 'none',
    }} />
    <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{label}</span>
  </div>
);

export default Overview;
