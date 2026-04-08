import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import '../styling/Login.css';

export default function Login() {
  const navigate  = useNavigate();
  const { login } = useAuth();

  const [form, setForm]         = useState({ email: '', password: '' });
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [showPass, setShowPass] = useState(false);

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError('Please fill in both fields.');
      return;
    }
    setLoading(true);
    try {
      // ── Try real backend first ──────────────────────────────────
      const res = await authAPI.login(form);
      login(res.user, res.token);
      navigate('/');
    } catch {
      // ── Mock fallback while backend is not ready ────────────────
      const mockUsers = [
        { email: 'admin@inventory.local',   password: 'admin123',   user: { id: 1, name: 'Admin User',    role: 'admin',    email: 'admin@inventory.local' } },
        { email: 'manager@inventory.local', password: 'manager123', user: { id: 2, name: 'Manager User',  role: 'manager',  email: 'manager@inventory.local' } },
        { email: 'user@inventory.local',    password: 'user123',    user: { id: 3, name: 'End User',      role: 'end-user', email: 'user@inventory.local' } },
      ];
      const found = mockUsers.find(
        u => u.email === form.email && u.password === form.password
      );
      if (found) {
        login(found.user, 'mock-jwt-token-' + found.user.role);
        navigate('/');
      } else {
        setError('Invalid email or password.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-shell">

      {/* ── Left branding panel ─────────────────────────────────── */}
      <div className="login-left">
        <div className="login-left__inner">
          <div className="login-brand">
            <div className="login-brand__logo">
              <svg width="22" height="22" viewBox="0 0 20 20" fill="none">
                <rect x="2" y="2" width="7" height="7" rx="1.5" fill="var(--color-primary)" />
                <rect x="11" y="2" width="7" height="7" rx="1.5" fill="var(--color-primary)" opacity=".55" />
                <rect x="2" y="11" width="7" height="7" rx="1.5" fill="var(--color-primary)" opacity=".55" />
                <rect x="11" y="11" width="7" height="7" rx="1.5" fill="var(--color-primary)" opacity=".3" />
              </svg>
            </div>
            <span className="login-brand__name">DevStock</span>
          </div>

          <div className="login-left__copy">
            <h1 className="login-left__headline">One source<br />of truth.</h1>
            <p className="login-left__sub">
              Every asset. Every movement.<br />Every person accountable.
            </p>
          </div>

          <div className="login-features">
            {[
              ['▣', 'Full chain of custody tracking'],
              ['⏱', 'Warranty & maintenance heartbeat'],
              ['⬆', 'Gate pass & QR label generation'],
              ['🔒', 'Immutable audit trail'],
            ].map(([icon, text], i) => (
              <div key={i} className="login-feature">
                <span className="login-feature__icon">{icon}</span>
                <span className="login-feature__text">{text}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="login-left__grid" aria-hidden />
      </div>

      {/* ── Right form panel ────────────────────────────────────── */}
      <div className="login-right">
        <div className="login-card">
          <div className="login-card__header">
            <h2 className="login-card__title">Sign in</h2>
            <p className="login-card__sub">Access your inventory workspace</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit} noValidate>
            <div className="login-field">
              <label className="login-label" htmlFor="email">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                className="login-input"
                placeholder="admin@inventory.local"
                value={form.email}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <div className="login-field">
              <label className="login-label" htmlFor="password">Password</label>
              <div className="login-pass-wrap">
                <input
                  id="password"
                  name="password"
                  type={showPass ? 'text' : 'password'}
                  autoComplete="current-password"
                  className="login-input"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  disabled={loading}
                />
                <button type="button" className="login-pass-toggle"
                  onClick={() => setShowPass(p => !p)} tabIndex={-1}>
                  {showPass
                    ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              </div>
            </div>

            {error && (
              <div className="login-error" role="alert">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {error}
              </div>
            )}

            <button type="submit" className="login-submit" disabled={loading}>
              {loading ? <><span className="login-spinner" />Signing in…</> : <>Sign in <span>→</span></>}
            </button>
          </form>

          {/* Dev credentials hint */}
          <div className="login-hint">
            <span className="login-hint__title">Dev credentials</span>
            <div className="login-hint__rows">
              {[
                ['admin@inventory.local',   'admin123',   'admin'],
                ['manager@inventory.local', 'manager123', 'manager'],
                ['user@inventory.local',    'user123',    'end-user'],
              ].map(([email, pass, role]) => (
                <button key={role} className="login-hint__row"
                  onClick={() => setForm({ email, password: pass })}>
                  <span className={`login-hint__role login-hint__role--${role}`}>{role}</span>
                  <span className="login-hint__email">{email}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}