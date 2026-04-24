import React from 'react';
import { useAuth } from '../context/AuthContext';
import StatsGrid from './StatsGrid';
import AlertsPanel from './AlertsPanel';
import ActivityFeed from './ActivityFeed';
import QuickActions from './QuickActions';
import '../styling/Dashboard.css';

function Dashboard() {
  const { user, can } = useAuth();

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="dashboard-intro">
          <h2 className="dashboard-welcome">
            {greeting()}, {user?.name?.split(' ')[0] || 'User'}
          </h2>
          <p className="dashboard-date">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
            })}
          </p>
          <span className={`role-badge role-badge--${user?.role}`}>
            {user?.role?.toUpperCase()}
          </span>
        </div>
        {(can('asset_create') || can('consumable_stockin')) && <QuickActions />}
      </div>

      {/* StatsGrid now fetches its own data */}
      <StatsGrid />

      <div className="dashboard-grid">
        {/* Alerts only for admin/manager */}
        {can('log_view') ? <AlertsPanel /> : <div className="no-access">Activity logs restricted.</div>}
        <ActivityFeed />
      </div>
    </div>
  );
}

export default Dashboard;