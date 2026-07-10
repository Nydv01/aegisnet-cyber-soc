import { useState, useEffect } from 'react';
import SpotlightCard from './SpotlightCard';
import ScrollReveal from './ScrollReveal';
import AnimatedNumber from './AnimatedNumber';
import TextScramble from './TextScramble';
import GlitchText from './GlitchText';
import CyberTerminal from './CyberTerminal';
import NetworkGraph from './NetworkGraph';
import { AnimatedBorderCard, TerminalTextStream, CyberButton } from './ui/cyber-effects';

const API = 'http://localhost:8000';

const ATTACKS = [
  {
    type: 'ddos',
    icon: '💥',
    name: 'DDoS Attack',
    desc: 'Distributed Denial of Service flood',
    severity: 'CRITICAL',
    color: '#ef4444',
  },
  {
    type: 'port_scan',
    icon: '🔭',
    name: 'Port Scan',
    desc: 'Network reconnaissance sweep',
    severity: 'HIGH',
    color: '#f59e0b',
  },
  {
    type: 'brute_force',
    icon: '🔐',
    name: 'Brute Force',
    desc: 'SSH credential brute force',
    severity: 'HIGH',
    color: '#f59e0b',
  },
  {
    type: 'sql_injection',
    icon: '💉',
    name: 'SQL Injection',
    desc: 'Database injection payload',
    severity: 'CRITICAL',
    color: '#ef4444',
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
    setLoading(true);
    // Add artificial HMR sweep delay for premium vibe
    setTimeout(() => setLoading(false), 800);
  };

  const stopAttack = async () => {
    setLoading(true);
    try {
      await fetch(`${API}/api/stop-attack`, { method: 'POST' });
      setActiveAttack(null);
    } catch (e) {
      console.error('Failed to stop attack:', e);
    }
    setLoading(true);
    setTimeout(() => setLoading(false), 800);
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
    <div className="simulator-wrapper max-w-7xl mx-auto py-10 px-4 md:px-8 space-y-10">
      
      {/* Page Header */}
      <ScrollReveal>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-zinc-900">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-white animate-pulse" />
              <TerminalTextStream text="⚔️ THREAT SIMULATION CHAMBER" speed={30} />
            </h1>
            <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest mt-1">
              <TextScramble delay={200}>INJECT ATTACK FLAGS AND MONITOR NEURAL POLICY ACTION TIMELINES</TextScramble>
            </p>
          </div>
        </div>
      </ScrollReveal>

      {/* Live Network Topology */}
      <ScrollReveal delay={50}>
        <SpotlightCard className="luxury-card p-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.003)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.003)_1px,transparent_1px)] bg-[size:15px_15px] pointer-events-none" />
          
          <div className="flex justify-between items-center mb-6 relative z-10">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">🌐 Live Network Topology</h2>
              <span className="text-[0.55rem] font-mono text-zinc-500 uppercase font-bold">Node switches and packet streams mapping resolution path</span>
            </div>
            <div className="flex gap-2">
              {activeAttack && (
                <span className="px-2 py-0.5 rounded bg-red-950 border border-red-900 text-red-400 font-mono text-[0.58rem] font-bold animate-[pulse_1.5s_infinite]">
                  UNDER ATTACK
                </span>
              )}
              {agentEnabled && activeAttack && (
                <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-900 text-emerald-400 font-mono text-[0.58rem] font-bold animate-pulse">
                  AGENT DEFENDING
                </span>
              )}
            </div>
          </div>

          <div className="relative z-10 min-h-[300px]">
            <NetworkGraph
              attackActive={!!activeAttack}
              attackType={activeAttack || 'none'}
              systemHealth={systemHealth}
              agentAction={agentAction}
            />
          </div>
        </SpotlightCard>
      </ScrollReveal>

      {/* Stats counter details */}
      {activeAttack && (
        <ScrollReveal delay={80}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <SpotlightCard className="stat-card luxury-card p-5 flex items-center gap-3">
              <div className="text-red-500 font-mono text-xs font-bold">⚠️ THREAT:</div>
              <div className="font-mono text-xs font-bold text-white">{activeAttack.replace(/_/g, ' ').toUpperCase()}</div>
            </SpotlightCard>
            <SpotlightCard className="stat-card luxury-card p-5 flex items-center gap-3">
              <div className="text-zinc-500 font-mono text-xs font-bold">LEVEL:</div>
              <div className="font-mono text-xs font-bold text-white">{telemetry?.threat_level?.toUpperCase() || 'N/A'}</div>
            </SpotlightCard>
            <SpotlightCard className="stat-card luxury-card p-5 flex items-center gap-3">
              <div className="text-zinc-500 font-mono text-xs font-bold">DEFENSE:</div>
              <div className="font-mono text-xs font-bold text-white">{effectiveness.toFixed(0)}% EFFECTIVE</div>
            </SpotlightCard>
            <SpotlightCard className="stat-card luxury-card p-5 flex items-center gap-3">
              <div className="text-zinc-500 font-mono text-xs font-bold">HEALTH:</div>
              <div className="font-mono text-xs font-bold text-white">{systemHealth.toFixed(0)}% INTEGRITY</div>
            </SpotlightCard>
          </div>
        </ScrollReveal>
      )}

      {/* Exploit Injector Panel & Agent Control Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Threat Injector */}
        <ScrollReveal delay={100}>
          <AnimatedBorderCard className="luxury-card p-6 h-full flex flex-col justify-between space-y-6">
            <div className="flex justify-between items-center border-b border-zinc-900 pb-4">
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight">🎯 Exploit Injector Panel</h2>
                <span className="text-[0.55rem] font-mono text-zinc-500 uppercase font-bold">Trigger virtual exploit packet floods</span>
              </div>
              {activeAttack && (
                <button
                  onClick={stopAttack}
                  disabled={loading}
                  className="px-4 py-1.5 bg-red-950 hover:bg-red-900 text-red-400 font-mono text-[0.62rem] font-bold border border-red-900 rounded cursor-pointer transition-all flex items-center gap-1.5"
                >
                  {loading ? <RefreshCw className="h-3 w-3 animate-spin" /> : '⏹ STOP INJECT'}
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ATTACKS.map((atk) => (
                <button
                  key={atk.type}
                  onClick={() => launchAttack(atk.type)}
                  disabled={loading || (activeAttack && activeAttack !== atk.type)}
                  className={`p-4 bg-zinc-950/60 hover:bg-zinc-900/60 border rounded-xl flex flex-col items-start text-left gap-2 cursor-pointer transition-all ${activeAttack === atk.type ? 'border-zinc-500' : 'border-zinc-900'}`}
                >
                  <div className="flex justify-between items-center w-full">
                    <span className="text-xl">{atk.icon}</span>
                    <span className="text-[0.55rem] font-mono font-bold" style={{ color: atk.color }}>{atk.severity}</span>
                  </div>
                  <h4 className="text-sm font-bold text-white">{atk.name}</h4>
                  <p className="text-[0.68rem] text-zinc-500 leading-relaxed font-light">{atk.desc}</p>
                </button>
              ))}
            </div>

            <div className="space-y-3 pt-4 border-t border-zinc-900">
              <div className="flex justify-between text-[0.68rem] font-mono text-zinc-500 font-bold">
                <span>EXPLOIT INTENSITY LEVEL</span>
                <span className="text-white">{(intensity * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.1"
                value={intensity}
                onChange={(e) => setIntensity(parseFloat(e.target.value))}
                className="w-full h-1 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-white"
              />
            </div>
          </AnimatedBorderCard>
        </ScrollReveal>

        {/* AI Agent Panel */}
        <ScrollReveal delay={150}>
          <AnimatedBorderCard className="luxury-card p-6 h-full flex flex-col justify-between space-y-6">
            <div className="flex justify-between items-center border-b border-zinc-900 pb-4">
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight">🤖 Neural Response Agent</h2>
                <span className="text-[0.55rem] font-mono text-zinc-500 uppercase font-bold">Autonomous policy decision mappings</span>
              </div>
              <span className={`px-2 py-0.5 rounded font-mono text-[0.58rem] font-bold ${agentEnabled ? 'bg-emerald-950 border border-emerald-900 text-emerald-400 animate-pulse' : 'bg-zinc-900 border border-zinc-800 text-zinc-400'}`}>
                {agentEnabled ? 'AUTONOMOUS' : 'STANDBY'}
              </span>
            </div>

            <div className="flex items-center gap-4 p-4 bg-zinc-950/60 border border-zinc-900 rounded-xl justify-between">
              <span className="text-xs font-mono text-zinc-400">Toggle autonomous reinforcement defense</span>
              <div
                onClick={toggleAgent}
                className={`w-11 h-6 rounded-full p-1 cursor-pointer transition-all duration-300 ${agentEnabled ? 'bg-white' : 'bg-zinc-900 border border-zinc-800'}`}
              >
                <div className={`w-4 h-4 rounded-full transition-all duration-300 ${agentEnabled ? 'bg-zinc-950 translate-x-5' : 'bg-zinc-700'}`} />
              </div>
            </div>

            {agentEnabled && agentStatus ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 font-mono text-xs">
                  <div className="bg-zinc-950/60 border border-zinc-900 p-3 rounded-lg">
                    <span className="text-zinc-500 block text-[0.58rem] mb-1">ACTIVE MITIGATION</span>
                    <strong className="text-white uppercase">{agentStatus.last_action || 'idle'}</strong>
                  </div>
                  <div className="bg-zinc-950/60 border border-zinc-900 p-3 rounded-lg">
                    <span className="text-zinc-500 block text-[0.58rem] mb-1">STATE INDEX</span>
                    <strong className="text-emerald-400">{agentStatus.current_state ?? 'N/A'}</strong>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[0.62rem] font-mono font-bold text-zinc-500 uppercase tracking-widest block">Mitigation Preferences (Q-Values)</span>
                  <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                    {Object.entries(qValues).map(([action, value]) => (
                      <div key={action} className="space-y-1.5">
                        <div className="flex justify-between items-center text-[0.62rem] font-mono">
                          <span className="text-zinc-400 uppercase">{action.replace(/_/g, ' ')}</span>
                          <span className={value >= 0 ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>{value.toFixed(2)}</span>
                        </div>
                        <div className="h-1 bg-zinc-900 rounded overflow-hidden">
                          <div
                            className="h-full rounded"
                            style={{
                              width: `${Math.max(2, (Math.abs(value) / maxQ) * 100)}%`,
                              background: value >= 0 ? '#ffffff' : 'rgba(239, 68, 68, 0.7)'
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="text-3xl mb-3">🤖</div>
                <h4 className="text-xs font-mono text-zinc-400 uppercase tracking-wider font-bold">Agent Inactive</h4>
                <p className="text-[0.68rem] text-zinc-500 max-w-sm mt-1 leading-relaxed">Engage autonomous defense to plot policy mappings.</p>
              </div>
            )}
          </AnimatedBorderCard>
        </ScrollReveal>

      </div>

      {/* Action timeline logs */}
      {agentEnabled && events && events.filter(e => e.event_type === 'defense').length > 0 && (
        <ScrollReveal delay={180}>
          <SpotlightCard className="luxury-card p-6">
            <h3 className="text-xs font-mono font-bold text-zinc-500 uppercase tracking-widest mb-6">Agent Mitigation timeline</h3>
            <div className="flex gap-4 overflow-x-auto pb-4">
              {events
                .filter(e => e.event_type === 'defense')
                .slice(0, 10)
                .map((evt, i) => {
                  const action = evt.details?.action || 'unknown';
                  return (
                    <div key={i} className="min-w-[120px] p-4 bg-zinc-950/60 border border-zinc-900 rounded-xl text-center space-y-1.5 flex-shrink-0">
                      <span className="text-lg block">🛡️</span>
                      <span className="text-[0.68rem] font-bold text-white block uppercase truncate max-w-[90px]">{action.replace(/_/g, ' ')}</span>
                      <span className="text-[0.55rem] font-mono text-zinc-500 block">
                        {evt.timestamp ? new Date(evt.timestamp).toLocaleTimeString() : ''}
                      </span>
                    </div>
                  );
                })}
            </div>
          </SpotlightCard>
        </ScrollReveal>
      )}

      {/* Simulated Incident Response Console */}
      <ScrollReveal delay={200}>
        <CyberTerminal telemetry={telemetry} events={events} />
      </ScrollReveal>

    </div>
  );
}
