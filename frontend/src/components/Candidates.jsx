import React, { useState, useMemo, useEffect } from 'react';
import {
  Search, MapPin, GraduationCap, Mail, Briefcase,
  Clock, ChevronRight, X, Star, Share2, MessageSquare,
  Trash2,
} from 'lucide-react';
import { candidateStore } from '../utils/candidateStore';

const matchColor = (m) => m >= 95 ? 'var(--primary)' : m >= 85 ? 'var(--warning)' : 'var(--text-secondary)';

const Candidates = ({ onSelectCandidate }) => {
  const [candidates, setCandidates] = useState(candidateStore.getAll());
  const [query,    setQuery]   = useState('');
  const [modal,    setModal]   = useState(null);
  const [roleFilter, setRoleFilter] = useState('All');
  const [sortBy,   setSortBy]  = useState('match');

  // Subscribe to store updates (new CVs parsed)
  useEffect(() => {
    return candidateStore.subscribe(() => setCandidates(candidateStore.getAll()));
  }, []);

  const roles = useMemo(() => {
    const r = new Set(candidates.map(c => c.role));
    return ['All', ...Array.from(r)];
  }, [candidates]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return candidates
      .filter(c =>
        (roleFilter === 'All' || c.role === roleFilter) &&
        (!q || c.name.toLowerCase().includes(q) || c.role.toLowerCase().includes(q) || c.skills.some(s => s.toLowerCase().includes(q)))
      )
      .sort((a, b) => sortBy === 'match' ? b.match - a.match : a.name.localeCompare(b.name));
  }, [candidates, query, roleFilter, sortBy]);

  const removeCandidate = (id, e) => {
    e.stopPropagation();
    candidateStore.remove(id);
  };

  return (
    <div className="animate-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.2rem' }}>Candidate Pool</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            {candidates.length} profiles · {filtered.length} shown · AI-ranked by match score
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Role filter */}
          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            className="input"
            style={{ width: 'auto', padding: '0.45rem 0.75rem', fontSize: '0.8rem' }}
          >
            {roles.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          {/* Sort */}
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="input"
            style={{ width: 'auto', padding: '0.45rem 0.75rem', fontSize: '0.8rem' }}
          >
            <option value="match">Sort: Match %</option>
            <option value="name">Sort: Name A–Z</option>
          </select>
          {/* Search */}
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
            <input
              className="input"
              type="text"
              placeholder="Search name, role, skill…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              style={{ paddingLeft: '2.25rem', width: '220px' }}
            />
          </div>
        </div>
      </div>

      {/* List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
        {filtered.length === 0 ? (
          <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            {query || roleFilter !== 'All' ? `No candidates match your filters.` : 'No candidates yet. Upload CVs to get started.'}
          </div>
        ) : filtered.map(c => (
          <CandidateRow key={c.id} candidate={c} onClick={() => setModal(c)} onRemove={removeCandidate} />
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

const CandidateRow = ({ candidate: c, onClick, onRemove }) => (
  <div
    className="card card-interactive"
    onClick={onClick}
    style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}
  >
    {/* Avatar */}
    <div style={{
      width: '44px', height: '44px',
      borderRadius: 'var(--r-md)',
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

    {/* Source badge */}
    {c.source && (
      <span className="badge badge-muted hide-mobile" style={{ fontSize: '0.65rem' }}>
        {c.source.split('.').pop().toUpperCase()}
      </span>
    )}

    {/* Match */}
    <div style={{ textAlign: 'right', minWidth: '64px', flexShrink: 0 }}>
      <p style={{ fontSize: '1.2rem', fontWeight: '800', color: matchColor(c.match), letterSpacing: '-0.03em' }}>{c.match}%</p>
      <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>match</p>
    </div>

    {/* Remove */}
    <button
      onClick={(e) => onRemove(c.id, e)}
      className="btn-icon"
      style={{ width: 28, height: 28, background: 'rgba(239,68,68,0.07)', color: 'var(--danger)', border: '1px solid rgba(239,68,68,0.15)', flexShrink: 0 }}
      title="Remove candidate"
    >
      <Trash2 size={12} />
    </button>

    <ChevronRight size={16} color="var(--text-muted)" />
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
          borderRadius: 'var(--r-md)',
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
                  borderRadius: 'var(--r-md)',
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
  <p style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.625rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
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
