import React, { useState, useEffect } from 'react';
import { ArrowUpRight, FileCheck2, CalendarClock, Database, TrendingUp, Video, Copy, Check, ExternalLink, X } from 'lucide-react';
import { candidateStore } from '../utils/candidateStore';
import { API_URL, getHeaders } from '../config';

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
  const [reqCount, setReqCount] = useState(0);
  
  // Google Meet integration state
  const [showMeetModal, setShowMeetModal] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState('Sarah Chen');
  const [meetLink, setMeetLink] = useState('https://meet.google.com/new');
  const [generated, setGenerated] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedInvite, setCopiedInvite] = useState(false);

  useEffect(() => {
    // Fetch requirements count
    const fetchReqs = async () => {
      try {
        const res = await fetch(`${API_URL}/api/requirements`, { headers: getHeaders() });
        const data = await res.json();
        if (data.success) setReqCount(data.data.length);
      } catch (err) { console.error(err); }
    };
    fetchReqs();
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
    { label: 'Parsed CVs',        value: String(candidateCount), delta: 'Total extracted pool', icon: FileCheck2,    featured: true },
    { label: 'Active Requirements', value: String(reqCount),      delta: 'Targeted roles',        icon: CalendarClock, featured: false },
    { label: 'Neo4j Entities',    value: String(candidateCount * 6 + reqCount * 3), delta: 'Graph nodes', icon: Database, featured: false },
    { label: 'System Health',     value: '99%',                  delta: 'All services up',       icon: TrendingUp,    featured: false },
  ];

  const allCandidates = candidates.map(c => c.name);
  if (!allCandidates.includes('Sarah Chen')) {
    allCandidates.unshift('Sarah Chen');
  }

  const generateMeetCode = () => {
    const randLetters = (len) => {
      let str = '';
      for (let i = 0; i < len; i++) {
        str += String.fromCharCode(97 + Math.floor(Math.random() * 26));
      }
      return str;
    };
    const code = `${randLetters(3)}-${randLetters(4)}-${randLetters(3)}`;
    setMeetLink(`https://meet.google.com/${code}`);
    setGenerated(true);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(meetLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyInvite = () => {
    const inviteText = `Hi ${selectedCandidate},\n\nYou have been invited to a video interview with SmartHire Insights.\n\nPlease join the Google Meet session at your scheduled time using the link below:\n${meetLink}\n\nLooking forward to speaking with you!\nBest regards,\nRecruitment Team`;
    navigator.clipboard.writeText(inviteText);
    setCopiedInvite(true);
    setTimeout(() => setCopiedInvite(false), 2000);
  };

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
        <button 
          className="btn-primary" 
          style={{ width: '100%', justifyContent: 'center', fontSize: '0.82rem', gap: '0.4rem' }}
          onClick={() => {
            setSelectedCandidate('Sarah Chen');
            setShowMeetModal(true);
          }}
        >
          <Video size={14} />
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

    {/* ── Google Meet Integration Modal ── */}
    {showMeetModal && (
      <div style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15,23,42,0.3)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        animation: 'fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
      }} onClick={() => {
        setShowMeetModal(false);
        setGenerated(false);
      }}>
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--r-2xl)',
          padding: '1.75rem',
          width: '92%',
          maxWidth: '460px',
          boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
          animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          overflow: 'hidden'
        }} onClick={e => e.stopPropagation()}>
          
          {/* Top Multi-color Google Meet Accent Bar */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: '4px',
            background: 'linear-gradient(90deg, #4285F4 25%, #EA4335 25% 50%, #FBBC05 50% 75%, #34A853 75%)'
          }} />

          {/* Modal Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '50%',
                background: 'rgba(66, 133, 244, 0.1)', display: 'flex',
                alignItems: 'center', justifyContent: 'center'
              }}>
                <Video size={18} color="#4285F4" />
              </div>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: '800', margin: 0 }}>Start Google Meet</h3>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: 0 }}>Instant recruiter link & candidate invite</p>
              </div>
            </div>
            <button 
              onClick={() => {
                setShowMeetModal(false);
                setGenerated(false);
              }}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--text-muted)', padding: '4px', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >
              <X size={16} />
            </button>
          </div>

          <hr style={{ border: 'none', height: '1px', background: 'var(--border)', margin: 0 }} />

          {/* Candidate Dropdown */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <label style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-secondary)' }}>Select Candidate</label>
            <select 
              value={selectedCandidate} 
              onChange={e => setSelectedCandidate(e.target.value)}
              style={{
                padding: '0.625rem 0.75rem', borderRadius: 'var(--r-md)',
                background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                color: 'var(--text-primary)', fontSize: '0.85rem', outline: 'none',
                width: '100%'
              }}
            >
              {allCandidates.map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>

          {/* Link Section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <label style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-secondary)' }}>Google Meet URL</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input 
                type="text" 
                readOnly 
                value={meetLink}
                style={{
                  flex: 1, padding: '0.625rem 0.75rem', borderRadius: 'var(--r-md)',
                  background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                  color: 'var(--text-secondary)', fontSize: '0.82rem', outline: 'none',
                  fontFamily: 'var(--font-mono)'
                }}
              />
              <button 
                onClick={handleCopyLink}
                style={{
                  padding: '0 0.75rem', borderRadius: 'var(--r-md)',
                  background: 'var(--bg-surface)', border: '1px solid var(--border)',
                  color: 'var(--text-primary)', cursor: 'pointer', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', transition: 'var(--transition)'
                }}
                title="Copy meeting link"
              >
                {copiedLink ? <Check size={14} color="var(--success)" /> : <Copy size={14} />}
              </button>
            </div>
          </div>

          {/* Call to actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', marginTop: '0.25rem' }}>
            {!generated ? (
              <button 
                className="btn-primary" 
                onClick={generateMeetCode}
                style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', gap: '0.5rem' }}
              >
                <Video size={16} />
                Generate Instant Meeting Link
              </button>
            ) : (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.625rem' }}>
                  <button 
                    onClick={handleCopyInvite}
                    style={{
                      padding: '0.75rem', borderRadius: 'var(--r-lg)',
                      background: 'var(--bg-surface)', border: '1px solid var(--border)',
                      color: 'var(--text-primary)', cursor: 'pointer', display: 'flex',
                      alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                      fontWeight: '600', fontSize: '0.8rem', transition: 'var(--transition)'
                    }}
                  >
                    {copiedInvite ? <Check size={14} color="var(--success)" /> : <Copy size={14} />}
                    {copiedInvite ? 'Copied Invite!' : 'Copy Invitation'}
                  </button>

                  <a 
                    href={meetLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{
                      padding: '0.75rem', borderRadius: 'var(--r-lg)',
                      background: 'linear-gradient(135deg, #4285F4 0%, #357ae8 100%)',
                      color: '#fff', cursor: 'pointer', display: 'flex', textDecoration: 'none',
                      alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                      fontWeight: '600', fontSize: '0.8rem', transition: 'var(--transition)',
                      boxShadow: '0 4px 12px rgba(66,133,244,0.3)'
                    }}
                  >
                    Launch Meet
                    <ExternalLink size={14} />
                  </a>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    )}

    <style>{`
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes slideUp {
        from { transform: translateY(12px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
    `}</style>

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
