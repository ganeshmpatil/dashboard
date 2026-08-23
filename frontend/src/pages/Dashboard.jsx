import React, { useState, useEffect, useCallback } from 'react';
import ReactECharts from 'echarts-for-react';
import api from '../api';
import { colors, chartColors, severityColors } from '../theme';
import Panel, { StatPanel, FieldSelect } from '../components/Panel';

const FIELD_OPTIONS = [
  { value: 'drug_name', label: 'Drug Name' },
  { value: 'drug_class', label: 'Drug Class' },
  { value: 'reaction_type', label: 'Reaction Type' },
  { value: 'reaction_severity', label: 'Severity' },
  { value: 'outcome', label: 'Outcome' },
  { value: 'patient_gender', label: 'Gender' },
  { value: 'reporter_type', label: 'Reporter' },
  { value: 'facility_state', label: 'State' },
  { value: 'route_of_admin', label: 'Route' },
  { value: 'age_group', label: 'Age Group' },
  { value: 'month', label: 'Month' },
  { value: 'is_serious', label: 'Serious' },
  { value: 'required_hospital', label: 'Hospitalized' },
  { value: 'onset_bucket', label: 'Onset Period' },
  { value: 'meddra_term', label: 'MedDRA Term' },
];

const METRIC_OPTIONS = [
  { value: 'count', label: 'Count' },
  { value: 'patients', label: 'Unique Patients' },
  { value: 'avg_age', label: 'Avg Age' },
  { value: 'avg_weight', label: 'Avg Weight' },
  { value: 'avg_onset', label: 'Avg Onset Days' },
];

const CHART_TYPES = [
  { value: 'bar', label: 'Bar' },
  { value: 'hbar', label: 'H-Bar' },
  { value: 'pie', label: 'Pie' },
  { value: 'donut', label: 'Donut' },
  { value: 'line', label: 'Line' },
  { value: 'area', label: 'Area' },
  { value: 'radar', label: 'Radar' },
];

const baseChartTheme = {
  backgroundColor: 'transparent',
  textStyle: { color: colors.textMuted, fontSize: 11 },
  legend: { textStyle: { color: colors.textMuted, fontSize: 11 }, top: 4, right: 8 },
  tooltip: {
    backgroundColor: '#1e2127',
    borderColor: colors.panelBorder,
    textStyle: { color: colors.text, fontSize: 12 },
  },
};

