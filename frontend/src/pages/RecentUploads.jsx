import React, { useState, useEffect, useCallback } from 'react';
import api from '../api';

export default function RecentUploads() {
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUploads = useCallback(async () => {
    try {
      const { data } = await api.get('/uploads');
      setUploads(data || []);
    } catch {} finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUploads(); }, [fetchUploads]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this upload and all its data?')) return;
    await api.delete(`/uploads/${id}`);
    fetchUploads();
  };

  if (loading) return <p style={{ padding: 40, color: '#718096' }}>Loading...</p>;

  return (
    <div>
      <h1 style={styles.pageTitle}>Recent Uploads</h1>
      <p style={styles.pageSubtitle}>History of uploaded drug reaction datasets</p>

      {uploads.length === 0 ? (
        <div style={styles.empty}>
          <span className="material-icons-outlined" style={{ fontSize: 48, color: '#cbd5e0' }}>
            folder_open
          </span>
          <p style={{ marginTop: 12, color: '#718096' }}>No uploads yet. Upload your first dataset.</p>
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
                <tr key={u.id} style={i % 2 === 0 ? {} : { background: '#f7fafc' }}>
                  <td style={styles.td}>{u.id}</td>
                  <td style={styles.td}>
                    <span className="material-icons-outlined" style={{ fontSize: 16, marginRight: 6, color: '#38a169' }}>
                      description
                    </span>
                    {u.filename}
                  </td>
                  <td style={styles.td}>{u.row_count.toLocaleString()}</td>
                  <td style={styles.td}>{new Date(u.created_at).toLocaleString()}</td>
                  <td style={styles.td}>
                    <button onClick={() => handleDelete(u.id)} style={styles.deleteBtn}>
                      <span className="material-icons-outlined" style={{ fontSize: 16 }}>delete</span>
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
  pageTitle: { fontSize: 22, fontWeight: 700, color: '#1a1a2e' },
  pageSubtitle: { fontSize: 14, color: '#718096', marginBottom: 24 },
  empty: {
    textAlign: 'center',
    padding: '64px 24px',
    background: '#fff',
    borderRadius: 12,
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
  },
  table: {
    background: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
  },
  th: {
    textAlign: 'left',
    padding: '12px 16px',
    fontSize: 12,
    fontWeight: 600,
    textTransform: 'uppercase',
    color: '#718096',
    borderBottom: '1px solid #e2e8f0',
    background: '#f7fafc',
  },
  td: {
    padding: '12px 16px',
    fontSize: 14,
    borderBottom: '1px solid #edf2f7',
    color: '#2d3748',
  },
  deleteBtn: {
    background: 'none',
    border: '1px solid #feb2b2',
    color: '#e53e3e',
    borderRadius: 6,
    padding: '4px 8px',
    cursor: 'pointer',
  },
};
