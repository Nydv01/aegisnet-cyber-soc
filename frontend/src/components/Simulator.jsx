import { useState, useEffect } from 'react';
import SpotlightCard from './SpotlightCard';
import ScrollReveal from './ScrollReveal';
import AnimatedNumber from './AnimatedNumber';
import TextScramble from './TextScramble';
import ShinyText from './ShinyText';
import GlitchText from './GlitchText';
import CyberTerminal from './CyberTerminal';
import NetworkGraph from './NetworkGraph';

const API = 'http://localhost:8000';

const ATTACKS = [
  {
    type: 'ddos',
    icon: '💥',
    name: 'DDoS Attack',
    desc: 'Distributed Denial of Service flood',
    severity: 'CRITICAL',
    color: 'var(--neon-red)',
  },
  {
    type: 'port_scan',
    icon: '🔭',
    name: 'Port Scan',
    desc: 'Network reconnaissance sweep',
    severity: 'HIGH',
    color: 'var(--neon-orange)',
  },
  {
    type: 'brute_force',
    icon: '🔐',
    name: 'Brute Force',
    desc: 'SSH credential brute force',
    severity: 'HIGH',
    color: 'var(--neon-orange)',
  },
  {
    type: 'sql_injection',
    icon: '💉',
    name: 'SQL Injection',
    desc: 'Database injection payload',
    severity: 'CRITICAL',
    color: 'var(--neon-red)',
  },
];

