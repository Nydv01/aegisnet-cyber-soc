import { useState, useEffect } from 'react';
import SpotlightCard from './SpotlightCard';
import ScrollReveal from './ScrollReveal';
import AnimatedNumber from './AnimatedNumber';
import TextScramble from './TextScramble';
import ShinyText from './ShinyText';
import GlitchText from './GlitchText';
import CyberTerminal from './CyberTerminal';

const API = 'http://localhost:8000';

const ATTACKS = [
  {
    type: 'ddos',
    icon: '💥',
    name: 'DDoS Attack',
    desc: 'Distributed Denial of Service flood',
  },
  {
    type: 'port_scan',
    icon: '🔭',
    name: 'Port Scan',
    desc: 'Network reconnaissance sweep',
  },
  {
    type: 'brute_force',
    icon: '🔐',
    name: 'Brute Force',
    desc: 'SSH credential brute force',
  },
  {
    type: 'sql_injection',
    icon: '💉',
    name: 'SQL Injection',
    desc: 'Database injection payload',
  },
];

export default function Simulator({ telemetry, events }) {
  const [activeAttack, setActiveAttack] = useState(null);
  const [intensity, setIntensity] = useState(0.7);
  const [agentEnabled, setAgentEnabled] = useState(false);
  const [agentStatus, setAgentStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  // Sync attack state from telemetry
  useEffect(() => {
    if (telemetry) {
      setActiveAttack(telemetry.attack_type !== 'none' ? telemetry.attack_type : null);
      setAgentEnabled(telemetry.agent_status === 'active');
    }
  }, [telemetry]);

  // Poll agent status
  useEffect(() => {
    const fetchAgentStatus = async () => {
      try {
        const res = await fetch(`${API}/api/agent-status`);
        if (res.ok) setAgentStatus(await res.json());
      } catch (e) { /* ignore */ }
    };
    fetchAgentStatus();
    const interval = setInterval(fetchAgentStatus, 2000);
    return () => clearInterval(interval);
  }, []);

  const launchAttack = async (type) => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/simulate-attack`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attack_type: type, intensity }),
      });
      if (res.ok) {
        setActiveAttack(type);
      }
    } catch (e) {
      console.error('Failed to launch attack:', e);
    }
    setLoading(false);
  };

  const stopAttack = async () => {
    setLoading(true);
    try {
      await fetch(`${API}/api/stop-attack`, { method: 'POST' });
      setActiveAttack(null);
    } catch (e) {
      console.error('Failed to stop attack:', e);
    }
    setLoading(false);
  };

  const toggleAgent = async () => {
    try {
      const res = await fetch(`${API}/api/agent-control`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !agentEnabled }),
      });
      if (res.ok) {
        setAgentEnabled(!agentEnabled);
      }
    } catch (e) {
      console.error('Failed to toggle agent:', e);
    }
  };

  // Q-value visualization
  const qValues = agentStatus?.q_values || {};
  const maxQ = Math.max(...Object.values(qValues).map(Math.abs), 1);

  return (
    <div>
      <ScrollReveal>
        <div className="page-header">
          <h1>
            <ShinyText>Threat Simulation Core</ShinyText>
          </h1>
          <p>
            <TextScramble delay={100}>Inject cyber attack vectors and coordinate automated neural defense mitigations</TextScramble>
          </p>
        </div>
      </ScrollReveal>

      {/* ── Network Topology ── */}
      <ScrollReveal delay={50}>
        <SpotlightCard style={{ marginBottom: 24 }}>
          <div className="card-header">
            <h2>🌐 Real-Time Node Connection Graph</h2>
            {activeAttack && (
              <span className="card-badge badge-alert">
                <GlitchText active={true}>ATTACK DETECTED</GlitchText>
              </span>
            )}
          </div>
          <div className="topology-container">
            <div className={`topology-node ${activeAttack ? 'attacked' : ''}`}>
              <span className="node-icon">👤</span>
              <span className="node-label">Threat Source</span>
            </div>
            <span className={`topology-arrow ${activeAttack ? 'danger' : ''}`}>
              {activeAttack ? '⚡→⚡→' : '· · · →'}
            </span>
            <div className={`topology-node ${agentEnabled ? 'active' : ''}`}>
              <span className="node-icon">🔥</span>
              <span className="node-label">Firewall Rule</span>
            </div>
            <span className="topology-arrow">→ → →</span>
            <div className="topology-node active">
              <span className="node-icon">🖥️</span>
              <span className="node-label">Core Server</span>
            </div>
            <span className="topology-arrow">→ → →</span>
            <div className="topology-node">
              <span className="node-icon">🗄️</span>
              <span className="node-label">Database</span>
            </div>
          </div>
        </SpotlightCard>
      </ScrollReveal>

      {/* ── Layout Grid ── */}
      <div className="dashboard-grid">
        
        {/* Attack Panel */}
        <ScrollReveal delay={100} className="display-contents">
          <SpotlightCard>
            <div className="card-header">
              <h2>🎯 Threat Injector Panel</h2>
              {activeAttack && (
                <button className="btn btn-danger btn-sm" onClick={stopAttack} disabled={loading}>
                  {loading ? <span className="spinner" /> : '⏹ Clear Attack'}
                </button>
              )}
            </div>

            <div className="attack-grid">
              {ATTACKS.map((atk) => (
                <button
                  key={atk.type}
                  className={`attack-btn ${activeAttack === atk.type ? 'active' : ''}`}
                  onClick={() => launchAttack(atk.type)}
                  disabled={loading || (activeAttack && activeAttack !== atk.type)}
                  id={`attack-${atk.type}`}
                >
                  <span className="attack-icon">{atk.icon}</span>
                  <span className="attack-name">{atk.name}</span>
                  <span className="attack-desc">{atk.desc}</span>
                </button>
              ))}
            </div>

            <div className="slider-container">
              <label>Exploit Intensity:</label>
              <input
                type="range"
                className="slider-input"
                min="0.1"
                max="1.0"
                step="0.1"
                value={intensity}
                onChange={(e) => setIntensity(parseFloat(e.target.value))}
              />
              <span className="slider-value">{(intensity * 100).toFixed(0)}%</span>
            </div>
          </SpotlightCard>
        </ScrollReveal>

        {/* AI Agent Control */}
        <ScrollReveal delay={150} className="display-contents">
          <SpotlightCard>
            <div className="card-header">
              <h2>🤖 Neural Response Agent</h2>
              <span className={`card-badge ${agentEnabled ? 'badge-live' : 'badge-info'}`}>
                {agentEnabled ? '● Active' : '○ Standby'}
              </span>
            </div>

            <div className="toggle-container" style={{ marginBottom: 20 }}>
              <div
                className={`toggle-switch ${agentEnabled ? 'active' : ''}`}
                onClick={toggleAgent}
                role="switch"
                aria-checked={agentEnabled}
                id="agent-toggle"
              />
              <span className="toggle-label">
                {agentEnabled ? 'Autonomous defense engaged' : 'Toggle autonomous RL mode'}
              </span>
            </div>

            {agentEnabled && agentStatus && (
              <>
                <div className="feature-item" style={{ marginBottom: 10 }}>
                  <span className="feature-name">Active Remediation Rule</span>
                  <span className="feature-value" style={{ textTransform: 'uppercase' }}>
                    {agentStatus.last_action || 'idle'}
                  </span>
                </div>

                <h3 style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 8, marginTop: 16, letterSpacing: '0.04em', fontWeight: 700 }}>
                  MITIGATION STRATEGY PREFERENCES (Q-Values)
                </h3>
                <div className="q-values-grid">
                  {Object.entries(qValues).map(([action, value]) => (
                    <div key={action} className="q-value-bar">
                      <span className="q-value-label">{action.replace(/_/g, ' ')}</span>
                      <div className="q-value-track">
                        <div
                          className="q-value-fill"
                          style={{
                            width: `${Math.max(2, (Math.abs(value) / maxQ) * 100)}%`,
                            background: value >= 0
                              ? 'linear-gradient(90deg, #22d3ee, #3b82f6)'
                              : 'linear-gradient(90deg, #ef4444, #dc2626)',
                          }}
                        />
                      </div>
                      <span className="q-value-num">{value.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </>
            )}

            {!agentEnabled && (
              <div className="empty-state" style={{ padding: '24px 0' }}>
                <div className="empty-icon">🤖</div>
                <h3>Agent Inactive</h3>
                <p>Remediation parameters will generate once autonomous training resolves</p>
              </div>
            )}
          </SpotlightCard>
        </ScrollReveal>
      </div>

      {/* ── Simulated Incident Response Console ── */}
      <ScrollReveal delay={200}>
        <CyberTerminal telemetry={telemetry} events={events} />
      </ScrollReveal>
    </div>
  );
}
