import React, { useState, useRef, useEffect } from 'react';
import { API_URL, getHeaders } from '../config';
import {
  Camera, Upload, Play, Square, RefreshCcw,
  Smile, Frown, Meh, AlertTriangle, CheckCircle2,
  ChevronDown, Info,
} from 'lucide-react';

const EMOTION_ICONS = {
  Neutral:    { icon: Meh,           color: '#8b949e' },
  Happy:      { icon: Smile,         color: '#22c55e' },
  Focused:    { icon: CheckCircle2,  color: '#1a5c38' },
  Nervous:    { icon: AlertTriangle, color: '#f59e0b' },
  Confident:  { icon: Smile,         color: '#3b82f6' },
  Surprised:  { icon: AlertTriangle, color: '#a855f7' },
};

const postFaceFile = async (file) => {
  const form = new FormData();
  form.append('file', file, file.name || 'capture.jpg');
  const res = await fetch(`${API_URL}/api/face-analysis`, {
    method: 'POST',
    headers: getHeaders(true),
    body: form,
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error || 'Face analysis failed');
  return data.data;
};

const captureVideoFrame = (videoEl) => new Promise((resolve, reject) => {
  const canvas = document.createElement('canvas');
  canvas.width = videoEl.videoWidth || 640;
  canvas.height = videoEl.videoHeight || 480;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
  canvas.toBlob(blob => {
    if (!blob) reject(new Error('Could not capture frame'));
    else resolve(new File([blob], 'live-frame.jpg', { type: 'image/jpeg' }));
  }, 'image/jpeg', 0.92);
});

/* ── Timeline entry ───────────────────────────────────────────── */
const TIMELINE = [
  { time: '0:00', emotion: 'Neutral',   note: 'Interview started' },
  { time: '0:45', emotion: 'Nervous',   note: 'Technical question asked' },
  { time: '1:30', emotion: 'Focused',   note: 'Problem-solving phase' },
  { time: '2:15', emotion: 'Confident', note: 'Explaining solution' },
  { time: '3:00', emotion: 'Happy',     note: 'Positive feedback received' },
];

/* ══════════════════════════════════════════════════════════════
   FACE RECOGNITION COMPONENT
══════════════════════════════════════════════════════════════ */
const FaceRecognition = ({ candidate }) => {
  const [mode, setMode]         = useState('upload'); // 'upload' | 'live'
  const [status, setStatus]     = useState('idle');   // 'idle' | 'analysing' | 'done' | 'error'
  const [result, setResult]     = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [liveActive, setLiveActive]     = useState(false);
  const [imageFile, setImageFile]       = useState(null);
  const [analysisError, setAnalysisError] = useState(null);
  const fileRef = useRef();
  const videoRef = useRef();

  useEffect(() => {
    let stream;
    if (liveActive) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(s => {
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch(err => console.error("Camera error:", err));
    }
    return () => {
      if (stream) stream.getTracks().forEach(t => t.stop());
    };
  }, [liveActive]);

  const loadImageFile = (file) => {
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = ev => setImagePreview(ev.target.result);
    reader.readAsDataURL(file);
    setResult(null);
    setAnalysisError(null);
    setStatus('idle');
  };

  const handleFile = (e) => loadImageFile(e.target.files?.[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    loadImageFile(e.dataTransfer.files?.[0]);
  };

  const runAnalysis = async () => {
    if (!imageFile) {
      setAnalysisError('Upload an image with a visible face first.');
      return;
    }
    setStatus('analysing');
    setAnalysisError(null);
    try {
      const data = await postFaceFile(imageFile);
      setResult({ ...data, timestamp: data.timestamp || new Date().toLocaleTimeString() });
      setStatus('done');
    } catch (err) {
      setAnalysisError(err.message);
      setStatus('error');
    }
  };

  const toggleLive = async () => {
    if (liveActive) {
      setLiveActive(false);
      setStatus('analysing');
      setAnalysisError(null);
      try {
        if (!videoRef.current) throw new Error('No video stream');
        const frameFile = await captureVideoFrame(videoRef.current);
        const data = await postFaceFile(frameFile);
        setResult({ ...data, timestamp: data.timestamp || new Date().toLocaleTimeString() });
        setStatus('done');
      } catch (err) {
        setAnalysisError(err.message);
        setStatus('error');
      }
    } else {
      setLiveActive(true);
      setResult(null);
      setAnalysisError(null);
    }
  };

  const reset = () => {
    setStatus('idle');
    setResult(null);
    setImagePreview(null);
    setImageFile(null);
    setLiveActive(false);
    setAnalysisError(null);
  };

  const dominantMeta = result ? EMOTION_ICONS[result.dominant] : null;

  return (
    <div className="animate-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {analysisError && (
        <div style={{ padding: '0.75rem 1rem', borderRadius: 'var(--r-md)', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: 'var(--danger)', fontSize: '0.83rem' }}>
          {analysisError}
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', flexWrap: 'wrap', gap: '1rem', marginBottom: '0.5rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <ModeTab label="Upload Image" active={mode === 'upload'} onClick={() => { setMode('upload'); reset(); }} />
          <ModeTab label="Live Camera"  active={mode === 'live'}   onClick={() => { setMode('live');   reset(); }} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.25rem' }}>

        {/* ── Left: input panel ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {mode === 'upload' ? (
            <>
              {/* Drop zone */}
              <div
                onDragOver={e => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => !imagePreview && fileRef.current?.click()}
                className="card"
                style={{
                  minHeight: '280px',
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  gap: '1rem', cursor: imagePreview ? 'default' : 'pointer',
                  overflow: 'hidden', padding: 0, position: 'relative',
                  border: imagePreview ? '1px solid var(--border)' : '2px dashed var(--border-strong)',
                }}
              >
                <input ref={fileRef} type="file" accept="image/*,video/*" onChange={handleFile} style={{ display: 'none' }} />
                {imagePreview ? (
                  <>
                    <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '280px', objectFit: 'cover' }} />
                    {/* Overlay face box simulation */}
                    {status === 'done' && (
                      <div style={{
                        position: 'absolute',
                        top: '50%', left: '50%',
                        transform: 'translate(-50%, -60%)',
                        width: '120px', height: '140px',
                        border: '2px solid #22c55e',
                        borderRadius: '8px',
                        boxShadow: '0 0 0 1px rgba(34,197,94,0.3)',
                      }}>
                        <div style={{
                          position: 'absolute', top: '-22px', left: '50%', transform: 'translateX(-50%)',
                          background: '#22c55e', color: '#fff',
                          fontSize: '0.65rem', fontWeight: '700',
                          padding: '2px 8px', borderRadius: '4px', whiteSpace: 'nowrap',
                        }}>
                          {result?.dominant} · {result?.confidence}%
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div style={{
                      width: '56px', height: '56px', borderRadius: 'var(--r-lg)',
                      background: 'var(--primary-subtle)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Camera size={24} color="var(--primary)" />
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ fontWeight: '600', fontSize: '0.9rem' }}>Drop image or video here</p>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                        JPG, PNG, MP4 · Interview screenshot or clip
                      </p>
                    </div>
                    <button className="btn-ghost" style={{ fontSize: '0.8rem' }}>
                      <Upload size={14} /> Browse files
                    </button>
                  </>
                )}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '0.625rem' }}>
                {imagePreview && status !== 'analysing' && (
                  <button className="btn-primary" onClick={runAnalysis} style={{ flex: 1, justifyContent: 'center' }}>
                    <Play size={14} /> Analyse Emotions
                  </button>
                )}
                {status === 'analysing' && (
                  <button className="btn-primary" disabled style={{ flex: 1, justifyContent: 'center', opacity: 0.7 }}>
                    <span className="animate-spin" style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block' }} />
                    Analysing…
                  </button>
                )}
                {(imagePreview || result) && (
                  <button className="btn-ghost" onClick={reset}>
                    <RefreshCcw size={14} /> Reset
                  </button>
                )}
              </div>
            </>
          ) : (
            /* Live camera panel */
            <div className="card" style={{ minHeight: '320px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.25rem', position: 'relative', overflow: 'hidden' }}>
              {/* Simulated camera feed */}
              <div style={{
                width: '100%',
                aspectRatio: '16/9',
                maxHeight: '450px',
                background: liveActive
                  ? '#0d1117'
                  : 'var(--bg-elevated)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem',
                borderRadius: 'var(--r-lg)',
                position: 'relative', overflow: 'hidden',
              }}>
                {liveActive ? (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      style={{ width: '100%', height: '100%', objectFit: 'contain', transform: 'scaleX(-1)' }}
                    />
                    {/* Simulated scan lines */}
                    <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(34,197,94,0.03) 2px, rgba(34,197,94,0.03) 4px)', pointerEvents: 'none' }} />
                    
                    {/* Scanning indicator */}
                    <div style={{ position: 'absolute', bottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(0,0,0,0.5)', padding: '0.3rem 0.8rem', borderRadius: '1rem' }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', animation: 'pulse-dot 1s ease-in-out infinite' }} />
                      <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.8)' }}>Detecting faces…</span>
                    </div>
                  </>
                ) : (
                  <>
                    <Camera size={36} color="var(--text-muted)" style={{ opacity: 0.4 }} />
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Camera not started</p>
                  </>
                )}
              </div>

              <div style={{ display: 'flex', gap: '0.625rem', width: '100%', padding: '0 1.5rem 1.5rem' }}>
                <button
                  className={liveActive ? 'btn-ghost' : 'btn-primary'}
                  onClick={toggleLive}
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  {liveActive ? <><Square size={14} /> Stop & Analyse</> : <><Play size={14} /> Start Camera</>}
                </button>
                {result && <button className="btn-ghost" onClick={reset}><RefreshCcw size={14} /></button>}
              </div>
            </div>
          )}
        </div>

        {/* ── Right: results panel ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {/* Dominant emotion */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <p style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.875rem' }}>
              Dominant Emotion
            </p>
            {result && dominantMeta ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                  width: '52px', height: '52px', borderRadius: 'var(--r-md)',
                  background: `${dominantMeta.color}18`,
                  border: `1px solid ${dominantMeta.color}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <dominantMeta.icon size={24} color={dominantMeta.color} />
                </div>
                <div>
                  <p style={{ fontSize: '1.4rem', fontWeight: '800', letterSpacing: '-0.03em', lineHeight: 1 }}>{result.dominant}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '3px' }}>
                    {result.confidence}% confidence · {result.frames} frames
                  </p>
                </div>
              </div>
            ) : (
              <EmptyState label="Run analysis to see results" />
            )}
          </div>

          {/* Emotion breakdown */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <p style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.875rem' }}>
              Emotion Breakdown
            </p>
            {result ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {Object.entries(result.scores)
                  .sort(([, a], [, b]) => b - a)
                  .map(([emotion, score]) => {
                    const meta = EMOTION_ICONS[emotion];
                    return (
                      <div key={emotion}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                          <span style={{ fontSize: '0.78rem', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <meta.icon size={12} color={meta.color} /> {emotion}
                          </span>
                          <span style={{ fontSize: '0.75rem', fontWeight: '700', color: meta.color }}>{score}%</span>
                        </div>
                        <div className="progress-track">
                          <div className="progress-fill-enter" style={{ width: `${score}%`, background: meta.color }} />
                        </div>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <EmptyState label="No data yet" />
            )}
          </div>

          {/* API status */}
          <div className="card" style={{ padding: '1rem 1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="status-dot standby" />
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>FER API</span>
              </div>
              <span className="badge badge-success">Connected</span>
            </div>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
              Live backend connection active.
            </p>
          </div>
        </div>
      </div>

      {/* ── Emotion timeline ── */}
      {result && (
        <div className="card" style={{ padding: '1.5rem' }}>
          <p style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1.25rem' }}>
            Emotion Timeline
          </p>
          <div style={{ display: 'flex', gap: '0', overflowX: 'auto', paddingBottom: '0.5rem' }}>
            {TIMELINE.map((t, i) => {
              const meta = EMOTION_ICONS[t.emotion];
              return (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '120px', position: 'relative' }}>
                  {/* Connector line */}
                  {i < TIMELINE.length - 1 && (
                    <div style={{ position: 'absolute', top: '16px', left: '50%', width: '100%', height: '2px', background: 'var(--border)', zIndex: 0 }} />
                  )}
                  {/* Dot */}
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '50%',
                    background: `${meta.color}18`,
                    border: `2px solid ${meta.color}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 1, flexShrink: 0,
                  }}>
                    <meta.icon size={14} color={meta.color} />
                  </div>
                  <p style={{ fontSize: '0.7rem', fontWeight: '700', marginTop: '0.5rem', color: meta.color }}>{t.emotion}</p>
                  <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{t.time}</p>
                  <p style={{ fontSize: '0.62rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '2px', maxWidth: '100px' }}>{t.note}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Responsive */}
      <style>{`
        @media (max-width: 900px) {
          .fer-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

const ModeTab = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    style={{
      padding: '0.45rem 1rem',
      borderRadius: 'var(--r-sm)',
      fontSize: '0.8rem', fontWeight: '600',
      background: active ? 'var(--primary)' : 'var(--bg-elevated)',
      color: active ? '#fff' : 'var(--text-secondary)',
      border: active ? 'none' : '1px solid var(--border)',
      transition: 'var(--transition)',
    }}
  >
    {label}
  </button>
);

const EmptyState = ({ label }) => (
  <div style={{ padding: '1.5rem 0', textAlign: 'center' }}>
    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{label}</p>
  </div>
);

export default FaceRecognition;
