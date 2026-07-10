import { useState, useEffect } from 'react';
import SpotlightCard from './SpotlightCard';
import ScrollReveal from './ScrollReveal';
import AnimatedNumber from './AnimatedNumber';
import TextScramble from './TextScramble';
import ShinyText from './ShinyText';
import { AnimatedBorderCard, TerminalTextStream, CyberButton } from './ui/cyber-effects';

const API = 'http://localhost:8000';

/**
 * URL Token Heatmap — color-codes each token of a URL by threat contribution.
 */
function URLTokenHeatmap({ url, isPhishing, features }) {
  if (!url) return null;

  // Split URL into meaningful tokens
  const tokens = [];
  let current = '';
  for (const char of url) {
    if (['/', '.', '?', '&', '=', '-', '_', '@', ':'].includes(char)) {
      if (current) tokens.push({ text: current, type: 'word' });
      tokens.push({ text: char, type: 'delimiter' });
      current = '';
    } else {
      current += char;
    }
  }
  if (current) tokens.push({ text: current, type: 'word' });

  // Assign threat intensity to tokens
  const suspiciousPatterns = /login|secure|verify|update|account|paypal|bank|password|admin|confirm|signin|alert|click|free|prize|won|suspend/i;
  const ipPattern = /^\d{1,3}$/;

  return (
    <div className="url-token-heatmap">
      {tokens.map((token, i) => {
        let intensity = 0;
        if (token.type === 'word') {
          if (suspiciousPatterns.test(token.text)) intensity = 0.8;
          else if (ipPattern.test(token.text)) intensity = 0.5;
          else if (token.text.length > 15) intensity = 0.3;
        }

        const bg = isPhishing
          ? `rgba(239, 68, 68, ${intensity * 0.5})`
          : intensity > 0.5
            ? `rgba(245, 158, 11, ${intensity * 0.3})`
            : 'transparent';

        return (
          <span
            key={i}
            className="url-token"
            style={{
              background: bg,
              color: intensity > 0.5 ? (isPhishing ? 'var(--neon-red-bright)' : 'var(--neon-orange)') : 'var(--text-secondary)',
              fontWeight: intensity > 0.5 ? 700 : 400,
            }}
            title={intensity > 0.3 ? `Suspicious token: ${token.text}` : token.text}
          >
            {token.text}
          </span>
        );
      })}
    </div>
  );
}

/**
 * Scanning animation overlay
 */
function ScanAnimation() {
  return (
    <div className="scan-animation-container">
      <div className="scan-pulse-ring">
        <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '1.5rem' }}>
          🔍
        </span>
      </div>
      <div className="scan-label">Analyzing URL structure...</div>
    </div>
  );
}

