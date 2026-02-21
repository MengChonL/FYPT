<<<<<<< HEAD
import { useState } from 'react';
import { adminLogin } from '../api';

export default function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please fill in all fields');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await adminLogin(username, password);
      // Store JWT token securely in sessionStorage
      sessionStorage.setItem('admin_token', res.data.token);
      onLogin();
    } catch (err) {
      const msg = err.response?.status === 429
        ? 'Too many login attempts. Please try again later.'
        : err.response?.data?.error || 'Login failed';
      setError(msg);
      setShake(true);
      setTimeout(() => setShake(false), 500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className={`login-card${shake ? ' shake' : ''}`}>
        <div className="login-icon">🛡️</div>
        <h1 className="login-title">Admin Panel</h1>
        <p className="login-subtitle">Web3 Phishing Training Platform</p>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => { setUsername(e.target.value); setError(''); }}
              placeholder="Enter username"
              autoFocus
              autoComplete="username"
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <div className="password-input-wrap">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                placeholder="Enter password"
                autoComplete="current-password"
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M2.1 3.51 3.5 2.1l18.4 18.39-1.41 1.41-3.02-3.01A11.74 11.74 0 0 1 12 20C6.5 20 2.1 15.5.5 12c.73-1.6 1.84-3.2 3.29-4.59L2.1 3.5Zm6.1 6.1A3.98 3.98 0 0 0 8 11a4 4 0 0 0 5.39 3.74l-1.53-1.53A2 2 0 0 1 10.79 12L8.2 9.61Zm5.15 5.15 2.96 2.96c2.2-1.13 3.93-3.02 5.19-5.72C19.9 8.5 15.5 4 10 4c-1.2 0-2.34.2-3.4.58l2.45 2.45A4 4 0 0 1 16 11c0 1.04-.39 1.99-1.03 2.76l-1.62-1.62Z" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 5c5.5 0 9.9 4.5 11.5 7-1.6 2.5-6 7-11.5 7S2.1 14.5.5 12C2.1 9.5 6.5 5 12 5Zm0 2C8.1 7 4.7 10 3 12c1.7 2 5.1 5 9 5s7.3-3 9-5c-1.7-2-5.1-5-9-5Zm0 2.5A2.5 2.5 0 1 1 9.5 12 2.5 2.5 0 0 1 12 9.5Z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {error && <div className="login-error">{error}</div>}

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
=======
import { useState } from 'react';
import { adminLogin } from '../api';

export default function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please fill in all fields');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await adminLogin(username, password);
      // Store JWT token securely in sessionStorage
      sessionStorage.setItem('admin_token', res.data.token);
      onLogin();
    } catch (err) {
      const msg = err.response?.status === 429
        ? 'Too many login attempts. Please try again later.'
        : err.response?.data?.error || 'Login failed';
      setError(msg);
      setShake(true);
      setTimeout(() => setShake(false), 500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className={`login-card${shake ? ' shake' : ''}`}>
        <div className="login-icon">🛡️</div>
        <h1 className="login-title">Admin Panel</h1>
        <p className="login-subtitle">Web3 Phishing Training Platform</p>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => { setUsername(e.target.value); setError(''); }}
              placeholder="Enter username"
              autoFocus
              autoComplete="username"
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <div className="password-input-wrap">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                placeholder="Enter password"
                autoComplete="current-password"
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M2.1 3.51 3.5 2.1l18.4 18.39-1.41 1.41-3.02-3.01A11.74 11.74 0 0 1 12 20C6.5 20 2.1 15.5.5 12c.73-1.6 1.84-3.2 3.29-4.59L2.1 3.5Zm6.1 6.1A3.98 3.98 0 0 0 8 11a4 4 0 0 0 5.39 3.74l-1.53-1.53A2 2 0 0 1 10.79 12L8.2 9.61Zm5.15 5.15 2.96 2.96c2.2-1.13 3.93-3.02 5.19-5.72C19.9 8.5 15.5 4 10 4c-1.2 0-2.34.2-3.4.58l2.45 2.45A4 4 0 0 1 16 11c0 1.04-.39 1.99-1.03 2.76l-1.62-1.62Z" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 5c5.5 0 9.9 4.5 11.5 7-1.6 2.5-6 7-11.5 7S2.1 14.5.5 12C2.1 9.5 6.5 5 12 5Zm0 2C8.1 7 4.7 10 3 12c1.7 2 5.1 5 9 5s7.3-3 9-5c-1.7-2-5.1-5-9-5Zm0 2.5A2.5 2.5 0 1 1 9.5 12 2.5 2.5 0 0 1 12 9.5Z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {error && <div className="login-error">{error}</div>}

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
>>>>>>> b997e2340aa0e4c282deea39539958bbab4a6517
