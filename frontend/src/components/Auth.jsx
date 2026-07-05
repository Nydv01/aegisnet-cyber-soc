import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SpotlightCard from './SpotlightCard';
import ScrollReveal from './ScrollReveal';
import ShinyText from './ShinyText';
import TextScramble from './TextScramble';

const API = 'http://localhost:8000';

export default function Auth({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    if (!username.trim() || !password.trim()) {
      setError('Username and password are required');
      setLoading(false);
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
        // ── Sign In Flow ──
        const formData = new URLSearchParams();
        formData.append('username', username.trim());
        formData.append('password', password);

        const res = await fetch(`${API}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: formData,
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.detail || 'Authentication failed');
        }

        const data = await res.json();
        localStorage.setItem('aegis_token', data.access_token);
        localStorage.setItem('aegis_user', data.username);
        onLogin(data.username);
        navigate('/dashboard');
      } else {
        // ── Sign Up Flow ──
        const res = await fetch(`${API}/api/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: username.trim(),
            password: password,
          }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.detail || 'Registration failed');
        }

        const data = await res.json();
        setMessage(data.message || 'Account registered successfully! Please sign in.');
        setIsLogin(true);
        setPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <ScrollReveal>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div className="auth-logo">🛡️</div>
          <h2>
            <ShinyText>{isLogin ? 'Access Portal' : 'Register Core'}</ShinyText>
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 4 }}>
            <TextScramble delay={150}>AegisNet Advanced Autonomous Intelligence Console</TextScramble>
          </p>
        </div>
      </ScrollReveal>

      <ScrollReveal delay={100}>
        <SpotlightCard className="auth-card">
          <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {error && (
              <div className="auth-alert error">
                <span>⚠️</span> {error}
              </div>
            )}
            {message && (
              <div className="auth-alert success">
                <span>✅</span> {message}
              </div>
            )}

            <div className="form-group">
              <label>Console Operator ID</label>
              <input
                type="text"
                className="text-input"
                placeholder="Enter operator username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                id="auth-username"
              />
            </div>

            <div className="form-group">
              <label>Security Keyphrase</label>
              <input
                type="password"
                className="text-input"
                placeholder="Enter secret keyphrase"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                id="auth-password"
              />
            </div>

            {!isLogin && (
              <div className="form-group">
                <label>Confirm Keyphrase</label>
                <input
                  type="password"
                  className="text-input"
                  placeholder="Re-enter security keyphrase"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  id="auth-confirm-password"
                />
              </div>
            )}

            <button type="submit" className="btn btn-primary" style={{ marginTop: 10, width: '100%', justifyContent: 'center' }} disabled={loading}>
              {loading ? <span className="spinner" /> : isLogin ? '🔑 Authenticate' : '📝 Register'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 18, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {isLogin ? "Need a new operator ID? " : "Already registered? "}
            <button
              className="btn btn-ghost btn-sm"
              style={{ border: 'none', background: 'transparent', padding: '0 4px', color: 'var(--neon-cyan)', cursor: 'pointer', display: 'inline', fontWeight: 700 }}
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
                setMessage(null);
              }}
              type="button"
            >
              {isLogin ? 'Register account' : 'Sign in'}
            </button>
          </div>
        </SpotlightCard>
      </ScrollReveal>
    </div>
  );
}
