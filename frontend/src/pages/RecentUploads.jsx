import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { colors } from '../theme';

export default function RecentUploads() {
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchUploads = useCallback(async () => {
    try {
      const { data } = await api.get('/uploads');
      setUploads(data || []);
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchUploads(); }, [fetchUploads]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this upload and all its data?')) return;
    await api.delete(`/uploads/${id}`);
    fetchUploads();
  };

  if (loading) return <p style={{ padding: 40, color: colors.textMuted }}>Loading...</p>;

  return (
    <div>
      <h1 style={{ fontSize: 18, fontWeight: 700, color: colors.textBright }}>Recent Uploads</h1>
      <p style={{ fontSize: 13, color: colors.textMuted, marginBottom: 20 }}>History of uploaded datasets. Click "View" to see per-upload dashboard.</p>

      {uploads.length === 0 ? (
        <div style={styles.empty}>
          <span className="material-icons-outlined" style={{ fontSize: 48, color: colors.panelBorder }}>folder_open</span>
          <p style={{ marginTop: 12, color: colors.textMuted }}>No uploads yet.</p>
        </div>
      ) : (
        <div style={styles.table}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['#', 'Filename', 'Rows', 'Uploaded At', 'Actions'].map((h) => (
                  <th key={h} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {uploads.map((u, i) => (
                <tr key={u.id} style={{ background: i % 2 === 0 ? colors.panel : colors.bg }}>
                  <td style={styles.td}>{u.id}</td>
                  <td style={styles.td}>
                    <span className="material-icons-outlined" style={{ fontSize: 14, marginRight: 6, color: colors.green }}>description</span>
                    {u.filename}
                  </td>
                  <td style={styles.td}>{u.row_count.toLocaleString()}</td>
                  <td style={styles.td}>{new Date(u.created_at).toLocaleString()}</td>
                  <td style={styles.td}>
                    <button onClick={() => navigate(`/?upload_id=${u.id}`)} style={styles.viewBtn}>
                      <span className="material-icons-outlined" style={{ fontSize: 14, marginRight: 3 }}>visibility</span>View
                    </button>
                    <button onClick={() => handleDelete(u.id)} style={styles.deleteBtn}>
                      <span className="material-icons-outlined" style={{ fontSize: 14 }}>delete</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const styles = {
  empty: { textAlign: 'center', padding: '60px 24px', background: colors.panel, border: `1px solid ${colors.panelBorder}`, borderRadius: 6 },
  table: { background: colors.panel, border: `1px solid ${colors.panelBorder}`, borderRadius: 6, overflow: 'hidden' },
  th: { textAlign: 'left', padding: '10px 14px', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: colors.textMuted, borderBottom: `1px solid ${colors.panelBorder}`, background: colors.panelHeader, letterSpacing: 0.5 },
  td: { padding: '10px 14px', fontSize: 13, borderBottom: `1px solid ${colors.panelBorder}`, color: colors.text },
  viewBtn: { background: 'rgba(59,130,246,0.1)', border: `1px solid ${colors.accent}`, color: colors.accent, borderRadius: 4, padding: '3px 8px', cursor: 'pointer', fontSize: 11, marginRight: 6, display: 'inline-flex', alignItems: 'center' },
  deleteBtn: { background: 'none', border: `1px solid rgba(239,68,68,0.3)`, color: colors.red, borderRadius: 4, padding: '3px 6px', cursor: 'pointer' },
};
