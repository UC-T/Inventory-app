import React from 'react';
import { AlertTriangle, Clock, Package, ChevronRight, ShieldAlert } from 'lucide-react';
import '../styling/AlertsPanel.css';

const alerts = [
  {
    id: 1,
    type: 'critical',
    title: 'Low Stock Critical',
    message: 'RG-6 Coax Cable (1000ft) - Only 2 units remaining',
    time: '5 minutes ago',
    icon: AlertTriangle
  },
  {
    id: 2,
    type: 'warning',
    title: 'Warranty Expiring',
    message: 'PTZ Camera #CAM-0042 warranty expires in 7 days',
    time: '1 hour ago',
    icon: Clock
  },
  {
    id: 3,
    type: 'warning',
    title: 'Asset Overdue',
    message: 'Thermal Imaging Camera checked out 5 days past due date',
    time: '2 hours ago',
    icon: Package
  },
  {
    id: 4,
    type: 'info',
    title: 'Maintenance Due',
    message: '3 vehicles scheduled for maintenance this week',
    time: '3 hours ago',
    icon: ShieldAlert
  }
];

function AlertsPanel() {
  const criticalCount = alerts.filter(a => a.type === 'critical').length;
  const warningCount = alerts.filter(a => a.type === 'warning').length;

  return (
    <div className="alerts-panel">
      <div className="panel-header">
        <div className="panel-title-group">
          <h3 className="panel-title">Proactive Alerts</h3>
          <div className="alert-badges">
            {criticalCount > 0 && (
              <span className="alert-badge alert-badge--critical">{criticalCount} Critical</span>
            )}
            {warningCount > 0 && (
              <span className="alert-badge alert-badge--warning">{warningCount} Warning</span>
            )}
          </div>
        </div>
        <button className="panel-action">
          View All <ChevronRight size={16} />
        </button>
      </div>

      <div className="alerts-list">
        {alerts.map((alert) => {
          const Icon = alert.icon;
          return (
            <div key={alert.id} className={`alert-item alert-item--${alert.type}`}>
              <div className={`alert-icon alert-icon--${alert.type}`}>
                <Icon size={18} />
              </div>
              <div className="alert-content">
                <span className="alert-title">{alert.title}</span>
                <span className="alert-message">{alert.message}</span>
                <span className="alert-time">{alert.time}</span>
              </div>
              <button className="alert-action">
                <ChevronRight size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default AlertsPanel;
