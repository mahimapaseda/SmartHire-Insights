import React, { useState, useRef, useEffect } from 'react';
import { API_URL, getHeaders } from '../config';
import {
  Mic, MicOff, Upload, Play, Square,
  RefreshCcw, Volume2, AlertTriangle,
  CheckCircle2, Activity, BarChart2,
} from 'lucide-react';

const postVoiceFile = async (file) => {
  const form = new FormData();
  form.append('file', file, file.name || 'recording.webm');
  const res = await fetch(`${API_URL}/api/voice-analysis`, {
    method: 'POST',
    headers: getHeaders(true),
    body: form,
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error || 'Voice analysis failed');
  return data.data;
};

/* ── Waveform visualiser (SVG bars) ──────────────────────────── */
const Waveform = ({ active, result }) => {
  const bars = 40;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '3px', height: '60px' }}>
      {Array.from({ length: bars }).map((_, i) => {
        const h = active
          ? Math.random() * 50 + 10
          : result
            ? Math.sin((i / bars) * Math.PI * 3) * 25 + 30
            : 4;
        return (
          <div key={i} style={{
            flex: 1,
            height: `${h}px`,
            borderRadius: '2px',
            background: active
              ? `rgba(34,197,94,${0.4 + Math.random() * 0.6})`
              : result
                ? 'var(--primary)'
                : 'var(--border-strong)',
            transition: active ? 'height 0.1s ease' : 'none',
          }} />
        );
      })}
    </div>
  );
};

