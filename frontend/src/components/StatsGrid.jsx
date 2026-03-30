import React from 'react';
import { Package, Boxes, MapPin, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import '../styling/StatsGrid.css';

const stats = [
  {
    id: 1,
    title: 'Total Assets',
    value: '1,284',
    change: '+12',
    changeType: 'positive',
    changeLabel: 'from last month',
    icon: Package,
    color: 'primary'
  },
  {
    id: 2,
    title: 'Consumables',
    value: '3,847',
    change: '-156',
    changeType: 'negative',
    changeLabel: 'items used',
    icon: Boxes,
    color: 'info'
  },
  {
    id: 3,
    title: 'Locations',
    value: '24',
    change: '+2',
    changeType: 'positive',
    changeLabel: 'new sites',
    icon: MapPin,
    color: 'success'
  },
  {
    id: 4,
    title: 'Active Alerts',
    value: '7',
    change: '+3',
    changeType: 'warning',
    changeLabel: 'need attention',
    icon: AlertTriangle,
    color: 'warning'
  }
];

function StatsGrid() {
  return (
    <div className="stats-grid">
      {stats.map((stat) => {
        const Icon = stat.icon;
        const TrendIcon = stat.changeType === 'positive' ? TrendingUp : 
                          stat.changeType === 'negative' ? TrendingDown : AlertTriangle;
        
        return (
          <div key={stat.id} className={`stat-card stat-card--${stat.color}`}>
            <div className="stat-header">
              <span className="stat-title">{stat.title}</span>
              <div className={`stat-icon stat-icon--${stat.color}`}>
                <Icon size={20} />
              </div>
            </div>
            <div className="stat-value">{stat.value}</div>
            <div className={`stat-change stat-change--${stat.changeType}`}>
              <TrendIcon size={14} />
              <span>{stat.change}</span>
              <span className="stat-change-label">{stat.changeLabel}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default StatsGrid;
