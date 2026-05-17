import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Search, MapPin, GraduationCap, Mail, Briefcase,
  Clock, ChevronRight, X, Star, Share2, MessageSquare,
  Trash2, Network,
} from 'lucide-react';
import { candidateStore } from '../utils/candidateStore';
import { requirementsStore } from '../utils/requirementsStore';

const matchColor = (m) => m >= 95 ? 'var(--primary)' : m >= 85 ? 'var(--warning)' : 'var(--text-secondary)';

const Candidates = ({ onSelectCandidate }) => {
  const [candidates, setCandidates] = useState(candidateStore.getAll());
  const [requirements, setRequirements] = useState(requirementsStore.getAll());
  const [query,    setQuery]   = useState('');
  const [modal,    setModal]   = useState(null);
  const [roleFilter, setRoleFilter] = useState('All');
  const [sortBy,   setSortBy]  = useState('match');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    requirementsStore.fetchFromBackend();
    const subC = candidateStore.subscribe(() => setCandidates(candidateStore.getAll()));
    const subR = requirementsStore.subscribe(() => setRequirements(requirementsStore.getAll()));
    return () => { subC(); subR(); };
  }, []);

  const roles = useMemo(() => {
    const r = new Set(candidates.map(c => c.role));
    const reqTitles = requirements.map(req => req.title);
    return ['All', ...Array.from(new Set([...reqTitles, ...r]))];
  }, [candidates, requirements]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return candidates
      .filter(c =>
        (roleFilter === 'All' || c.role === roleFilter || requirements.some(r => r.title === roleFilter)) &&
        (!q || c.name.toLowerCase().includes(q) || c.role.toLowerCase().includes(q) || c.skills.some(s => s.toLowerCase().includes(q)))
      )
      .sort((a, b) => sortBy === 'match' ? b.match - a.match : a.name.localeCompare(b.name));
  }, [candidates, query, roleFilter, sortBy, requirements]);

  const handleRemoveClick = (id, e) => {
    e.stopPropagation();
    setDeleteConfirm(id);
  };

  const grouped = useMemo(() => {
    const groups = {};
    const activeRequirements = requirements.filter(r => r.isActive !== false);
    const reqTitles = activeRequirements.map(r => r.title);

    filtered.forEach(c => {
      let groupName = 'General Talent Pool';
      
      if (activeRequirements.length === 0) {
        groupName = 'General Talent Pool';
      } else {
        const matchingReq = activeRequirements.find(req => 
          c.role.toLowerCase().includes(req.title.toLowerCase()) || 
          req.title.toLowerCase().includes(c.role.toLowerCase())
        );

        if (matchingReq) {
          groupName = matchingReq.title;
        } else if (c.match > 60) {
          groupName = activeRequirements[0].title;
        } else {
          groupName = c.role || 'Unspecified Role';
        }
      }

      if (!groups[groupName]) groups[groupName] = [];
      groups[groupName].push(c);
    });

    const sortedEntries = Object.entries(groups).sort(([a], [b]) => {
      const aIsReq = reqTitles.includes(a);
      const bIsReq = reqTitles.includes(b);
      if (aIsReq && !bIsReq) return -1;
      if (!aIsReq && bIsReq) return 1;
      return a.localeCompare(b);
    });

    return Object.fromEntries(sortedEntries);
  }, [filtered, requirements]);

  const confirmDelete = () => {
    if (deleteConfirm) {
      candidateStore.remove(deleteConfirm);
      setDeleteConfirm(null);
      if (modal && modal.id === deleteConfirm) setModal(null);
    }
  };

  return (
    <div className="animate-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <p style={{ fontSize: '0.81rem', color: 'var(--text-muted)', fontWeight: '500' }}>
            {candidates.length} profiles · {filtered.length} shown
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

      {/* List (Grouped by Role) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {filtered.length === 0 ? (
          <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            {query || roleFilter !== 'All' ? `No candidates match your filters.` : 'No candidates yet. Upload CVs to get started.'}
          </div>
        ) : Object.entries(grouped).map(([role, list]) => (
          <div key={role} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0 0.25rem' }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                color: requirements.some(req => req.title === role) ? 'var(--primary)' : 'var(--text-muted)'
              }}>
                {requirements.some(req => req.title === role) && <Briefcase size={12} />}
                <h3 style={{ fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  {role}
                </h3>
              </div>
              <span className="badge badge-muted" style={{ fontSize: '0.65rem', borderRadius: '12px', padding: '0.1rem 0.5rem' }}>{list.length}</span>
              <div style={{ flex: 1, height: '1px', background: 'var(--border)', opacity: 0.4 }}></div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {list.map(c => (
                <CandidateRow
                  key={c.id}
                  candidate={c}
                  onClick={() => setModal(c)}
                  onRemove={handleRemoveClick}
                  onDeepDive={(e) => { e.stopPropagation(); onSelectCandidate(c); }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1100,
          background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }} onClick={() => setDeleteConfirm(null)}>
          <div className="card animate-scale-in" style={{ padding: '2rem', maxWidth: '400px', width: '90%' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(239,68,68,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Trash2 size={18} color="var(--danger)" />
              </div>
              <div>
                <p style={{ fontWeight: '700', fontSize: '0.95rem' }}>Delete Candidate?</p>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{candidates.find(c => c.id === deleteConfirm)?.name}</p>
              </div>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.5' }}>
              This will permanently remove the candidate's profile, Intelligence Graph data, and the associated source file from the server. This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button className="btn-ghost" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button
                className="btn-primary"
                style={{ background: 'var(--danger)', borderColor: 'var(--danger)', minWidth: '100px', justifyContent: 'center' }}
                onClick={confirmDelete}
              >
                <Trash2 size={14} /> Delete Profile
              </button>
            </div>
          </div>
        </div>
      )}

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

const CandidateRow = ({ candidate: c, onClick, onRemove, onDeepDive }) => (
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

    {/* Match + Intelligence Graph button */}
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexShrink: 0 }}>
      <div style={{ textAlign: 'right', minWidth: '56px' }}>
        <p style={{ fontSize: '1.2rem', fontWeight: '800', color: matchColor(c.match), letterSpacing: '-0.03em' }}>{c.match}%</p>
        <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>match</p>
      </div>

      {/* View Intelligence Graph */}
      <button
        onClick={onDeepDive}
        className="btn-outline hide-mobile"
        title="View Intelligence Graph"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.35rem',
          fontSize: '0.72rem',
          padding: '0.35rem 0.7rem',
          flexShrink: 0,
          borderColor: 'rgba(26,92,56,0.35)',
          color: 'var(--primary)',
          background: 'rgba(26,92,56,0.06)',
          whiteSpace: 'nowrap',
        }}
      >
        <Network size={12} />
        Graph
      </button>
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

const CandidateModal = ({ candidate: c, onClose, onDeepDive }) => {
  return createPortal(
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
  </div>,
  document.body
  );
};

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
