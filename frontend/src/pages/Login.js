import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

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
        <div style={styles.iconWrap}>
          <span className="material-icons-outlined" style={{ fontSize: 40, color: '#4f8cf7' }}>
            monitoring
          </span>
        </div>
        <h1 style={styles.title}>Drug Reaction Dashboard</h1>
        <p style={styles.subtitle}>Sign in to continue</p>

        {error && <div style={styles.error}>{error}</div>}

        <label style={styles.label}>Username</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={styles.input}
          placeholder="Enter username"
          required
        />

        <label style={styles.label}>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
          placeholder="Enter password"
          required
        />

        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? 'Signing in...' : 'Sign In'}
        </button>

        <p style={styles.hint}>Use admin / admin to login</p>
      </form>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
  },
  form: {
    background: '#fff',
    padding: '40px',
    borderRadius: 16,
    width: 380,
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
  },
  iconWrap: {
    textAlign: 'center',
    marginBottom: 8,
  },
  title: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 700,
    color: '#1a1a2e',
    marginBottom: 4,
  },
  subtitle: {
    textAlign: 'center',
    color: '#718096',
    fontSize: 14,
    marginBottom: 24,
  },
  label: {
    display: 'block',
    fontSize: 13,
    fontWeight: 600,
    color: '#4a5568',
    marginBottom: 6,
    marginTop: 16,
  },
  input: {
    width: '100%',
    padding: '10px 14px',
    border: '1px solid #e2e8f0',
    borderRadius: 8,
    fontSize: 14,
    outline: 'none',
  },
  button: {
    width: '100%',
    padding: '12px',
    marginTop: 24,
    background: '#4f8cf7',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
  },
  error: {
    background: '#fff5f5',
    color: '#e53e3e',
    padding: '10px 14px',
    borderRadius: 8,
    fontSize: 13,
    textAlign: 'center',
  },
  hint: {
    textAlign: 'center',
    color: '#a0aec0',
    fontSize: 12,
    marginTop: 16,
  },
};
