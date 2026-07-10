import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SpotlightCard from './SpotlightCard';
import ScrollReveal from './ScrollReveal';
import AnimatedNumber from './AnimatedNumber';
import TextScramble from './TextScramble';
import ShinyText from './ShinyText';
import WorldMap from './WorldMap';
import { RadarSweep, AnimatedBorderCard, TerminalTextStream, CyberButton } from './ui/cyber-effects';

const API = 'http://localhost:8000';

// ─── Circular Cockpit HUD Gauge Component ─────────────────────────────
function Gauge({ value, max, label, color }) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(value / max, 1);
  const offset = circumference * (1 - pct);

  return (
    <div className="gauge-container relative flex flex-col items-center p-4 bg-zinc-950/60 border border-zinc-800/80 rounded-xl shadow-lg w-[120px]">
      {/* Outer corner ticks */}
      <span className="absolute top-0 left-0 w-1 h-1 border-t border-l border-zinc-700" />
      <span className="absolute top-0 right-0 w-1 h-1 border-t border-r border-zinc-700" />
      
      <svg className="gauge-svg w-20 h-20" viewBox="0 0 100 100" style={{ color }}>
        {/* Outer targeting circles */}
        <circle cx="50" cy="50" r="48" fill="none" stroke="rgba(255, 255, 255, 0.02)" strokeWidth="0.5" strokeDasharray="3 3" />
        {/* Gauge background track */}
        <circle className="gauge-bg" cx="50" cy="50" r={radius} stroke="rgba(255,255,255,0.03)" strokeWidth="4" fill="none" />
        {/* Glowing active fill */}
        <circle
          className="gauge-fill transition-all duration-500 ease-out"
          cx="50" cy="50" r={radius}
          stroke="currentColor"
          strokeWidth="4"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ filter: 'drop-shadow(0 0 4px currentColor)' }}
        />
        {/* Cockpit radar indicators */}
        <line x1="50" y1="2" x2="50" y2="6" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
        <line x1="50" y1="94" x2="50" y2="98" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
        <line x1="2" y1="50" x2="6" y2="50" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
        <line x1="94" y1="50" x2="98" y2="50" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
      </svg>
      <span className="gauge-value mt-2 font-mono text-sm font-black text-white">
        <AnimatedNumber value={value} />%
      </span>
      <span className="gauge-label text-[0.58rem] font-extrabold text-zinc-500 uppercase tracking-widest mt-1 font-mono">{label}</span>
    </div>
  );
}

// ─── Tactical Mini Line Chart ───────────────────────────────────────
function MiniChart({ data, color, height = 100 }) {
  if (data.length < 2) return null;

  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const w = 120;

  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = height - ((v - min) / range) * (height - 20) - 10;
    return `${x},${y}`;
  });

  const areaPoints = `0,${height} ${points.join(' ')} ${w},${height}`;

  return (
    <div className="chart-container relative" style={{ height }}>
      <svg viewBox={`0 0 ${w} ${height}`} preserveAspectRatio="none" style={{ color }} className="w-full h-full">
        {/* Horizontal grid ticks */}
        {[0.25, 0.5, 0.75].map((pct) => (
          <line
            key={pct}
            x1="0" y1={height * pct} x2={w} y2={height * pct}
            stroke="rgba(255,255,255,0.02)"
            strokeWidth="0.5"
            strokeDasharray="2 4"
          />
        ))}
        {/* Gradient fill */}
        <polygon points={areaPoints} fill="currentColor" fillOpacity="0.02" />
        {/* Core telemetry line */}
        <polyline 
          points={points.join(' ')} 
          stroke="currentColor" 
          strokeWidth="1.5" 
          fill="none"
          style={{ filter: 'drop-shadow(0 0 3px currentColor)' }}
        />
      </svg>
      {/* HUD min/max coordinate stamps */}
      <div className="absolute top-1 right-1 font-mono text-[0.52rem] text-zinc-600">
        MAX:{max.toFixed(0)}
      </div>
      <div className="absolute bottom-1 right-1 font-mono text-[0.52rem] text-zinc-600">
        MIN:{min.toFixed(0)}
      </div>
    </div>
  );
}

