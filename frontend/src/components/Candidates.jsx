import React, { useState, useMemo } from 'react';
import {
  Search, MapPin, GraduationCap, Mail, Briefcase,
  Clock, ChevronRight, X, Star, Share2, MessageSquare,
} from 'lucide-react';

const CANDIDATES = [
  {
    id: 1,
    name: 'Sarah Chen',
    role: 'Full Stack Engineer',
    match: 98,
    skills: ['React', 'Node.js', 'Neo4j', 'Python', 'TypeScript'],
    experience: '5 years',
    location: 'San Francisco, CA',
    education: 'M.S. Computer Science, Stanford',
    email: 'sarah.chen@example.com',
    summary: 'Experienced engineer specialising in high-performance web applications and graph database modelling. Strong background in React ecosystems and distributed systems.',
    projects: ['FinTech Analytics Engine', 'Graph-based Social CRM'],
    initials: 'SC',
    gradient: 'linear-gradient(135deg, #6366f1, #06b6d4)',
  },
  {
    id: 2,
    name: 'James Wilson',
    role: 'DevOps Lead',
    match: 92,
    skills: ['AWS', 'Docker', 'Kubernetes', 'Python', 'Terraform'],
    experience: '8 years',
    location: 'Austin, TX',
    education: 'B.S. Information Technology, UT Austin',
    email: 'j.wilson@example.com',
    summary: 'Automation specialist focused on cloud infrastructure scalability and security. Expert in CI/CD pipeline optimisation and container orchestration.',
    projects: ['Global CDN Migration', 'Zero-Downtime Deployment Suite'],
    initials: 'JW',
    gradient: 'linear-gradient(135deg, #10b981, #06b6d4)',
  },
  {
    id: 3,
    name: 'Elena Rodriguez',
    role: 'AI Researcher',
    match: 95,
    skills: ['Python', 'PyTorch', 'NLP', 'TensorFlow', 'LLMs'],
    experience: '4 years',
    location: 'Boston, MA',
    education: 'Ph.D. Artificial Intelligence, MIT',
    email: 'elena.r@example.com',
    summary: 'Research scientist dedicated to advancing Natural Language Processing. Published author in major AI conferences with a focus on transformer architectures.',
    projects: ['Multi-modal LLM Evaluation', 'Sentiment Analysis at Scale'],
    initials: 'ER',
    gradient: 'linear-gradient(135deg, #f59e0b, #ef4444)',
  },
];

const matchColor = (m) => m >= 95 ? 'var(--primary)' : m >= 85 ? 'var(--warning)' : 'var(--text-secondary)';

const Candidates = ({ onSelectCandidate }) => {
  const [query, setQuery]   = useState('');
  const [modal, setModal]   = useState(null);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return CANDIDATES.filter(c =>
      !q ||
      c.name.toLowerCase().includes(q) ||
      c.role.toLowerCase().includes(q) ||
      c.skills.some(s => s.toLowerCase().includes(q))
    );
  }, [query]);

  return (
    <div className="animate-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.2rem' }}>Candidate Pool</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            {CANDIDATES.length} profiles · AI-ranked by match score
          </p>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', width: '280px' }}>
          <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)', pointerEvents: 'none' }} />
          <input
            className="input"
            type="text"
            placeholder="Search name, role, skill…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={{ paddingLeft: '2.25rem' }}
          />
        </div>
      </div>

      {/* List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
        {filtered.length === 0 ? (
          <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-tertiary)' }}>
            No candidates match "{query}"
          </div>
        ) : filtered.map(c => (
          <CandidateRow key={c.id} candidate={c} onClick={() => setModal(c)} />
        ))}
      </div>

      {/* Modal */}
      {modal && (
        <CandidateModal
          candidate={modal}
          onClose={() => setModal(null)}
          onDeepDive={() => { setModal(null); onSelectCandidate(modal); }}
        />
      )}
    </div>
  );
};

