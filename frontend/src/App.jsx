import { useState, useEffect, useRef, useCallback } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Simulator from './components/Simulator';
import Phishing from './components/Phishing';
import Logs from './components/Logs';
import Landing from './components/Landing';
import Models from './components/Models';
import Auth from './components/Auth';
import MatrixBackground from './components/MatrixBackground';
import InteractiveDock from './components/InteractiveDock';
import AuroraBackground from './components/AuroraBackground';
import ParticleField from './components/ParticleField';
import PageTransition from './components/PageTransition';
import CommandPalette from './components/CommandPalette';
import { ToastProvider, useToast } from './components/ToastNotification';
import { InteractiveGrid } from './components/ui/cyber-effects';
import './index.css';

const WS_URL = 'ws://localhost:8000/ws/telemetry';
const API_URL = 'http://localhost:8000';

function AppContent() {
  const [telemetry, setTelemetry] = useState(null);
  const [events, setEvents] = useState([]);
  const [connected, setConnected] = useState(false);
  const [user, setUser] = useState(() => localStorage.getItem('aegis_user'));
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const wsRef = useRef(null);
  const reconnectTimerRef = useRef(null);
  const toast = useToast();

  const handleLogout = () => {
    localStorage.removeItem('aegis_token');
    localStorage.removeItem('aegis_user');
    setUser(null);
    window.location.href = '/';
  };

  // ── Ctrl+K Command Palette ──
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setCommandPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // ── WebSocket Connection with Auto-Reconnect ──
  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('[WS] Connected');
      setConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);

        if (msg.type === 'telemetry') {
          setTelemetry(msg.data);

          // Fire toast on attack detection
          if (msg.data?.attack_type && msg.data.attack_type !== 'none') {
            const attackName = msg.data.attack_type.replace(/_/g, ' ').toUpperCase();
            if (!window._lastAttackToast || Date.now() - window._lastAttackToast > 10000) {
              window._lastAttackToast = Date.now();
              toast?.addToast(`${attackName} attack detected — Threat Level: ${msg.data.threat_level}`, {
                severity: 'danger',
                duration: 6000,
                icon: '🚨',
              });
            }
          }

          // Fire toast on agent action
          if (msg.data?.agent_last_action && msg.data.agent_last_action !== 'idle' && msg.data.agent_last_action !== 'do_nothing') {
            if (!window._lastAgentToast || Date.now() - window._lastAgentToast > 8000) {
              window._lastAgentToast = Date.now();
              toast?.addToast(`Agent: ${msg.data.agent_last_action.replace(/_/g, ' ')}`, {
                severity: 'agent',
                duration: 4000,
                icon: '🤖',
              });
            }
          }
        } else if (msg.type === 'events') {
          setEvents(msg.data);
        }
      } catch (e) {
        console.error('[WS] Parse error:', e);
      }
    };

    ws.onclose = () => {
      console.log('[WS] Disconnected');
      setConnected(false);
      wsRef.current = null;
      // Auto-reconnect after 3 seconds
      reconnectTimerRef.current = setTimeout(connect, 3000);
    };

    ws.onerror = (err) => {
      console.error('[WS] Error:', err);
      ws.close();
    };
  }, [toast]);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      if (wsRef.current) wsRef.current.close();
    };
  }, [connect]);

  // ── Poll events via REST as WebSocket backup ──
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch(`${API_URL}/api/logs?limit=50`);
        if (res.ok) setEvents(await res.json());
      } catch (e) { /* silent */ }
    };
    fetchEvents();
    const interval = setInterval(fetchEvents, 3000);
    return () => clearInterval(interval);
  }, []);

  const isAttack = telemetry?.attack_type && telemetry.attack_type !== 'none';
  const intensity = telemetry?.attack_intensity || 0.5;

  return (
    <div className="app-layout">
      <MatrixBackground attackActive={isAttack} intensity={intensity} />
      <AuroraBackground />
      <ParticleField attackActive={isAttack} intensity={intensity} />
      <InteractiveGrid />

      {/* Global Glass Top Navbar */}
      <header className="global-navbar">
        <div className="navbar-logo">
          <span className="logo-icon">🛡️</span>
          <div className="logo-text">
            <h1>AegisNet</h1>
            <span>AI Autonomous SOC</span>
          </div>
        </div>

        <div className="navbar-status-area" style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {/* Command Palette Hint */}
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setCommandPaletteOpen(true)}
            style={{ gap: 6, opacity: 0.7 }}
          >
            <span>⌘</span>
            <kbd style={{
              fontSize: '0.62rem',
              padding: '2px 6px',
              borderRadius: 4,
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              fontFamily: 'var(--font-mono)',
            }}>K</kbd>
          </button>

          {user && (
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                OP: {user.toUpperCase()}
              </span>
              <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
                🚪 Exit
              </button>
            </div>
          )}
          <div className={`navbar-status-pill ${connected ? '' : 'offline'}`}>
            <span className="status-dot" />
            {connected ? 'CORE ONLINE' : 'DISCONNECTED'}
          </div>
        </div>
      </header>

      {/* Main Content Area with Page Transitions */}
      <main className="main-content-full" role="main">
        <PageTransition>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Auth onLogin={(username) => setUser(username)} />} />
            <Route
              path="/dashboard"
              element={user ? <Dashboard telemetry={telemetry} events={events} /> : <Auth onLogin={(username) => setUser(username)} />}
            />
            <Route
              path="/simulator"
              element={user ? <Simulator telemetry={telemetry} events={events} /> : <Auth onLogin={(username) => setUser(username)} />}
            />
            <Route
              path="/phishing"
              element={user ? <Phishing /> : <Auth onLogin={(username) => setUser(username)} />}
            />
            <Route
              path="/logs"
              element={user ? <Logs /> : <Auth onLogin={(username) => setUser(username)} />}
            />
            <Route
              path="/models"
              element={user ? <Models /> : <Auth onLogin={(username) => setUser(username)} />}
            />
          </Routes>
        </PageTransition>
      </main>

      {/* Floating Magnified Dock Navigation */}
      <InteractiveDock />

      {/* Command Palette */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </BrowserRouter>
  );
}
