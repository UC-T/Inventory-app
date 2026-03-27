import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Menu, 
  Search, 
  Bell, 
  X,
  AlertTriangle,
  Package,
  Clock
} from 'lucide-react';
import '../styling/Header.css';

const pageTitles = {
  '/': 'Dashboard',
  '/assets': 'Assets',
  '/consumables': 'Consumables',
  '/locations': 'Locations',
  '/categories': 'Categories',
  '/activity': 'Activity Log',
  '/settings': 'Settings',
};

const mockNotifications = [
  {
    id: 1,
    type: 'warning',
    title: 'Low Stock Alert',
    message: 'RG-6 Coax Cable below minimum threshold',
    time: '5 min ago',
    icon: AlertTriangle
  },
  {
    id: 2,
    type: 'info',
    title: 'Asset Checked Out',
    message: 'PTZ Camera #CAM-0042 assigned to John D.',
    time: '1 hour ago',
    icon: Package
  },
  {
    id: 3,
    type: 'warning',
    title: 'Warranty Expiring',
    message: '3 assets have warranties expiring this month',
    time: '2 hours ago',
    icon: Clock
  }
];

function Header({ onMenuClick, collapsed }) {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);

  const pageTitle = pageTitles[location.pathname] || 'Dashboard';
  const unreadCount = mockNotifications.length;

  return (
    <header className="header">
      <div className="header-left">
        <button 
          className="menu-toggle"
          onClick={onMenuClick}
          aria-label="Toggle menu"
        >
          <Menu size={20} />
        </button>
        <h1 className="header-title">{pageTitle}</h1>
      </div>

      <div className="header-center">
        <div className="search-container">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search assets, consumables, locations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <span className="search-shortcut">
            <kbd>Ctrl</kbd>
            <kbd>K</kbd>
          </span>
        </div>
      </div>

      <div className="header-right">
        <div className="notifications-wrapper">
          <button 
            className={`notification-btn ${showNotifications ? 'active' : ''}`}
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="Notifications"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="notification-badge">{unreadCount}</span>
            )}
          </button>

          {showNotifications && (
            <div className="notifications-dropdown">
              <div className="notifications-header">
                <span className="notifications-title">Notifications</span>
                <button 
                  className="notifications-close"
                  onClick={() => setShowNotifications(false)}
                >
                  <X size={16} />
                </button>
              </div>
              <div className="notifications-list">
                {mockNotifications.map((notification) => {
                  const Icon = notification.icon;
                  return (
                    <div 
                      key={notification.id} 
                      className={`notification-item ${notification.type}`}
                    >
                      <div className="notification-icon">
                        <Icon size={16} />
                      </div>
                      <div className="notification-content">
                        <span className="notification-item-title">
                          {notification.title}
                        </span>
                        <span className="notification-message">
                          {notification.message}
                        </span>
                        <span className="notification-time">
                          {notification.time}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <button className="notifications-view-all">
                View all notifications
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
