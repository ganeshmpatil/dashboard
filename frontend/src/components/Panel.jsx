import React, { useState } from 'react';
import { colors } from '../theme';

export default function Panel({ title, children, span = 1, height = 300, controls }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div style={{
      ...styles.panel,
      gridColumn: `span ${span}`,
    }}>
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <span
            className="material-icons-outlined"
            style={{ fontSize: 14, cursor: 'pointer', marginRight: 6, color: colors.textMuted }}
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? 'expand_more' : 'expand_less'}
          </span>
          <span style={styles.title}>{title}</span>
        </div>
        {controls && <div style={styles.controls}>{controls}</div>}
      </div>
      {!collapsed && (
        <div style={{ ...styles.body, height }}>
          {children}
        </div>
      )}
    </div>
  );
}

export function StatPanel({ label, value, icon, color, subtext }) {
  return (
    <div style={{ ...styles.statPanel, borderTop: `2px solid ${color}` }}>
      <div style={styles.statTop}>
        <span className="material-icons-outlined" style={{ fontSize: 18, color, marginRight: 6 }}>
          {icon}
        </span>
        <span style={{ fontSize: 11, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 }}>
          {label}
        </span>
      </div>
      <div style={{ fontSize: 28, fontWeight: 700, color: colors.textBright, marginTop: 4 }}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
      {subtext && <div style={{ fontSize: 11, color: colors.textMuted, marginTop: 2 }}>{subtext}</div>}
    </div>
  );
}

export function FieldSelect({ label, value, onChange, options }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      title={label}
      style={styles.select}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

const styles = {
  panel: {
    background: colors.panel,
    border: `1px solid ${colors.panelBorder}`,
    borderRadius: 4,
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '6px 12px',
    background: colors.panelHeader,
    borderBottom: `1px solid ${colors.panelBorder}`,
    minHeight: 32,
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
  },
  title: {
    fontSize: 13,
    fontWeight: 600,
    color: colors.text,
  },
  controls: {
    display: 'flex',
    gap: 6,
    alignItems: 'center',
  },
  body: {
    padding: 8,
  },
  statPanel: {
    background: colors.panel,
    border: `1px solid ${colors.panelBorder}`,
    borderRadius: 4,
    padding: '12px 16px',
  },
  statTop: {
    display: 'flex',
    alignItems: 'center',
  },
  select: {
    background: colors.bg,
    color: colors.text,
    border: `1px solid ${colors.panelBorder}`,
    borderRadius: 3,
    padding: '2px 6px',
    fontSize: 11,
    cursor: 'pointer',
    outline: 'none',
  },
};
