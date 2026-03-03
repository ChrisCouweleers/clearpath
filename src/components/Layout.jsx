import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

export default function Layout({ children }) {
  const [theme, setTheme] = useState(
    () => document.documentElement.getAttribute('data-theme') || 'light'
  );
  const location = useLocation();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('clearpath-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => (t === 'light' ? 'dark' : 'light'));

  const navItems = [
    { to: '/', label: '🏠 Home' },
    { to: '/mortgage', label: '🏡 Mortgage' },
    { to: '/auto-loan', label: '🚗 Auto Loan' },
  ];

  return (
    <div className="app">
      {/* Header */}
      <div className="header">
        <div className="theme-toggle-wrap">
          <div className="theme-toggle" onClick={toggleTheme} role="button" tabIndex={0} title="Toggle light/dark mode">
            <span className={`theme-toggle-icon${theme === 'light' ? ' dim' : ''}`}>🌙</span>
            <div className="theme-toggle-track">
              <div className="theme-toggle-thumb" />
            </div>
            <span className={`theme-toggle-icon${theme !== 'light' ? ' dim' : ''}`}>☀️</span>
          </div>
        </div>
        <div className="badge">Clearpath</div>
        <h1>{getPageTitle(location.pathname)}</h1>
        <p>{getPageSubtitle(location.pathname)}</p>
      </div>

      {/* Navigation */}
      <nav className="nav-bar">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            end={item.to === '/'}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Page Content */}
      {children}

      {/* Footer */}
      <footer className="footer">
        <div className="footer-brand"><span>Clearpath</span></div>
        <p>&copy; 2026 Clearpath. All rights reserved.</p>
      </footer>
    </div>
  );
}

function getPageTitle(path) {
  switch (path) {
    case '/mortgage': return 'Mortgage Calculator';
    case '/auto-loan': return 'Auto Loan Calculator';
    default: return 'Financial Calculators';
  }
}

function getPageSubtitle(path) {
  switch (path) {
    case '/mortgage': return 'Estimate your monthly payments and see the full cost breakdown';
    case '/auto-loan': return 'Calculate your monthly car payment and total loan cost';
    default: return 'Simple, modern tools to help you make smarter financial decisions';
  }
}
