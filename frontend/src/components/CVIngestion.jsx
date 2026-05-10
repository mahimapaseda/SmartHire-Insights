import React, { useState, useCallback } from 'react';
import { Upload, FileText, X, CheckCircle2, AlertCircle, Loader2, FileWarning } from 'lucide-react';

const ACCEPTED = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
const MAX_MB = 10;

const CVIngestion = () => {
  const [dragging, setDragging]   = useState(false);
  const [files, setFiles]         = useState([]);
  const [parsing, setParsing]     = useState(false);

  const addFiles = useCallback((incoming) => {
    const valid = incoming
      .filter(f => ACCEPTED.includes(f.type) && f.size <= MAX_MB * 1024 * 1024)
      .map(f => ({ id: crypto.randomUUID(), file: f, status: 'queued', progress: 0 }));
    const invalid = incoming.filter(f => !ACCEPTED.includes(f.type) || f.size > MAX_MB * 1024 * 1024);
    if (invalid.length) console.warn('Skipped invalid files:', invalid.map(f => f.name));
    setFiles(prev => [...prev, ...valid]);
  }, []);

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    addFiles(Array.from(e.dataTransfer.files));
  };

  const onInput = (e) => addFiles(Array.from(e.target.files));

  const remove = (id) => setFiles(prev => prev.filter(f => f.id !== id));

  const startParsing = () => {
    if (!files.some(f => f.status === 'queued')) return;
    setParsing(true);
    const queued = files.filter(f => f.status === 'queued');
    let done = 0;

    queued.forEach((fileObj) => {
      let progress = 0;
      const tick = setInterval(() => {
        progress = Math.min(100, progress + Math.random() * 25 + 5);
        const pct = Math.floor(progress);
        setFiles(prev => prev.map(f =>
          f.id === fileObj.id
            ? { ...f, status: pct < 100 ? 'parsing' : 'completed', progress: pct }
            : f
        ));
        if (pct >= 100) {
          clearInterval(tick);
          done++;
          if (done === queued.length) setParsing(false);
        }
      }, 400);
    });
  };

  const allDone  = files.length > 0 && files.every(f => f.status === 'completed');
  const hasQueue = files.some(f => f.status === 'queued');

  return (
    <div className="animate-fade-up" style={{ maxWidth: '720px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Header */}
      <div>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>CV Ingestion</h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Upload resumes in PDF or DOCX format. The AI engine will extract skills, experience, and graph metadata.
        </p>
      </div>

      {/* Drop zone */}
      <label
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.75rem',
          padding: '3rem 2rem',
          borderRadius: 'var(--radius-xl)',
          border: `2px dashed ${dragging ? 'var(--primary)' : 'var(--border-strong)'}`,
          background: dragging ? 'rgba(26,92,56,0.05)' : 'var(--bg-surface)',
          cursor: 'pointer',
          transition: 'var(--transition)',
          textAlign: 'center',
        }}
      >
        <input type="file" multiple accept=".pdf,.docx" onChange={onInput} style={{ display: 'none' }} />
        <div style={{
          width: '52px', height: '52px',
          borderRadius: 'var(--radius-md)',
          background: dragging ? 'rgba(26,92,56,0.12)' : 'var(--bg-elevated)',
          border: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'var(--transition)',
        }}>
          <Upload size={22} color={dragging ? 'var(--primary)' : 'var(--text-secondary)'} />
        </div>
        <div>
          <p style={{ fontWeight: '600', fontSize: '0.9rem' }}>
            {dragging ? 'Drop files here' : 'Drag & drop resumes, or click to browse'}
          </p>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', marginTop: '0.25rem' }}>
            PDF and DOCX · Max {MAX_MB}MB per file
          </p>
        </div>
      </label>

      {/* File list */}
      {files.length > 0 && (
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <p style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
              Queue · {files.length} file{files.length !== 1 ? 's' : ''}
            </p>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {files.some(f => f.status === 'completed') && (
                <button
                  className="btn-ghost"
                  onClick={() => setFiles(prev => prev.filter(f => f.status !== 'completed'))}
                  style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
                >
                  Clear done
                </button>
              )}
              <button
                className="btn-primary"
                onClick={startParsing}
                disabled={parsing || !hasQueue}
                style={{ fontSize: '0.8rem', padding: '0.45rem 1rem', opacity: (parsing || !hasQueue) ? 0.5 : 1 }}
              >
                {parsing ? (
                  <><Loader2 size={14} className="animate-spin" /> Analyzing…</>
                ) : allDone ? (
                  <><CheckCircle2 size={14} /> All done</>
                ) : (
                  'Start Analysis'
                )}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {files.map(f => <FileRow key={f.id} fileObj={f} onRemove={remove} />)}
          </div>
        </div>
      )}
    </div>
  );
};

const FileRow = ({ fileObj, onRemove }) => {
  const { id, file, status, progress } = fileObj;
  const ext = file.name.split('.').pop().toUpperCase();
  const size = (file.size / 1024).toFixed(0) + ' KB';

  const statusIcon = {
    queued:    <X size={15} style={{ cursor: 'pointer', color: 'var(--text-tertiary)' }} onClick={() => onRemove(id)} />,
    parsing:   <Loader2 size={15} className="animate-spin" color="var(--primary)" />,
    completed: <CheckCircle2 size={15} color="var(--success)" />,
    error:     <AlertCircle size={15} color="var(--danger)" />,
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.875rem',
      padding: '0.75rem',
      borderRadius: 'var(--radius-md)',
      background: 'var(--bg-elevated)',
      border: '1px solid var(--border)',
    }}>
      {/* Icon */}
      <div style={{
        width: '36px', height: '36px',
        borderRadius: 'var(--radius-sm)',
        background: ext === 'PDF' ? 'rgba(239,68,68,0.1)' : 'var(--primary-subtle)',
        border: `1px solid ${ext === 'PDF' ? 'rgba(239,68,68,0.2)' : 'rgba(26,92,56,0.2)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <FileText size={16} color={ext === 'PDF' ? 'var(--danger)' : 'var(--primary)'} />
      </div>

      {/* Info + progress */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
          <p style={{ fontSize: '0.82rem', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '70%' }}>
            {file.name}
          </p>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', flexShrink: 0 }}>
            {status === 'parsing' ? `${progress}%` : status === 'completed' ? 'Done' : size}
          </span>
        </div>
        <div className="progress-track">
          <div
            className="progress-fill"
            style={{
              width: `${progress}%`,
              background: status === 'completed' ? 'var(--success)' : 'var(--primary)',
            }}
          />
        </div>
      </div>

      {/* Action */}
      <div style={{ flexShrink: 0 }}>{statusIcon[status]}</div>
    </div>
  );
};

export default CVIngestion;
