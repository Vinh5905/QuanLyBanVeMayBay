import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './AppLayout.css';

export interface AppLayoutProps {
  role: 'Admin' | 'Staff' | 'Agent' | 'User';
  children: React.ReactNode;
}

const MENU_ITEMS = {
  Admin: [
    { label: 'Dashboard', path: '/admin' },
    { label: 'User Management', path: '/admin/users' },
    { label: 'Revenue Reports', path: '/admin/reports' },
    { label: 'Settings', path: '/admin/settings' },
  ],
  Staff: [
    { label: 'Dashboard', path: '/staff' },
    { label: 'Flights', path: '/staff/flights' },
    { label: 'Tickets', path: '/staff/tickets' },
    { label: 'POS', path: '/staff/pos' },
    { label: 'Baggage', path: '/staff/baggage' },
  ],
  Agent: [
    { label: 'Dashboard', path: '/agent' },
    { label: 'Search Flights', path: '/agent/search' },
    { label: 'My Bookings', path: '/agent/bookings' },
  ],
  User: [
    { label: 'Home', path: '/' },
    { label: 'My Bookings', path: '/bookings' },
    { label: 'Online Check-in', path: '/check-in' },
  ]
};

export const AppLayout: React.FC<AppLayoutProps> = ({ role, children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const menus = MENU_ITEMS[role] || [];

  return (
    <div className="ds-layout">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="ds-layout__overlay" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`ds-sidebar ${isSidebarOpen ? 'ds-sidebar--open' : ''}`}>
        <div className="ds-sidebar__header">
          <div className="ds-sidebar__logo">
            <span className="ds-sidebar__logo-icon">✈️</span>
            <span className="ds-sidebar__logo-text">QAirline</span>
          </div>
        </div>
        <nav className="ds-sidebar__nav">
          <ul className="ds-sidebar__menu">
            {menus.map((item) => {
              const isActive = location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
              return (
                <li key={item.path}>
                  <Link 
                    to={item.path} 
                    className={`ds-sidebar__link ${isActive ? 'ds-sidebar__link--active' : ''}`}
                    onClick={() => setIsSidebarOpen(false)}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="ds-sidebar__footer">
          <div className="ds-sidebar__user">
            <div className="ds-avatar">{role.charAt(0)}</div>
            <div className="ds-user-info">
              <div className="ds-user-name">{role} User</div>
              <div className="ds-user-role">{role}</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="ds-layout__main">
        {/* Header */}
        <header className="ds-header">
          <button 
            className="ds-header__menu-btn"
            onClick={() => setIsSidebarOpen(true)}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
          
          <div className="ds-breadcrumb">
            <span className="ds-breadcrumb__item">Home</span>
            <span className="ds-breadcrumb__separator">/</span>
            <span className="ds-breadcrumb__item ds-breadcrumb__item--active">Current Page</span>
          </div>

          <div className="ds-header__actions">
            <button className="ds-header__action-btn" aria-label="Notifications">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
            </button>
          </div>
        </header>

        {/* Content Area */}
        <main className="ds-content">
          {children}
        </main>
      </div>
    </div>
  );
};
