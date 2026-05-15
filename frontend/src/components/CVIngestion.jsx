import React, { useState, useCallback } from 'react';
import {
  Upload, FileText, X, CheckCircle2, AlertCircle,
  Loader2, ChevronDown, ChevronUp, User, Briefcase,
  MapPin, GraduationCap,
} from 'lucide-react';
import { candidateStore } from '../utils/candidateStore';
import { notificationStore, NOTIF_TYPES } from '../utils/notificationStore';
import { API_URL, getHeaders } from '../config';

const ACCEPTED = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
const MAX_MB = 10;

/* ══════════════════════════════════════════════════════════════
   CV INGESTION — multi-file with per-CV extracted profile
══════════════════════════════════════════════════════════════ */
import { ingestionStore } from '../utils/ingestionStore';

const CVIngestion = () => {
  const [dragging, setDragging] = useState(false);
  const [files,    setFiles]    = useState(ingestionStore.getFiles());
  const [parsing,  setParsing]  = useState(ingestionStore.isParsing());
  const [expanded, setExpanded] = useState(null);

  React.useEffect(() => {
    const unsub = ingestionStore.subscribe(() => {
      setFiles(ingestionStore.getFiles());
      setParsing(ingestionStore.isParsing());
    });
    return unsub;
  }, []);

  /* ── Add files ── */
  const addFiles = useCallback((incoming) => {
    const valid = incoming
      .filter(f => ACCEPTED.includes(f.type) && f.size <= MAX_MB * 1024 * 1024)
      .map(f => ({ id: crypto.randomUUID(), file: f, status: 'queued', progress: 0, profile: null }));
    if (valid.length < incoming.length) {
      console.warn('Some files skipped — wrong type or too large.');
    }
    ingestionStore.addFiles(valid);
  }, []);

  const onDrop  = (e) => { e.preventDefault(); setDragging(false); addFiles(Array.from(e.dataTransfer.files)); };
  const onInput = (e) => addFiles(Array.from(e.target.files));
  const remove  = (id) => ingestionStore.removeFile(id);

  /* ── Parse all queued ── */
  const startParsing = () => {
    const queued = files.filter(f => f.status === 'queued');
    if (!queued.length) return;
    ingestionStore.setParsing(true);
    let done = 0;

    queued.forEach((fileObj) => {
      let progress = 0;
      const tick = setInterval(() => {
        progress = Math.min(95, progress + Math.random() * 15 + 5);
        const pct = Math.floor(progress);
        ingestionStore.updateFile(fileObj.id, { status: 'parsing', progress: pct });
      }, 400);

      const formData = new FormData();
      formData.append('file', fileObj.file);

      fetch(`${API_URL}/api/upload`, {
        method: 'POST',
        headers: getHeaders(true), // Passing true to indicate multipart if needed, though getHeaders currently doesn't handle it. 
        // Actually fetch with FormData doesn't need Content-Type header manually set.
        // So we just need the API key.
        body: formData,
      })
      .then(res => res.json())
      .then(data => {
        clearInterval(tick);
        if (data.success) {
          const d = data.data;
          
          if (!data.neo4j_saved) {
            ingestionStore.updateFile(fileObj.id, { status: 'error', progress: 100, errorMsg: 'NLP failed to extract candidate name. Not saved.' });
            notificationStore.add(NOTIF_TYPES.ERROR, 'Parsing Rejected', `Failed to extract name from ${fileObj.file.name}. Not saved to DB.`);
          } else {
            const initials = d.name && d.name !== "Not Found" ? d.name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() : 'CV';
            
            const profile = {
              id: d.id || fileObj.id,
              name: d.name,
              initials: initials || 'CV',
              role: d.experience && d.experience.length > 0 ? d.experience[0].title : 'Software Engineer',
              match: d.match ?? 0,   // M-2: no random fallback — show 0 if backend returns nothing
              skills: d.skills || [],
              experience: d.experience && d.experience.length > 0 ? `${d.experience[0].title} at ${d.experience[0].company}` : 'Not detected',
              location: 'Location not specified',
              education: d.education && d.education.length > 0 ? d.education[0].degree : 'Not detected',
              email: d.email,
              summary: d.summary,
              projects: [],
              gradient: 'linear-gradient(135deg,#1a5c38,#22c55e)',
              source: d.source,
              addedAt: new Date().toLocaleTimeString(),
            };
            
            ingestionStore.updateFile(fileObj.id, { status: 'completed', progress: 100, profile });
            candidateStore.add(profile);
            
            notificationStore.add(NOTIF_TYPES.PARSE, 'CV Parsing Complete', `${profile.name}'s profile is now available in the intelligence pool.`);
            
            if (profile.match >= 85) {
              notificationStore.add(NOTIF_TYPES.MATCH, 'High Potential Match', `${profile.name} has an impressive ${profile.match}% match score.`);
            }
          }
        } else {
          ingestionStore.updateFile(fileObj.id, { status: 'error', progress: 0, errorMsg: data.error || 'Server error' });
          notificationStore.add(NOTIF_TYPES.ERROR, 'Processing Error', `Server failed to process ${fileObj.file.name}.`);
        }
      })
      .catch(err => {
        clearInterval(tick);
        console.error("Upload error:", err);
        ingestionStore.updateFile(fileObj.id, { status: 'error', progress: 0, errorMsg: 'Network error' });
        notificationStore.add(NOTIF_TYPES.ERROR, 'Network Error', `Could not connect to the backend server.`);
      })
      .finally(() => {
        done++;
        if (done === queued.length) ingestionStore.setParsing(false);
      });
    });
  };

  const clearDone = () => ingestionStore.clearDone();

  const allDone  = files.length > 0 && files.every(f => f.status === 'completed');
  const hasQueue = files.some(f => f.status === 'queued');
  const doneCount = files.filter(f => f.status === 'completed').length;

  return (
    <div className="animate-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
        {files.length > 0 && (
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span className="badge badge-muted">{files.length} file{files.length !== 1 ? 's' : ''}</span>
            {doneCount > 0 && <span className="badge badge-success">{doneCount} parsed</span>}
          </div>
        )}
      </div>

      {/* ── Drop zone ── */}
      <label
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        style={{
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          gap: '0.875rem', padding: '2.5rem 2rem',
          borderRadius: 'var(--r-xl)',
          border: `2px dashed ${dragging ? 'var(--primary)' : 'var(--border-strong)'}`,
          background: dragging ? 'rgba(26,92,56,0.05)' : 'var(--bg-surface)',
          cursor: 'pointer', transition: 'var(--transition)', textAlign: 'center',
        }}
      >
        <input type="file" multiple accept=".pdf,.docx" onChange={onInput} style={{ display: 'none' }} />
        <div style={{
          width: '56px', height: '56px', borderRadius: 'var(--r-lg)',
          background: dragging ? 'rgba(26,92,56,0.12)' : 'var(--bg-elevated)',
          border: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'var(--transition)',
        }}>
          <Upload size={24} color={dragging ? 'var(--primary)' : 'var(--text-secondary)'} />
        </div>
        <div>
          <p style={{ fontWeight: '700', fontSize: '0.95rem' }}>
            {dragging ? 'Drop CVs here' : 'Drag & drop multiple CVs, or click to browse'}
          </p>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
            PDF and DOCX · Max {MAX_MB} MB per file · Batch upload supported
          </p>
        </div>
      </label>

      {/* ── Queue + actions ── */}
      {files.length > 0 && (
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <p style={{ fontSize: '0.85rem', fontWeight: '700' }}>
              Processing Queue
              <span style={{ color: 'var(--text-muted)', fontWeight: '400', marginLeft: '0.5rem' }}>
                {files.filter(f => f.status === 'queued').length} queued · {doneCount} done
              </span>
            </p>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {doneCount > 0 && (
                <button className="btn-ghost" onClick={clearDone} style={{ fontSize: '0.75rem' }}>
                  Clear done
                </button>
              )}
              <button
                className="btn-primary"
                onClick={startParsing}
                disabled={parsing || !hasQueue}
                style={{ fontSize: '0.8rem', opacity: (parsing || !hasQueue) ? 0.5 : 1 }}
              >
                {parsing ? (
                  <><Loader2 size={14} className="animate-spin" /> Analysing…</>
                ) : allDone ? (
                  <><CheckCircle2 size={14} /> All done</>
                ) : (
                  `Analyse ${files.filter(f => f.status === 'queued').length} CV${files.filter(f => f.status === 'queued').length !== 1 ? 's' : ''}`
                )}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {files.map(f => (
              <FileCard
                key={f.id}
                fileObj={f}
                onRemove={remove}
                expanded={expanded === f.id}
                onToggle={() => setExpanded(expanded === f.id ? null : f.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Parsed profiles grid ── */}
      {doneCount > 0 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '0.95rem' }}>
              Extracted Profiles
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '400', marginLeft: '0.5rem' }}>
                {doneCount} candidate{doneCount !== 1 ? 's' : ''} added to pool
              </span>
            </h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
            {files.filter(f => f.status === 'completed' && f.profile).map(f => (
              <ProfileCard key={f.id} profile={f.profile} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/* ── File row with expandable extracted data ──────────────────── */
const FileCard = ({ fileObj, onRemove, expanded, onToggle }) => {
  const { id, file, status, progress, profile } = fileObj;
  const ext  = file.name.split('.').pop().toUpperCase();
  const size = (file.size / 1024).toFixed(0) + ' KB';

  const statusIcon = {
    queued:    <X size={14} style={{ cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => onRemove(id)} />,
    parsing:   <Loader2 size={14} className="animate-spin" color="var(--primary)" />,
    completed: <CheckCircle2 size={14} color="var(--success)" />,
    error:     <AlertCircle size={14} color="var(--danger)" />,
  };

  return (
    <div style={{
      borderRadius: 'var(--r-md)',
      background: 'var(--bg-elevated)',
      border: `1px solid ${status === 'completed' ? 'rgba(34,197,94,0.2)' : 'var(--border)'}`,
      overflow: 'hidden',
      transition: 'var(--transition)',
    }}>
      {/* Row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem' }}>
        {/* File type icon */}
        <div style={{
          width: '34px', height: '34px', borderRadius: 'var(--r-sm)', flexShrink: 0,
          background: ext === 'PDF' ? 'rgba(239,68,68,0.1)' : 'var(--primary-subtle)',
          border: `1px solid ${ext === 'PDF' ? 'rgba(239,68,68,0.2)' : 'rgba(26,92,56,0.2)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <FileText size={15} color={ext === 'PDF' ? 'var(--danger)' : 'var(--primary)'} />
        </div>

        {/* Name + progress */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
            <p style={{ fontSize: '0.82rem', fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '75%' }}>
              {file.name}
            </p>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', flexShrink: 0 }}>
              {status === 'parsing' ? `${progress}%` : status === 'completed' ? 'Done' : status === 'error' ? 'Failed' : size}
            </span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{
              width: `${progress}%`,
              background: status === 'completed' ? 'var(--success)' : status === 'error' ? 'var(--danger)' : 'var(--primary)',
            }} />
          </div>
          {status === 'error' && fileObj.errorMsg && (
            <p style={{ fontSize: '0.7rem', color: 'var(--danger)', marginTop: '0.25rem' }}>{fileObj.errorMsg}</p>
          )}
        </div>

        {/* Status icon */}
        <div style={{ flexShrink: 0 }}>{statusIcon[status]}</div>

        {/* Expand toggle (only when done) */}
        {status === 'completed' && profile && (
          <button
            onClick={onToggle}
            style={{ background: 'none', color: 'var(--text-muted)', padding: '2px', flexShrink: 0 }}
          >
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        )}
      </div>

      {/* Expanded extracted data */}
      {expanded && profile && (
        <div style={{
          borderTop: '1px solid var(--border)',
          padding: '1rem',
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          gap: '0.75rem',
          background: 'var(--bg-surface)',
        }}>
          <ExtractRow icon={<User size={12} />}        label="Name"       value={profile.name} />
          <ExtractRow icon={<Briefcase size={12} />}   label="Role"       value={profile.role} />
          <ExtractRow icon={<MapPin size={12} />}      label="Location"   value={profile.location} />
          <ExtractRow icon={<GraduationCap size={12} />} label="Education" value={profile.education} />
          <div style={{ gridColumn: '1 / -1' }}>
            <p style={{ fontSize: '0.65rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.4rem' }}>
              Extracted Skills
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
              {profile.skills.map(s => (
                <span key={s} className="badge badge-green" style={{ fontSize: '0.65rem' }}>{s}</span>
              ))}
            </div>
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <p style={{ fontSize: '0.65rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.3rem' }}>
              AI Summary
            </p>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>{profile.summary}</p>
          </div>
          <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Match score</span>
            <span style={{ fontSize: '1rem', fontWeight: '800', color: profile.match >= 90 ? 'var(--success)' : profile.match >= 80 ? 'var(--primary)' : 'var(--warning)' }}>
              {profile.match}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

/* ── Extracted profile card (grid below queue) ────────────────── */
const ProfileCard = ({ profile: p }) => (
  <div className="card card-lift animate-scale-in" style={{ padding: '1.25rem' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
      <div style={{
        width: '40px', height: '40px', borderRadius: 'var(--r-md)',
        background: p.gradient,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '0.78rem', fontWeight: '800', color: '#fff', flexShrink: 0,
      }}>{p.initials}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontWeight: '700', fontSize: '0.88rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</p>
        <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{p.role} · {p.experience}</p>
      </div>
      <span style={{ fontSize: '1rem', fontWeight: '800', color: p.match >= 90 ? 'var(--success)' : p.match >= 80 ? 'var(--primary)' : 'var(--warning)', flexShrink: 0 }}>
        {p.match}%
      </span>
    </div>

    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginBottom: '0.875rem' }}>
      {p.skills.slice(0, 4).map(s => <span key={s} className="skill-tag" style={{ fontSize: '0.68rem' }}>{s}</span>)}
      {p.skills.length > 4 && <span className="skill-tag" style={{ fontSize: '0.68rem' }}>+{p.skills.length - 4}</span>}
    </div>

    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
        From: {p.source}
      </span>
      <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>
        <CheckCircle2 size={10} /> Added to pool
      </span>
    </div>
  </div>
);

const ExtractRow = ({ icon, label, value }) => (
  <div>
    <p style={{ fontSize: '0.62rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
      {icon}{label}
    </p>
    <p style={{ fontSize: '0.78rem', color: 'var(--text-primary)', fontWeight: '500' }}>{value}</p>
  </div>
);

export default CVIngestion;
