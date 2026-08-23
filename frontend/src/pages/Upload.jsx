import React, { useState, useRef } from 'react';
import api from '../api';
import { colors } from '../theme';

export default function Upload() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef();

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError('');
    setResult(null);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const { data } = await api.post('/upload', formData);
      setResult(data);
      setFile(null);
      if (inputRef.current) inputRef.current.value = '';
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f && f.name.endsWith('.xlsx')) setFile(f);
    else setError('Only .xlsx files are supported');
  };

  return (
    <div>
      <h1 style={{ fontSize: 18, fontWeight: 700, color: colors.textBright }}>Upload Data</h1>
      <p style={{ fontSize: 13, color: colors.textMuted, marginBottom: 20 }}>Upload drug reaction data in Excel (.xlsx) format</p>

      <div
        style={{ ...styles.dropZone, borderColor: dragOver ? colors.accent : colors.panelBorder, background: dragOver ? 'rgba(59,130,246,0.05)' : colors.panel }}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <span className="material-icons-outlined" style={{ fontSize: 44, color: colors.accent, marginBottom: 10 }}>cloud_upload</span>
        <p style={{ fontSize: 14, fontWeight: 600, color: colors.text }}>{file ? file.name : 'Drag & drop your Excel file here'}</p>
        <p style={{ fontSize: 12, color: colors.textMuted, marginTop: 4 }}>{file ? `${(file.size / 1024).toFixed(1)} KB` : 'or click to browse'}</p>
        <input ref={inputRef} type="file" accept=".xlsx" style={{ display: 'none' }}
          onChange={(e) => { setFile(e.target.files[0]); setError(''); setResult(null); }} />
      </div>

      <div style={{ textAlign: 'center', marginTop: 16 }}>
        <button onClick={handleUpload} disabled={!file || uploading}
          style={{ ...styles.btn, opacity: !file || uploading ? 0.4 : 1 }}>
          <span className="material-icons-outlined" style={{ marginRight: 6, fontSize: 16 }}>upload</span>
          {uploading ? 'Uploading...' : 'Upload File'}
        </button>
      </div>

      {error && <div style={styles.errorMsg}><span className="material-icons-outlined" style={{ marginRight: 6 }}>error</span>{error}</div>}
      {result && <div style={styles.successMsg}><span className="material-icons-outlined" style={{ marginRight: 6 }}>check_circle</span>{result.message}</div>}

      <div style={styles.infoCard}>
        <h3 style={{ fontSize: 13, fontWeight: 600, color: colors.text, marginBottom: 10 }}>Expected Excel Columns</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {['patient_id','patient_age','patient_gender','patient_weight','drug_name','drug_class','dosage','route_of_admin','reaction_type','reaction_severity','reaction_date','onset_days','outcome','reporter_type','facility_state','meddra_term','is_serious','required_hospital'].map((col) => (
            <span key={col} style={styles.tag}>{col}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  dropZone: { border: `2px dashed ${colors.panelBorder}`, borderRadius: 8, padding: '40px 24px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s' },
  btn: { padding: '10px 28px', background: colors.accent, color: '#fff', border: 'none', borderRadius: 4, fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center' },
  errorMsg: { display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(239,68,68,0.1)', color: colors.red, padding: '10px 16px', borderRadius: 4, marginTop: 14, fontSize: 13 },
  successMsg: { display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(16,185,129,0.1)', color: colors.green, padding: '10px 16px', borderRadius: 4, marginTop: 14, fontSize: 13 },
  infoCard: { marginTop: 28, background: colors.panel, border: `1px solid ${colors.panelBorder}`, borderRadius: 6, padding: '16px 20px' },
  tag: { background: colors.bg, padding: '3px 8px', borderRadius: 3, fontSize: 11, fontFamily: 'monospace', color: colors.textMuted, border: `1px solid ${colors.panelBorder}` },
};
