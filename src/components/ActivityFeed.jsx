import React from 'react';
import { Package, UserCheck, MapPin, Plus, Edit, Trash2, ChevronRight } from 'lucide-react';
import '../styling/ActivityFeed.css';

const activities = [
  {
    id: 1,
    action: 'checkout',
    title: 'Asset Checked Out',
    description: 'PTZ Camera #CAM-0042 assigned to John Davidson',
    user: 'Sarah Miller',
    time: '10 minutes ago',
    icon: UserCheck
  },
  {
    id: 2,
    action: 'create',
    title: 'New Asset Added',
    description: 'Thermal Imaging Camera added to inventory',
    user: 'Admin User',
    time: '45 minutes ago',
    icon: Plus
  },
  {
    id: 3,
    action: 'transfer',
    title: 'Location Transfer',
    description: '15 items moved from Warehouse A to Site #12',
    user: 'Mike Johnson',
    time: '2 hours ago',
    icon: MapPin
  },
  {
    id: 4,
    action: 'update',
    title: 'Inventory Updated',
    description: 'RG-6 Coax Cable quantity adjusted (-50 units)',
    user: 'Sarah Miller',
    time: '3 hours ago',
    icon: Edit
  },
  {
    id: 5,
    action: 'delete',
    title: 'Asset Decommissioned',
    description: 'Old DVR Unit #DVR-0012 marked as disposed',
    user: 'Admin User',
    time: '5 hours ago',
    icon: Trash2
  }
];

function ActivityFeed() {
  return (
    <div className="activity-feed">
      <div className="panel-header">
        <h3 className="panel-title">Recent Activity</h3>
        <button className="panel-action">
          View All <ChevronRight size={16} />
        </button>
      </div>

      <div className="activity-list">
        {activities.map((activity, index) => {
          const Icon = activity.icon;
          return (
            <div key={activity.id} className="activity-item">
              <div className="activity-timeline">
                <div className={`activity-dot activity-dot--${activity.action}`}>
                  <Icon size={14} />
                </div>
                {index < activities.length - 1 && <div className="activity-line" />}
              </div>
              <div className="activity-content">
                <div className="activity-header">
                  <span className={`activity-badge activity-badge--${activity.action}`}>
                    {activity.action}
                  </span>
                  <span className="activity-time">{activity.time}</span>
                </div>
                <span className="activity-title">{activity.title}</span>
                <span className="activity-description">{activity.description}</span>
                <span className="activity-user">by {activity.user}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ActivityFeed;
