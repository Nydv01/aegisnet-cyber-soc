import { NavLink } from 'react-router-dom';

const navItems = [
  { path: '/', icon: '📊', label: 'Dashboard', desc: 'System Overview' },
  { path: '/simulator', icon: '⚔️', label: 'Attack Simulator', desc: 'Launch & Defend' },
  { path: '/phishing', icon: '🔍', label: 'URL Scanner', desc: 'Phishing Detection' },
  { path: '/logs', icon: '📋', label: 'Security Logs', desc: 'Event History' },
];

export default function Sidebar({ connected }) {
  return (
    <aside className="sidebar" role="navigation" aria-label="Main navigation">
      <div className="sidebar-logo">
        <div className="logo-icon">🛡️</div>
        <div className="logo-text">
          <h1>AegisNet</h1>
          <span>Threat Intelligence</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            id={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className={`sidebar-status ${connected ? '' : 'offline'}`}>
          <span className="status-dot" />
          {connected ? 'System Online' : 'Connecting...'}
        </div>
      </div>
    </aside>
  );
}
