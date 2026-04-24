import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Menu, Search, Bell, X, AlertTriangle, Package, Database, MapPin
} from 'lucide-react';
// Corrected Import
import api, { dashboardAPI } from '../services/api'; 
// Use the library we installed
import { formatDistanceToNow } from 'date-fns'; 
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

function Header({ onMenuClick }) {
  const location = useLocation();
  const navigate = useNavigate();
  const searchRef = useRef(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const pageTitle = pageTitles[location.pathname] || 'Dashboard';

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const data = await dashboardAPI.getAlerts();
        setNotifications(data || []);
      } catch (err) { console.error("Notification fetch failed", err); }
    };
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.length > 1) {
        try {
          const res = await api.get(`/search?q=${searchQuery}`);
          setSearchResults(res.data || res); 
          setShowSearch(true);
        } catch (err) { console.error("Search failed", err); }
      } else {
        setSearchResults([]);
        setShowSearch(false);
      }
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  return (
    <header className="header">
      <div className="header-left">
        <button className="menu-toggle" onClick={onMenuClick}><Menu size={20} /></button>
        <h1 className="header-title">{pageTitle}</h1>
      </div>

      <div className="header-center" ref={searchRef}>
        <div className="search-container">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search database..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => searchQuery.length > 1 && setShowSearch(true)}
          />
          
          {showSearch && searchResults.length > 0 && (
            <div className="search-results-dropdown">
              {searchResults.map((res, i) => (
                <div key={i} className="search-result-item" onClick={() => {
                  navigate(res.path);
                  setShowSearch(false);
                  setSearchQuery('');
                }}>
                  <div className="res-icon">
                    {res.type === 'Asset' ? <Package size={14}/> : res.type === 'Location' ? <MapPin size={14}/> : <Database size={14}/>}
                  </div>
                  <div className="res-info">
                    <span className="res-name">{res.name}</span>
                    <span className="res-meta">{res.type} • {res.id}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="header-right">
        <div className="notifications-wrapper">
          <button className={`notification-btn ${showNotifications ? 'active' : ''}`} onClick={() => setShowNotifications(!showNotifications)}>
            <Bell size={20} />
            {notifications.length > 0 && <span className="notification-badge">{notifications.length}</span>}
          </button>

          {showNotifications && (
            <div className="notifications-dropdown">
              <div className="notifications-header">
                <span className="notifications-title">Critical Alerts</span>
                <button onClick={() => setShowNotifications(false)}><X size={16} /></button>
              </div>
              <div className="notifications-list">
                {notifications.length === 0 ? <p className="empty-msg">No active alerts</p> : 
                  notifications.map((n) => (
                    <div key={n.id} className="notification-item warning">
                      <div className="notification-icon"><AlertTriangle size={16} /></div>
                      <div className="notification-content">
                        <span className="notification-item-title">Low Stock: {n.name}</span>
                        {/* THE LIBRARY IS NOW USED HERE */}
                        <span className="notification-time">
                          {formatDistanceToNow(new Date(n.updated_at || new Date()), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  ))
                }
              </div>
              <button className="notifications-view-all" onClick={() => navigate('/activity')}>
                View Activity Log
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;