import React, { useState, useEffect } from 'react';
import SpotlightCard from './SpotlightCard';
import ScrollReveal from './ScrollReveal';
import ShinyText from './ShinyText';
import { AnimatedBorderCard, TerminalTextStream } from './ui/cyber-effects';

const API = 'http://localhost:8000';

// ─── Holographic Confusion Matrix Heatmap Component ──────────────────
function ConfusionMatrix({ matrix, labels }) {
  if (!matrix || !labels) return null;
  const maxVal = Math.max(...matrix.flat());

  return (
    <div className="relative p-5 bg-zinc-950/60 border border-zinc-900 rounded-xl overflow-hidden shadow-xl">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.003)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.003)_1px,transparent_1px)] bg-[size:15px_15px] pointer-events-none" />
      
      <div style={{ display: 'flex', gap: 4, marginBottom: 8 }} className="font-mono text-[0.58rem] text-zinc-500 font-bold uppercase">
        <div style={{ width: 70 }} />
        {labels.map((l, i) => (
          <div key={i} style={{ flex: 1, textAlign: 'center' }}>
            {l.slice(0, 7)}
          </div>
        ))}
      </div>
      {matrix.map((row, ri) => (
        <div key={ri} style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
          <div className="font-mono text-[0.58rem] text-zinc-500 font-bold uppercase" style={{ width: 70, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 8 }}>
            {labels[ri]?.slice(0, 7)}
          </div>
          {row.map((val, ci) => {
            const intensity = maxVal > 0 ? val / maxVal : 0;
            const isDiag = ri === ci;
            const bg = isDiag
              ? `rgba(255, 255, 255, ${0.03 + intensity * 0.35})`
              : `rgba(239, 68, 68, ${intensity * 0.18})`;
            const color = intensity > 0.4 ? '#ffffff' : 'var(--text-secondary)';
            return (
              <div
                key={ci}
                className="confusion-cell relative font-mono font-bold transition-all duration-300 hover:scale-[1.04] hover:shadow-[0_0_12px_rgba(255,255,255,0.1)] hover:border-zinc-500 cursor-default"
                style={{ 
                  flex: 1, 
                  background: bg, 
                  color, 
                  fontSize: '0.72rem', 
                  padding: '12px 0', 
                  textAlign: 'center', 
                  borderRadius: 6,
                  border: '1px solid rgba(255, 255, 255, 0.03)'
                }}
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

// ─── Dynamic Feature Importance Chart ────────────────────────────────
function FeatureImportanceChart({ features, maxBars = 8 }) {
  if (!features) return null;
  const sorted = Object.entries(features)
    .sort(([, a], [, b]) => b - a)
    .slice(0, maxBars);
  const maxVal = sorted[0]?.[1] || 1;

  return (
    <div className="space-y-3 p-5 bg-zinc-950/60 border border-zinc-900 rounded-xl relative overflow-hidden shadow-xl">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.003)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.003)_1px,transparent_1px)] bg-[size:15px_15px] pointer-events-none" />
      {sorted.map(([name, val]) => (
        <div key={name} className="feature-importance-bar space-y-1.5 relative z-10">
          <div className="flex justify-between items-center text-[0.62rem] font-mono text-zinc-500">
            <span className="font-bold uppercase tracking-wider">{name.replace(/_/g, ' ')}</span>
            <span className="text-white">{(val * 100).toFixed(1)}%</span>
          </div>
          <div className="fi-bar-track h-1.5 bg-zinc-900 rounded overflow-hidden">
            <div 
              className="fi-bar-fill h-full bg-gradient-to-r from-zinc-500 via-white to-zinc-400 rounded transition-all duration-1000 ease-out" 
              style={{ width: `${(val / maxVal) * 100}%`, filter: 'drop-shadow(0 0 3px rgba(255,255,255,0.15))' }} 
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── SVG ROC Curve with grid ticks ───────────────────────────────────
function ROCCurve({ auc = 0.99 }) {
  const points = [];
  const n = 50;
  for (let i = 0; i <= n; i++) {
    const fpr = i / n;
    const tpr = Math.pow(fpr, 1 - auc * 0.95);
    points.push({ fpr, tpr: Math.min(1, tpr) });
  }

  const w = 280, h = 180, pad = 35;
  const plotW = w - pad * 2, plotH = h - pad * 2;

  const pathData = points
    .map((p, i) => {
      const x = pad + p.fpr * plotW;
      const y = pad + (1 - p.tpr) * plotH;
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');

  return (
    <div className="model-chart-container p-5 bg-zinc-950/60 border border-zinc-900 rounded-xl relative overflow-hidden shadow-xl flex justify-center">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.003)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.003)_1px,transparent_1px)] bg-[size:15px_15px] pointer-events-none" />
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full max-w-[260px] h-auto z-10">
        {/* Radar grid coordinates */}
        {[0.25, 0.5, 0.75].map((v) => (
          <line key={v} x1={pad} y1={pad + (1 - v) * plotH} x2={pad + plotW} y2={pad + (1 - v) * plotH}
            stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" strokeDasharray="3 3" />
        ))}
        {/* Diagonal baseline */}
        <line x1={pad} y1={pad + plotH} x2={pad + plotW} y2={pad}
          stroke="rgba(239, 68, 68, 0.15)" strokeWidth="1" strokeDasharray="4 4" />
        {/* Glowing ROC curve */}
        <path d={pathData} fill="none" stroke="#ffffff" strokeWidth="2.5"
          filter="drop-shadow(0 0 6px rgba(255,255,255,0.3))" strokeLinecap="round" />
        {/* AUC shade area */}
        <path
          d={`${pathData} L ${(pad + plotW).toFixed(1)} ${(pad + plotH).toFixed(1)} L ${pad} ${(pad + plotH).toFixed(1)} Z`}
          fill="rgba(255, 255, 255, 0.02)"
        />
        {/* Axes coordinates */}
        <text x={w / 2} y={h - 4} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="8" fontFamily="var(--font-mono)">FPR</text>
        <text x={12} y={h / 2} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="8" fontFamily="var(--font-mono)"
          transform={`rotate(-90, 12, ${h / 2})`}>TPR</text>
        {/* AUC value tag */}
        <text x={pad + plotW - 10} y={pad + 20} textAnchor="end" fill="#ffffff"
          fontSize="9" fontWeight="800" fontFamily="var(--font-mono)" filter="drop-shadow(0 0 3px rgba(255,255,255,0.2))">
          AUC = {auc.toFixed(4)}
        </text>
      </svg>
    </div>
  );
}

// ─── SVG Training Reward Curve ──────────────────────────────────────
function RewardCurve({ rewards }) {
  if (!rewards || rewards.length === 0) return null;

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
    <div className="reward-curve-container p-5 bg-zinc-950/60 border border-zinc-900 rounded-xl relative overflow-hidden shadow-xl">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.003)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.003)_1px,transparent_1px)] bg-[size:15px_15px] pointer-events-none" />
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto z-10">
        {[0.25, 0.5, 0.75].map((v) => (
          <line key={v} x1={pad} y1={pad + (1 - v) * plotH} x2={pad + plotW} y2={pad + (1 - v) * plotH}
            stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" strokeDasharray="3 3" />
        ))}
        <path d={pathData} fill="none" stroke="#ffffff" strokeWidth="2"
          filter="drop-shadow(0 0 6px rgba(255,255,255,0.3))" strokeLinecap="round" />
        <path
          d={`${pathData} L ${(pad + plotW).toFixed(1)} ${(pad + plotH).toFixed(1)} L ${pad} ${(pad + plotH).toFixed(1)} Z`}
          fill="rgba(255, 255, 255, 0.02)"
        />
        <text x={w / 2} y={h - 4} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="8" fontFamily="var(--font-mono)">Episode</text>
        <text x={12} y={h / 2} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="8" fontFamily="var(--font-mono)"
          transform={`rotate(-90, 12, ${h / 2})`}>Reward</text>
      </svg>
    </div>
  );
}

// ─── Visual Pipeline Diagram with Connection vectors ──────────────────
function PipelineDiagram({ steps }) {
  return (
    <div className="pipeline-diagram flex flex-wrap gap-4 items-center justify-center p-5 bg-zinc-950/60 border border-zinc-900 rounded-xl relative overflow-hidden shadow-xl">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.003)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.003)_1px,transparent_1px)] bg-[size:15px_15px] pointer-events-none" />
      {steps.map((step, i) => (
        <React.Fragment key={i}>
          {i > 0 && (
            <div className="flex items-center gap-0.5 text-zinc-700 font-mono text-[0.62rem] select-none">
              <span className="h-1 w-1 bg-zinc-600 rounded-full animate-ping" />
              <span>---</span>
            </div>
          )}
          <div className="pipeline-step flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg shadow relative z-10 hover:border-zinc-700/60 transition-colors cursor-default">
            <span className="step-icon text-base filter drop-shadow-[0_0_4px_rgba(255,255,255,0.1)]">{step.icon}</span>
            <span className="step-label font-mono text-[0.68rem] font-bold text-zinc-300 uppercase tracking-wider">{step.label}</span>
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
    const fetchMetrics = async () => {
      try {
        const res = await fetch(`${API}/api/models/metrics`);
        if (res.ok) {
          setMetrics(await res.json());
        }
      } catch (e) {
        console.log('[Models] Using demo metrics fallback');
      }
      setLoading(false);
    };
    fetchMetrics();
  }, []);

  // Fallback demo weights if API not online
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
    <div className="models-wrapper max-w-7xl mx-auto py-10 px-4 md:px-8 space-y-10">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-zinc-900">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-white animate-pulse" />
            <TerminalTextStream text="🧠 ACTIVE MACHINE LEARNING DECK" speed={30} />
          </h1>
          <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest mt-1">
            SCIKIT-LEARN TRAINED CLASSIFIERS AND POLICY TABLE VALUATION LEDGERS
          </p>
        </div>
      </div>

      {/* ── Section 1: End-To-End Training Pipeline ── */}
      <ScrollReveal>
        <AnimatedBorderCard className="luxury-card p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">📐 Model Pipeline Architecture</h2>
              <span className="text-[0.55rem] font-mono text-zinc-500 uppercase font-bold">Data serialization and standardization loops</span>
            </div>
            <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 font-mono text-[0.58rem] font-bold">
              PIPELINE: ACTIVE
            </span>
          </div>
          <PipelineDiagram steps={[
            { icon: '📊', label: 'Synthetic Generator' },
            { icon: '🔧', label: 'Vector Engineers' },
            { icon: '⚖️', label: 'Standard Scaler' },
            { icon: '🧠', label: 'Fit Classifiers' },
            { icon: '📈', label: 'Fold Evaluation' },
            { icon: '✅', label: 'Validate Matrices' },
            { icon: '💾', label: 'Pickle Dump' },
          ]} />
        </AnimatedBorderCard>
      </ScrollReveal>

      {/* ── Section 2: Model Zoo comparison grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* IDS Model Zoo Card */}
        <ScrollReveal>
          <AnimatedBorderCard className="luxury-card p-6 space-y-6">
            <div className="flex justify-between items-center border-b border-zinc-900 pb-4">
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">🔍 Intrusion Detection System</h2>
                <span className="text-[0.55rem] font-mono text-zinc-500 uppercase font-bold">Random Forest classifier mapping flow events</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-900 text-emerald-400 font-mono text-[0.58rem] font-bold">
                ACTIVE
              </span>
            </div>

            <div className="flex gap-8 font-mono text-[0.68rem] text-zinc-400">
              <div>
                <span className="text-zinc-500 block">MODEL TYPE:</span>
                <span className="text-white font-bold">{ids.model}</span>
              </div>
              <div>
                <span className="text-zinc-500 block">ESTIMATORS:</span>
                <span className="text-white font-bold">{ids.n_estimators}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 font-mono">
              <div className="bg-zinc-950/60 border border-zinc-900 p-3 rounded-lg text-center">
                <span className="text-lg font-black text-emerald-400">{(ids.accuracy * 100).toFixed(1)}%</span>
                <span className="text-[0.52rem] text-zinc-500 block mt-1">ACCURACY</span>
              </div>
              <div className="bg-zinc-950/60 border border-zinc-900 p-3 rounded-lg text-center">
                <span className="text-lg font-black text-white">{(ids.cv_accuracy_mean * 100).toFixed(1)}%</span>
                <span className="text-[0.52rem] text-zinc-500 block mt-1">CV MEAN</span>
              </div>
              <div className="bg-zinc-950/60 border border-zinc-900 p-3 rounded-lg text-center">
                <span className="text-lg font-black text-zinc-300">{ids.roc_auc_weighted?.toFixed(4)}</span>
                <span className="text-[0.52rem] text-zinc-500 block mt-1">ROC-AUC</span>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-mono font-bold text-zinc-500 uppercase tracking-widest">Confusion Matrix</h3>
              <ConfusionMatrix matrix={ids.confusion_matrix} labels={ids.classes} />
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-mono font-bold text-zinc-500 uppercase tracking-widest">Feature Importance</h3>
              <FeatureImportanceChart features={ids.feature_importance} maxBars={5} />
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-mono font-bold text-zinc-500 uppercase tracking-widest">ROC Analytics Waveform</h3>
              <ROCCurve auc={ids.roc_auc_weighted || 0.999} />
            </div>
          </AnimatedBorderCard>
        </ScrollReveal>

        {/* Phishing Model Card */}
        <ScrollReveal>
          <AnimatedBorderCard className="luxury-card p-6 space-y-6">
            <div className="flex justify-between items-center border-b border-zinc-900 pb-4">
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">🌐 Phishing URL Classifier</h2>
                <span className="text-[0.55rem] font-mono text-zinc-500 uppercase font-bold">Lexical TF-IDF Logistic Regression scanner</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-900 text-emerald-400 font-mono text-[0.58rem] font-bold">
                ACTIVE
              </span>
            </div>

            <div className="flex gap-8 font-mono text-[0.68rem] text-zinc-400">
              <div>
                <span className="text-zinc-500 block">MODEL TYPE:</span>
                <span className="text-white font-bold">{phishing.model}</span>
              </div>
              <div>
                <span className="text-zinc-500 block">FEATURE SCALE:</span>
                <span className="text-white font-bold">{phishing.total_features} DIM</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 font-mono">
              <div className="bg-zinc-950/60 border border-zinc-900 p-3 rounded-lg text-center">
                <span className="text-lg font-black text-emerald-400">{(phishing.accuracy * 100).toFixed(1)}%</span>
                <span className="text-[0.52rem] text-zinc-500 block mt-1">ACCURACY</span>
              </div>
              <div className="bg-zinc-950/60 border border-zinc-900 p-3 rounded-lg text-center">
                <span className="text-lg font-black text-white">{(phishing.cv_accuracy_mean * 100).toFixed(1)}%</span>
                <span className="text-[0.52rem] text-zinc-500 block mt-1">CV MEAN</span>
              </div>
              <div className="bg-zinc-950/60 border border-zinc-900 p-3 rounded-lg text-center">
                <span className="text-lg font-black text-zinc-300">{phishing.roc_auc?.toFixed(4)}</span>
                <span className="text-[0.52rem] text-zinc-500 block mt-1">ROC-AUC</span>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-mono font-bold text-zinc-500 uppercase tracking-widest">Confusion Matrix</h3>
              <ConfusionMatrix matrix={phishing.confusion_matrix} labels={['Safe', 'Phish']} />
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-mono font-bold text-zinc-500 uppercase tracking-widest">NLP Feature extraction</h3>
              <PipelineDiagram steps={[
                { icon: '🔗', label: 'Raw URL Input' },
                { icon: '✂️', label: 'Entropy Parser' },
                { icon: '📝', label: 'TF-IDF Lexer' },
                { icon: '🔧', label: 'Scale stack' },
                { icon: '📐', label: 'LogReg Pred' },
              ]} />
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-mono font-bold text-zinc-500 uppercase tracking-widest">ROC Analytics Waveform</h3>
              <ROCCurve auc={phishing.roc_auc || 0.999} />
            </div>
          </AnimatedBorderCard>
        </ScrollReveal>

      </div>

      {/* ── Section 3: Reinforcement Learning agent details ── */}
      <ScrollReveal>
        <AnimatedBorderCard className="luxury-card p-6 space-y-6">
          <div className="flex justify-between items-center border-b border-zinc-900 pb-4">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">🤖 Q-Learning Autonomous Agent</h2>
              <span className="text-[0.55rem] font-mono text-zinc-500 uppercase font-bold">Policy table actions mapping threat states</span>
            </div>
            <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 font-mono text-[0.58rem] font-bold">
              RL_ENGINE: STANDBY
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 font-mono">
            {[
              { label: 'Episodes', value: agent.total_episodes?.toLocaleString() },
              { label: 'Epsilon', value: agent.final_epsilon?.toFixed(3) },
              { label: 'Avg Reward', value: agent.avg_reward_last_100?.toFixed(1) },
              { label: 'Eval Reward', value: agent.eval_avg_reward?.toFixed(1) },
              { label: 'Eval Health', value: `${agent.eval_avg_health?.toFixed(0)}%` },
              { label: 'Survival Rate', value: `${((agent.eval_survival_rate || 0) * 100).toFixed(0)}%` },
            ].map((s, i) => (
              <div key={i} className="bg-zinc-950/60 border border-zinc-900 p-4 rounded-xl text-center">
                <span className="text-base font-black text-white block">{s.value}</span>
                <span className="text-[0.52rem] text-zinc-500 uppercase block mt-1 tracking-wider">{s.label}</span>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-mono font-bold text-zinc-500 uppercase tracking-widest">Episode Reward convergence</h3>
            <RewardCurve rewards={agent.episode_rewards} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
            <div className="bg-zinc-950/40 border border-zinc-900 p-4 rounded-xl">
              <span className="text-[0.55rem] text-zinc-500 block uppercase tracking-wider mb-2">State Dimensions</span>
              <div className="text-zinc-300">
                5 Threat × 5 Attack × 5 Health × 3 Load = <strong className="text-white">{agent.q_table_shape?.[0] || 375} states</strong>
              </div>
            </div>
            <div className="bg-zinc-950/40 border border-zinc-900 p-4 rounded-xl">
              <span className="text-[0.55rem] text-zinc-500 block uppercase tracking-wider mb-2">Action Vectors</span>
              <div className="text-zinc-300 truncate">
                <strong className="text-white">{agent.q_table_shape?.[1] || 7} mitigations</strong>: do_nothing, block_ip, rate_limit...
              </div>
            </div>
            <div className="bg-zinc-950/40 border border-zinc-900 p-4 rounded-xl">
              <span className="text-[0.55rem] text-zinc-500 block uppercase tracking-wider mb-2">Policy Params</span>
              <div className="text-zinc-300 font-mono">
                α=0.1 · γ=0.95 · ε=0.05
              </div>
            </div>
          </div>
        </AnimatedBorderCard>
      </ScrollReveal>

    </div>
  );
}
