'use client'

import {
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  Boxes,
  Package,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

import './activity-feed.css'

interface Activity {
  id: number
  action: 'Checked Out' | 'Returned' | 'Consumed' | 'Added'
  item: string
  user: string
  location: string
  time: string
}

// Mock data - will be replaced with API calls
const recentActivity: Activity[] = [
  {
    id: 1,
    action: 'Checked Out',
    item: 'Flir C3-X Thermal Camera',
    user: 'Mike Thompson',
    location: 'Van #3',
    time: '10 min ago',
  },
  {
    id: 2,
    action: 'Returned',
    item: 'Bosch Laser Level',
    user: 'Sarah Chen',
    location: 'Warehouse A',
    time: '45 min ago',
  },
  {
    id: 3,
    action: 'Consumed',
    item: 'RG6 Coax Cable (50ft)',
    user: 'James Wilson',
    location: 'Site: Metro Office',
    time: '1 hour ago',
  },
  {
    id: 4,
    action: 'Added',
    item: 'Ubiquiti UniFi AP',
    user: 'Admin',
    location: 'Warehouse A',
    time: '2 hours ago',
  },
]

function getActionIcon(action: Activity['action']) {
  switch (action) {
    case 'Checked Out':
      return <ArrowRight className="h-4 w-4 text-primary" />
    case 'Returned':
      return <CheckCircle2 className="h-4 w-4 text-success" />
    case 'Consumed':
      return <Boxes className="h-4 w-4 text-warning" />
    case 'Added':
      return <Package className="h-4 w-4 text-info" />
  }
}

export function ActivityFeed() {
  return (
    <Card className="activity-feed">
      <CardHeader className="activity-feed-header">
        <div className="activity-feed-title-group">
          <TrendingUp className="activity-feed-icon" />
          <CardTitle>Recent Activity</CardTitle>
        </div>
        <Button variant="ghost" size="sm" className="activity-feed-action">
          View Log
          <ArrowRight className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="activity-list">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="activity-item">
              <div className="activity-icon-wrapper">
                {getActionIcon(activity.action)}
              </div>
              <div className="activity-details">
                <div className="activity-header">
                  <span className="activity-item-name">{activity.item}</span>
                  <Badge variant="secondary" className="activity-badge">
                    {activity.action}
                  </Badge>
                </div>
                <span className="activity-meta">
                  {activity.user} &bull; {activity.location}
                </span>
                <span className="activity-time">{activity.time}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