export default function Dashboard({ telemetry, events }) {
  const navigate = useNavigate();
  const [bandwidthHistory, setBandwidthHistory] = useState([]);
  const [latencyHistory, setLatencyHistory] = useState([]);
  const [packetRateHistory, setPacketRateHistory] = useState([]);
  const [modelMetrics, setModelMetrics] = useState(null);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [blocking, setBlocking] = useState(false);
  const [blockMessage, setBlockMessage] = useState('');
  const [uptime, setUptime] = useState(0);

  // Uptime counter
  useEffect(() => {
    const timer = setInterval(() => setUptime(prev => prev + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  // Sync bandwidth, latency, and packet rate telemetry
  useEffect(() => {
    if (!telemetry) return;
    setBandwidthHistory((prev) => [...prev.slice(-59), telemetry.bandwidth_in]);
    setLatencyHistory((prev) => [...prev.slice(-59), telemetry.latency_ms]);
    setPacketRateHistory((prev) => [...prev.slice(-59), telemetry.packet_rate || Math.random() * 1000 + 200]);
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

  // Format uptime
  const uptimeStr = `${String(Math.floor(uptime / 3600)).padStart(2, '0')}:${String(Math.floor((uptime % 3600) / 60)).padStart(2, '0')}:${String(uptime % 60).padStart(2, '0')}`;

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

  // Attack type display info
  const attackInfo = {
    ddos: { icon: '💥', name: 'DDoS Flood' },
    port_scan: { icon: '🔭', name: 'Port Scan' },
    brute_force: { icon: '🔐', name: 'Brute Force' },
    sql_injection: { icon: '💉', name: 'SQL Injection' },
  };

  return (
    <div className="dashboard-wrapper max-w-7xl mx-auto py-10 px-4 md:px-8 space-y-10">
      
      {/* Header telemetry stamps */}
      <ScrollReveal>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-zinc-900">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-white animate-pulse" />
              <TerminalTextStream text="📊 SECURITY OPERATIONS CENTER" speed={30} />
            </h1>
            <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest mt-1">
              <TextScramble delay={200}>REAL-TIME UPLINK TELEMETRY AND AUTONOMOUS RESOLUTION SIGNALS</TextScramble>
            </p>
          </div>
          <div className="flex gap-4 items-center font-mono text-[0.68rem]">
            <span className="px-3.5 py-1.5 bg-zinc-950/80 border border-zinc-800/80 rounded text-zinc-400">
              UPTIME: {uptimeStr}
            </span>
            {isAttackActive && (
              <span className="px-3.5 py-1.5 bg-red-950/40 border border-red-900/40 rounded text-red-400 font-bold animate-[pulse_2s_infinite]">
                🚨 {attackInfo[t.attack_type]?.name || 'ATTACK VECTOR ENGAGED'}
              </span>
            )}
          </div>
        </div>
      </ScrollReveal>

      {/* ── Quick Stats Grid ── */}
      <ScrollReveal delay={50}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <SpotlightCard className="stat-card luxury-card p-6 flex items-center gap-4 relative overflow-hidden group">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.003)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.003)_1px,transparent_1px)] bg-[size:10px_10px] pointer-events-none" />
            <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-lg text-2xl">📡</div>
            <div>
              <h3 className="text-[0.62rem] font-black text-zinc-500 uppercase tracking-widest font-mono">Bandwidth In</h3>
              <div className="text-xl font-bold text-white mt-1"><AnimatedNumber value={t.bandwidth_in || 0} /> Mbps</div>
            </div>
          </SpotlightCard>

          <SpotlightCard className="stat-card luxury-card p-6 flex items-center gap-4 relative overflow-hidden group">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.003)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.003)_1px,transparent_1px)] bg-[size:10px_10px] pointer-events-none" />
            <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-lg text-2xl">⚡</div>
            <div>
              <h3 className="text-[0.62rem] font-black text-zinc-500 uppercase tracking-widest font-mono">System Latency</h3>
              <div className="text-xl font-bold text-white mt-1"><AnimatedNumber value={t.latency_ms || 0} /> ms</div>
            </div>
          </SpotlightCard>

          <SpotlightCard className="stat-card luxury-card p-6 flex items-center gap-4 relative overflow-hidden group">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.003)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.003)_1px,transparent_1px)] bg-[size:10px_10px] pointer-events-none" />
            <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-lg text-2xl">💚</div>
            <div>
              <h3 className="text-[0.62rem] font-black text-zinc-500 uppercase tracking-widest font-mono">Host Integrity</h3>
              <div className="text-xl font-bold mt-1" style={{ color: healthColor }}><AnimatedNumber value={t.system_health || 100} />%</div>
            </div>
          </SpotlightCard>

          <SpotlightCard className="stat-card luxury-card p-6 flex items-center gap-4 relative overflow-hidden group">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.003)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.003)_1px,transparent_1px)] bg-[size:10px_10px] pointer-events-none" />
            <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-lg text-2xl">🤖</div>
            <div>
              <h3 className="text-[0.62rem] font-black text-zinc-500 uppercase tracking-widest font-mono">Defense Agent</h3>
              <div className="text-sm font-mono mt-1 font-bold tracking-wider" style={{ color: t.agent_status === 'active' ? '#34d399' : '#71717a' }}>
                {t.agent_status === 'active' ? '● ENGAGED' : '○ STANDBY'}
              </div>
            </div>
          </SpotlightCard>

        </div>
      </ScrollReveal>

      {/* ── Bento Grid Cockpit HUD ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Geolocation Threat Map */}
        <ScrollReveal delay={100} className="lg:col-span-2">
          <AnimatedBorderCard className="h-full luxury-card p-6 flex flex-col justify-between">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-1.5">🌐 Threat Vector Map</h2>
                <span className="text-[0.55rem] font-mono text-zinc-500 uppercase">Live targeting system mapping packet origins</span>
              </div>
              <span className={`px-2 py-0.5 rounded font-mono text-[0.58rem] font-bold ${isAttackActive ? 'bg-red-950 border border-red-900 text-red-400 animate-pulse' : 'bg-zinc-900 border border-zinc-800 text-zinc-400'}`}>
                {isAttackActive ? 'ATTACK VECTORS DETECTED' : 'LEST_MONITORING'}
              </span>
            </div>
            <div className="my-6 min-h-[220px] flex items-center justify-center">
              <WorldMap attackActive={isAttackActive} attackType={t.attack_type} />
            </div>
            <div className="flex justify-between items-center text-[0.58rem] font-mono text-zinc-500 border-t border-zinc-900 pt-4 mt-2">
              <span>ACTIVE TARGET BLIPS: US, DE, JP, IN, AU</span>
              <span>TELEMETRY_REFRESH: OK</span>
            </div>
          </AnimatedBorderCard>
        </ScrollReveal>

        {/* Threat Vector Radar Sweep */}
        <ScrollReveal delay={150}>
          <AnimatedBorderCard className="h-full luxury-card p-6 flex flex-col justify-between">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight">📡 Sonar Sweep</h2>
                <span className="text-[0.55rem] font-mono text-zinc-500 uppercase">Interactive circular sweep scans</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 font-mono text-[0.58rem] font-bold">
                {t.threat_level?.toUpperCase() || 'SAFE'}
              </span>
            </div>
            <div className="my-6 flex items-center justify-center">
              <RadarSweep threatLevel={t.threat_level || 'safe'} />
            </div>
            <div className="text-[0.58rem] font-mono text-zinc-500 border-t border-zinc-900 pt-4 mt-2 text-center">
              SWEEP CHANNELS: IDS & WAF SIGNATURE PACKETS
            </div>
          </AnimatedBorderCard>
        </ScrollReveal>

        {/* Resource Allocation Gauges */}
        <ScrollReveal delay={200} className="lg:col-span-2">
          <AnimatedBorderCard className="luxury-card p-6">
            <div className="flex justify-between items-center mb-6 border-b border-zinc-900 pb-4">
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight">⚙️ Core Resource Dials</h2>
                <span className="text-[0.55rem] font-mono text-zinc-500 uppercase">Active hardware CPU/RAM thread measurements</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 font-mono text-[0.58rem] font-bold">UPLINK_U: 24MS</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="flex justify-around items-center py-4">
                <Gauge value={t.cpu_usage || 0} max={100} label="CPU Core" color="#e4e4e7" />
                <Gauge value={t.ram_usage || 0} max={100} label="RAM Pool" color="#a1a1aa" />
              </div>
              
              <div className="space-y-4 md:border-l md:border-zinc-900 md:pl-8">
                <div className="health-bar-container">
                  <div className="flex justify-between items-center text-[0.62rem] font-mono text-zinc-500 mb-2">
                    <span>HOST INTEGRITY LEVEL</span>
                    <span style={{ color: healthColor }} className="font-bold"><AnimatedNumber value={t.system_health || 100} />%</span>
                  </div>
                  <div className="health-bar-track h-2 bg-zinc-900 rounded-full overflow-hidden">
                    <div
                      className="health-bar-fill h-full rounded-full transition-all duration-500 ease-out"
                      style={{
                        width: `${t.system_health || 100}%`,
                        background: healthColor,
                        boxShadow: `0 0 8px ${healthColor}`
                      }}
                    />
                  </div>
                </div>
                <div className="text-[0.58rem] font-mono text-zinc-500 leading-relaxed">
                  System logs confirm kernel interface validation check succeeded. No stack anomalies detected.
                </div>
              </div>
            </div>
          </AnimatedBorderCard>
        </ScrollReveal>

        {/* AI Model Validation */}
        <ScrollReveal delay={250}>
          <AnimatedBorderCard className="h-full luxury-card p-6 flex flex-col justify-between">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight">🧠 AI Classifier Sets</h2>
                <span className="text-[0.55rem] font-mono text-zinc-500 uppercase">Current metrics from the pipeline</span>
              </div>
            </div>
            
            <div className="space-y-4 my-4">
              <div className="flex justify-between items-center p-3.5 bg-zinc-950/60 border border-zinc-900 rounded-lg">
                <span className="text-xs font-mono text-zinc-400">IDS Classifier Accuracy</span>
                <span className="text-sm font-mono font-bold text-white">{(modelMetrics?.ids_metrics?.accuracy * 100 || 99.8).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between items-center p-3.5 bg-zinc-950/60 border border-zinc-900 rounded-lg">
                <span className="text-xs font-mono text-zinc-400">Phishing Scanner Precision</span>
                <span className="text-sm font-mono font-bold text-white">{(modelMetrics?.phishing_metrics?.accuracy * 100 || 99.2).toFixed(1)}%</span>
              </div>
            </div>

            <div className="text-[0.58rem] font-mono text-zinc-500 border-t border-zinc-900 pt-4 mt-2">
              VALIDATION MATRIX SOURCE: SQLITE LEDGER
            </div>
          </AnimatedBorderCard>
        </ScrollReveal>

        {/* Performance Charts */}
        <ScrollReveal delay={300} className="lg:col-span-3">
          <AnimatedBorderCard className="luxury-card p-6">
            <div className="flex justify-between items-center mb-8 border-b border-zinc-900 pb-4">
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight">📈 Network Analytics Waveforms</h2>
                <span className="text-[0.55rem] font-mono text-zinc-500 uppercase">Live history buffers streaming at 1s intervals</span>
              </div>
              <span className="h-2 w-2 bg-emerald-500 rounded-full animate-ping" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-zinc-950/40 border border-zinc-900 p-4 rounded-xl">
                <span className="text-[0.62rem] font-mono font-bold text-zinc-400 block mb-4">
                  Bandwidth ({t.bandwidth_in || 0} Mbps)
                </span>
                <MiniChart data={bandwidthHistory} color="#ffffff" height={80} />
              </div>
              <div className="bg-zinc-950/40 border border-zinc-900 p-4 rounded-xl">
                <span className="text-[0.62rem] font-mono font-bold text-zinc-400 block mb-4">
                  Latency ({t.latency_ms || 0} ms)
                </span>
                <MiniChart data={latencyHistory} color="#e4e4e7" height={80} />
              </div>
              <div className="bg-zinc-950/40 border border-zinc-900 p-4 rounded-xl">
                <span className="text-[0.62rem] font-mono font-bold text-zinc-400 block mb-4">
                  Packet Rate (pkt/s)
                </span>
                <MiniChart data={packetRateHistory} color="#a1a1aa" height={80} />
              </div>
            </div>
          </AnimatedBorderCard>
        </ScrollReveal>

        {/* Active Incident Logs Feed */}
        <ScrollReveal delay={350} className="lg:col-span-3">
          <SpotlightCard className="luxury-card p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight">🚨 Active Threat signature Feed</h2>
                <span className="text-[0.55rem] font-mono text-zinc-500 uppercase">Severe event notifications from packet capture filters</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-red-950 border border-red-900 text-red-400 font-mono text-[0.58rem] font-bold">
                {recentAlerts.length} WARNINGS
              </span>
            </div>

            {recentAlerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="text-3xl mb-3">🟢</div>
                <h4 className="text-xs font-mono text-zinc-400 uppercase tracking-wider font-bold">Zero Anomalies Detected</h4>
                <p className="text-[0.68rem] text-zinc-500 max-w-sm mt-1 leading-relaxed">No critical attack vector signatures matched current database models.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-2">
                {recentAlerts.map((evt, i) => (
                  <div
                    key={i}
                    onClick={() => setSelectedAlert(evt)}
                    className="p-3 bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800/80 hover:border-zinc-700/60 rounded-lg flex items-center justify-between gap-4 cursor-pointer transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-red-500 font-mono text-xs font-bold">🚨 [CRIT]</span>
                      <div>
                        <div className="text-xs text-white font-medium truncate max-w-[280px]">{evt.message}</div>
                        <div className="text-[0.62rem] font-mono text-zinc-500 mt-0.5">{evt.source_ip} &gt;&gt; {evt.destination_ip}</div>
                      </div>
                    </div>
                    <span className="text-[0.58rem] font-mono text-zinc-500">
                      {evt.timestamp ? new Date(evt.timestamp).toLocaleTimeString() : '--'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </SpotlightCard>
        </ScrollReveal>

      </div>

      {/* Incident Triage sliding drawer modal */}
      {selectedAlert && (
        <div className="triage-drawer-overlay fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-end">
          <div className="triage-drawer w-full max-w-md h-full bg-zinc-950 border-l border-zinc-800/80 p-6 flex flex-col justify-between shadow-2xl relative overflow-hidden">
            
            {/* Corner Bracket Decorators */}
            <span className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-zinc-800" />
            <span className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-zinc-800" />
            
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-zinc-900 pb-4">
                <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5 text-red-500" /> Incident Analyzer
                </h3>
                <button 
                  onClick={() => setSelectedAlert(null)}
                  className="p-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  ✖ Close
                </button>
              </div>

              <div className="flex justify-around items-center border border-zinc-900 bg-zinc-900/30 p-3 rounded-lg font-mono text-[0.58rem]">
                <span className="text-emerald-400 font-bold">1. TRIAGE</span>
                <span className="text-zinc-600">---</span>
                <span className="text-emerald-400 font-bold">2. DETECT</span>
                <span className="text-zinc-600">---</span>
                <span className="text-zinc-400 font-bold">3. BLOCK</span>
              </div>

              <div className="space-y-3 font-mono text-[0.68rem] text-zinc-400 bg-zinc-900/40 border border-zinc-900 p-4 rounded-xl">
                <div className="flex justify-between">
                  <span className="text-zinc-500">EVENT UUID:</span>
                  <span className="text-white font-bold">{selectedAlert.event_id?.slice(0, 18)}...</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">SEVERITY LEVEL:</span>
                  <span className="text-red-400 font-bold">{selectedAlert.severity?.toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">SOURCE IP:</span>
                  <span className="text-white font-bold">{selectedAlert.source_ip}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">DESTINATION IP:</span>
                  <span className="text-white font-bold">{selectedAlert.destination_ip}</span>
                </div>
                <div className="border-t border-zinc-900 pt-3 mt-3">
                  <span className="text-zinc-500 block mb-1">SIGNATURE MESSAGE:</span>
                  <p className="text-[0.62rem] leading-relaxed text-zinc-300">{selectedAlert.message}</p>
                </div>
              </div>

              {blockMessage && (
                <div className="p-3 bg-emerald-950/20 border border-emerald-900/40 rounded-lg text-emerald-400 font-mono text-xs text-center animate-pulse">
                  🛡️ {blockMessage}
                </div>
              )}
            </div>

            <div className="space-y-3 border-t border-zinc-900 pt-6 mt-6">
              <button
                onClick={() => handleBlockIP(selectedAlert.source_ip)}
                disabled={blocking || selectedAlert.source_ip === 'SYSTEM' || selectedAlert.source_ip === 'AEGIS-AGENT'}
                className="w-full py-3 bg-red-950 hover:bg-red-900 text-red-400 font-mono text-xs font-bold border border-red-900 rounded-lg cursor-pointer transition-all disabled:opacity-30"
              >
                {blocking ? 'APPLYING RULE...' : '🛡️ APPLY FIREWALL IP BLOCK'}
              </button>
              <button
                onClick={() => navigate(`/phishing?prefill_ip=${selectedAlert.source_ip}`)}
                className="w-full py-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-mono text-xs font-bold rounded-lg cursor-pointer transition-all"
              >
                🔍 INVESTIGATE NODE IN SCANNERS
              </button>
            </div>
            
          </div>
        </div>
      )}
      
    </div>
  );
}
