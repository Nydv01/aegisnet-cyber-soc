import { useState, useEffect } from 'react';
import SpotlightCard from './SpotlightCard';
import ScrollReveal from './ScrollReveal';
import AnimatedNumber from './AnimatedNumber';
import TextScramble from './TextScramble';
import ShinyText from './ShinyText';

const API = 'http://localhost:8000';

export default function Phishing() {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState(null);

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
      const res = await fetch(`${API}/api/scan-history?limit=10`);
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
      fetchHistory(); // refresh history
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
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

  return (
    <div>
      <ScrollReveal>
        <div className="page-header">
          <h1>
            <ShinyText>Phishing URL Classifier</ShinyText>
          </h1>
          <p>
            <TextScramble delay={100}>Multi-feature lexical token modeling using trained Logistic Regression classifiers</TextScramble>
          </p>
        </div>
      </ScrollReveal>

      {/* ── URL Input ── */}
      <ScrollReveal delay={50}>
        <SpotlightCard style={{ marginBottom: 24 }}>
          <div className="card-header">
            <h2>🌐 Analyze Web Address</h2>
          </div>
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
            <button
              className="btn btn-primary"
              onClick={scanUrl}
              disabled={loading || !url.trim()}
              id="scan-btn"
            >
              {loading ? <span className="spinner" /> : '🔍 Analyze'}
            </button>
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
        </SpotlightCard>
      </ScrollReveal>

      {/* ── Error ── */}
      {error && (
        <ScrollReveal>
          <SpotlightCard style={{ marginBottom: 24, borderColor: 'rgba(239, 68, 68, 0.3)' }}>
            <div style={{ color: 'var(--accent-red)', display: 'flex', gap: 8, alignItems: 'center' }}>
              <span>❌</span>
              <span>{error}</span>
            </div>
          </SpotlightCard>
        </ScrollReveal>
      )}

      {/* ── Scan Result ── */}
      {result && (
        <ScrollReveal>
          <SpotlightCard className={`scan-result ${result.is_phishing ? 'danger' : 'safe'}`}>
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

                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-secondary)', padding: '12px 16px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)', wordBreak: 'break-all', border: '1px solid var(--glass-border)' }}>
                  {result.url}
                </div>
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
                      style={{ transition: 'stroke-dashoffset 0.8s ease' }}
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
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {Object.entries(features).map(([key, value]) => {
                  const numVal = typeof value === 'number' ? value : 0;
                  const barWidth = `${Math.min(100, Math.max(4, (numVal / maxFeatureVal) * 100))}%`;

                  return (
                    <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <span style={{ fontSize: '0.74rem', minWidth: '130px', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
                        {key.replace(/_/g, ' ')}
                      </span>
                      <div className="q-value-track" style={{ flex: 1, height: '8px' }}>
                        <div
                          className="q-value-fill"
                          style={{
                            width: barWidth,
                            height: '100%',
                            background: result.is_phishing 
                              ? 'linear-gradient(90deg, var(--neon-red-glow), var(--neon-red))' 
                              : 'linear-gradient(90deg, var(--neon-cyan-glow), var(--neon-cyan))',
                            boxShadow: result.is_phishing 
                              ? '0 0 8px rgba(239, 68, 68, 0.2)' 
                              : '0 0 8px rgba(34, 211, 238, 0.2)',
                          }}
                        />
                      </div>
                      <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', minWidth: '40px', textAlign: 'right', color: 'var(--text-muted)' }}>
                        {numVal.toFixed(2)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </SpotlightCard>
        </ScrollReveal>
      )}

      {/* ── Scan History ── */}
      <ScrollReveal delay={100}>
        <SpotlightCard style={{ marginTop: 24 }}>
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
            <div className="history-list">
              {history.map((item) => (
                <div key={item.id} className="history-item">
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                    #{item.id}
                  </span>
                  <span className="history-url">{item.url}</span>
                  <span className={`history-verdict ${item.is_phishing ? 'phishing' : 'safe'}`}>
                    {item.is_phishing ? 'Phishing' : 'Safe'}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                    {(item.confidence * 100).toFixed(0)}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </SpotlightCard>
      </ScrollReveal>
    </div>
  );
}
