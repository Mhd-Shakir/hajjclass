'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password.');
      return;
    }

    setSubmitting(true);
    setError('');

    // Simulate authentication logic for now
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();

      if (data.success) {
        // Handle successful login (e.g., set token, redirect)
        router.push('/');
      } else {
        setError(data.message || 'Invalid username or password.');
      }
    } catch {
      setError('An error occurred during login. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="app-wrapper" style={{ justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'var(--color-bg)' }}>
      <div className="form-panel" style={{ width: '100%', maxWidth: '400px', margin: 'auto', boxShadow: 'var(--shadow-xl)' }}>
        <div className="form-panel-header" style={{ justifyContent: 'center', marginBottom: '2rem' }}>
          <div className="header-brand-icon" style={{ width: '48px', height: '48px', fontSize: '1.5rem', marginRight: '0.75rem' }}>
            🔒
          </div>
          <div className="header-brand-text">
            <span className="header-brand-title" style={{ fontSize: '1.25rem' }}>Admin Login</span>
            <span className="header-brand-subtitle">Hajj Darulaman</span>
          </div>
        </div>

        {error && (
          <div style={{ padding: '0.75rem', marginBottom: '1.25rem', borderRadius: 'var(--radius-sm)', background: 'rgba(239, 68, 68, 0.15)', color: 'var(--color-danger)', fontSize: '0.875rem', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="form-field">
            <label className="form-label" htmlFor="username">Username</label>
            <input
              id="username"
              className="form-input"
              type="text"
              placeholder="e.g. admin"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
            />
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="password">Password</label>
            <input
              id="password"
              className="form-input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          <button
            id="login-btn"
            className="btn btn-primary"
            type="submit"
            disabled={submitting || !username.trim() || !password.trim()}
            style={{ marginTop: '0.5rem', width: '100%', justifyContent: 'center' }}
          >
            {submitting ? '⏳ Logging in…' : 'Log In'}
          </button>
        </form>
      </div>
    </div>
  );
}
