import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faEnvelope, faLock, faSignInAlt, faUserPlus } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';

export default function AuthPage() {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const { showNotification } = useApp();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
      } else {
        await register(form.name, form.email, form.password);
      }
      showNotification(mode === 'login' ? 'Welcome back, storyteller!' : 'Account created! Welcome to KathaVani!', 'success');
      navigate('/');
    } catch (err) {
      setError(err.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-center fade-in" style={{ minHeight: '60vh' }}>
      <div style={{ width: '100%', maxWidth: 440 }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🪔</div>
          <h1 style={{ color: 'var(--terracotta)', marginBottom: '0.3rem' }}>
            {mode === 'login' ? 'Welcome Back' : 'Join KathaVani'}
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>
            {mode === 'login' ? 'Continue your storytelling journey' : 'Begin preserving our heritage'}
          </p>
        </div>

        <div className="card">
          {/* Mode toggle */}
          <div className="tab-nav" style={{ marginBottom: '1.5rem' }}>
            <button className={`tab-btn ${mode === 'login' ? 'active' : ''}`} onClick={() => setMode('login')}>
              <FontAwesomeIcon icon={faSignInAlt} /> <span>Sign In</span>
            </button>
            <button className={`tab-btn ${mode === 'register' ? 'active' : ''}`} onClick={() => setMode('register')}>
              <FontAwesomeIcon icon={faUserPlus} /> <span>Register</span>
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {mode === 'register' && (
              <div style={{ marginBottom: '1rem' }}>
                <label><FontAwesomeIcon icon={faUser} style={{ marginRight: 6 }} />Full Name</label>
                <input type="text" placeholder="Your name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
              </div>
            )}
            <div style={{ marginBottom: '1rem' }}>
              <label><FontAwesomeIcon icon={faEnvelope} style={{ marginRight: 6 }} />Email</label>
              <input type="email" placeholder="your@email.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label><FontAwesomeIcon icon={faLock} style={{ marginRight: 6 }} />Password</label>
              <input type="password" placeholder="••••••••" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required minLength={6} />
            </div>

            {error && (
              <div style={{ background: 'rgba(192,57,43,0.1)', border: '1px solid var(--vermillion)', borderRadius: 'var(--radius-sm)', padding: '0.75rem', marginBottom: '1rem', color: 'var(--vermillion)', fontSize: '0.9rem' }}>
                {error}
              </div>
            )}

            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
              {loading ? 'Please wait…' : (mode === 'login' ? '🪔 Enter the Hub' : '✨ Create Account')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
