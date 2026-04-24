import React, { useState, useEffect } from 'react';
import { UserCheck, MapPin, Plus, Edit, Trash2, ChevronRight, Activity } from 'lucide-react';
import { logsAPI } from '../services/api';
// 1. Import the relative time function
import { formatDistanceToNow } from 'date-fns'; 
import '../styling/ActivityFeed.css';

const getActionMeta = (actionStr) => {
  const a = actionStr.toLowerCase();
  if (a.includes('added') || a.includes('created')) return { icon: Plus, cls: 'create' };
  if (a.includes('issued') || a.includes('checkout')) return { icon: UserCheck, cls: 'checkout' };
  if (a.includes('moved') || a.includes('transfer')) return { icon: MapPin, cls: 'transfer' };
  if (a.includes('deleted') || a.includes('removed')) return { icon: Trash2, cls: 'delete' };
  return { icon: Edit, cls: 'update' };
};

function ActivityFeed() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadActivity() {
      try {
        const data = await logsAPI.getAll({ limit: 10 });
        setActivities(data || []);
      } catch (err) {
        console.error("Failed to fetch activity:", err);
      } finally {
        setLoading(false);
      }
    }
    loadActivity();
  }, []);

  if (loading) return <div className="skeleton-activity" style={{height: '300px'}} />;

  return (
    <div className="activity-feed">
      <div className="panel-header">
        <h3 className="panel-title">Recent Activity</h3>
        <button className="panel-action">View All <ChevronRight size={16} /></button>
      </div>

      <div className="activity-list">
        {activities.length === 0 ? (
          <div className="empty-state">
             <Activity size={24} style={{opacity: 0.2}} />
             <p>No recent activity recorded.</p>
          </div>
        ) : (
          activities.map((log, index) => {
            const meta = getActionMeta(log.action);
            const Icon = meta.icon;
            
            return (
              <div key={log.id} className="activity-item">
                <div className="activity-timeline">
                  <div className={`activity-dot activity-dot--${meta.cls}`}>
                    <Icon size={14} />
                  </div>
                  {index < activities.length - 1 && <div className="activity-line" />}
                </div>
                
                <div className="activity-content">
                  <div className="activity-header">
                    <span className={`activity-badge activity-badge--${meta.cls}`}>
                      {meta.cls.toUpperCase()}
                    </span>
                    {/* 2. Implementation: formatDistanceToNow turns the ISO date into "X ago" */}
                    <span className="activity-time">
                      {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                    </span>
                  </div>
                  <span className="activity-description">{log.action}</span>
                  <span className="activity-user">by {log.user}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default ActivityFeed;