/* ── Stress gauge ─────────────────────────────────────────────── */
const StressGauge = ({ score }) => {
  const color = score < 35 ? '#22c55e' : score < 65 ? '#f59e0b' : '#ef4444';
  const label = score < 35 ? 'Low Stress' : score < 65 ? 'Moderate' : 'High Stress';
  const r = 44, cx = 56, cy = 56;
  const circ = Math.PI * r; // half circle
  const filled = (score / 100) * circ;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
      <div style={{ position: 'relative', width: '112px', height: '64px', overflow: 'hidden' }}>
        <svg width="112" height="112" style={{ position: 'absolute', top: 0, left: 0 }}>
          {/* Track */}
          <path d={`M 12 56 A 44 44 0 0 1 100 56`} fill="none" stroke="var(--border-strong)" strokeWidth="10" strokeLinecap="round" />
          {/* Fill */}
          <path d={`M 12 56 A 44 44 0 0 1 100 56`} fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
            strokeDasharray={`${filled} ${circ}`} />
        </svg>
        <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', textAlign: 'center' }}>
          <p style={{ fontSize: '1.3rem', fontWeight: '800', letterSpacing: '-0.04em', color, lineHeight: 1 }}>{score}</p>
        </div>
      </div>
      <span className={`badge ${score < 35 ? 'badge-success' : score < 65 ? 'badge-warning' : 'badge-danger'}`}>
        {label}
      </span>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════
   VOICE ANALYSIS COMPONENT
══════════════════════════════════════════════════════════════ */
const VoiceAnalysis = ({ candidate }) => {
  const [mode, setMode]       = useState('upload'); // 'upload' | 'live'
  const [status, setStatus]   = useState('idle');
  const [result, setResult]   = useState(null);
  const [recording, setRecording] = useState(false);
  const [audioName, setAudioName] = useState(null);
  const [audioFile, setAudioFile] = useState(null);
  const [analysisError, setAnalysisError] = useState(null);
  const [tick, setTick]       = useState(0);
  const fileRef  = useRef();
  const timerRef = useRef();
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  // Animate waveform while recording
  useEffect(() => {
    if (recording) {
      timerRef.current = setInterval(() => setTick(t => t + 1), 120);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [recording]);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAudioName(file.name);
    setAudioFile(file);
    setResult(null);
    setAnalysisError(null);
    setStatus('idle');
  };

  const runAnalysis = async () => {
    if (!audioFile) {
      setAnalysisError('Upload or record audio first.');
      return;
    }
    setStatus('analysing');
    setAnalysisError(null);
    try {
      const data = await postVoiceFile(audioFile);
      setResult({ ...data, timestamp: data.timestamp || new Date().toLocaleTimeString() });
      setStatus('done');
    } catch (err) {
      setAnalysisError(err.message);
      setStatus('error');
    }
  };

  const toggleRecording = async () => {
    if (recording) {
      mediaRecorderRef.current?.stop();
      setRecording(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        chunksRef.current = [];
        const recorder = new MediaRecorder(stream);
        mediaRecorderRef.current = recorder;
        recorder.ondataavailable = (ev) => {
          if (ev.data.size > 0) chunksRef.current.push(ev.data);
        };
        recorder.onstop = async () => {
          stream.getTracks().forEach(t => t.stop());
          const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
          const file = new File([blob], 'live-recording.webm', { type: 'audio/webm' });
          setAudioFile(file);
          setAudioName(file.name);
          setStatus('analysing');
          setAnalysisError(null);
          try {
            const data = await postVoiceFile(file);
            setResult({ ...data, timestamp: data.timestamp || new Date().toLocaleTimeString() });
            setStatus('done');
          } catch (err) {
            setAnalysisError(err.message);
            setStatus('error');
          }
        };
        recorder.start();
        setRecording(true);
        setStatus('recording');
        setResult(null);
        setAnalysisError(null);
      } catch (err) {
        setAnalysisError(err.message || 'Microphone access denied');
        setStatus('error');
      }
    }
  };

  const reset = () => {
    setStatus('idle');
    setResult(null);
    setAudioName(null);
    setAudioFile(null);
    setRecording(false);
    setAnalysisError(null);
    clearInterval(timerRef.current);
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  const stressColor = result
    ? result.stressScore < 35 ? '#22c55e' : result.stressScore < 65 ? '#f59e0b' : '#ef4444'
    : 'var(--text-muted)';

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
          <ModeTab label="Upload Audio" active={mode === 'upload'} onClick={() => { setMode('upload'); reset(); }} />
          <ModeTab label="Live Record"  active={mode === 'live'}   onClick={() => { setMode('live');   reset(); }} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.25rem' }}>

        {/* ── Left ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {/* Waveform card */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <p style={{ fontSize: '0.85rem', fontWeight: '600' }}>
                {mode === 'live' && recording ? 'Recording…' : result ? 'Audio Analysis' : 'Waveform'}
              </p>
              {result && (
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Duration: {result.duration} · {result.wordsPerMin} wpm
                </span>
              )}
            </div>

            {/* Waveform */}
            <div style={{
              padding: '1rem',
              borderRadius: 'var(--r-md)',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              marginBottom: '1rem',
            }}>
              <Waveform active={recording} result={result} key={tick} />
            </div>

            {/* Upload mode */}
            {mode === 'upload' && (
              <div style={{ display: 'flex', gap: '0.625rem', alignItems: 'center' }}>
                <input ref={fileRef} type="file" accept="audio/*,video/*" onChange={handleFile} style={{ display: 'none' }} />
                {!audioName ? (
                  <button className="btn-ghost" onClick={() => fileRef.current?.click()} style={{ flex: 1, justifyContent: 'center' }}>
                    <Upload size={14} /> Upload audio / video file
                  </button>
                ) : (
                  <>
                    <div style={{
                      flex: 1, padding: '0.5rem 0.875rem',
                      borderRadius: 'var(--r-sm)',
                      background: 'var(--primary-subtle)',
                      border: '1px solid rgba(26,92,56,0.2)',
                      fontSize: '0.8rem', color: 'var(--primary)', fontWeight: '500',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      🎵 {audioName}
                    </div>
                    {status !== 'analysing' && (
                      <button className="btn-primary" onClick={runAnalysis}>
                        <Play size={14} /> Analyse
                      </button>
                    )}
                  </>
                )}
                {(audioName || result) && (
                  <button className="btn-ghost" onClick={reset} style={{ padding: '0.5rem' }}>
                    <RefreshCcw size={14} />
                  </button>
                )}
              </div>
            )}

            {/* Live mode */}
            {mode === 'live' && (
              <div style={{ display: 'flex', gap: '0.625rem' }}>
                <button
                  className={recording ? 'btn-ghost' : 'btn-primary'}
                  onClick={toggleRecording}
                  disabled={status === 'analysing'}
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  {recording ? (
                    <><Square size={14} /> Stop Recording</>
                  ) : status === 'analysing' ? (
                    <><span className="animate-spin" style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block' }} /> Analysing…</>
                  ) : (
                    <><Mic size={14} /> Start Recording</>
                  )}
                </button>
                {result && <button className="btn-ghost" onClick={reset}><RefreshCcw size={14} /></button>}
              </div>
            )}
          </div>

          {/* Vocal traits */}
          {result && (
            <div className="card" style={{ padding: '1.5rem' }}>
              <p style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1rem' }}>
                Vocal Trait Scores
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
                {Object.entries(result.traits).map(([trait, score]) => (
                  <div key={trait}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: '500' }}>{trait}</span>
                      <span style={{ fontSize: '0.75rem', fontWeight: '700', color: score >= 75 ? 'var(--success)' : score >= 55 ? 'var(--warning)' : 'var(--danger)' }}>{score}%</span>
                    </div>
                    <div className="progress-track">
                      <div className="progress-fill-enter" style={{
                        width: `${score}%`,
                        background: score >= 75 ? 'var(--success)' : score >= 55 ? 'var(--warning)' : 'var(--danger)',
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Transcript */}
          {result && (
            <div className="card" style={{ padding: '1.5rem' }}>
              <p style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>
                AI Transcript Summary
              </p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.65', fontStyle: 'italic' }}>
                "{result.transcript}"
              </p>
            </div>
          )}
        </div>

        {/* ── Right: results ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {/* Stress gauge */}
          <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
            <p style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', alignSelf: 'flex-start' }}>
              Stress Level
            </p>
            {result ? (
              <StressGauge score={result.stressScore} />
            ) : (
              <div style={{ padding: '2rem 0', textAlign: 'center' }}>
                <Activity size={28} color="var(--text-muted)" style={{ opacity: 0.3, margin: '0 auto 0.5rem' }} />
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>No data yet</p>
              </div>
            )}
          </div>

          {/* Quick stats */}
          {result && (
            <div className="card" style={{ padding: '1.25rem' }}>
              <p style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.875rem' }}>
                Speech Metrics
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <MetricRow label="Words per minute" value={`${result.wordsPerMin} wpm`} good={result.wordsPerMin >= 120 && result.wordsPerMin <= 160} />
                <MetricRow label="Pause count"      value={`${result.pauseCount} pauses`} good={result.pauseCount <= 4} />
                <MetricRow label="Duration"         value={result.duration} good />
                <MetricRow label="Stress score"     value={`${result.stressScore}/100`} good={result.stressScore < 50} />
              </div>
            </div>
          )}

          {/* API status */}
          <div className="card" style={{ padding: '1rem 1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="status-dot standby" />
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Voice Stress API</span>
              </div>
              <span className="badge badge-success">Connected</span>
            </div>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
              Live backend connection active.
            </p>
          </div>
        </div>
      </div>
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

const MetricRow = ({ label, value, good }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{label}</span>
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
      {good
        ? <CheckCircle2 size={12} color="var(--success)" />
        : <AlertTriangle size={12} color="var(--warning)" />}
      <span style={{ fontSize: '0.78rem', fontWeight: '700' }}>{value}</span>
    </div>
  </div>
);

export default VoiceAnalysis;
