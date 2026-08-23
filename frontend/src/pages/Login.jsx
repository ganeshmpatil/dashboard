import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { colors } from '../theme';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/login', { username, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('username', data.username);
      navigate('/');
    } catch {
      setError('Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={{ textAlign: 'center', marginBottom: 8 }}>
          <span className="material-icons-outlined" style={{ fontSize: 36, color: colors.accent }}>monitoring</span>
        </div>
        <h1 style={styles.title}>ADR Dashboard</h1>
        <p style={styles.subtitle}>Adverse Drug Reaction Analytics</p>

        {error && <div style={styles.error}>{error}</div>}

        <label style={styles.label}>Username</label>
        <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} style={styles.input} placeholder="Enter username" required />

        <label style={styles.label}>Password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={styles.input} placeholder="Enter password" required />

        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
        <p style={styles.hint}>Use admin / admin to login</p>
      </form>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: colors.bg },
  form: { background: colors.panel, border: `1px solid ${colors.panelBorder}`, padding: '36px 32px', borderRadius: 8, width: 360 },
  title: { textAlign: 'center', fontSize: 18, fontWeight: 700, color: colors.textBright, marginBottom: 2 },
  subtitle: { textAlign: 'center', color: colors.textMuted, fontSize: 12, marginBottom: 20 },
  label: { display: 'block', fontSize: 12, fontWeight: 600, color: colors.textMuted, marginBottom: 4, marginTop: 14 },
  input: { width: '100%', padding: '9px 12px', background: colors.bg, border: `1px solid ${colors.panelBorder}`, borderRadius: 4, fontSize: 13, color: colors.text, outline: 'none' },
  button: { width: '100%', padding: '10px', marginTop: 20, background: colors.accent, color: '#fff', border: 'none', borderRadius: 4, fontSize: 14, fontWeight: 600, cursor: 'pointer' },
  error: { background: 'rgba(239,68,68,0.1)', color: colors.red, padding: '8px 12px', borderRadius: 4, fontSize: 12, textAlign: 'center' },
  hint: { textAlign: 'center', color: colors.textMuted, fontSize: 11, marginTop: 14 },
};
