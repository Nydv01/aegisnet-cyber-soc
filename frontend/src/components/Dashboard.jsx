import { useState, useEffect } from 'react';
import SpotlightCard from './SpotlightCard';
import ScrollReveal from './ScrollReveal';
import AnimatedNumber from './AnimatedNumber';
import TextScramble from './TextScramble';
import ShinyText from './ShinyText';
import RadarScan from './RadarScan';
import WorldMap from './WorldMap';

const API = 'http://localhost:8000';

// ─── Circular Gauge Component ────────────────────────────────────
function Gauge({ value, max, label, color }) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(value / max, 1);
  const offset = circumference * (1 - pct);

  return (
    <div className="gauge-container">
      <svg className="gauge-svg" viewBox="0 0 100 100" style={{ color }}>
        <circle className="gauge-bg" cx="50" cy="50" r={radius} />
        <circle
          className="gauge-fill"
          cx="50" cy="50" r={radius}
          stroke="currentColor"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <span className="gauge-value" style={{ color }}>
        <AnimatedNumber value={value} />%
      </span>
      <span className="gauge-label">{label}</span>
    </div>
  );
}

// ─── Mini Line Chart ─────────────────────────────────────────────
function MiniChart({ data, color, height = 110 }) {
  if (data.length < 2) return null;

  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const w = 100;

  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = height - ((v - min) / range) * (height - 20) - 10;
    return `${x},${y}`;
  });

  const areaPoints = `0,${height} ${points.join(' ')} ${w},${height}`;

  return (
    <div className="chart-container" style={{ height }}>
      <svg viewBox={`0 0 ${w} ${height}`} preserveAspectRatio="none" style={{ color }}>
        {[0.25, 0.5, 0.75].map((pct) => (
          <line
            key={pct}
            x1="0" y1={height * pct} x2={w} y2={height * pct}
            className="chart-grid-line"
          />
        ))}
        <polygon points={areaPoints} fill="currentColor" className="chart-area" />
        <polyline points={points.join(' ')} stroke="currentColor" className="chart-line" />
      </svg>
    </div>
  );
}

