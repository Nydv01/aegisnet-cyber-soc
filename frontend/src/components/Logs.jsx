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
      log.event_type?.toLowerCase().includes(term)
    );
  });

  const severityCounts = {
    critical: logs.filter((l) => l.severity === 'critical').length,
    alert: logs.filter((l) => l.severity === 'alert').length,
    warning: logs.filter((l) => l.severity === 'warning').length,
    info: logs.filter((l) => l.severity === 'info').length,
  };

  return (
    <div>
      <ScrollReveal>
        <div className="page-header">
          <h1>
            <ShinyText>Security Ledger</ShinyText>
          </h1>
          <p>
            <TextScramble delay={100}>Inspect firewall activity, packet alerts, and machine learning engine reports</TextScramble>
          </p>
        </div>
      </ScrollReveal>

      {/* ── Severity Summary ── */}
      <div className="stats-grid" style={{ marginBottom: 20 }}>
        <ScrollReveal delay={50}>
          <SpotlightCard stat-card="true">
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div className="stat-icon red">🔴</div>
              <div className="stat-info">
                <h3>Critical</h3>
                <div className="stat-value" style={{ color: '#ef4444' }}>
                  <AnimatedNumber value={severityCounts.critical} />
                </div>
              </div>
            </div>
          </SpotlightCard>
        </ScrollReveal>

        <ScrollReveal delay={100}>
          <SpotlightCard stat-card="true">
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div className="stat-icon orange">🟠</div>
              <div className="stat-info">
                <h3>Alert</h3>
                <div className="stat-value" style={{ color: '#f59e0b' }}>
                  <AnimatedNumber value={severityCounts.alert} />
                </div>
              </div>
            </div>
          </SpotlightCard>
        </ScrollReveal>

        <ScrollReveal delay={150}>
          <SpotlightCard stat-card="true">
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div className="stat-icon orange">🟡</div>
              <div className="stat-info">
                <h3>Warning</h3>
                <div className="stat-value" style={{ color: '#f59e0b' }}>
                  <AnimatedNumber value={severityCounts.warning} />
                </div>
              </div>
            </div>
          </SpotlightCard>
        </ScrollReveal>

        <ScrollReveal delay={200}>
          <SpotlightCard stat-card="true">
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div className="stat-icon blue">🔵</div>
              <div className="stat-info">
                <h3>Info</h3>
                <div className="stat-value" style={{ color: '#3b82f6' }}>
                  <AnimatedNumber value={severityCounts.info} />
                </div>
              </div>
            </div>
          </SpotlightCard>
        </ScrollReveal>
      </div>

      {/* ── Filters ── */}
      <ScrollReveal delay={250}>
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
              <span className="toggle-label">Auto-refresh</span>
            </div>

            <button className="btn btn-ghost btn-sm" onClick={fetchLogs} disabled={loading}>
              {loading ? <span className="spinner" /> : '🔄 Refresh'}
            </button>

            <span style={{ marginLeft: 'auto', fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              {filtered.length} / {logs.length} events
            </span>
          </div>
        </SpotlightCard>
      </ScrollReveal>

      {/* ── Log Table ── */}
      <ScrollReveal delay={300}>
        <SpotlightCard style={{ overflow: 'auto', maxHeight: '60vh' }}>
          {filtered.length === 0 ? (
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
                  <th>Time</th>
                  <th>ID</th>
                  <th>Severity</th>
                  <th>Type</th>
                  <th>Source</th>
                  <th>Destination</th>
                  <th>Message</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((log, i) => (
                  <tr key={i}>
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
                    <td style={{ fontSize: '0.75rem', textTransform: 'capitalize' }}>{log.event_type}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem' }}>
                      {log.source_ip}
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem' }}>
                      {log.destination_ip}
                    </td>
                    <td style={{ maxWidth: 350, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {log.message}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </SpotlightCard>
      </ScrollReveal>
    </div>
  );
}
