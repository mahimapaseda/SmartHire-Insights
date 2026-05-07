import React, { useState, useCallback } from 'react';
import { Upload, File, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

const CVIngestion = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState([]);
  const [isParsing, setIsParsing] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    addFiles(droppedFiles);
  };

  const handleFileInput = (e) => {
    const selectedFiles = Array.from(e.target.files);
    addFiles(selectedFiles);
  };

  const addFiles = (newFiles) => {
    const validFiles = newFiles.filter(file => 
      file.type === 'application/pdf' || 
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ).map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      status: 'queued',
      progress: 0
    }));
    setFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (id) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const startParsing = () => {
    setIsParsing(true);
    // Simulate parsing process
    files.forEach((fileObj, index) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 30;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          setFiles(prev => prev.map(f => f.id === fileObj.id ? { ...f, status: 'completed', progress: 100 } : f));
          if (index === files.length - 1) setIsParsing(false);
        } else {
          setFiles(prev => prev.map(f => f.id === fileObj.id ? { ...f, status: 'parsing', progress: Math.floor(progress) } : f));
        }
      }, 500);
    });
  };

  return (
    <div className="cv-ingestion animate-fade">
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>CV Ingestion Portal</h2>
        <p style={{ color: 'var(--text-muted)' }}>Upload candidate resumes in PDF or DOCX format for AI analysis.</p>
      </div>

      {/* Upload Zone */}
      <div 
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className="glass"
        style={{
          padding: '4rem 2rem',
          borderRadius: '24px',
          textAlign: 'center',
          border: isDragging ? '2px dashed var(--primary)' : '1px dashed var(--glass-border)',
          background: isDragging ? 'rgba(59, 130, 246, 0.05)' : 'var(--glass-bg)',
          transition: 'var(--transition)',
          cursor: 'pointer',
          position: 'relative'
        }}
      >
        <input 
          type="file" 
          multiple 
          accept=".pdf,.docx" 
          onChange={handleFileInput}
          style={{
            position: 'absolute',
            inset: 0,
            opacity: 0,
            cursor: 'pointer'
          }}
        />
        <div style={{
          background: 'rgba(59, 130, 246, 0.1)',
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem'
        }}>
          <Upload size={32} color="var(--primary)" />
        </div>
        <h3 style={{ marginBottom: '0.5rem' }}>Drag and drop resumes here</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Support for PDF and DOCX (Max 10MB per file)</p>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h4 style={{ color: 'var(--text-muted)' }}>Queue ({files.length} files)</h4>
            <button 
              className="primary-btn" 
              onClick={startParsing}
              disabled={isParsing || files.every(f => f.status === 'completed')}
              style={{ opacity: (isParsing || files.every(f => f.status === 'completed')) ? 0.5 : 1 }}
            >
              {isParsing ? 'Parsing...' : 'Start Intelligence Analysis'}
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {files.map(fileObj => (
              <div key={fileObj.id} className="glass" style={{
                padding: '1rem 1.5rem',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem'
              }}>
                <div style={{ color: 'var(--primary)' }}>
                  <File size={24} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>{fileObj.file.name}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {fileObj.status === 'completed' ? 'Analyzed' : fileObj.status === 'parsing' ? `${fileObj.progress}%` : 'Waiting'}
                    </span>
                  </div>
                  <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ 
                      height: '100%', 
                      width: `${fileObj.progress}%`, 
                      background: fileObj.status === 'completed' ? '#22c55e' : 'var(--primary)',
                      transition: 'width 0.3s ease'
                    }}></div>
                  </div>
                </div>
                <div>
                  {fileObj.status === 'completed' ? (
                    <CheckCircle size={20} color="#22c55e" />
                  ) : fileObj.status === 'parsing' ? (
                    <Loader2 size={20} className="animate-spin" style={{ animation: 'spin 2s linear infinite' }} />
                  ) : (
                    <X size={20} style={{ cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => removeFile(fileObj.id)} />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default CVIngestion;
