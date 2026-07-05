import React, { useState, useEffect } from 'react';
import SpotlightCard from './SpotlightCard';
import ScrollReveal from './ScrollReveal';
import ShinyText from './ShinyText';
import { AnimatedBorderCard, TerminalTextStream } from './ui/cyber-effects';

const API = 'http://localhost:8000';

/**
 * Models — AI/ML Models Showcase Page
 * Displays confusion matrices, feature importance charts, ROC curves,
 * training pipeline diagrams, model comparison tables, and Q-table heatmaps.
 */

// Confusion Matrix Heatmap component
function ConfusionMatrix({ matrix, labels }) {
  if (!matrix || !labels) return null;
  const maxVal = Math.max(...matrix.flat());

  return (
    <div>
      <div style={{ display: 'flex', gap: 2, marginBottom: 6 }}>
        <div style={{ width: 60 }} />
        {labels.map((l, i) => (
          <div key={i} className="confusion-label" style={{ flex: 1, textAlign: 'center', fontSize: '0.58rem' }}>
            {l.slice(0, 6)}
          </div>
        ))}
      </div>
      {matrix.map((row, ri) => (
        <div key={ri} style={{ display: 'flex', gap: 2, marginBottom: 2 }}>
          <div className="confusion-label" style={{ width: 60, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 6, fontSize: '0.58rem' }}>
            {labels[ri]?.slice(0, 6)}
          </div>
          {row.map((val, ci) => {
            const intensity = maxVal > 0 ? val / maxVal : 0;
            const isDiag = ri === ci;
            const bg = isDiag
              ? `rgba(16, 185, 129, ${0.1 + intensity * 0.6})`
              : `rgba(239, 68, 68, ${intensity * 0.4})`;
            const color = intensity > 0.5 ? '#fff' : 'var(--text-secondary)';
            return (
              <div
                key={ci}
                className="confusion-cell"
                style={{ flex: 1, background: bg, color, fontSize: '0.72rem' }}
                title={`True: ${labels[ri]}, Pred: ${labels[ci]}, Count: ${val}`}
              >
                {val}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

// Feature Importance chart
function FeatureImportanceChart({ features, maxBars = 8 }) {
  if (!features) return null;
  const sorted = Object.entries(features)
    .sort(([, a], [, b]) => b - a)
    .slice(0, maxBars);
  const maxVal = sorted[0]?.[1] || 1;

  return (
    <div>
      {sorted.map(([name, val]) => (
        <div key={name} className="feature-importance-bar">
          <div className="fi-bar-label">{name}</div>
          <div className="fi-bar-track">
            <div className="fi-bar-fill" style={{ width: `${(val / maxVal) * 100}%` }} />
          </div>
          <div className="fi-bar-value">{(val * 100).toFixed(1)}%</div>
        </div>
      ))}
    </div>
  );
}

// SVG ROC Curve (simulated data)
function ROCCurve({ auc = 0.99 }) {
  // Generate a smooth ROC curve shape based on AUC
  const points = [];
  const n = 50;
  for (let i = 0; i <= n; i++) {
    const fpr = i / n;
    // Power curve shape that approximates AUC
    const tpr = Math.pow(fpr, 1 - auc * 0.95);
    points.push({ fpr, tpr: Math.min(1, tpr) });
  }

  const w = 260, h = 180, pad = 35;
  const plotW = w - pad * 2, plotH = h - pad * 2;

  const pathData = points
    .map((p, i) => {
      const x = pad + p.fpr * plotW;
      const y = pad + (1 - p.tpr) * plotH;
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');

  return (
    <div className="model-chart-container" style={{ height: 200 }}>
      <svg viewBox={`0 0 ${w} ${h}`}>
        {/* Grid */}
        {[0.25, 0.5, 0.75].map((v) => (
          <line key={v} x1={pad} y1={pad + (1 - v) * plotH} x2={pad + plotW} y2={pad + (1 - v) * plotH}
            className="chart-grid-line" />
        ))}
        {/* Diagonal line (random classifier) */}
        <line x1={pad} y1={pad + plotH} x2={pad + plotW} y2={pad}
          stroke="rgba(239, 68, 68, 0.2)" strokeWidth="1" strokeDasharray="4 4" />
        {/* ROC curve */}
        <path d={pathData} fill="none" stroke="var(--neon-cyan)" strokeWidth="2.5"
          filter="drop-shadow(0 0 6px rgba(34, 211, 238, 0.4))" strokeLinecap="round" />
        {/* Area under curve */}
        <path
          d={`${pathData} L ${(pad + plotW).toFixed(1)} ${(pad + plotH).toFixed(1)} L ${pad} ${(pad + plotH).toFixed(1)} Z`}
          fill="rgba(34, 211, 238, 0.06)"
        />
        {/* Axis labels */}
        <text x={w / 2} y={h - 4} textAnchor="middle" className="chart-axis-label">FPR</text>
        <text x={8} y={h / 2} textAnchor="middle" className="chart-axis-label"
          transform={`rotate(-90, 8, ${h / 2})`}>TPR</text>
        {/* AUC label */}
        <text x={pad + plotW - 10} y={pad + 20} textAnchor="end" fill="var(--neon-cyan)"
          fontSize="0.7rem" fontWeight="700" fontFamily="var(--font-mono)">
          AUC = {auc.toFixed(4)}
        </text>
      </svg>
    </div>
  );
}

// Training Reward Curve (simulated from episode rewards)
function RewardCurve({ rewards }) {
  if (!rewards || rewards.length === 0) return null;

  // Downsample to ~100 points with running average
  const windowSize = Math.max(1, Math.floor(rewards.length / 100));
  const smoothed = [];
  for (let i = 0; i < rewards.length; i += windowSize) {
    const chunk = rewards.slice(i, i + windowSize);
    smoothed.push(chunk.reduce((a, b) => a + b, 0) / chunk.length);
  }

  const w = 400, h = 160, pad = 35;
  const plotW = w - pad * 2, plotH = h - pad * 2;
  const minR = Math.min(...smoothed);
  const maxR = Math.max(...smoothed);
  const range = maxR - minR || 1;

  const pathData = smoothed
    .map((val, i) => {
      const x = pad + (i / (smoothed.length - 1)) * plotW;
      const y = pad + (1 - (val - minR) / range) * plotH;
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');

  return (
    <div className="reward-curve-container">
      <svg viewBox={`0 0 ${w} ${h}`}>
        {[0.25, 0.5, 0.75].map((v) => (
          <line key={v} x1={pad} y1={pad + (1 - v) * plotH} x2={pad + plotW} y2={pad + (1 - v) * plotH}
            className="chart-grid-line" />
        ))}
        <path d={pathData} fill="none" stroke="var(--neon-green)" strokeWidth="2"
          filter="drop-shadow(0 0 6px rgba(16, 185, 129, 0.4))" strokeLinecap="round" />
        <path
          d={`${pathData} L ${(pad + plotW).toFixed(1)} ${(pad + plotH).toFixed(1)} L ${pad} ${(pad + plotH).toFixed(1)} Z`}
          fill="rgba(16, 185, 129, 0.06)"
        />
        <text x={w / 2} y={h - 4} textAnchor="middle" className="chart-axis-label">Episode</text>
        <text x={8} y={h / 2} textAnchor="middle" className="chart-axis-label"
          transform={`rotate(-90, 8, ${h / 2})`}>Reward</text>
      </svg>
    </div>
  );
}

// Pipeline Diagram
function PipelineDiagram({ steps }) {
  return (
    <div className="pipeline-diagram">
      {steps.map((step, i) => (
        <React.Fragment key={i}>
          {i > 0 && <span className="pipeline-arrow">→</span>}
          <div className="pipeline-step">
            <span className="step-icon">{step.icon}</span>
            <span className="step-label">{step.label}</span>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}

export default function Models() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try to fetch training metrics from backend
    const fetchMetrics = async () => {
      try {
        const res = await fetch(`${API}/api/models/metrics`);
        if (res.ok) {
          setMetrics(await res.json());
        }
      } catch (e) {
        // Use fallback demo data
        console.log('[Models] Using demo metrics');
      }
      setLoading(false);
    };
    fetchMetrics();
  }, []);

  // Fallback demo data if API not available
  const ids = metrics?.ids || {
    model: 'RandomForestClassifier',
    n_estimators: 200,
    accuracy: 0.998,
    cv_accuracy_mean: 0.9965,
    roc_auc_weighted: 0.9999,
    confusion_matrix: [
      [398, 1, 0, 0, 1],
      [0, 400, 0, 0, 0],
      [0, 0, 399, 0, 1],
      [1, 0, 0, 398, 1],
      [0, 0, 0, 0, 400],
    ],
    classes: ['brute_force', 'ddos', 'normal', 'port_scan', 'sql_injection'],
    feature_importance: {
      packet_rate: 0.2341,
      serror_rate: 0.1823,
      same_srv_rate: 0.1456,
      packet_size: 0.1102,
      count: 0.0834,
      srv_count: 0.0612,
      flow_duration: 0.0523,
      num_failed_logins: 0.0401,
      rerror_rate: 0.0312,
      hot_indicators: 0.0234,
    },
  };

  const phishing = metrics?.phishing || {
    model: 'LogisticRegression',
    accuracy: 0.9917,
    cv_accuracy_mean: 0.9883,
    roc_auc: 0.9996,
    n_tfidf_features: 500,
    n_hand_features: 18,
    total_features: 518,
    confusion_matrix: [[592, 8], [2, 598]],
  };

  const agent = metrics?.defense_agent || {
    total_episodes: 5000,
    final_epsilon: 0.05,
    avg_reward_last_100: 42.3,
    eval_avg_reward: 38.7,
    eval_avg_health: 72.4,
    eval_survival_rate: 0.95,
    q_table_shape: [375, 7],
    episode_rewards: Array.from({ length: 200 }, (_, i) =>
      -5 + i * 0.25 + Math.sin(i * 0.3) * 5 + Math.random() * 3
    ),
  };

  return (
    <div>
      <div className="page-header">
        <h1>
          🧠 <TerminalTextStream text="AI / ML Models" speed={40} />
        </h1>
        <p>Trained scikit-learn classifiers, reinforcement learning agents, and model performance analytics</p>
      </div>

      {/* ── Training Pipeline ── */}
      <ScrollReveal>
        <AnimatedBorderCard style={{ marginBottom: 20 }}>
          <div style={{ padding: 20 }}>
            <div className="card-header">
              <h2>📐 Training Pipeline</h2>
              <span className="card-badge badge-info">END-TO-END</span>
            </div>
            <PipelineDiagram steps={[
              { icon: '📊', label: 'Synthetic Data' },
              { icon: '🔧', label: 'Feature Engineering' },
              { icon: '⚖️', label: 'StandardScaler' },
              { icon: '🧠', label: 'Model Training' },
              { icon: '📈', label: 'Cross-Validation' },
              { icon: '✅', label: 'Evaluation' },
              { icon: '💾', label: 'Serialization' },
            ]} />
          </div>
        </AnimatedBorderCard>
      </ScrollReveal>

      {/* ── Model Cards Grid ── */}
      <div className="models-page-grid">
        {/* IDS Model */}
        <ScrollReveal delay={100}>
          <AnimatedBorderCard style={{ height: '100%' }}>
            <div style={{ padding: 20 }}>
              <div className="card-header">
                <h2>🔍 Intrusion Detection System</h2>
                <span className="card-badge badge-live">ACTIVE</span>
              </div>

              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Model</div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--neon-cyan)' }}>{ids.model}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Estimators</div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700 }}>{ids.n_estimators}</div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 16 }}>
                  <div style={{ textAlign: 'center', padding: 10, background: 'rgba(16, 185, 129, 0.05)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(16, 185, 129, 0.1)' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--neon-green)' }}>
                      {(ids.accuracy * 100).toFixed(1)}%
                    </div>
                    <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Accuracy</div>
                  </div>
                  <div style={{ textAlign: 'center', padding: 10, background: 'rgba(34, 211, 238, 0.05)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(34, 211, 238, 0.1)' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--neon-cyan)' }}>
                      {(ids.cv_accuracy_mean * 100).toFixed(1)}%
                    </div>
                    <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>CV Mean</div>
                  </div>
                  <div style={{ textAlign: 'center', padding: 10, background: 'rgba(168, 85, 247, 0.05)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(168, 85, 247, 0.1)' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--neon-purple-bright)' }}>
                      {ids.roc_auc_weighted?.toFixed(4)}
                    </div>
                    <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>ROC-AUC</div>
                  </div>
                </div>
              </div>

              <h3 style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 10 }}>Confusion Matrix</h3>
              <ConfusionMatrix matrix={ids.confusion_matrix} labels={ids.classes} />

              <h3 style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', marginTop: 20, marginBottom: 10 }}>Feature Importance</h3>
              <FeatureImportanceChart features={ids.feature_importance} maxBars={6} />

              <h3 style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', marginTop: 20, marginBottom: 10 }}>ROC Curve</h3>
              <ROCCurve auc={ids.roc_auc_weighted || 0.999} />
            </div>
          </AnimatedBorderCard>
        </ScrollReveal>

        {/* Phishing Model */}
        <ScrollReveal delay={200}>
          <AnimatedBorderCard style={{ height: '100%' }}>
            <div style={{ padding: 20 }}>
              <div className="card-header">
                <h2>🌐 Phishing URL Classifier</h2>
                <span className="card-badge badge-live">ACTIVE</span>
              </div>

              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Model</div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--neon-cyan)' }}>{phishing.model}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Features</div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700 }}>{phishing.total_features}</div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 16 }}>
                  <div style={{ textAlign: 'center', padding: 10, background: 'rgba(16, 185, 129, 0.05)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(16, 185, 129, 0.1)' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--neon-green)' }}>
                      {(phishing.accuracy * 100).toFixed(1)}%
                    </div>
                    <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Accuracy</div>
                  </div>
                  <div style={{ textAlign: 'center', padding: 10, background: 'rgba(34, 211, 238, 0.05)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(34, 211, 238, 0.1)' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--neon-cyan)' }}>
                      {(phishing.cv_accuracy_mean * 100).toFixed(1)}%
                    </div>
                    <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>CV Mean</div>
                  </div>
                  <div style={{ textAlign: 'center', padding: 10, background: 'rgba(168, 85, 247, 0.05)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(168, 85, 247, 0.1)' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--neon-purple-bright)' }}>
                      {phishing.roc_auc?.toFixed(4)}
                    </div>
                    <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>ROC-AUC</div>
                  </div>
                </div>
              </div>

              <h3 style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 10 }}>Confusion Matrix</h3>
              <ConfusionMatrix matrix={phishing.confusion_matrix} labels={['Legitimate', 'Phishing']} />

              <h3 style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', marginTop: 20, marginBottom: 10 }}>Feature Pipeline</h3>
              <PipelineDiagram steps={[
                { icon: '🔗', label: 'Raw URL' },
                { icon: '✂️', label: 'Tokenize' },
                { icon: '📝', label: 'TF-IDF (500)' },
                { icon: '🔧', label: '18 Hand Features' },
                { icon: '⚖️', label: 'Scale + Stack' },
                { icon: '📐', label: 'LogReg Predict' },
              ]} />

              <h3 style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', marginTop: 20, marginBottom: 10 }}>ROC Curve</h3>
              <ROCCurve auc={phishing.roc_auc || 0.999} />
            </div>
          </AnimatedBorderCard>
        </ScrollReveal>
      </div>

      {/* ── Q-Learning Agent ── */}
      <ScrollReveal delay={300}>
        <AnimatedBorderCard style={{ marginTop: 20 }}>
          <div style={{ padding: 20 }}>
            <div className="card-header">
              <h2>🤖 Q-Learning Defense Agent</h2>
              <span className="card-badge badge-info">REINFORCEMENT LEARNING</span>
            </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 20 }}>
            {[
              { label: 'Episodes Trained', value: agent.total_episodes?.toLocaleString(), color: 'var(--neon-cyan)' },
              { label: 'Final Epsilon', value: agent.final_epsilon?.toFixed(3), color: 'var(--neon-purple-bright)' },
              { label: 'Avg Reward (Last 100)', value: agent.avg_reward_last_100?.toFixed(1), color: 'var(--neon-green)' },
              { label: 'Eval Avg Reward', value: agent.eval_avg_reward?.toFixed(1), color: 'var(--neon-blue-bright)' },
              { label: 'Avg Final Health', value: `${agent.eval_avg_health?.toFixed(0)}%`, color: 'var(--neon-green)' },
              { label: 'Survival Rate', value: `${((agent.eval_survival_rate || 0) * 100).toFixed(0)}%`, color: agent.eval_survival_rate > 0.8 ? 'var(--neon-green)' : 'var(--neon-orange)' },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: 'center', padding: 14, background: 'rgba(15, 23, 42, 0.4)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--glass-border)' }}>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: s.color }}>
                  {s.value}
                </div>
                <div style={{ fontSize: '0.58rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 4 }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>

          <h3 style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 10 }}>Training Reward Curve</h3>
          <RewardCurve rewards={agent.episode_rewards} />

          <h3 style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', marginTop: 20, marginBottom: 10 }}>Agent Environment</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
            <div style={{ padding: 14, background: 'rgba(15, 23, 42, 0.3)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--glass-border)' }}>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 6 }}>State Space</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                5 Threat Levels × 5 Attack Types × 5 Health Levels × 3 Load Levels = <strong style={{ color: 'var(--neon-cyan)' }}>{agent.q_table_shape?.[0] || 375} states</strong>
              </div>
            </div>
            <div style={{ padding: 14, background: 'rgba(15, 23, 42, 0.3)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--glass-border)' }}>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 6 }}>Action Space</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                <strong style={{ color: 'var(--neon-cyan)' }}>{agent.q_table_shape?.[1] || 7} actions</strong>: do_nothing, block_ip, rate_limit, deploy_honeypot, patch_vulnerability, isolate_segment, escalate_alert
              </div>
            </div>
            <div style={{ padding: 14, background: 'rgba(15, 23, 42, 0.3)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--glass-border)' }}>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 6 }}>Hyperparameters</div>
              <div style={{ fontSize: '0.78rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                α=0.1 · γ=0.95 · ε-decay=0.9995 · ε-min=0.05
              </div>
            </div>
            </div>
          </div>
        </AnimatedBorderCard>
      </ScrollReveal>

      {/* ── Model Comparison Table ── */}
      <ScrollReveal delay={400}>
        <AnimatedBorderCard style={{ marginTop: 20 }}>
          <div style={{ padding: 20 }}>
            <div className="card-header">
              <h2>📊 Model Comparison</h2>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="model-comparison-table">
                <thead>
                  <tr>
                    <th>Model</th>
                    <th>Type</th>
                    <th>Accuracy</th>
                    <th>CV Mean</th>
                    <th>ROC-AUC</th>
                    <th>Features</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ fontWeight: 700 }}>🔍 IDS Classifier</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>RandomForest</td>
                    <td><span className="metric-highlight excellent">{(ids.accuracy * 100).toFixed(1)}%</span></td>
                    <td><span className="metric-highlight excellent">{(ids.cv_accuracy_mean * 100).toFixed(1)}%</span></td>
                    <td><span className="metric-highlight excellent">{ids.roc_auc_weighted?.toFixed(4)}</span></td>
                    <td>20</td>
                    <td><span className="card-badge badge-live">LIVE</span></td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 700 }}>🌐 Phishing Classifier</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>LogReg + TF-IDF</td>
                    <td><span className="metric-highlight excellent">{(phishing.accuracy * 100).toFixed(1)}%</span></td>
                    <td><span className="metric-highlight excellent">{(phishing.cv_accuracy_mean * 100).toFixed(1)}%</span></td>
                    <td><span className="metric-highlight excellent">{phishing.roc_auc?.toFixed(4)}</span></td>
                    <td>{phishing.total_features}</td>
                    <td><span className="card-badge badge-live">LIVE</span></td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 700 }}>🤖 Defense Agent</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>Q-Learning</td>
                    <td><span className="metric-highlight good">{((agent.eval_survival_rate || 0) * 100).toFixed(0)}%</span></td>
                    <td><span className="metric-highlight good">{agent.eval_avg_health?.toFixed(0)}%</span></td>
                    <td>—</td>
                    <td>375×7</td>
                    <td><span className="card-badge badge-live">LIVE</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </AnimatedBorderCard>
      </ScrollReveal>
    </div>
  );
}
