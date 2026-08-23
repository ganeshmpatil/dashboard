import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import api from '../api';

const COLORS = ['#4f8cf7', '#38a169', '#e53e3e', '#ed8936', '#9f7aea', '#dd6b20', '#3182ce', '#d69e2e'];
const SEVERITY_COLORS = { Mild: '#38a169', Moderate: '#ed8936', Severe: '#e53e3e', 'Life-threatening': '#9b2c2c' };

function StatCard({ icon, label, value, color }) {
  return (
    <div style={styles.statCard}>
      <span className="material-icons-outlined" style={{ fontSize: 32, color }}>{icon}</span>
      <div style={{ marginLeft: 16 }}>
        <div style={{ fontSize: 24, fontWeight: 700, color: '#1a1a2e' }}>{value?.toLocaleString() ?? '-'}</div>
        <div style={{ fontSize: 13, color: '#718096' }}>{label}</div>
      </div>
    </div>
  );
}

function ChartCard({ title, children, span }) {
  return (
    <div style={{ ...styles.chartCard, gridColumn: span ? `span ${span}` : undefined }}>
      <h3 style={styles.chartTitle}>{title}</h3>
      {children}
    </div>
  );
}

export default function Dashboard() {
  const [summary, setSummary] = useState({});
  const [byDrug, setByDrug] = useState([]);
  const [bySeverity, setBySeverity] = useState([]);
  const [byOutcome, setByOutcome] = useState([]);
  const [byGender, setByGender] = useState([]);
  const [byMonth, setByMonth] = useState([]);
  const [byAge, setByAge] = useState([]);
  const [byType, setByType] = useState([]);
  const [byDrugClass, setByDrugClass] = useState([]);
  const [serious, setSerious] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [s, d, sv, o, g, m, a, t, dc, sr] = await Promise.all([
          api.get('/analytics/summary'),
          api.get('/analytics/by-drug'),
          api.get('/analytics/by-severity'),
          api.get('/analytics/by-outcome'),
          api.get('/analytics/by-gender'),
          api.get('/analytics/by-month'),
          api.get('/analytics/by-age'),
          api.get('/analytics/by-type'),
          api.get('/analytics/by-drug-class'),
          api.get('/analytics/serious'),
        ]);
        setSummary(s.data);
        setByDrug(d.data);
        setBySeverity(sv.data);
        setByOutcome(o.data);
        setByGender(g.data);
        setByMonth(m.data);
        setByAge(a.data);
        setByType(t.data);
        setByDrugClass(dc.data);
        setSerious(sr.data);
      } catch {}
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <p style={{ padding: 40, color: '#718096' }}>Loading dashboard...</p>;

  if (!summary.total_reactions) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 24px' }}>
        <span className="material-icons-outlined" style={{ fontSize: 64, color: '#cbd5e0' }}>
          analytics
        </span>
        <h2 style={{ marginTop: 16, color: '#4a5568' }}>No Data Yet</h2>
        <p style={{ color: '#718096', marginTop: 8 }}>Upload a drug reaction Excel file to see visualizations here.</p>
      </div>
    );
  }

  return (
    <div>
      <h1 style={styles.pageTitle}>Dashboard</h1>
      <p style={styles.pageSubtitle}>Adverse drug reaction analytics overview</p>

      {/* Summary Cards */}
      <div style={styles.statGrid}>
        <StatCard icon="science" label="Total Reactions" value={summary.total_reactions} color="#4f8cf7" />
        <StatCard icon="people" label="Unique Patients" value={summary.total_patients} color="#38a169" />
        <StatCard icon="upload_file" label="Total Uploads" value={summary.total_uploads} color="#ed8936" />
        <StatCard
          icon="warning"
          label="Severe / Life-threatening"
          value={
            (summary.severity_breakdown || [])
              .filter((s) => s.label === 'Severe' || s.label === 'Life-threatening')
              .reduce((a, b) => a + b.count, 0)
          }
          color="#e53e3e"
        />
      </div>

      {/* Charts Grid */}
      <div style={styles.chartsGrid}>
        {/* Reactions by Month - Line Chart */}
        <ChartCard title="Reactions Over Time (Monthly)" span={2}>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={byMonth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#edf2f7" />
              <XAxis dataKey="label" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#4f8cf7" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Top Drugs - Bar Chart */}
        <ChartCard title="Top 15 Drugs by Reactions" span={2}>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={byDrug} layout="vertical" margin={{ left: 80 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#edf2f7" />
              <XAxis type="number" fontSize={12} />
              <YAxis type="category" dataKey="label" fontSize={11} width={80} />
              <Tooltip />
              <Bar dataKey="count" fill="#4f8cf7" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Severity - Pie Chart */}
        <ChartCard title="Severity Distribution">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={bySeverity} dataKey="count" nameKey="label" cx="50%" cy="50%" outerRadius={100} label>
                {bySeverity.map((entry) => (
                  <Cell key={entry.label} fill={SEVERITY_COLORS[entry.label] || '#718096'} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Outcome - Pie Chart */}
        <ChartCard title="Outcome Distribution">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={byOutcome} dataKey="count" nameKey="label" cx="50%" cy="50%" outerRadius={100} label>
                {byOutcome.map((entry, i) => (
                  <Cell key={entry.label} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Gender Split - Pie Chart */}
        <ChartCard title="Gender Distribution">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={byGender} dataKey="count" nameKey="label" cx="50%" cy="50%" innerRadius={50} outerRadius={100} label>
                {byGender.map((entry, i) => (
                  <Cell key={entry.label} fill={i === 0 ? '#4f8cf7' : '#e53e3e'} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Serious vs Non-Serious */}
        <ChartCard title="Serious vs Non-Serious">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={serious} dataKey="count" nameKey="label" cx="50%" cy="50%" innerRadius={50} outerRadius={100} label>
                {serious.map((entry, i) => (
                  <Cell key={entry.label} fill={i === 0 ? '#e53e3e' : '#38a169'} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Age Distribution - Bar Chart */}
        <ChartCard title="Age Group Distribution">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={byAge}>
              <CartesianGrid strokeDasharray="3 3" stroke="#edf2f7" />
              <XAxis dataKey="label" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Bar dataKey="count" fill="#9f7aea" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Top Reaction Types - Bar Chart */}
        <ChartCard title="Top Reaction Types">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={byType}>
              <CartesianGrid strokeDasharray="3 3" stroke="#edf2f7" />
              <XAxis dataKey="label" fontSize={10} angle={-30} textAnchor="end" height={60} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Bar dataKey="count" fill="#ed8936" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Drug Class Breakdown - Bar Chart */}
        <ChartCard title="Reactions by Drug Class" span={2}>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={byDrugClass}>
              <CartesianGrid strokeDasharray="3 3" stroke="#edf2f7" />
              <XAxis dataKey="label" fontSize={11} angle={-20} textAnchor="end" height={60} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Bar dataKey="count" fill="#3182ce" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}

const styles = {
  pageTitle: { fontSize: 22, fontWeight: 700, color: '#1a1a2e' },
  pageSubtitle: { fontSize: 14, color: '#718096', marginBottom: 24 },
  statGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: 16,
    marginBottom: 24,
  },
  statCard: {
    display: 'flex',
    alignItems: 'center',
    background: '#fff',
    padding: '20px 24px',
    borderRadius: 12,
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
  },
  chartsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: 20,
  },
  chartCard: {
    background: '#fff',
    borderRadius: 12,
    padding: '20px 24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: '#2d3748',
    marginBottom: 16,
  },
};
