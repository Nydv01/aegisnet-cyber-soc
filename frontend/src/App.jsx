import { useState, useEffect, useRef, useCallback } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Simulator from './components/Simulator';
import Phishing from './components/Phishing';
import Logs from './components/Logs';
import Landing from './components/Landing';
import Auth from './components/Auth';
import MatrixBackground from './components/MatrixBackground';
import InteractiveDock from './components/InteractiveDock';
import AuroraBackground from './components/AuroraBackground';
import './index.css';

const WS_URL = 'ws://localhost:8000/ws/telemetry';
const API_URL = 'http://localhost:8000';

export default function App() {
  const [telemetry, setTelemetry] = useState(null);
  const [events, setEvents] = useState([]);
  const [connected, setConnected] = useState(false);
  const [user, setUser] = useState(() => localStorage.getItem('aegis_user'));
  const wsRef = useRef(null);
  const reconnectTimerRef = useRef(null);

  const handleLogout = () => {
    localStorage.removeItem('aegis_token');
    localStorage.removeItem('aegis_user');
    setUser(null);
    window.location.href = '/';
  };

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
  }, []);

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
    <BrowserRouter>
      <div className="app-layout">
        {/* Animated Cyber Digital Matrix & Aurora Background */}
        <MatrixBackground attackActive={isAttack} intensity={intensity} />
        <AuroraBackground />

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

        {/* Main Content Area */}
        <main className="main-content-full" role="main">
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
          </Routes>
        </main>

        {/* Floating Magnified Dock Navigation */}
        <InteractiveDock />
      </div>
    </BrowserRouter>
  );
}
