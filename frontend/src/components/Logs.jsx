import { useState, useEffect, useCallback } from 'react';
import SpotlightCard from './SpotlightCard';
import ScrollReveal from './ScrollReveal';
import AnimatedNumber from './AnimatedNumber';
import TextScramble from './TextScramble';
import ShinyText from './ShinyText';

const API = 'http://localhost:8000';

export default function Logs() {
  const [logs, setLogs] = useState([]);
  const [severity, setSeverity] = useState('');
  const [eventType, setEventType] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [sortKey, setSortKey] = useState('timestamp');
  const [sortDir, setSortDir] = useState('desc');
  const [expandedRow, setExpandedRow] = useState(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: '100' });
      if (severity) params.set('severity', severity);
      if (eventType) params.set('event_type', eventType);

      const res = await fetch(`${API}/api/logs?${params}`);
      if (res.ok) {
        setLogs(await res.json());
      }
    } catch (e) {
      console.error('Failed to fetch logs:', e);
    }
    setLoading(false);
  }, [severity, eventType]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(fetchLogs, 2000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchLogs]);

  // Filter by search text
  const filtered = logs.filter((log) => {
    if (!search) return true;
    const term = search.toLowerCase();
    return (
      log.message?.toLowerCase().includes(term) ||
      log.source_ip?.toLowerCase().includes(term) ||
      log.destination_ip?.toLowerCase().includes(term) ||
      log.event_type?.toLowerCase().includes(term) ||
      log.event_id?.toLowerCase?.().includes(term)
    );
  });

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    let av = a[sortKey] || '';
    let bv = b[sortKey] || '';
    if (sortKey === 'timestamp') {
      av = new Date(av).getTime() || 0;
      bv = new Date(bv).getTime() || 0;
    } else if (typeof av === 'string') {
      av = av.toLowerCase();
      bv = bv.toLowerCase();
    }
    if (av < bv) return sortDir === 'asc' ? -1 : 1;
    if (av > bv) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const sortClass = (key) => {
    if (sortKey !== key) return 'sortable';
    return `sortable ${sortDir}`;
  };

  // Export logs as CSV
  const exportCSV = () => {
    const headers = ['timestamp', 'event_id', 'severity', 'event_type', 'source_ip', 'destination_ip', 'message'];
    const rows = sorted.map(l => headers.map(h => `"${(l[h] || '').toString().replace(/"/g, '""')}"`).join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aegisnet_logs_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export as JSON
  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(sorted, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aegisnet_logs_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const severityCounts = {
    critical: logs.filter((l) => l.severity === 'critical').length,
    alert: logs.filter((l) => l.severity === 'alert').length,
    warning: logs.filter((l) => l.severity === 'warning').length,
    info: logs.filter((l) => l.severity === 'info').length,
  };

  // Severity distribution donut
  const total = logs.length || 1;
  const donutData = [
    { label: 'Critical', count: severityCounts.critical, color: '#ef4444' },
    { label: 'Alert', count: severityCounts.alert, color: '#f59e0b' },
    { label: 'Warning', count: severityCounts.warning, color: '#fb923c' },
    { label: 'Info', count: severityCounts.info, color: '#3b82f6' },
  ];

  // SVG donut
  const donutRadius = 58;
  const donutCircumference = 2 * Math.PI * donutRadius;
  let donutOffset = 0;

  return (
    <div>
      <ScrollReveal>
        <div className="page-header">
          <h1>
            <ShinyText>📋 Security Ledger</ShinyText>
          </h1>
          <p>
            <TextScramble delay={100}>Inspect firewall activity, packet alerts, and machine learning engine reports in real-time</TextScramble>
          </p>
        </div>
      </ScrollReveal>

      {/* ── Severity Summary + Donut ── */}
      <ScrollReveal delay={50}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 20, marginBottom: 20 }}>
          <div className="stats-grid">
            <SpotlightCard className="stat-card glass-card">
              <div className="stat-icon red">🔴</div>
              <div className="stat-info">
                <h3>Critical</h3>
                <div className="stat-value" style={{ color: '#ef4444' }}>
                  <AnimatedNumber value={severityCounts.critical} />
                </div>
              </div>
            </SpotlightCard>
            <SpotlightCard className="stat-card glass-card">
              <div className="stat-icon orange">🟠</div>
              <div className="stat-info">
                <h3>Alert</h3>
                <div className="stat-value" style={{ color: '#f59e0b' }}>
                  <AnimatedNumber value={severityCounts.alert} />
                </div>
              </div>
            </SpotlightCard>
            <SpotlightCard className="stat-card glass-card">
              <div className="stat-icon orange">🟡</div>
              <div className="stat-info">
                <h3>Warning</h3>
                <div className="stat-value" style={{ color: '#fb923c' }}>
                  <AnimatedNumber value={severityCounts.warning} />
                </div>
              </div>
            </SpotlightCard>
            <SpotlightCard className="stat-card glass-card">
              <div className="stat-icon blue">🔵</div>
              <div className="stat-info">
                <h3>Info</h3>
                <div className="stat-value" style={{ color: '#3b82f6' }}>
                  <AnimatedNumber value={severityCounts.info} />
                </div>
              </div>
            </SpotlightCard>
          </div>

          {/* Donut Chart */}
          <SpotlightCard style={{ width: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="donut-chart-container">
              <svg viewBox="0 0 140 140">
                {donutData.map((d, i) => {
                  const fraction = d.count / total;
                  const dashLen = fraction * donutCircumference;
                  const dashGap = donutCircumference - dashLen;
                  const currentOffset = donutOffset;
                  donutOffset += dashLen;

                  return (
                    <circle
                      key={i}
                      cx="70" cy="70" r={donutRadius}
                      fill="none"
                      stroke={d.color}
                      strokeWidth="12"
                      strokeDasharray={`${dashLen} ${dashGap}`}
                      strokeDashoffset={-currentOffset}
                      style={{ transition: 'stroke-dasharray 0.5s ease, stroke-dashoffset 0.5s ease' }}
                    />
                  );
                })}
                <circle cx="70" cy="70" r="44" fill="rgba(6, 11, 24, 0.8)" />
              </svg>
              <div className="donut-center-label">
                <div className="donut-value">{logs.length}</div>
                <div className="donut-label">Events</div>
              </div>
            </div>
          </SpotlightCard>
        </div>
      </ScrollReveal>

      {/* ── Filters ── */}
      <ScrollReveal delay={100}>
        <SpotlightCard style={{ marginBottom: 20 }}>
          <div className="filter-bar">
            <input
              type="text"
              className="text-input"
              placeholder="🔍 Search ledger events..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ maxWidth: 300 }}
              id="log-search"
            />

            <select
              className="select-input"
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
              id="severity-filter"
            >
              <option value="">All Severities</option>
              <option value="critical">Critical</option>
              <option value="alert">Alert</option>
              <option value="warning">Warning</option>
              <option value="info">Info</option>
            </select>

            <select
              className="select-input"
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              id="type-filter"
            >
              <option value="">All Types</option>
              <option value="attack">Attack</option>
              <option value="defense">Defense</option>
              <option value="system">System</option>
              <option value="traffic">Traffic</option>
            </select>

            <div className="toggle-container">
              <div
                className={`toggle-switch ${autoRefresh ? 'active' : ''}`}
                onClick={() => setAutoRefresh(!autoRefresh)}
                role="switch"
                aria-checked={autoRefresh}
                id="auto-refresh-toggle"
              />
              <span className="toggle-label">Live</span>
              {autoRefresh && (
                <span className="live-badge" style={{ marginLeft: 4 }}>
                  <span className="live-dot" />
                  LIVE
                </span>
              )}
            </div>

            <div className="export-btn-group" style={{ marginLeft: 'auto' }}>
              <button className="btn btn-ghost btn-sm" onClick={exportCSV} title="Export CSV">
                📄 CSV
              </button>
              <button className="btn btn-ghost btn-sm" onClick={exportJSON} title="Export JSON">
                📋 JSON
              </button>
            </div>

            <button className="btn btn-ghost btn-sm" onClick={fetchLogs} disabled={loading}>
              {loading ? <span className="spinner" /> : '🔄'}
            </button>

            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              {sorted.length}/{logs.length}
            </span>
          </div>
        </SpotlightCard>
      </ScrollReveal>

      {/* ── Log Table ── */}
      <ScrollReveal delay={150}>
        <SpotlightCard style={{ overflow: 'auto', maxHeight: '65vh' }}>
          {sorted.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <h3>No Ledger Records</h3>
              <p>
                {search ? 'Try adjusting your search filters' : 'Security events will be logged here in real-time'}
              </p>
            </div>
          ) : (
            <table className="log-table">
              <thead>
                <tr>
                  <th className={sortClass('timestamp')} onClick={() => handleSort('timestamp')}>Time</th>
                  <th className={sortClass('event_id')} onClick={() => handleSort('event_id')}>ID</th>
                  <th className={sortClass('severity')} onClick={() => handleSort('severity')}>Severity</th>
                  <th className={sortClass('event_type')} onClick={() => handleSort('event_type')}>Type</th>
                  <th className={sortClass('source_ip')} onClick={() => handleSort('source_ip')}>Source</th>
                  <th>Dest</th>
                  <th>Message</th>
                  <th style={{ width: 30 }}></th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((log, i) => (
                  <>
                    <tr
                      key={`row-${i}`}
                      onClick={() => setExpandedRow(expandedRow === i ? null : i)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', whiteSpace: 'nowrap' }}>
                        {log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : '--'}
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {log.event_id}
                      </td>
                      <td>
                        <span className={`severity-badge ${log.severity}`}>
                          {log.severity}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.75rem', textTransform: 'capitalize' }}>
                        {log.event_type === 'attack' && '⚔️ '}
                        {log.event_type === 'defense' && '🛡️ '}
                        {log.event_type === 'system' && '⚙️ '}
                        {log.event_type === 'traffic' && '📡 '}
                        {log.event_type}
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem' }}>
                        {log.source_ip}
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem' }}>
                        {log.destination_ip}
                      </td>
                      <td style={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.78rem' }}>
                        {log.message}
                      </td>
                      <td style={{ textAlign: 'center', fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                        {expandedRow === i ? '▲' : '▼'}
                      </td>
                    </tr>

                    {/* Expanded detail row */}
                    {expandedRow === i && (
                      <tr key={`detail-${i}`} className="log-expand-row">
                        <td colSpan={8}>
                          <div className="log-expand-content">
                            <div className="log-detail-grid">
                              <div>
                                <div style={{ fontSize: '0.6rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Event ID</div>
                                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}>{log.event_id}</div>
                              </div>
                              <div>
                                <div style={{ fontSize: '0.6rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Timestamp</div>
                                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}>
                                  {log.timestamp ? new Date(log.timestamp).toLocaleString() : '—'}
                                </div>
                              </div>
                              <div>
                                <div style={{ fontSize: '0.6rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Source IP</div>
                                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--neon-cyan)' }}>{log.source_ip}</div>
                              </div>
                              <div>
                                <div style={{ fontSize: '0.6rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Destination IP</div>
                                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--neon-cyan)' }}>{log.destination_ip}</div>
                              </div>
                              <div style={{ gridColumn: 'span 2' }}>
                                <div style={{ fontSize: '0.6rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Full Message</div>
                                <div style={{ fontSize: '0.82rem', lineHeight: 1.5 }}>{log.message}</div>
                              </div>
                              {log.details && (
                                <div style={{ gridColumn: 'span 2' }}>
                                  <div style={{ fontSize: '0.6rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Details</div>
                                  <pre style={{
                                    fontSize: '0.72rem',
                                    fontFamily: 'var(--font-mono)',
                                    background: 'rgba(6,11,24,0.5)',
                                    padding: 10,
                                    borderRadius: 'var(--radius-xs)',
                                    overflow: 'auto',
                                    maxHeight: 120,
                                    color: 'var(--text-secondary)',
                                  }}>
                                    {JSON.stringify(log.details, null, 2)}
                                  </pre>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          )}
        </SpotlightCard>
      </ScrollReveal>
    </div>
  );
}
