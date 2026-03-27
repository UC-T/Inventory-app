import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  Boxes, 
  MapPin, 
  Tags, 
  Activity,
  Settings,
  ChevronLeft,
  ChevronRight,
  Radio,
  LogOut,
  User,
  HelpCircle
} from 'lucide-react';
import '../styling/SideBar.css';

const navigationItems = [
  {
    title: 'Main',
    items: [
      { name: 'Dashboard', path: '/', icon: LayoutDashboard },
      { name: 'Assets', path: '/assets', icon: Package },
      { name: 'Consumables', path: '/consumables', icon: Boxes },
      { name: 'Locations', path: '/locations', icon: MapPin },
      { name: 'Categories', path: '/categories', icon: Tags },
    ]
  },
  {
    title: 'System',
    items: [
      { name: 'Activity Log', path: '/activity', icon: Activity },
      { name: 'Settings', path: '/settings', icon: Settings },
    ]
  }
];

function SideBar({ collapsed, onToggle }) {
  const location = useLocation();

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      {/* Logo Section */}
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="logo-icon">
            <Radio size={24} />
          </div>
          {!collapsed && (
            <div className="logo-text">
              <span className="logo-title">AssetTrack</span>
              <span className="logo-subtitle">Inventory System</span>
            </div>
          )}
        </div>
        <button 
          className="sidebar-toggle"
          onClick={onToggle}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {navigationItems.map((group) => (
          <div key={group.title} className="nav-group">
            {!collapsed && <span className="nav-group-title">{group.title}</span>}
            <ul className="nav-list">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <li key={item.path}>
                    <NavLink
                      to={item.path}
                      className={`nav-item ${isActive ? 'active' : ''}`}
                      title={collapsed ? item.name : undefined}
                    >
                      <Icon size={20} className="nav-icon" />
                      {!collapsed && <span className="nav-label">{item.name}</span>}
                      {isActive && <span className="nav-indicator" />}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <button className="footer-btn" title="Help">
          <HelpCircle size={20} />
          {!collapsed && <span>Help & Support</span>}
        </button>
        <div className="user-section">
          <div className="user-avatar">
            <User size={18} />
          </div>
          {!collapsed && (
            <div className="user-info">
              <span className="user-name">Admin User</span>
              <span className="user-role">Administrator</span>
            </div>
          )}
          <button className="logout-btn" title="Sign out">
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
}

export default SideBar;