export default function Dashboard({ telemetry, events }) {
  const [bandwidthHistory, setBandwidthHistory] = useState([]);
  const [latencyHistory, setLatencyHistory] = useState([]);
  const [modelMetrics, setModelMetrics] = useState(null);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [blocking, setBlocking] = useState(false);
  const [blockMessage, setBlockMessage] = useState('');

  // Sync bandwidth and latency telemetry
  useEffect(() => {
    if (!telemetry) return;
    setBandwidthHistory((prev) => [...prev.slice(-59), telemetry.bandwidth_in]);
    setLatencyHistory((prev) => [...prev.slice(-59), telemetry.latency_ms]);
  }, [telemetry]);

  // Load model validation metrics
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await fetch(`${API}/api/metrics`);
        if (res.ok) setModelMetrics(await res.json());
      } catch (e) { /* ignore */ }
    };
    fetchMetrics();
  }, []);

  const t = telemetry || {};
  const isAttackActive = t.attack_type && t.attack_type !== 'none';
  const healthColor = t.system_health > 70 ? '#10b981' : t.system_health > 40 ? '#f59e0b' : '#ef4444';

  const recentAlerts = (events || [])
    .filter((e) => e.severity === 'critical' || e.severity === 'alert' || e.severity === 'warning')
    .slice(0, 10);

  // Trigger manual firewall rules block
  const handleBlockIP = async (ip) => {
    if (!ip || ip === 'SYSTEM' || ip === 'AEGIS-AGENT') return;
    setBlocking(true);
    setBlockMessage('');
    try {
      const res = await fetch(`${API}/api/block-ip`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ip_address: ip }),
      });
      const data = await res.json();
      setBlockMessage(data.message || 'Block applied');
      setTimeout(() => {
        setSelectedAlert(null);
        setBlockMessage('');
      }, 2000);
    } catch (e) {
      setBlockMessage('Failed to apply firewall block');
    } finally {
      setBlocking(false);
    }
  };

  return (
    <div className="dashboard-wrapper">
      <ScrollReveal>
        <div className="page-header">
          <h1>
            <ShinyText>Security Operations Center</ShinyText>
          </h1>
          <p>
            <TextScramble delay={100}>Real-time cyber telemetry and neural network response streams</TextScramble>
          </p>
        </div>
      </ScrollReveal>

      {/* ── Bento Grid Layout ── */}
      <div className="bento-grid">
        
        {/* Cell 1: Geolocation Threat Map (Col Span 2, Row Span 2) */}
        <ScrollReveal delay={50} className="bento-cell col-span-2 row-span-2">
          <SpotlightCard style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div className="card-header">
              <h2>🌐 Global Threat Geolocation Map</h2>
              <span className={`card-badge ${isAttackActive ? 'badge-alert' : 'badge-live'}`}>
                {isAttackActive ? '🚨 ATTACK VECTOR ACTIVE' : '● MONITORING GLOBAL CHANNELS'}
              </span>
            </div>
            <WorldMap attackActive={isAttackActive} attackType={t.attack_type} />
            <div className="bento-stats-row">
              <span className="stat-label">Active Node Clusters:</span>
              <span className="stat-val">USA, Frankfurt, Tokyo, Mumbai, Sydney</span>
            </div>
          </SpotlightCard>
        </ScrollReveal>

        {/* Cell 2: Threat Vector Sonar (Col Span 1, Row Span 2) */}
        <ScrollReveal delay={100} className="bento-cell row-span-2">
          <SpotlightCard style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div className="card-header">
              <h2>📡 Radar Scanning Sonar</h2>
              <span className={`card-badge ${t.threat_level === 'safe' ? 'badge-info' : 'badge-alert'}`}>
                {t.threat_level || 'safe'}
              </span>
            </div>
            <RadarScan threatLevel={t.threat_level || 'safe'} />
            <div className="bento-stats-row">
              <span className="stat-label">Scan sweep:</span>
              <span className="stat-val">IDS & WAF signals</span>
            </div>
          </SpotlightCard>
        </ScrollReveal>

        {/* Cell 3: Resource Allocation & Health (Col Span 2) */}
        <ScrollReveal delay={150} className="bento-cell col-span-2">
          <SpotlightCard>
            <div className="card-header">
              <h2>⚙️ Host Resource Allocation & Health</h2>
              <span className="card-badge badge-live">● TELEMETRY DIALS</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 24, alignItems: 'center' }}>
              <div className="gauges-row" style={{ margin: 0, justifyContent: 'space-around' }}>
                <Gauge value={t.cpu_usage || 0} max={100} label="CPU Load" color="#3b82f6" />
                <Gauge value={t.ram_usage || 0} max={100} label="RAM Usage" color="#a855f7" />
              </div>
              <div style={{ borderLeft: '1px solid var(--glass-border)', paddingLeft: 24 }}>
                <div className="health-bar-container">
                  <div className="health-bar-track">
                    <div
                      className="health-bar-fill"
                      style={{
                        width: `${t.system_health || 100}%`,
                        background: `linear-gradient(90deg, ${healthColor}, ${healthColor}cc)`,
                        color: healthColor,
                      }}
                    />
                  </div>
                  <div className="health-bar-label">
                    <span>Host Integrity</span>
                    <span><AnimatedNumber value={t.system_health || 100} />%</span>
                  </div>
                </div>
              </div>
            </div>
          </SpotlightCard>
        </ScrollReveal>

        {/* Cell 4: Model Validation Metrics (Col Span 1) */}
        <ScrollReveal delay={200} className="bento-cell">
          <SpotlightCard style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div className="card-header">
              <h2>🧠 AI Model Validation</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div className="feature-item">
                <span className="feature-name">IDS RF Accuracy</span>
                <span className="feature-value">{(modelMetrics?.ids_metrics?.accuracy * 100 || 100).toFixed(0)}%</span>
              </div>
              <div className="feature-item">
                <span className="feature-name">Phishing Accuracy</span>
                <span className="feature-value">{(modelMetrics?.phishing_metrics?.accuracy * 100 || 100).toFixed(0)}%</span>
              </div>
            </div>
            <div className="bento-stats-row">
              <span className="stat-label">Classifier parameters:</span>
              <span className="stat-val">Scikit-Learn metrics</span>
            </div>
          </SpotlightCard>
        </ScrollReveal>

        {/* Cell 5: Bandwidth & Latency Analytics (Col Span 2) */}
        <ScrollReveal delay={250} className="bento-cell col-span-2">
          <SpotlightCard>
            <div className="card-header">
              <h2>📊 Analytics Performance Charts</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: 8 }}>
                  Bandwidth (Inbound: <AnimatedNumber value={t.bandwidth_in || 0} /> Mbps)
                </span>
                <MiniChart data={bandwidthHistory} color="#22d3ee" />
              </div>
              <div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: 8 }}>
                  Latency (Response: <AnimatedNumber value={t.latency_ms || 0} /> ms)
                </span>
                <MiniChart data={latencyHistory} color="#a855f7" />
              </div>
            </div>
          </SpotlightCard>
        </ScrollReveal>

        {/* Cell 6: Incident Logs Feed (Col Span 3) */}
        <ScrollReveal delay={300} className="bento-cell col-span-3">
          <SpotlightCard>
            <div className="card-header">
              <h2>🚨 Active Threat Indicators Feed</h2>
              <span className="card-badge badge-alert">{recentAlerts.length} Warnings</span>
            </div>
            {recentAlerts.length === 0 ? (
              <div className="empty-state" style={{ padding: '24px 0' }}>
                <div className="empty-icon">🟢</div>
                <h3>No Active Threat Signatures</h3>
                <p>System operational logs normal. Click logs inside the console switcher to verify ledger.</p>
              </div>
            ) : (
              <div className="alert-feed" style={{ maxHeight: '180px' }}>
                {recentAlerts.map((evt, i) => (
                  <div
                    key={i}
                    className={`alert-item severity-${evt.severity}`}
                    onClick={() => setSelectedAlert(evt)}
                    style={{ cursor: 'pointer' }}
                    title="Click to launch Triage action"
                  >
                    <span className="alert-time">
                      {evt.timestamp ? new Date(evt.timestamp).toLocaleTimeString() : '--'}
                    </span>
                    <div className="alert-content">
                      <div className="alert-message">{evt.message}</div>
                      <div className="alert-meta">
                        {evt.source_ip} → {evt.destination_ip} | {evt.event_type} (Click to Triage)
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SpotlightCard>
        </ScrollReveal>
      </div>

      {/* ── Incident Triage sliding drawer modal ── */}
      {selectedAlert && (
        <div className="triage-drawer-overlay">
          <div className="triage-drawer">
            <div className="triage-drawer-header">
              <h3>🚨 Incident Triage Drawer</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setSelectedAlert(null)}>
                ✖ Close
              </button>
            </div>
            <div className="triage-drawer-body">
              <div className="triage-step-indicator">
                <span className="step active">1. Triage</span>
                <span className="step active">2. Investigate</span>
                <span className="step">3. Respond</span>
              </div>

              <div className="triage-details">
                <div className="feature-item">
                  <span className="feature-name">Event ID</span>
                  <span className="feature-value">{selectedAlert.event_id}</span>
                </div>
                <div className="feature-item">
                  <span className="feature-name">Severity</span>
                  <span className="feature-value" style={{ color: '#ef4444', textTransform: 'uppercase' }}>{selectedAlert.severity}</span>
                </div>
                <div className="feature-item">
                  <span className="feature-name">Source Host IP</span>
                  <span className="feature-value" style={{ fontFamily: 'var(--font-mono)' }}>{selectedAlert.source_ip}</span>
                </div>
                <div className="feature-item">
                  <span className="feature-name">Destination IP</span>
                  <span className="feature-value" style={{ fontFamily: 'var(--font-mono)' }}>{selectedAlert.destination_ip}</span>
                </div>
                <div style={{ marginTop: 12, fontSize: '0.82rem', padding: '10px 14px', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius-xs)', border: '1px solid var(--glass-border)' }}>
                  <strong>Log Alert Description:</strong>
                  <p style={{ marginTop: 4, color: 'var(--text-secondary)' }}>{selectedAlert.message}</p>
                </div>
              </div>

              {blockMessage && (
                <div className="auth-alert success" style={{ marginTop: 14 }}>
                  <span>🛡️</span> {blockMessage}
                </div>
              )}

              <div className="triage-actions" style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 24 }}>
                <button
                  className="btn btn-danger"
                  onClick={() => handleBlockIP(selectedAlert.source_ip)}
                  disabled={blocking || selectedAlert.source_ip === 'SYSTEM' || selectedAlert.source_ip === 'AEGIS-AGENT'}
                  style={{ justifyContent: 'center' }}
                >
                  {blocking ? <span className="spinner" /> : '🛡️ Apply Firewall IP Block'}
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    // Deep link to phishing URL classifier scan
                    window.location.href = `/phishing?prefill_ip=${selectedAlert.source_ip}`;
                  }}
                  style={{ justifyContent: 'center' }}
                >
                  🔍 Deep Investigate Source Node
                </button>
                <button
                  className="btn btn-ghost"
                  onClick={() => setSelectedAlert(null)}
                  style={{ justifyContent: 'center' }}
                >
                  Dismiss Incident Alert
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