export default function Phishing() {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState(null);
  const [batchMode, setBatchMode] = useState(false);
  const [batchUrls, setBatchUrls] = useState('');
  const [batchResults, setBatchResults] = useState([]);
  const [batchLoading, setBatchLoading] = useState(false);

  // Check URL query parameters for prefill IP (Deep Link from Triage Drawer)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const prefill = params.get('prefill_ip');
    if (prefill) {
      setUrl(`http://${prefill}/secure-verify/login.php`);
    }
  }, []);

  // Load scan history
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch(`${API}/api/scan-history?limit=15`);
      if (res.ok) setHistory(await res.json());
    } catch (e) { /* ignore */ }
  };

  const scanUrl = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(`${API}/api/scan-url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || 'Scan failed');
      }

      const data = await res.json();
      setResult(data);
      fetchHistory();
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  const scanBatch = async () => {
    const urls = batchUrls.split('\n').map(u => u.trim()).filter(Boolean);
    if (urls.length === 0) return;
    setBatchLoading(true);
    setBatchResults([]);

    const results = [];
    for (const u of urls) {
      try {
        const res = await fetch(`${API}/api/scan-url`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: u }),
        });
        if (res.ok) {
          results.push(await res.json());
        } else {
          results.push({ url: u, error: true, label: 'Error' });
        }
      } catch (e) {
        results.push({ url: u, error: true, label: 'Error' });
      }
    }
    setBatchResults(results);
    setBatchLoading(false);
    fetchHistory();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') scanUrl();
  };

  // Threat score gauge parameters
  const threatScore = result?.threat_score || 0;
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - threatScore);
  const gaugeColor = threatScore > 0.7 ? '#ef4444' : threatScore > 0.4 ? '#f59e0b' : '#10b981';

  // Normalize feature values for visual weights visualization
  const features = result?.feature_analysis || {};
  const maxFeatureVal = Math.max(...Object.values(features).map(v => typeof v === 'number' ? v : 1), 1);

  // Stats from history
  const totalScans = history.length;
  const phishingCount = history.filter(h => h.is_phishing).length;
  const safeCount = totalScans - phishingCount;
  const detectionRate = totalScans > 0 ? ((phishingCount / totalScans) * 100).toFixed(0) : 0;

  return (
    <div>
      <ScrollReveal>
        <div className="page-header">
          <h1>
            🔍 <TerminalTextStream text="Phishing URL Classifier" speed={40} />
          </h1>
          <p>
            <TextScramble delay={200}>Multi-feature lexical token modeling using TF-IDF + 18 hand-crafted features via trained Logistic Regression</TextScramble>
          </p>
        </div>
      </ScrollReveal>

      {/* ── Stats Row ── */}
      {totalScans > 0 && (
        <ScrollReveal delay={30}>
          <div className="stats-grid" style={{ marginBottom: 20 }}>
            <SpotlightCard className="stat-card glass-card">
              <div className="stat-icon cyan">🔍</div>
              <div className="stat-info">
                <h3>Total Scans</h3>
                <div className="stat-value"><AnimatedNumber value={totalScans} /></div>
              </div>
            </SpotlightCard>
            <SpotlightCard className="stat-card glass-card">
              <div className="stat-icon red">🚫</div>
              <div className="stat-info">
                <h3>Phishing Detected</h3>
                <div className="stat-value" style={{ color: 'var(--neon-red)' }}><AnimatedNumber value={phishingCount} /></div>
              </div>
            </SpotlightCard>
            <SpotlightCard className="stat-card glass-card">
              <div className="stat-icon green">✅</div>
              <div className="stat-info">
                <h3>Safe URLs</h3>
                <div className="stat-value" style={{ color: 'var(--neon-green)' }}><AnimatedNumber value={safeCount} /></div>
              </div>
            </SpotlightCard>
            <SpotlightCard className="stat-card glass-card">
              <div className="stat-icon orange">📊</div>
              <div className="stat-info">
                <h3>Threat Rate</h3>
                <div className="stat-value" style={{ color: 'var(--neon-orange)' }}>{detectionRate}%</div>
              </div>
            </SpotlightCard>
          </div>
        </ScrollReveal>
      )}

      {/* ── URL Input ── */}
      <ScrollReveal delay={50}>
        <AnimatedBorderCard style={{ marginBottom: 20 }}>
          <div style={{ padding: 20 }}>
            <div className="card-header">
              <h2>🌐 Analyze Web Address</h2>
              <CyberButton
                variant="primary"
                onClick={() => setBatchMode(!batchMode)}
              >
                {batchMode ? '📝 Single Scan' : '📋 Batch Scan'}
              </CyberButton>
            </div>

            {!batchMode ? (
              <>
                <div className="input-group">
                  <input
                    type="text"
                    className="text-input"
                    placeholder="Enter URL to inspect (e.g., http://secure-login-paypal.xyz/verify)"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyDown={handleKeyDown}
                    id="url-input"
                  />
                  <CyberButton
                    variant="primary"
                    onClick={scanUrl}
                    disabled={loading || !url.trim()}
                    id="scan-btn"
                  >
                    {loading ? <span className="spinner" /> : '🔍 Analyze'}
                  </CyberButton>
                </div>

                {/* Quick test URLs */}
                <div style={{ marginTop: 14, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', alignSelf: 'center', fontWeight: 600 }}>
                    TEST CASES:
                  </span>
                  {[
                    'https://google.com/search?q=test',
                    'http://secure-login-paypal.xyz/verify',
                    'https://github.com/features',
                    'http://192.168.1.1/admin/login.php',
                    'http://amaz0n-secure.club/update/verify',
                  ].map((testUrl) => (
                    <button
                      key={testUrl}
                      className="btn btn-ghost btn-sm"
                      onClick={() => { setUrl(testUrl); setResult(null); }}
                      style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem' }}
                    >
                      {testUrl.length > 35 ? testUrl.substring(0, 35) + '...' : testUrl}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              /* Batch mode */
              <>
                <textarea
                  className="batch-scan-textarea"
                  placeholder="Enter one URL per line..."
                  value={batchUrls}
                  onChange={(e) => setBatchUrls(e.target.value)}
                  rows={6}
                />
                <div style={{ marginTop: 12, display: 'flex', gap: 10, alignItems: 'center' }}>
                  <CyberButton
                    variant="primary"
                    onClick={scanBatch}
                    disabled={batchLoading || !batchUrls.trim()}
                  >
                    {batchLoading ? <span className="spinner" /> : `🔍 Scan ${batchUrls.split('\n').filter(Boolean).length} URLs`}
                  </CyberButton>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    One URL per line
                  </span>
                </div>
              </>
            )}
          </div>
        </AnimatedBorderCard>
      </ScrollReveal>

      {/* ── Scanning Animation ── */}
      {loading && (
        <ScrollReveal>
          <SpotlightCard style={{ marginBottom: 20 }}>
            <ScanAnimation />
          </SpotlightCard>
        </ScrollReveal>
      )}

      {/* ── Error ── */}
      {error && (
        <ScrollReveal>
          <SpotlightCard style={{ marginBottom: 20, borderColor: 'rgba(239, 68, 68, 0.3)' }}>
            <div style={{ color: 'var(--accent-red)', display: 'flex', gap: 8, alignItems: 'center' }}>
              <span>❌</span>
              <span>{error}</span>
            </div>
          </SpotlightCard>
        </ScrollReveal>
      )}

      {/* ── Batch Results ── */}
      {batchResults.length > 0 && (
        <ScrollReveal>
          <SpotlightCard style={{ marginBottom: 20 }}>
            <div className="card-header">
              <h2>📋 Batch Scan Results</h2>
              <span className="card-badge badge-info">{batchResults.length} scanned</span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="log-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>URL</th>
                    <th>Verdict</th>
                    <th>Confidence</th>
                    <th>Threat Score</th>
                  </tr>
                </thead>
                <tbody>
                  {batchResults.map((r, i) => (
                    <tr key={i}>
                      <td>{i + 1}</td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {r.url}
                      </td>
                      <td>
                        {r.error ? (
                          <span className="card-badge badge-info">Error</span>
                        ) : (
                          <span className={`card-badge ${r.is_phishing ? 'badge-alert' : 'badge-live'}`}>
                            {r.is_phishing ? '🚫 Phishing' : '✅ Safe'}
                          </span>
                        )}
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)' }}>
                        {r.confidence ? `${(r.confidence * 100).toFixed(1)}%` : '—'}
                      </td>
                      <td>
                        {r.threat_score != null && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <div className="health-bar-track" style={{ width: 60, height: 6 }}>
                              <div className="health-bar-fill" style={{
                                width: `${r.threat_score * 100}%`,
                                background: r.threat_score > 0.7 ? 'var(--neon-red)' : r.threat_score > 0.4 ? 'var(--neon-orange)' : 'var(--neon-green)',
                              }} />
                            </div>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                              {(r.threat_score * 100).toFixed(0)}%
                            </span>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SpotlightCard>
        </ScrollReveal>
      )}

      {/* ── Scan Result ── */}
      {result && !loading && (
        <ScrollReveal>
          <AnimatedBorderCard className={`scan-result ${result.is_phishing ? 'danger' : 'safe'}`}>
            <div style={{ padding: 20 }}>
              <div className="dashboard-grid" style={{ gridTemplateColumns: '1.4fr 1fr' }}>
                {/* Verdict */}
                <div>
                  <div className="scan-verdict">
                    <div className={`verdict-icon ${result.is_phishing ? 'danger' : 'safe'}`} style={{ color: gaugeColor }}>
                      {result.is_phishing ? '🚫' : '✅'}
                    </div>
                    <div className="verdict-text">
                      <h3 style={{ color: result.is_phishing ? '#ef4444' : '#10b981' }}>
                        <TextScramble scrambleChars="01">{result.label}</TextScramble>
                      </h3>
                      <p>Model Confidence: {(result.confidence * 100).toFixed(1)}%</p>
                    </div>
                  </div>

                  {/* URL with token heatmap */}
                  <URLTokenHeatmap url={result.url} isPhishing={result.is_phishing} features={features} />
                </div>

                {/* Threat Score Gauge */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <div className="threat-score-circle" style={{ color: gaugeColor }}>
                    <svg viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)' }}>
                      <circle cx="60" cy="60" r={radius} fill="none" stroke="var(--bg-tertiary)" strokeWidth="8" />
                      <circle
                        cx="60" cy="60" r={radius}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        style={{ transition: 'stroke-dashoffset 0.8s ease', filter: `drop-shadow(0 0 8px ${gaugeColor})` }}
                      />
                    </svg>
                  </div>
                  <div style={{ textAlign: 'center', marginTop: -20 }}>
                    <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: gaugeColor }}>
                      <AnimatedNumber value={threatScore * 100} />%
                    </div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>
                      Threat Score
                    </div>
                  </div>
                </div>
              </div>

              {/* Feature Weight Visualizations */}
              <div style={{ marginTop: 24, borderTop: '1px solid var(--glass-border)', paddingTop: 20 }}>
                <h3 style={{ fontSize: '0.82rem', fontWeight: 700, marginBottom: 16, letterSpacing: '0.02em' }}>
                  📊 Lexical Feature Weight Analysis
                </h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {Object.entries(features).map(([key, value]) => {
                    const numVal = typeof value === 'number' ? value : 0;
                    const barWidth = `${Math.min(100, Math.max(4, (numVal / maxFeatureVal) * 100))}%`;

                    return (
                      <div key={key} className="feature-importance-bar">
                        <div className="fi-bar-label" style={{ minWidth: 140, textTransform: 'capitalize' }}>
                          {key.replace(/_/g, ' ')}
                        </div>
                        <div className="fi-bar-track">
                          <div
                            className="fi-bar-fill"
                            style={{
                              width: barWidth,
                              background: result.is_phishing 
                                ? 'linear-gradient(90deg, rgba(239,68,68,0.6), var(--neon-red))' 
                                : 'linear-gradient(90deg, #ffffff, #a1a1aa)',
                              boxShadow: result.is_phishing 
                                ? '0 0 8px rgba(239, 68, 68, 0.3)' 
                                : '0 0 8px rgba(255, 255, 255, 0.2)',
                            }}
                          />
                        </div>
                        <div className="fi-bar-value">
                          {numVal.toFixed(2)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Classification details */}
              {result.classification_details && (
                <div style={{ marginTop: 20, borderTop: '1px solid var(--glass-border)', paddingTop: 16 }}>
                  <h3 style={{ fontSize: '0.78rem', fontWeight: 700, marginBottom: 12 }}>🔬 Classification Details</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
                    {Object.entries(result.classification_details).map(([key, val]) => (
                      <div key={key} style={{ padding: 10, background: 'rgba(15,23,42,0.3)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--glass-border)' }}>
                        <div style={{ fontSize: '0.6rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                          {key.replace(/_/g, ' ')}
                        </div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', marginTop: 4 }}>
                          {typeof val === 'number' ? val.toFixed(4) : String(val)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </AnimatedBorderCard>
        </ScrollReveal>
      )}

      {/* ── Scan History ── */}
      <ScrollReveal delay={100}>
        <AnimatedBorderCard style={{ marginTop: 20 }}>
          <div style={{ padding: 20 }}>
            <div className="card-header">
              <h2>📜 Inspection Registry</h2>
              <span className="card-badge badge-info">{history.length} Inspected</span>
            </div>

            {history.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🔍</div>
                <h3>No URL History</h3>
                <p>Type a URL address above and click inspect to log results in the registry</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="log-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>URL</th>
                      <th>Verdict</th>
                      <th>Confidence</th>
                      <th>Threat</th>
                      <th>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((item) => (
                      <tr key={item.id} onClick={() => { setUrl(item.url); setResult(null); }} style={{ cursor: 'pointer' }}>
                        <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                          #{item.id}
                        </td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.url}
                        </td>
                        <td>
                          <span className={`card-badge ${item.is_phishing ? 'badge-alert' : 'badge-live'}`}>
                            {item.is_phishing ? '🚫 Phishing' : '✅ Safe'}
                          </span>
                        </td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                          {(item.confidence * 100).toFixed(1)}%
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <div className="health-bar-track" style={{ width: 50, height: 5 }}>
                              <div className="health-bar-fill" style={{
                                width: `${(item.threat_score || 0) * 100}%`,
                                background: (item.threat_score || 0) > 0.7 ? 'var(--neon-red)' : (item.threat_score || 0) > 0.4 ? 'var(--neon-orange)' : 'var(--neon-green)',
                              }} />
                            </div>
                          </div>
                        </td>
                        <td style={{ fontSize: '0.68rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                          {item.scanned_at ? new Date(item.scanned_at).toLocaleTimeString() : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </AnimatedBorderCard>
      </ScrollReveal>
    </div>
  );
}
