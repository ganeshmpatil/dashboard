import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { colors } from '../theme';
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
    <div style={{ display: 'flex', minHeight: '100vh', background: colors.bg }}>
      <aside style={styles.sidebar}>
        <div style={styles.logo}>
          <span className="material-icons-outlined" style={{ fontSize: 24, color: colors.accent }}>
            monitoring
          </span>
          <span style={{ fontSize: 13, fontWeight: 700, color: colors.textBright, marginLeft: 10 }}>
            ADR Dashboard
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
                backgroundColor: isActive ? colors.activeLink : 'transparent',
                color: isActive ? colors.accent : colors.textMuted,
                borderLeft: isActive ? `3px solid ${colors.accent}` : '3px solid transparent',
              })}
            >
              <span className="material-icons-outlined" style={{ marginRight: 10, fontSize: 18 }}>
                {item.icon}
              </span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div style={styles.userSection}>
          <div style={styles.userInfo}>
            <span className="material-icons-outlined" style={{ marginRight: 6, fontSize: 16 }}>person</span>
            {username}
          </div>
          <button onClick={handleLogout} style={styles.logoutBtn}>
            <span className="material-icons-outlined" style={{ fontSize: 14, marginRight: 4 }}>logout</span>
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
    width: 200,
    backgroundColor: colors.sidebar,
    display: 'flex',
    flexDirection: 'column',
    position: 'fixed',
    height: '100vh',
    borderRight: `1px solid ${colors.panelBorder}`,
    zIndex: 10,
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    padding: '16px 14px',
    borderBottom: `1px solid ${colors.panelBorder}`,
  },
  nav: {
    flex: 1,
    padding: '8px 0',
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  navLink: {
    display: 'flex',
    alignItems: 'center',
    padding: '8px 14px',
    textDecoration: 'none',
    fontSize: 13,
    fontWeight: 500,
    transition: 'all 0.15s',
  },
  userSection: {
    padding: '12px 14px',
    borderTop: `1px solid ${colors.panelBorder}`,
  },
  userInfo: {
    color: colors.textMuted,
    fontSize: 12,
    display: 'flex',
    alignItems: 'center',
    marginBottom: 6,
  },
  logoutBtn: {
    background: 'none',
    border: `1px solid ${colors.panelBorder}`,
    color: colors.textMuted,
    padding: '4px 10px',
    borderRadius: 4,
    cursor: 'pointer',
    fontSize: 11,
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'center',
  },
  main: {
    flex: 1,
    marginLeft: 200,
    padding: '16px 20px',
    minHeight: '100vh',
  },
};
