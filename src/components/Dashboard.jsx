import React from 'react';
import StatsGrid from './StatsGrid';
import AlertsPanel from './AlertsPanel';
import ActivityFeed from './ActivityFeed';
import QuickActions from './QuickActions';
import '../styling/Dashboard.css';

function Dashboard() {
  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="dashboard-intro">
          <h2 className="dashboard-welcome">Welcome back, Admin</h2>
          <p className="dashboard-date">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
        <QuickActions />
      </div>

      <StatsGrid />

      <div className="dashboard-grid">
        <AlertsPanel />
        <ActivityFeed />
      </div>
    </div>
  );
}

export default Dashboard;
