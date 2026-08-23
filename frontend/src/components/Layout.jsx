import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import api from '../api';

const navItems = [
  { path: '/', label: 'Dashboard', icon: 'dashboard' },
  { path: '/upload', label: 'Upload Data', icon: 'upload_file' },
  { path: '/uploads', label: 'Recent Uploads', icon: 'history' },
];

export default function Layout() {
  const navigate = useNavigate();
  const username = localStorage.getItem('username') || 'Admin';

  const handleLogout = async () => {
    try { await api.post('/logout'); } catch {}
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside style={styles.sidebar}>
        <div style={styles.logo}>
          <span className="material-icons-outlined" style={{ fontSize: 28, color: '#4f8cf7' }}>
            monitoring
          </span>
          <span style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginLeft: 10 }}>
            Drug Reaction<br/>Dashboard
          </span>
        </div>
        <nav style={styles.nav}>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              style={({ isActive }) => ({
                ...styles.navLink,
                backgroundColor: isActive ? 'rgba(79,140,247,0.15)' : 'transparent',
                color: isActive ? '#4f8cf7' : '#a0aec0',
              })}
            >
              <span className="material-icons-outlined" style={{ marginRight: 12 }}>
                {item.icon}
              </span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div style={styles.userSection}>
          <div style={styles.userInfo}>
            <span className="material-icons-outlined" style={{ marginRight: 8 }}>person</span>
            {username}
          </div>
          <button onClick={handleLogout} style={styles.logoutBtn}>
            <span className="material-icons-outlined" style={{ fontSize: 18, marginRight: 6 }}>logout</span>
            Logout
          </button>
        </div>
      </aside>
      <main style={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}

const styles = {
  sidebar: {
    width: 240,
    backgroundColor: '#1a1a2e',
    display: 'flex',
    flexDirection: 'column',
    position: 'fixed',
    height: '100vh',
    zIndex: 10,
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    padding: '24px 20px',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
  },
  nav: {
    flex: 1,
    padding: '16px 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  navLink: {
    display: 'flex',
    alignItems: 'center',
    padding: '10px 16px',
    borderRadius: 8,
    textDecoration: 'none',
    fontSize: 14,
    fontWeight: 500,
    transition: 'all 0.2s',
  },
  userSection: {
    padding: '16px 20px',
    borderTop: '1px solid rgba(255,255,255,0.08)',
  },
  userInfo: {
    color: '#a0aec0',
    fontSize: 13,
    display: 'flex',
    alignItems: 'center',
    marginBottom: 8,
  },
  logoutBtn: {
    background: 'none',
    border: '1px solid rgba(255,255,255,0.15)',
    color: '#a0aec0',
    padding: '6px 12px',
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: 12,
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'center',
  },
  main: {
    flex: 1,
    marginLeft: 240,
    padding: '24px 32px',
    minHeight: '100vh',
  },
};
