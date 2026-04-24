import React, { useState, useEffect } from 'react';
import { AlertTriangle, ChevronRight } from 'lucide-react';
import { dashboardAPI } from '../services/api';
import '../styling/AlertsPanel.css';

function AlertsPanel() {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    dashboardAPI.getAlerts().then(setAlerts).catch(console.error);
  }, []);

  return (
    <div className="alerts-panel">
      <div className="panel-header">
        <h3 className="panel-title">Proactive Alerts</h3>
        <span className="alert-badge alert-badge--critical">{alerts.length} Items Low</span>
      </div>

      <div className="alerts-list">
        {alerts.length === 0 ? (
          <p className="empty-msg">All stock levels healthy.</p>
        ) : (
          alerts.map((item) => (
            <div key={item.id} className="alert-item alert-item--warning">
              <div className="alert-icon alert-icon--warning">
                <AlertTriangle size={18} />
              </div>
              <div className="alert-content">
                <span className="alert-title">Low Stock: {item.name}</span>
                <span className="alert-message">
                  {item.quantity} units left (Threshold: {item.min_threshold})
                </span>
              </div>
              <button className="alert-action"><ChevronRight size={16} /></button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default AlertsPanel;