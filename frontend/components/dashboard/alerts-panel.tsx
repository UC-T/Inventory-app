'use client'

import { AlertTriangle, Clock, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

import './alerts-panel.css'

interface Alert {
  id: number
  type: 'critical' | 'warning' | 'info'
  title: string
  description: string
  time: string
  action: string
}

// Mock data - will be replaced with API calls
const alerts: Alert[] = [
  {
    id: 1,
    type: 'critical',
    title: 'Low Stock Alert',
    description: 'CAT6 Cable Spools below minimum threshold (2 remaining)',
    time: '2 hours ago',
    action: 'Reorder',
  },
  {
    id: 2,
    type: 'warning',
    title: 'Warranty Expiring',
    description: 'Hikvision 4MP Camera (SN: HK-2024-0847) expires in 15 days',
    time: '5 hours ago',
    action: 'Review',
  },
  {
    id: 3,
    type: 'warning',
    title: 'Calibration Due',
    description: 'Fluke 179 Multimeter requires calibration by April 1st',
    time: '1 day ago',
    action: 'Schedule',
  },
  {
    id: 4,
    type: 'info',
    title: 'Asset Transfer Complete',
    description: '15 items transferred from Warehouse A to Site: Johnson Residence',
    time: '2 days ago',
    action: 'View',
  },
]

export function AlertsPanel() {
  return (
    <Card className="alerts-panel">
      <CardHeader className="alerts-panel-header">
        <div className="alerts-panel-title-group">
          <AlertTriangle className="alerts-panel-icon" />
          <CardTitle>Proactive Alerts</CardTitle>
        </div>
        <Button variant="ghost" size="sm" className="alerts-panel-action">
          View All
          <ArrowRight className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="alerts-list">
          {alerts.map((alert) => (
            <div key={alert.id} className="alert-item">
              <div className="alert-content">
                <div className={`alert-indicator alert-indicator--${alert.type}`} />
                <div className="alert-details">
                  <span className="alert-title">{alert.title}</span>
                  <span className="alert-description">{alert.description}</span>
                  <span className="alert-time">
                    <Clock className="h-3 w-3" />
                    {alert.time}
                  </span>
                </div>
              </div>
              <Button size="sm" variant="outline">
                {alert.action}
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
