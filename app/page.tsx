import { StatsGrid } from '@/components/dashboard/stats-grid'
import { AlertsPanel } from '@/components/dashboard/alerts-panel'
import { ActivityFeed } from '@/components/dashboard/activity-feed'
import { QuickActions } from '@/components/dashboard/quick-actions'

import './page.css'

export default function DashboardPage() {
  return (
    <div className="dashboard">
      {/* Page Header */}
      <div className="dashboard-header">
        <h1 className="dashboard-title">Dashboard</h1>
        <p className="dashboard-description">
          Overview of your inventory and proactive alerts
        </p>
      </div>

      {/* Stats Grid */}
      <StatsGrid />

      {/* Main Content Grid */}
      <div className="dashboard-content">
        {/* Alerts Section */}
        <div className="dashboard-alerts">
          <AlertsPanel />
        </div>

        {/* Recent Activity Section */}
        <div className="dashboard-activity">
          <ActivityFeed />
        </div>
      </div>

      {/* Quick Actions */}
      <QuickActions />
    </div>
  )
}
