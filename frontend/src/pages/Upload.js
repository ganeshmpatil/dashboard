import React, { useState, useRef } from 'react';
import api from '../api';

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
      const { data } = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
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
      <h1 style={styles.pageTitle}>Upload Data</h1>
      <p style={styles.pageSubtitle}>Upload drug reaction data in Excel (.xlsx) format</p>

      <div
        style={{
          ...styles.dropZone,
          borderColor: dragOver ? '#4f8cf7' : '#cbd5e0',
          background: dragOver ? '#ebf4ff' : '#fafbfc',
        }}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <span className="material-icons-outlined" style={{ fontSize: 48, color: '#4f8cf7', marginBottom: 12 }}>
          cloud_upload
        </span>
        <p style={{ fontSize: 15, fontWeight: 600, color: '#2d3748' }}>
          {file ? file.name : 'Drag & drop your Excel file here'}
        </p>
        <p style={{ fontSize: 13, color: '#718096', marginTop: 4 }}>
          {file ? `${(file.size / 1024).toFixed(1)} KB` : 'or click to browse'}
        </p>
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx"
          style={{ display: 'none' }}
          onChange={(e) => {
            setFile(e.target.files[0]);
            setError('');
            setResult(null);
          }}
        />
      </div>

      <div style={{ textAlign: 'center', marginTop: 20 }}>
        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          style={{
            ...styles.uploadBtn,
            opacity: !file || uploading ? 0.5 : 1,
          }}
        >
          <span className="material-icons-outlined" style={{ marginRight: 8, fontSize: 18 }}>
            upload
          </span>
          {uploading ? 'Uploading...' : 'Upload File'}
        </button>
      </div>

      {error && (
        <div style={styles.errorMsg}>
          <span className="material-icons-outlined" style={{ marginRight: 8 }}>error</span>
          {error}
        </div>
      )}

      {result && (
        <div style={styles.successMsg}>
          <span className="material-icons-outlined" style={{ marginRight: 8 }}>check_circle</span>
          {result.message}
        </div>
      )}

      <div style={styles.infoCard}>
        <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Expected Excel Columns</h3>
        <div style={styles.colGrid}>
          {[
            'patient_id', 'patient_age', 'patient_gender', 'patient_weight',
            'drug_name', 'drug_class', 'dosage', 'route_of_admin',
            'reaction_type', 'reaction_severity', 'reaction_date', 'onset_days',
            'outcome', 'reporter_type', 'facility_state', 'meddra_term',
            'is_serious', 'required_hospital',
          ].map((col) => (
            <span key={col} style={styles.colTag}>{col}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  pageTitle: { fontSize: 22, fontWeight: 700, color: '#1a1a2e' },
  pageSubtitle: { fontSize: 14, color: '#718096', marginBottom: 24 },
  dropZone: {
    border: '2px dashed #cbd5e0',
    borderRadius: 12,
    padding: '48px 24px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  uploadBtn: {
    padding: '12px 32px',
    background: '#4f8cf7',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
  },
  errorMsg: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#fff5f5',
    color: '#e53e3e',
    padding: '12px 20px',
    borderRadius: 8,
    marginTop: 16,
    fontSize: 14,
  },
  successMsg: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f0fff4',
    color: '#38a169',
    padding: '12px 20px',
    borderRadius: 8,
    marginTop: 16,
    fontSize: 14,
  },
  infoCard: {
    marginTop: 32,
    background: '#fff',
    borderRadius: 12,
    padding: '20px 24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
  },
  colGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
  },
  colTag: {
    background: '#edf2f7',
    padding: '4px 10px',
    borderRadius: 6,
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#4a5568',
  },
};