const CandidateRow = ({ candidate: c, onClick }) => (
  <div
    className="card"
    onClick={onClick}
    style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', flexWrap: 'wrap' }}
  >
    {/* Avatar */}
    <div style={{
      width: '44px', height: '44px',
      borderRadius: 'var(--radius-md)',
      background: c.gradient,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '0.8rem', fontWeight: '800', color: '#fff',
      flexShrink: 0,
    }}>
      {c.initials}
    </div>

    {/* Name + role */}
    <div style={{ flex: 1, minWidth: '160px' }}>
      <p style={{ fontWeight: '700', fontSize: '0.9rem' }}>{c.name}</p>
      <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '2px' }}>
        <Briefcase size={12} /> {c.role} · <Clock size={12} /> {c.experience}
      </p>
    </div>

    {/* Skills */}
    <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }} className="hide-mobile">
      {c.skills.slice(0, 3).map(s => <span key={s} className="skill-tag">{s}</span>)}
      {c.skills.length > 3 && <span className="skill-tag">+{c.skills.length - 3}</span>}
    </div>

    {/* Match */}
    <div style={{ textAlign: 'right', minWidth: '64px', flexShrink: 0 }}>
      <p style={{ fontSize: '1.2rem', fontWeight: '800', color: matchColor(c.match), letterSpacing: '-0.03em' }}>{c.match}%</p>
      <p style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>match</p>
    </div>

    <ChevronRight size={16} color="var(--text-tertiary)" />
  </div>
);

const CandidateModal = ({ candidate: c, onClose, onDeepDive }) => (
  <div
    style={{
      position: 'fixed', inset: 0,
      background: 'var(--modal-bg)',
      backdropFilter: 'blur(10px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: '1.5rem',
    }}
    onClick={onClose}
  >
    <div
      className="card animate-fade-up"
      style={{ width: '100%', maxWidth: '760px', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
      onClick={e => e.stopPropagation()}
    >
      {/* Modal header */}
      <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <div style={{
          width: '56px', height: '56px',
          borderRadius: 'var(--radius-md)',
          background: c.gradient,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.1rem', fontWeight: '800', color: '#fff',
          flexShrink: 0,
        }}>
          {c.initials}
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: '1.2rem' }}>{c.name}</h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{c.role} · {c.experience}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.5rem', fontWeight: '800', color: matchColor(c.match) }}>{c.match}%</span>
          <button className="btn-icon" onClick={onClose}><X size={16} /></button>
        </div>
      </div>

      {/* Modal body */}
      <div style={{ padding: '1.5rem', overflowY: 'auto', display: 'grid', gridTemplateColumns: '1fr 280px', gap: '1.5rem' }}>
        {/* Left */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <section>
            <SectionTitle icon={<Star size={14} />} label="Summary" />
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: '1.65' }}>{c.summary}</p>
          </section>
          <section>
            <SectionTitle icon={<Briefcase size={14} />} label="Key Projects" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {c.projects.map(p => (
                <div key={p} style={{
                  padding: '0.625rem 0.875rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border)',
                  fontSize: '0.85rem',
                }}>{p}</div>
              ))}
            </div>
          </section>
        </div>

        {/* Right */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <section>
            <SectionTitle label="Skills" />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
              {c.skills.map(s => (
                <span key={s} className="badge badge-green">{s}</span>
              ))}
            </div>
          </section>

          <section style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            <InfoRow icon={<MapPin size={14} />} label={c.location} />
            <InfoRow icon={<GraduationCap size={14} />} label={c.education} />
            <InfoRow icon={<Mail size={14} />} label={c.email} />
          </section>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: 'auto' }}>
            <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={onDeepDive}>
              <Share2 size={14} /> View Intelligence Graph
            </button>
            <button className="btn-outline" style={{ width: '100%', justifyContent: 'center' }}>
              <MessageSquare size={14} /> Schedule Interview
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const SectionTitle = ({ icon, label }) => (
  <p style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.625rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
    {icon}{label}
  </p>
);

const InfoRow = ({ icon, label }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
    <span style={{ color: 'var(--primary)', flexShrink: 0 }}>{icon}</span>
    <span>{label}</span>
  </div>
);

export default Candidates;
