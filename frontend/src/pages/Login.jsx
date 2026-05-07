import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, ArrowRight } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

const Login = () => {
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    navigate('/dashboard');
  };

  return (
    <div className="login-page animate-fade" style={{
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-darker)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative background blur */}
      <div style={{
        position: 'absolute',
        top: '-10%',
        right: '-5%',
        width: '500px',
        height: '500px',
        background: 'var(--primary-glow)',
        filter: 'blur(150px)',
        opacity: '0.15',
        zIndex: 0
      }}></div>

      <div style={{ position: 'absolute', top: '2rem', right: '2rem', zIndex: 10 }}>
        <ThemeToggle />
      </div>

      <div className="glass animate-fade" style={{
        width: '100%',
        maxWidth: '450px',
        padding: '3rem',
        borderRadius: '24px',
        textAlign: 'center'
      }}>
        <div style={{
          background: 'var(--primary)',
          width: '64px',
          height: '64px',
          borderRadius: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem',
          boxShadow: '0 0 30px var(--primary-glow)'
        }}>
          <Shield size={32} color="white" />
        </div>

        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>SmartHire Insights</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem' }}>
          Intelligent CV & Interview Analysis Platform
        </p>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ textAlign: 'left' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem', marginLeft: '0.5rem' }}>
              Corporate Email
            </label>
              <input 
                type="email" 
                placeholder="mahima@smarthire.ai" 
                className="glass"
                style={{
                  width: '100%',
                  padding: '1rem',
                  borderRadius: '12px',
                  color: 'var(--text-main)',
                  outline: 'none',
                  background: 'var(--bg-dark)',
                  border: '1px solid var(--glass-border)'
                }}
                required
              />
            </div>
  
            <div style={{ textAlign: 'left' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem', marginLeft: '0.5rem' }}>
                Access Key
              </label>
              <input 
                type="password" 
                placeholder="••••••••" 
                className="glass"
                style={{
                  width: '100%',
                  padding: '1rem',
                  borderRadius: '12px',
                  color: 'var(--text-main)',
                  outline: 'none',
                  background: 'var(--bg-dark)',
                  border: '1px solid var(--glass-border)'
                }}
                required
              />

          </div>

          <button type="submit" className="primary-btn" style={{ 
            marginTop: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem'
          }}>
            Authorize System <ArrowRight size={18} />
          </button>
        </form>

        <p style={{ marginTop: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Backend secured by Anuruddha • v1.0.0
        </p>
        
        <div style={{ 
          marginTop: '1.5rem', 
          padding: '1rem', 
          borderRadius: '12px', 
          background: 'var(--bg-dark)', 
          border: '1px solid var(--glass-border)',
          fontSize: '0.8rem',
          color: 'var(--text-muted)',
          display: 'inline-block'
        }}>
          <p style={{ marginBottom: '0.25rem' }}><strong>Demo Account:</strong> mahima@smarthire.ai</p>
          <p><strong>Access Key:</strong> admin123</p>
        </div>
      </div>
    </div>

  );
};

export default Login;
