import React, { useState } from 'react';
import { Search, Filter, Download, UserCheck, Plus, MapPin, Edit, Trash2, Package } from 'lucide-react';
import '../styling/ActivityPage.css';

const mockActivities = [
  { id: 1, action: 'checkout', title: 'Asset Checked Out', description: 'PTZ Camera #CAM-0042 assigned to John Davidson', user: 'Sarah Miller', timestamp: '2024-01-15 14:32:00', icon: UserCheck },
  { id: 2, action: 'create', title: 'New Asset Added', description: 'Thermal Imaging Camera added to inventory', user: 'Admin User', timestamp: '2024-01-15 13:45:00', icon: Plus },
  { id: 3, action: 'transfer', title: 'Location Transfer', description: '15 items moved from Warehouse A to Site #12', user: 'Mike Johnson', timestamp: '2024-01-15 11:20:00', icon: MapPin },
  { id: 4, action: 'update', title: 'Inventory Updated', description: 'RG-6 Coax Cable quantity adjusted (-50 units)', user: 'Sarah Miller', timestamp: '2024-01-15 10:15:00', icon: Edit },
  { id: 5, action: 'delete', title: 'Asset Decommissioned', description: 'Old DVR Unit #DVR-0012 marked as disposed', user: 'Admin User', timestamp: '2024-01-15 09:30:00', icon: Trash2 },
  { id: 6, action: 'checkin', title: 'Asset Returned', description: 'Dome Camera #CAM-0038 returned by Tech Team', user: 'Mike Johnson', timestamp: '2024-01-14 16:45:00', icon: Package },
  { id: 7, action: 'create', title: 'New Location Added', description: 'Site #15 - Medical Center added to locations', user: 'Admin User', timestamp: '2024-01-14 14:20:00', icon: Plus },
  { id: 8, action: 'update', title: 'Asset Updated', description: 'Warranty info updated for Network DVR #DVR-0015', user: 'Sarah Miller', timestamp: '2024-01-14 11:00:00', icon: Edit },
];

const actionConfig = {
  checkout: { label: 'Checkout', className: 'action--checkout' },
  checkin: { label: 'Check In', className: 'action--checkin' },
  create: { label: 'Create', className: 'action--create' },
  update: { label: 'Update', className: 'action--update' },
  delete: { label: 'Delete', className: 'action--delete' },
  transfer: { label: 'Transfer', className: 'action--transfer' },
};

function ActivityPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="activity-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Activity Log</h1>
          <p className="page-subtitle">Complete audit trail of all inventory actions</p>
        </div>
        <button className="btn btn--secondary">
          <Download size={18} />
          Export Log
        </button>
      </div>

      <div className="toolbar">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search activity..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button className="btn btn--secondary">
          <Filter size={18} />
          Filters
        </button>
      </div>

      <div className="activity-log">
        {mockActivities.map((activity) => {
          const config = actionConfig[activity.action];
          const Icon = activity.icon;

          return (
            <div key={activity.id} className="log-item">
              <div className={`log-icon ${config.className}`}>
                <Icon size={18} />
              </div>
              <div className="log-content">
                <div className="log-header">
                  <span className={`log-action ${config.className}`}>
                    {config.label}
                  </span>
                  <span className="log-timestamp">{formatDate(activity.timestamp)}</span>
                </div>
                <h4 className="log-title">{activity.title}</h4>
                <p className="log-description">{activity.description}</p>
                <span className="log-user">by {activity.user}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ActivityPage;
