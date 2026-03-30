'use client'

import { Package, Boxes, MapPin, Shield, LucideIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import './stats-grid.css'

interface StatItem {
  title: string
  value: string
  change: string
  changeLabel: string
  icon: LucideIcon
  trend: 'up' | 'warning' | 'neutral'
}

// Mock data - will be replaced with API calls
const stats: StatItem[] = [
  {
    title: 'Total Assets',
    value: '1,284',
    change: '+12',
    changeLabel: 'this month',
    icon: Package,
    trend: 'up',
  },
  {
    title: 'Consumables',
    value: '847',
    change: '23 low',
    changeLabel: 'stock items',
    icon: Boxes,
    trend: 'warning',
  },
  {
    title: 'Locations',
    value: '32',
    change: '5 active',
    changeLabel: 'job sites',
    icon: MapPin,
    trend: 'neutral',
  },
  {
    title: 'Warranties',
    value: '89',
    change: '7 expiring',
    changeLabel: 'in 30 days',
    icon: Shield,
    trend: 'warning',
  },
]

export function StatsGrid() {
  return (
    <div className="stats-grid">
      {stats.map((stat) => (
        <Card key={stat.title} className="stats-card">
          <CardHeader className="stats-card-header">
            <CardTitle className="stats-card-title">
              {stat.title}
            </CardTitle>
            <stat.icon className="stats-card-icon" />
          </CardHeader>
          <CardContent>
            <div className="stats-card-value">{stat.value}</div>
            <p className="stats-card-change">
              <span className={`stats-trend stats-trend--${stat.trend}`}>
                {stat.change}
              </span>{' '}
              {stat.changeLabel}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
