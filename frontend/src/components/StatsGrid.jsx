import React, { useState, useEffect } from 'react';
import { Package, Boxes, MapPin, AlertTriangle } from 'lucide-react';
import { dashboardAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import '../styling/StatsGrid.css';

function StatsGrid() {
  const [stats, setStats] = useState({ assets: 0, consumables: 0, locations: 0, alerts: 0 });
  const [loading, setLoading] = useState(true);
  const navigate      = useNavigate();

  useEffect(() => {
    async function fetchStats() {
      try {
        const data = await dashboardAPI.getStats();
        setStats(data);
      } catch (err) {
        console.error("Dashboard Stats Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) return <div className="stats-grid-loading">Loading Dashboard...</div>;

  const cards = [
    { title: 'Total Assets', value: stats.assets, icon: Package, color: 'primary', path: '/assets' },
    { title: 'Consumables', value: stats.consumables, icon: Boxes, color: 'info', path: '/consumables' },
    { title: 'Locations', value: stats.locations, icon: MapPin, color: 'success', path: '/locations' },
    { title: 'Active Alerts', value: stats.alerts, icon: AlertTriangle, color: 'warning', path: '/alerts' }
  ];

  return (
    <div className="stats-grid">
      {cards.map((item, idx) => {
        const Icon = item.icon;
        return (
          /* 3. Attach the onClick to the div and add a 'pointer' cursor style in CSS */
          <div 
            key={idx} 
            className={`stat-card stat-card--${item.color}`}
            onClick={() => {
              // FIX: Accessing 'path' because that is what we named it in the array
              if (item.path) {
                console.log(`Navigating to: ${item.path}`); 
                navigate(item.path);
              } else {
                console.error("Navigation Error: Path is undefined for", item.title);
              }
            }}
          >
            <div className="stat-header">
              <span className="stat-title">{item.title}</span>
              <div className={`stat-icon stat-icon--${item.color}`}><Icon size={20} /></div>
            </div>
            <div className="stat-value">{item.value?.toLocaleString() || 0}</div>
          </div>
        );
      })}
    </div>
  );
}

export default StatsGrid;