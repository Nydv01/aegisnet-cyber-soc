import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * CommandPalette — Ctrl+K spotlight-style command palette.
 * Quick navigate, launch attacks, scan URLs, toggle agent.
 * Features fuzzy search and keyboard navigation.
 */

const COMMANDS = [
  { id: 'home', icon: '🏠', label: 'Go to Home', category: 'Navigation', action: 'navigate', path: '/' },
  { id: 'dashboard', icon: '📊', label: 'Go to Dashboard', category: 'Navigation', action: 'navigate', path: '/dashboard' },
  { id: 'simulator', icon: '⚔️', label: 'Go to Simulator', category: 'Navigation', action: 'navigate', path: '/simulator' },
  { id: 'phishing', icon: '🔍', label: 'Go to Phishing Scanner', category: 'Navigation', action: 'navigate', path: '/phishing' },
  { id: 'logs', icon: '📋', label: 'Go to Security Logs', category: 'Navigation', action: 'navigate', path: '/logs' },
  { id: 'models', icon: '🧠', label: 'Go to AI Models', category: 'Navigation', action: 'navigate', path: '/models' },
  { id: 'ddos', icon: '💥', label: 'Launch DDoS Attack', category: 'Attacks', action: 'attack', type: 'ddos' },
  { id: 'portscan', icon: '🔭', label: 'Launch Port Scan', category: 'Attacks', action: 'attack', type: 'port_scan' },
  { id: 'bruteforce', icon: '🔐', label: 'Launch Brute Force', category: 'Attacks', action: 'attack', type: 'brute_force' },
  { id: 'sqli', icon: '💉', label: 'Launch SQL Injection', category: 'Attacks', action: 'attack', type: 'sql_injection' },
  { id: 'stopattack', icon: '⏹', label: 'Stop Active Attack', category: 'Attacks', action: 'stop_attack' },
  { id: 'agent-on', icon: '🤖', label: 'Enable Defense Agent', category: 'Agent', action: 'agent', enabled: true },
  { id: 'agent-off', icon: '🛑', label: 'Disable Defense Agent', category: 'Agent', action: 'agent', enabled: false },
  { id: 'scan-url', icon: '🌐', label: 'Scan URL for Phishing', category: 'Tools', action: 'scan_url' },
  { id: 'logout', icon: '🚪', label: 'Logout', category: 'System', action: 'logout' },
];

const API = 'http://localhost:8000';

export default function CommandPalette({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Filter commands by fuzzy match
  const filtered = COMMANDS.filter((cmd) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      cmd.label.toLowerCase().includes(q) ||
      cmd.category.toLowerCase().includes(q)
    );
  });

  // Group by category
  const groups = {};
  for (const cmd of filtered) {
    if (!groups[cmd.category]) groups[cmd.category] = [];
    groups[cmd.category].push(cmd);
  }

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const executeCommand = useCallback(async (cmd) => {
    onClose();

    switch (cmd.action) {
      case 'navigate':
        navigate(cmd.path);
        break;
      case 'attack':
        try {
          await fetch(`${API}/api/simulate-attack`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ attack_type: cmd.type, intensity: 0.7 }),
          });
        } catch (e) { /* ignore */ }
        break;
      case 'stop_attack':
        try {
          await fetch(`${API}/api/stop-attack`, { method: 'POST' });
        } catch (e) { /* ignore */ }
        break;
      case 'agent':
        try {
          await fetch(`${API}/api/agent-control`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ enabled: cmd.enabled }),
          });
        } catch (e) { /* ignore */ }
        break;
      case 'scan_url':
        navigate('/phishing');
        break;
      case 'logout':
        localStorage.removeItem('aegis_token');
        localStorage.removeItem('aegis_user');
        window.location.href = '/';
        break;
      default:
        break;
    }
  }, [navigate, onClose]);

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && filtered[selectedIndex]) {
      e.preventDefault();
      executeCommand(filtered[selectedIndex]);
    }
  };

  if (!isOpen) return null;

  let flatIndex = 0;

  return (
    <div className="command-palette-overlay" onClick={onClose}>
      <div className="command-palette" onClick={(e) => e.stopPropagation()}>
        <div className="command-palette-input-wrapper">
          <span className="command-palette-search-icon">⌘</span>
          <input
            ref={inputRef}
            type="text"
            className="command-palette-input"
            placeholder="Type a command..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            autoComplete="off"
            spellCheck="false"
          />
          <kbd className="command-palette-kbd">ESC</kbd>
        </div>
        <div className="command-palette-results">
          {Object.entries(groups).map(([category, cmds]) => (
            <div key={category} className="command-palette-group">
              <div className="command-palette-group-label">{category}</div>
              {cmds.map((cmd) => {
                const idx = flatIndex++;
                return (
                  <button
                    key={cmd.id}
                    className={`command-palette-item ${idx === selectedIndex ? 'selected' : ''}`}
                    onClick={() => executeCommand(cmd)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                  >
                    <span className="command-palette-item-icon">{cmd.icon}</span>
                    <span className="command-palette-item-label">{cmd.label}</span>
                    {idx === selectedIndex && (
                      <span className="command-palette-item-hint">↵</span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="command-palette-empty">
              No commands found for "{query}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