function buildChartOption(data, chartType) {
  if (!data || data.length === 0) return { ...baseChartTheme, title: { text: 'No data', textStyle: { color: colors.textMuted, fontSize: 13 }, left: 'center', top: 'center' } };

  const labels = data.map((d) => d.label);
  const values = data.map((d) => d.value);
  const colorByLabel = (label) => severityColors[label] || chartColors[labels.indexOf(label) % chartColors.length];

  if (chartType === 'pie' || chartType === 'donut') {
    return {
      ...baseChartTheme,
      tooltip: { ...baseChartTheme.tooltip, trigger: 'item', formatter: '{b}: {c} ({d}%)' },
      legend: { ...baseChartTheme.legend, orient: 'vertical', left: 8, top: 'center', type: 'scroll' },
      series: [{
        type: 'pie',
        radius: chartType === 'donut' ? ['40%', '72%'] : '72%',
        center: ['62%', '50%'],
        data: data.map((d) => ({ name: d.label, value: d.value, itemStyle: { color: colorByLabel(d.label) } })),
        label: { color: colors.textMuted, fontSize: 10, formatter: '{b}\n{d}%' },
        emphasis: { itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.5)' } },
      }],
    };
  }

  if (chartType === 'hbar') {
    const rev = [...data].reverse();
    return {
      ...baseChartTheme,
      tooltip: { ...baseChartTheme.tooltip, trigger: 'axis', axisPointer: { type: 'shadow' } },
      grid: { left: 10, right: 20, top: 10, bottom: 10, containLabel: true },
      xAxis: { type: 'value', splitLine: { lineStyle: { color: '#2a2d35' } }, axisLabel: { color: colors.textMuted } },
      yAxis: { type: 'category', data: rev.map(d => d.label), axisLabel: { color: colors.textMuted, fontSize: 10 }, axisTick: { show: false }, axisLine: { lineStyle: { color: '#2a2d35' } } },
      series: [{
        type: 'bar',
        data: rev.map((d, i) => ({ value: d.value, itemStyle: { color: chartColors[i % chartColors.length], borderRadius: [0, 3, 3, 0] } })),
        barMaxWidth: 18,
      }],
    };
  }

  if (chartType === 'line' || chartType === 'area') {
    return {
      ...baseChartTheme,
      tooltip: { ...baseChartTheme.tooltip, trigger: 'axis' },
      grid: { left: 10, right: 16, top: 16, bottom: 10, containLabel: true },
      xAxis: { type: 'category', data: labels, axisLabel: { color: colors.textMuted, fontSize: 10, rotate: labels.length > 8 ? 30 : 0 }, axisLine: { lineStyle: { color: '#2a2d35' } }, axisTick: { show: false }, boundaryGap: false },
      yAxis: { type: 'value', splitLine: { lineStyle: { color: '#2a2d35' } }, axisLabel: { color: colors.textMuted } },
      series: [{
        type: 'line',
        data: values,
        smooth: true,
        symbol: 'circle',
        symbolSize: 5,
        lineStyle: { color: colors.accent, width: 2 },
        itemStyle: { color: colors.accent },
        areaStyle: chartType === 'area' ? { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(59,130,246,0.35)' }, { offset: 1, color: 'rgba(59,130,246,0.02)' }] } } : undefined,
      }],
    };
  }

  if (chartType === 'radar') {
    const max = Math.max(...values) * 1.2 || 1;
    return {
      ...baseChartTheme,
      radar: {
        indicator: labels.slice(0, 12).map((l) => ({ name: l, max })),
        shape: 'polygon',
        axisName: { color: colors.textMuted, fontSize: 9 },
        splitArea: { areaStyle: { color: ['rgba(59,130,246,0.02)', 'rgba(59,130,246,0.06)'] } },
        splitLine: { lineStyle: { color: '#2a2d35' } },
        axisLine: { lineStyle: { color: '#2a2d35' } },
      },
      series: [{
        type: 'radar',
        data: [{ value: values.slice(0, 12), areaStyle: { color: 'rgba(59,130,246,0.25)' }, lineStyle: { color: colors.accent }, itemStyle: { color: colors.accent } }],
      }],
    };
  }

  // bar
  return {
    ...baseChartTheme,
    tooltip: { ...baseChartTheme.tooltip, trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: 10, right: 16, top: 16, bottom: 10, containLabel: true },
    xAxis: { type: 'category', data: labels, axisLabel: { color: colors.textMuted, fontSize: 10, rotate: labels.length > 6 ? 35 : 0 }, axisLine: { lineStyle: { color: '#2a2d35' } }, axisTick: { show: false } },
    yAxis: { type: 'value', splitLine: { lineStyle: { color: '#2a2d35' } }, axisLabel: { color: colors.textMuted } },
    series: [{
      type: 'bar',
      data: values.map((v, i) => ({ value: v, itemStyle: { color: chartColors[i % chartColors.length], borderRadius: [3, 3, 0, 0] } })),
      barMaxWidth: 32,
    }],
  };
}

function buildStackedOption(crossData) {
  if (!crossData?.data?.length) return { ...baseChartTheme, title: { text: 'No data', textStyle: { color: colors.textMuted }, left: 'center', top: 'center' } };
  const { columns, data } = crossData;
  return {
    ...baseChartTheme,
    tooltip: { ...baseChartTheme.tooltip, trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: { ...baseChartTheme.legend, data: columns },
    grid: { left: 10, right: 16, top: 30, bottom: 10, containLabel: true },
    xAxis: { type: 'category', data: data.map(d => d.name), axisLabel: { color: colors.textMuted, fontSize: 10, rotate: 25 }, axisLine: { lineStyle: { color: '#2a2d35' } } },
    yAxis: { type: 'value', splitLine: { lineStyle: { color: '#2a2d35' } }, axisLabel: { color: colors.textMuted } },
    series: columns.map((col, i) => ({
      name: col, type: 'bar', stack: 'total',
      data: data.map(d => d[col] || 0),
      itemStyle: { color: severityColors[col] || chartColors[i % chartColors.length] },
    })),
  };
}

function DynamicPanel({ defaultField, defaultChart, defaultMetric, title, span, height, uploadId }) {
  const [field, setField] = useState(defaultField);
  const [chart, setChart] = useState(defaultChart);
  const [metric, setMetric] = useState(defaultMetric || 'count');
  const [data, setData] = useState([]);

  const limit = (chart === 'pie' || chart === 'donut' || chart === 'radar') ? 8 : 15;

  const fetchData = useCallback(async () => {
    const params = { group_by: field, metric, limit, order: 'desc' };
    if (uploadId) params.upload_id = uploadId;
    try {
      const { data: res } = await api.get('/analytics/query', { params });
      setData(res);
    } catch {}
  }, [field, metric, limit, uploadId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <Panel title={title} span={span || 1} height={height || 280}
      controls={<>
        <FieldSelect value={field} onChange={setField} options={FIELD_OPTIONS} />
        <FieldSelect value={metric} onChange={setMetric} options={METRIC_OPTIONS} />
        <FieldSelect value={chart} onChange={setChart} options={CHART_TYPES} />
      </>}
    >
      <ReactECharts key={chart} option={buildChartOption(data, chart)} notMerge={true} style={{ height: '100%', width: '100%' }} opts={{ renderer: 'canvas' }} />
    </Panel>
  );
}

function CrossPanel({ defaultRow, defaultCol, title, span, height, uploadId }) {
  const [row, setRow] = useState(defaultRow);
  const [col, setCol] = useState(defaultCol);
  const [data, setData] = useState(null);

  const fetchData = useCallback(async () => {
    const params = { row, col, limit: 10 };
    if (uploadId) params.upload_id = uploadId;
    try {
      const { data: res } = await api.get('/analytics/cross', { params });
      setData(res);
    } catch {}
  }, [row, col, uploadId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <Panel title={title} span={span || 2} height={height || 300}
      controls={<>
        <span style={{ fontSize: 10, color: colors.textMuted }}>Row:</span>
        <FieldSelect value={row} onChange={setRow} options={FIELD_OPTIONS} />
        <span style={{ fontSize: 10, color: colors.textMuted }}>Col:</span>
        <FieldSelect value={col} onChange={setCol} options={FIELD_OPTIONS} />
      </>}
    >
      <ReactECharts option={buildStackedOption(data)} style={{ height: '100%', width: '100%' }} opts={{ renderer: 'canvas' }} />
    </Panel>
  );
}

export default function Dashboard() {
  const [uploads, setUploads] = useState([]);
  const [selectedUpload, setSelectedUpload] = useState('');
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [u, s] = await Promise.all([api.get('/uploads'), api.get('/analytics/summary')]);
        setUploads(u.data || []);
        setSummary(s.data);
      } catch {}
      setLoading(false);
    }
    load();
  }, []);

  useEffect(() => {
    async function loadSummary() {
      const params = selectedUpload ? { upload_id: selectedUpload } : {};
      try {
        const { data } = await api.get('/analytics/summary', { params });
        setSummary(data);
      } catch {}
    }
    if (!loading) loadSummary();
  }, [selectedUpload, loading]);

  if (loading) return <div style={{ padding: 40, color: colors.textMuted }}>Loading...</div>;

  if (!summary.total_reactions) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 24px' }}>
        <span className="material-icons-outlined" style={{ fontSize: 64, color: colors.panelBorder }}>analytics</span>
        <h2 style={{ marginTop: 16, color: colors.text }}>No Data Yet</h2>
        <p style={{ color: colors.textMuted, marginTop: 8 }}>Upload a drug reaction Excel file to see visualizations.</p>
      </div>
    );
  }

  const uid = selectedUpload || undefined;

  return (
    <div>
      <div style={styles.topBar}>
        <h1 style={styles.pageTitle}>Adverse Drug Reaction Dashboard</h1>
        <select value={selectedUpload} onChange={(e) => setSelectedUpload(e.target.value)} style={styles.uploadSelect}>
          <option value="">All Uploads</option>
          {uploads.map((u) => (
            <option key={u.id} value={u.id}>{u.filename} ({u.row_count} rows)</option>
          ))}
        </select>
      </div>

      <div style={styles.statGrid}>
        <StatPanel label="Total Reactions" value={summary.total_reactions} icon="science" color={colors.accent} />
        <StatPanel label="Unique Patients" value={summary.total_patients} icon="people" color={colors.cyan} />
        <StatPanel label="Serious Rate" value={`${(summary.serious_pct || 0).toFixed(1)}%`} icon="warning" color={colors.orange} subtext={`${summary.serious_count} serious`} />
        <StatPanel label="Fatal" value={summary.fatal_count} icon="dangerous" color={colors.red} />
        <StatPanel label="Hospitalized" value={summary.hospital_count} icon="local_hospital" color={colors.purple} />
        <StatPanel label="Avg Age" value={`${(summary.avg_age || 0).toFixed(0)} yrs`} icon="elderly" color={colors.green} />
        <StatPanel label="Avg Onset" value={`${(summary.avg_onset || 0).toFixed(1)} days`} icon="schedule" color={colors.pink} />
        <StatPanel label="Uploads" value={summary.total_uploads} icon="upload_file" color={colors.lime} />
      </div>

      <div style={styles.chartGrid}>
        <DynamicPanel title="Reactions Over Time" defaultField="month" defaultChart="area" span={2} uploadId={uid} />
        <DynamicPanel title="Top Drugs" defaultField="drug_name" defaultChart="hbar" span={2} uploadId={uid} />
        <DynamicPanel title="Severity" defaultField="reaction_severity" defaultChart="pie" uploadId={uid} />
        <DynamicPanel title="Outcomes" defaultField="outcome" defaultChart="donut" uploadId={uid} />
        <DynamicPanel title="Reaction Types" defaultField="reaction_type" defaultChart="bar" uploadId={uid} />
        <DynamicPanel title="Age Groups" defaultField="age_group" defaultChart="bar" uploadId={uid} />
        <DynamicPanel title="Gender" defaultField="patient_gender" defaultChart="pie" uploadId={uid} />
        <DynamicPanel title="Reporter" defaultField="reporter_type" defaultChart="donut" uploadId={uid} />
        <DynamicPanel title="Drug Class" defaultField="drug_class" defaultChart="bar" uploadId={uid} />
        <DynamicPanel title="Route" defaultField="route_of_admin" defaultChart="pie" uploadId={uid} />
        <DynamicPanel title="State" defaultField="facility_state" defaultChart="bar" uploadId={uid} />
        <DynamicPanel title="Onset Period" defaultField="onset_bucket" defaultChart="donut" uploadId={uid} />
        <CrossPanel title="Severity by Drug (Stacked)" defaultRow="drug_name" defaultCol="reaction_severity" uploadId={uid} />
        <CrossPanel title="Outcome by Drug Class" defaultRow="drug_class" defaultCol="outcome" uploadId={uid} />
      </div>
    </div>
  );
}

const styles = {
  topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 10 },
  pageTitle: { fontSize: 18, fontWeight: 700, color: colors.textBright },
  uploadSelect: { background: colors.panel, color: colors.text, border: `1px solid ${colors.panelBorder}`, borderRadius: 4, padding: '6px 12px', fontSize: 12, cursor: 'pointer', outline: 'none', minWidth: 220 },
  statGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 8, marginBottom: 14 },
  chartGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 },
};