export default function Simulator({ telemetry, events }) {
  const [activeAttack, setActiveAttack] = useState(null);
  const [intensity, setIntensity] = useState(0.7);
  const [agentEnabled, setAgentEnabled] = useState(false);
  const [agentStatus, setAgentStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [attackHistory, setAttackHistory] = useState([]);

  // Sync attack state from telemetry
  useEffect(() => {
    if (telemetry) {
      const atkType = telemetry.attack_type !== 'none' ? telemetry.attack_type : null;
      setActiveAttack(atkType);
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

  // Track attack history
  useEffect(() => {
    if (activeAttack) {
      setAttackHistory(prev => {
        const last = prev[prev.length - 1];
        if (last && last.type === activeAttack && !last.endTime) return prev;
        return [...prev.slice(-9), { type: activeAttack, startTime: Date.now(), endTime: null }];
      });
    } else {
      setAttackHistory(prev => {
        if (prev.length === 0) return prev;
        const last = prev[prev.length - 1];
        if (last && !last.endTime) {
          return [...prev.slice(0, -1), { ...last, endTime: Date.now() }];
        }
        return prev;
      });
    }
  }, [activeAttack]);

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

  const systemHealth = telemetry?.system_health ?? 100;
  const agentAction = telemetry?.agent_last_action || 'idle';

  // Defense effectiveness
  const defenseActions = events?.filter(e => e.event_type === 'defense')?.length || 0;
  const attackEvents = events?.filter(e => e.event_type === 'attack')?.length || 0;
  const effectiveness = attackEvents > 0 ? Math.min(100, (defenseActions / Math.max(1, attackEvents)) * 100) : 0;

  return (
    <div>
      <ScrollReveal>
        <div className="page-header">
          <h1>
            <ShinyText>⚔️ Threat Simulation Core</ShinyText>
          </h1>
          <p>
            <TextScramble delay={100}>Inject cyber attack vectors and coordinate automated neural defense mitigations in a sandboxed environment</TextScramble>
          </p>
        </div>
      </ScrollReveal>

      {/* ── Network Topology Graph (Canvas) ── */}
      <ScrollReveal delay={50}>
        <SpotlightCard style={{ marginBottom: 20 }}>
          <div className="card-header">
            <h2>🌐 Live Network Topology</h2>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {activeAttack && (
                <span className="card-badge badge-alert">
                  <GlitchText active={true}>UNDER ATTACK</GlitchText>
                </span>
              )}
              {agentEnabled && activeAttack && (
                <span className="card-badge badge-live">AGENT DEFENDING</span>
              )}
            </div>
          </div>
          <NetworkGraph
            attackActive={!!activeAttack}
            attackType={activeAttack || 'none'}
            systemHealth={systemHealth}
            agentAction={agentAction}
          />
        </SpotlightCard>
      </ScrollReveal>

      {/* ── Attack Stats Row ── */}
      {activeAttack && (
        <ScrollReveal delay={80}>
          <div className="stats-grid" style={{ marginBottom: 20 }}>
            <SpotlightCard className="stat-card glass-card">
              <div className="stat-icon red">⚠️</div>
              <div className="stat-info">
                <h3>Active Threat</h3>
                <div className="stat-value" style={{ color: 'var(--neon-red)', fontSize: '1.1rem' }}>
                  {activeAttack.replace(/_/g, ' ').toUpperCase()}
                </div>
              </div>
            </SpotlightCard>
            <SpotlightCard className="stat-card glass-card">
              <div className="stat-icon orange">📊</div>
              <div className="stat-info">
                <h3>Threat Level</h3>
                <div className="stat-value" style={{ color: 'var(--neon-orange)' }}>
                  {telemetry?.threat_level?.toUpperCase() || 'N/A'}
                </div>
              </div>
            </SpotlightCard>
            <SpotlightCard className="stat-card glass-card">
              <div className="stat-icon cyan">🛡️</div>
              <div className="stat-info">
                <h3>Defense Effectiveness</h3>
                <div className="stat-value" style={{ color: effectiveness > 50 ? 'var(--neon-green)' : 'var(--neon-orange)' }}>
                  {effectiveness.toFixed(0)}%
                </div>
              </div>
            </SpotlightCard>
            <SpotlightCard className="stat-card glass-card">
              <div className="stat-icon green">💚</div>
              <div className="stat-info">
                <h3>System Health</h3>
                <div className="stat-value" style={{ color: systemHealth > 70 ? 'var(--neon-green)' : systemHealth > 40 ? 'var(--neon-orange)' : 'var(--neon-red)' }}>
                  {systemHealth.toFixed(0)}%
                </div>
              </div>
            </SpotlightCard>
          </div>
        </ScrollReveal>
      )}

      {/* ── Layout Grid ── */}
      <div className="dashboard-grid">
        
        {/* Attack Panel */}
        <ScrollReveal delay={100} className="display-contents">
          <SpotlightCard>
            <div className="card-header">
              <h2>🎯 Threat Injector Panel</h2>
              {activeAttack && (
                <button className="btn btn-danger btn-sm" onClick={stopAttack} disabled={loading}>
                  {loading ? <span className="spinner" /> : '⏹ Neutralize'}
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
                  <span style={{
                    fontSize: '0.58rem',
                    fontWeight: 800,
                    color: atk.color,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    marginTop: 4,
                  }}>
                    {atk.severity}
                  </span>
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

            {/* Attack intensity waveform */}
            {activeAttack && (
              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 6 }}>
                  Attack Intensity Waveform
                </div>
                <div className="health-bar-track" style={{ height: 10 }}>
                  <div
                    className="health-bar-fill"
                    style={{
                      width: `${intensity * 100}%`,
                      background: 'linear-gradient(90deg, var(--neon-orange), var(--neon-red))',
                      boxShadow: '0 0 12px rgba(239, 68, 68, 0.4)',
                    }}
                  />
                </div>
              </div>
            )}
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
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
                  <div className="feature-item">
                    <span className="feature-name">Active Action</span>
                    <span className="feature-value" style={{ textTransform: 'uppercase', color: 'var(--neon-cyan)' }}>
                      {agentStatus.last_action || 'idle'}
                    </span>
                  </div>
                  <div className="feature-item">
                    <span className="feature-name">Agent State</span>
                    <span className="feature-value" style={{ color: 'var(--neon-green)' }}>
                      {agentStatus.current_state ?? 'N/A'}
                    </span>
                  </div>
                </div>

                <h3 style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: 8, marginTop: 8, letterSpacing: '0.04em', fontWeight: 700, textTransform: 'uppercase' }}>
                  Mitigation Strategy Preferences (Q-Values)
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
                <p>Enable the agent to see real-time Q-value policy decisions</p>
              </div>
            )}
          </SpotlightCard>
        </ScrollReveal>
      </div>

      {/* ── Agent Action Timeline ── */}
      {agentEnabled && events && events.filter(e => e.event_type === 'defense').length > 0 && (
        <ScrollReveal delay={180}>
          <SpotlightCard style={{ marginTop: 20 }}>
            <div className="card-header">
              <h2>🕐 Agent Action Timeline</h2>
              <span className="card-badge badge-info">{events.filter(e => e.event_type === 'defense').length} actions</span>
            </div>
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8 }}>
              {events
                .filter(e => e.event_type === 'defense')
                .slice(0, 10)
                .map((evt, i) => {
                  const action = evt.details?.action || 'unknown';
                  const actionIcons = {
                    block_ip: '🛡️',
                    rate_limit: '⏱️',
                    deploy_honeypot: '🍯',
                    patch_vulnerability: '🔧',
                    isolate_segment: '🔒',
                    escalate_alert: '⚠️',
                  };
                  return (
                    <div
                      key={i}
                      style={{
                        minWidth: 110,
                        padding: '10px 12px',
                        background: 'rgba(15, 23, 42, 0.4)',
                        border: '1px solid var(--glass-border)',
                        borderRadius: 'var(--radius-sm)',
                        textAlign: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <div style={{ fontSize: '1.2rem', marginBottom: 4 }}>{actionIcons[action] || '🤖'}</div>
                      <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'capitalize' }}>
                        {action.replace(/_/g, ' ')}
                      </div>
                      <div style={{ fontSize: '0.58rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', marginTop: 4 }}>
                        {evt.timestamp ? new Date(evt.timestamp).toLocaleTimeString() : ''}
                      </div>
                      {evt.details?.attack_intensity_remaining != null && (
                        <div style={{ fontSize: '0.58rem', color: 'var(--neon-orange)', marginTop: 2, fontFamily: 'var(--font-mono)' }}>
                          ATK: {(evt.details.attack_intensity_remaining * 100).toFixed(0)}%
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </SpotlightCard>
        </ScrollReveal>
      )}

      {/* ── Simulated Incident Response Console ── */}
      <ScrollReveal delay={200}>
        <CyberTerminal telemetry={telemetry} events={events} />
      </ScrollReveal>
    </div>
  );
}
