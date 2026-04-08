import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, Boxes, MapPin, Tags,
  Activity, Settings, ChevronLeft, ChevronRight,
  Radio, LogOut, User, HelpCircle, Shield
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import '../styling/SideBar.css';

function SideBar({ collapsed, onToggle }) {
  const location = useLocation();
  const navigate  = useNavigate();
  const { user, logout, can } = useAuth();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  // Build nav dynamically based on permissions
  const mainItems = [
    { name: 'Dashboard',    path: '/',            icon: LayoutDashboard, permission: null },
    { name: 'Assets',       path: '/assets',      icon: Package,         permission: 'asset_view' },
    { name: 'Consumables',  path: '/consumables', icon: Boxes,           permission: 'consumable_view' },
    { name: 'Locations',    path: '/locations',   icon: MapPin,          permission: 'location_manage' },
    { name: 'Categories',   path: '/categories',  icon: Tags,            permission: 'category_manage' },
  ].filter(item => !item.permission || can(item.permission));

  const systemItems = [
    { name: 'Activity Log', path: '/activity', icon: Activity, permission: 'log_view'      },
    { name: 'Settings',     path: '/settings', icon: Settings, permission: 'settings_view' },
  ].filter(item => can(item.permission));

  const groups = [
    { title: 'Main',   items: mainItems   },
    { title: 'System', items: systemItems },
  ].filter(g => g.items.length > 0);

  const roleLabel = {
    'admin':    'Administrator',
    'manager':  'Manager',
    'end-user': 'End User',
  }[user?.role] || user?.role;

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      {/* ── Logo ─────────────────────────────────────────────────── */}
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="logo-icon">
            <Radio size={22} />
          </div>
          {!collapsed && (
            <div className="logo-text">
              <span className="logo-title">AssetTrack</span>
              <span className="logo-subtitle">Inventory System</span>
            </div>
          )}
        </div>
        <button className="sidebar-toggle" onClick={onToggle}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
          {collapsed ? <ChevronRight size={17} /> : <ChevronLeft size={17} />}
        </button>
      </div>

      {/* ── Navigation ───────────────────────────────────────────── */}
      <nav className="sidebar-nav">
        {groups.map(group => (
          <div key={group.title} className="nav-group">
            {!collapsed && <span className="nav-group-title">{group.title}</span>}
            <ul className="nav-list">
              {group.items.map(item => {
                const Icon     = item.icon;
                const isActive = location.pathname === item.path ||
                  (item.path !== '/' && location.pathname.startsWith(item.path));
                return (
                  <li key={item.path}>
                    <NavLink to={item.path}
                      className={`nav-item ${isActive ? 'active' : ''}`}
                      title={collapsed ? item.name : undefined}>
                      <Icon size={19} className="nav-icon" />
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

      {/* ── Footer ───────────────────────────────────────────────── */}
      <div className="sidebar-footer">
        <button className="footer-btn" title="Help & Support">
          <HelpCircle size={19} />
          {!collapsed && <span>Help & Support</span>}
        </button>

        <div className="user-section">
          <div className="user-avatar" title={user?.name}>
            {user?.role === 'admin'
              ? <Shield size={16} />
              : <User size={16} />
            }
          </div>
          {!collapsed && (
            <div className="user-info">
              <span className="user-name">{user?.name || 'User'}</span>
              <span className="user-role">{roleLabel}</span>
            </div>
          )}
          <button className="logout-btn" title="Sign out" onClick={handleLogout}>
            <LogOut size={17} />
          </button>
        </div>
      </div>
    </aside>
  );
}

export default SideBar;