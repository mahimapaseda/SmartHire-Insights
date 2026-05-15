import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Plus, X, CheckCircle2, Loader2, Briefcase, Zap, Search,
  ClipboardList, AlertCircle, Pencil, Trash2, ChevronDown,
  ChevronUp, Save, RefreshCw, FileText, Upload, ToggleLeft, ToggleRight,
} from 'lucide-react';
import { requirementsStore } from '../utils/requirementsStore';
import { API_URL, getHeaders } from '../config';

const ROLE_OPTIONS = [
  'Engineering', 'Frontend Engineering', 'Backend Engineering',
  'Full Stack Engineering', 'Quality Assurance', 'DevOps / Infrastructure',
  'Data Science / ML', 'Product Management', 'Design / UX',
];

const SKILL_SUGGESTIONS = [
  'React', 'Node.js', 'Python', 'AWS', 'Neo4j', 'PostgreSQL',
  'TypeScript', 'Docker', 'Kubernetes', 'NLP', 'Java', 'Go', 'MongoDB',
];

/* ─────────────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────────────── */
const RequirementsImport = ({ onComplete }) => {
  const [requirements, setRequirements] = useState(requirementsStore.getAll());
  const [storeError, setStoreError]     = useState(requirementsStore.getError());
  const [loading, setLoading]           = useState(false);

  // CREATE / EDIT form state
  const [showForm, setShowForm]   = useState(false);
  const [editingId, setEditingId] = useState(null);   // null = create, id = edit
  const [form, setForm]           = useState(emptyForm());

  // Text-extraction step: 'idle' | 'extracting'
  const [extractStep, setExtractStep] = useState('idle');
  const [rawText, setRawText]         = useState('');
  const fileRef = useRef();

  // DELETE confirmation
  const [deleteId, setDeleteId]     = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Expanded detail card
  const [expandedId, setExpandedId] = useState(null);

  // Sync store
  useEffect(() => {
    requirementsStore.fetchFromBackend().then(() => {
      setRequirements([...requirementsStore.getAll()]);
    });
    return requirementsStore.subscribe(() => {
      setRequirements([...requirementsStore.getAll()]);
      setStoreError(requirementsStore.getError());
    });
  }, []);

  function emptyForm() {
    return { title: '', role: 'Engineering', skills: [], summary: '', description: '', isActive: true };
  }

  /* ── CREATE ── */
  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm());
    setRawText('');
    setExtractStep('idle');
    setShowForm(true);
  };

  /* ── EDIT ── */
  const openEdit = (req) => {
    setEditingId(req.id);
    setForm({
      title:       req.title       || '',
      role:        req.role        || 'Engineering',
      skills:      req.skills      ? [...req.skills] : [],
      summary:     req.summary     || '',
      description: req.description || '',
      isActive:    req.isActive ?? true,
    });
    setRawText('');
    setExtractStep('idle');
    setShowForm(true);
    setExpandedId(null);
  };

  /* ── SAVE (Create or Update) ── */
  const handleSave = async () => {
    if (!form.title.trim()) return;
    setLoading(true);
    try {
      if (editingId) {
        await requirementsStore.update(editingId, { ...form, text: form.description });
      } else {
        await requirementsStore.add({ ...form, text: form.description });
      }
      setShowForm(false);
      if (!editingId && onComplete) onComplete();
    } finally {
      setLoading(false);
    }
  };

  /* ── DELETE ── */
  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    await requirementsStore.remove(deleteId);
    setDeleteLoading(false);
    setDeleteId(null);
    if (expandedId === deleteId) setExpandedId(null);
  };

  /* ── TOGGLE ACTIVE ── */
  const handleToggle = async (req) => {
    const newStatus = !(req.isActive ?? true);
    await requirementsStore.update(req.id, { isActive: newStatus });
  };

  /* ── AI EXTRACT ── */
  const handleExtract = async () => {
    if (!rawText.trim()) return;
    setExtractStep('extracting');
    try {
      const res  = await fetch(`${API_URL}/api/requirements`, {
        method:  'POST',
        headers: getHeaders(),
        body:    JSON.stringify({ text: rawText, title: '' }),
      });
      const data = await res.json();
      if (data.success) {
        setForm(f => ({
          ...f,
          title:       data.data.title   || f.title,
          role:        data.data.role    || f.role,
          skills:      data.data.skills  || f.skills,
          summary:     data.data.summary || f.summary,
          description: rawText,
        }));
        // Remove the auto-saved record (we'll save it ourselves)
        await requirementsStore.remove(data.data.id);
      }
    } catch (err) {
      console.error('Extraction failed:', err);
    } finally {
      setExtractStep('idle');
    }
  };

  /* ── FILE UPLOAD ── */
  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setRawText(ev.target.result || `Job Description from ${file.name}`);
    reader.readAsText(file);
    fileRef.current.value = '';
  };

  /* ── SKILL HELPERS ── */
  const addSkill = (skill) => {
    skill = skill.trim();
    if (!skill || form.skills.includes(skill)) return;
    setForm(f => ({ ...f, skills: [...f.skills, skill] }));
  };
  const removeSkill = (s) => setForm(f => ({ ...f, skills: f.skills.filter(x => x !== s) }));

  const isEmpty = requirements.length === 0;

  return (
    <div className="animate-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* ── Top action bar ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            {requirements.length} requirement{requirements.length !== 1 ? 's' : ''} stored
          </span>
          {storeError && (
            <span style={{ fontSize: '0.78rem', color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <AlertCircle size={13} /> {storeError}
              <button
                style={{ background: 'none', color: 'var(--primary)', fontSize: '0.75rem', textDecoration: 'underline' }}
                onClick={() => { requirementsStore.clearError(); requirementsStore.fetchFromBackend(); }}
              >Retry</button>
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            className="btn-ghost"
            style={{ fontSize: '0.78rem' }}
            onClick={() => requirementsStore.fetchFromBackend()}
          >
            <RefreshCw size={13} /> Refresh
          </button>
          <button className="btn-primary" onClick={openCreate} style={{ fontSize: '0.82rem' }}>
            <Plus size={14} /> New Requirement
          </button>
        </div>
      </div>

      {/* ── CREATE / EDIT FORM ── */}
      {showForm && (
        <div className="card animate-scale-in" style={{ padding: '1.75rem', border: '1px solid var(--primary)', boxShadow: '0 0 0 3px rgba(26,92,56,0.08)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem' }}>
              {editingId ? '✏️ Edit Requirement' : '➕ New Requirement'}
            </h3>
            <button className="btn-ghost" style={{ fontSize: '0.75rem' }} onClick={() => setShowForm(false)}>
              <X size={14} /> Cancel
            </button>
          </div>

          {/* AI Extract strip (only on create) */}
          {!editingId && (
            <div style={{
              padding: '1rem', marginBottom: '1.25rem',
              borderRadius: 'var(--r-lg)', background: 'var(--primary-subtle)',
              border: '1px dashed rgba(26,92,56,0.3)',
            }}>
              <p style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--primary)', marginBottom: '0.625rem' }}>
                <Zap size={13} style={{ display: 'inline', marginRight: '4px' }} />
                AI Auto-Extract from Job Description
              </p>
              <textarea
                className="input"
                placeholder="Paste a job description here and click Extract…"
                value={rawText}
                onChange={e => setRawText(e.target.value)}
                style={{ width: '100%', minHeight: '100px', resize: 'none', fontSize: '0.82rem', marginBottom: '0.625rem' }}
              />
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  className="btn-primary"
                  style={{ fontSize: '0.78rem' }}
                  disabled={!rawText.trim() || extractStep === 'extracting'}
                  onClick={handleExtract}
                >
                  {extractStep === 'extracting'
                    ? <><Loader2 size={13} className="animate-spin" /> Extracting…</>
                    : <><Zap size={13} /> Extract Skills & Title</>
                  }
                </button>
                <button className="btn-ghost" style={{ fontSize: '0.78rem' }} onClick={() => fileRef.current?.click()}>
                  <Upload size={13} /> Upload .txt / .md
                </button>
                <input ref={fileRef} type="file" accept=".txt,.md,.text" style={{ display: 'none' }} onChange={handleFile} />
              </div>
            </div>
          )}

          {/* Form fields */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
            <FormField label="Job Title *" icon={<Briefcase size={13} />}>
              <input
                className="input"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="e.g. Senior React Developer"
                style={{ fontSize: '0.85rem' }}
              />
            </FormField>
            <FormField label="Core Role" icon={<Search size={13} />}>
              <select
                className="input"
                value={form.role}
                onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                style={{ fontSize: '0.85rem' }}
              >
                {ROLE_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </FormField>
          </div>

          {/* Skills */}
          <FormField label="Required Skills" icon={<ClipboardList size={13} />} style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.5rem' }}>
              {form.skills.map(s => (
                <span key={s} className="badge badge-green" style={{ fontSize: '0.78rem', padding: '0.3rem 0.7rem' }}>
                  {s}
                  <X size={11} style={{ marginLeft: '4px', cursor: 'pointer' }} onClick={() => removeSkill(s)} />
                </span>
              ))}
              <SkillInput onAdd={addSkill} />
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
              {SKILL_SUGGESTIONS.filter(s => !form.skills.includes(s)).slice(0, 8).map(s => (
                <button
                  key={s} className="skill-tag"
                  style={{ fontSize: '0.68rem', cursor: 'pointer', opacity: 0.7 }}
                  onClick={() => addSkill(s)}
                >+ {s}</button>
              ))}
            </div>
          </FormField>

          {/* Summary */}
          <FormField label="Summary / Notes" style={{ marginBottom: '1.25rem' }}>
            <textarea
              className="input"
              value={form.summary}
              onChange={e => setForm(f => ({ ...f, summary: e.target.value }))}
              placeholder="Key requirements, experience level, salary range…"
              style={{ width: '100%', minHeight: '80px', resize: 'none', fontSize: '0.85rem' }}
            />
          </FormField>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button className="btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
            <button
              className="btn-primary"
              disabled={!form.title.trim() || loading}
              onClick={handleSave}
              style={{ minWidth: '130px', justifyContent: 'center' }}
            >
              {loading
                ? <><Loader2 size={14} className="animate-spin" /> Saving…</>
                : <><Save size={14} /> {editingId ? 'Save Changes' : 'Create Requirement'}</>
              }
            </button>
          </div>
        </div>
      )}

      {/* ── LIST ── */}
      {isEmpty && !showForm ? (
        <EmptyState onAdd={openCreate} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {requirements.map(req => (
            <RequirementCard
              key={req.id}
              req={req}
              expanded={expandedId === req.id}
              onToggle={() => setExpandedId(expandedId === req.id ? null : req.id)}
              onStatusToggle={() => handleToggle(req)}
              onEdit={() => openEdit(req)}
              onDelete={() => setDeleteId(req.id)}
            />
          ))}
        </div>
      )}

      {/* ── DELETE CONFIRM MODAL ── */}
      {deleteId && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
          onClick={() => setDeleteId(null)}
        >
          <div
            className="card animate-scale-in"
            style={{ padding: '2rem', maxWidth: '400px', width: '90%' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(239,68,68,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Trash2 size={18} color="var(--danger)" />
              </div>
              <div>
                <p style={{ fontWeight: '700', fontSize: '0.95rem' }}>Delete Requirement?</p>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  {requirements.find(r => r.id === deleteId)?.title}
                </p>
              </div>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              This will permanently remove the requirement and all its skill links from Neo4j. Matched candidates are unaffected.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button className="btn-ghost" onClick={() => setDeleteId(null)}>Cancel</button>
              <button
                className="btn-primary"
                style={{ background: 'var(--danger)', borderColor: 'var(--danger)', minWidth: '100px', justifyContent: 'center' }}
                disabled={deleteLoading}
                onClick={handleDelete}
              >
                {deleteLoading ? <Loader2 size={14} className="animate-spin" /> : <><Trash2 size={14} /> Delete</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────────
   REQUIREMENT CARD — with expand, edit, delete
───────────────────────────────────────────────────────────────────── */
const RequirementCard = ({ req, expanded, onToggle, onStatusToggle, onEdit, onDelete }) => {
  const skillCount = req.skills?.length ?? 0;
  const badge = {
    'Frontend Engineering':     { label: 'Frontend',    color: '#3b82f6' },
    'Backend Engineering':      { label: 'Backend',     color: '#8b5cf6' },
    'Quality Assurance':        { label: 'QA',          color: '#f59e0b' },
    'DevOps / Infrastructure':  { label: 'DevOps',      color: '#10b981' },
    'Data Science / ML':        { label: 'ML / Data',   color: '#06b6d4' },
    'Full Stack Engineering':   { label: 'Full Stack',  color: '#1a5c38' },
  }[req.role] || { label: req.role || 'Engineering', color: 'var(--primary)' };

  return (
    <div className="card" style={{
      overflow: 'hidden', transition: 'var(--transition)',
      border: expanded ? '1px solid rgba(26,92,56,0.3)' : '1px solid var(--border)',
      opacity: (req.isActive ?? true) ? 1 : 0.65,
      filter: (req.isActive ?? true) ? 'none' : 'grayscale(0.4)',
    }}>
      {/* ── Row ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem' }}>

        <div style={{
          width: '38px', height: '38px', flexShrink: 0,
          borderRadius: 'var(--r-md)', background: 'var(--primary-subtle)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <ClipboardList size={16} color="var(--primary)" />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <p style={{ fontWeight: '700', fontSize: '0.88rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '260px' }}>
              {req.title}
            </p>
            <span style={{
              fontSize: '0.65rem', fontWeight: '700', padding: '2px 8px',
              borderRadius: '20px', background: badge.color + '18', color: badge.color,
              border: `1px solid ${badge.color}30`, flexShrink: 0,
            }}>
              {badge.label}
            </span>
          </div>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            {skillCount} skill{skillCount !== 1 ? 's' : ''} required
            {req.addedAt && ` · Added ${new Date(req.addedAt).toLocaleDateString()}`}
            {!(req.isActive ?? true) && <span style={{ color: 'var(--danger)', fontWeight: '700', marginLeft: '8px' }}>· INACTIVE</span>}
          </p>
        </div>

        {/* Skills preview */}
        <div className="hide-mobile" style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', maxWidth: '240px' }}>
          {(req.skills || []).slice(0, 4).map(s => (
            <span key={s} className="skill-tag" style={{ fontSize: '0.65rem' }}>{s}</span>
          ))}
          {skillCount > 4 && (
            <span className="skill-tag" style={{ fontSize: '0.65rem' }}>+{skillCount - 4}</span>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', flexShrink: 0 }}>
          <button
            className="btn-ghost"
            title={(req.isActive ?? true) ? 'Disable' : 'Enable'}
            onClick={(e) => { e.stopPropagation(); onStatusToggle(); }}
            style={{ 
              padding: '0.4rem 0.6rem', 
              fontSize: '0.7rem', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.4rem',
              color: (req.isActive ?? true) ? 'var(--text-muted)' : 'var(--primary)'
            }}
          >
            {(req.isActive ?? true) ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
            <span style={{ fontWeight: '700' }}>{(req.isActive ?? true) ? 'ACTIVE' : 'DISABLED'}</span>
          </button>
          
          <div style={{ width: '1px', height: '20px', background: 'var(--border)', margin: '0 0.25rem' }}></div>
          <button
            className="btn-icon"
            title="Edit"
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            style={{ width: '30px', height: '30px' }}
          >
            <Pencil size={13} />
          </button>
          <button
            className="btn-icon"
            title="Delete"
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            style={{ width: '30px', height: '30px', color: 'var(--danger)' }}
          >
            <Trash2 size={13} />
          </button>
          <button
            className="btn-icon"
            onClick={onToggle}
            style={{ width: '30px', height: '30px' }}
          >
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {/* ── Expanded detail ── */}
      {expanded && (
        <div style={{
          borderTop: '1px solid var(--border)',
          padding: '1.25rem',
          background: 'var(--bg-elevated)',
          display: 'flex', flexDirection: 'column', gap: '1rem',
        }}>
          {req.summary && (
            <div>
              <p style={{ fontSize: '0.68rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.4rem' }}>
                Summary
              </p>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>{req.summary}</p>
            </div>
          )}
          <div>
            <p style={{ fontSize: '0.68rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>
              All Required Skills ({skillCount})
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
              {(req.skills || []).map(s => (
                <span key={s} className="badge badge-green" style={{ fontSize: '0.72rem' }}>{s}</span>
              ))}
              {skillCount === 0 && <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>No skills defined.</p>}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn-outline" style={{ fontSize: '0.78rem' }} onClick={onEdit}>
              <Pencil size={13} /> Edit This Requirement
            </button>
            <button
              className="btn-ghost"
              style={{ fontSize: '0.78rem', color: 'var(--danger)' }}
              onClick={onDelete}
            >
              <Trash2 size={13} /> Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────────────── */
const FormField = ({ label, icon, children, style }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', ...style }}>
    {label && (
      <p style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
        {icon}{label}
      </p>
    )}
    {children}
  </div>
);

const SkillInput = ({ onAdd }) => {
  const [val, setVal] = useState('');
  const submit = () => { onAdd(val); setVal(''); };
  return (
    <div style={{ display: 'flex', gap: '0.3rem' }}>
      <input
        className="input"
        value={val}
        onChange={e => setVal(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && submit()}
        placeholder="Add skill…"
        style={{ fontSize: '0.78rem', padding: '0.25rem 0.6rem', width: '110px', borderRadius: 'var(--r-md)' }}
      />
      <button
        className="btn-ghost"
        style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
        onClick={submit}
        disabled={!val.trim()}
      >
        <Plus size={12} />
      </button>
    </div>
  );
};

const EmptyState = ({ onAdd }) => (
  <div className="card" style={{
    padding: '4rem 2rem', display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', gap: '1rem', textAlign: 'center',
  }}>
    <div style={{ width: '64px', height: '64px', borderRadius: 'var(--r-xl)', background: 'var(--primary-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <ClipboardList size={28} color="var(--primary)" />
    </div>
    <div>
      <p style={{ fontWeight: '700', fontSize: '1rem', marginBottom: '0.4rem' }}>No Requirements Yet</p>
      <p style={{ fontSize: '0.83rem', color: 'var(--text-muted)', maxWidth: '320px' }}>
        Create your first job requirement. The AI will extract skills automatically from your job description.
      </p>
    </div>
    <button className="btn-primary" onClick={onAdd}>
      <Plus size={15} /> Create First Requirement
    </button>
  </div>
);

export default RequirementsImport;
