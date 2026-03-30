'use client'

import { Package, Boxes, ArrowRight, MapPin } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

import './quick-actions.css'

const actions = [
  {
    label: 'Add Asset',
    icon: Package,
    href: '/assets/new',
  },
  {
    label: 'Add Consumable',
    icon: Boxes,
    href: '/consumables/new',
  },
  {
    label: 'Transfer Items',
    icon: ArrowRight,
    href: '/transfers/new',
  },
  {
    label: 'New Location',
    icon: MapPin,
    href: '/locations/new',
  },
]

export function QuickActions() {
  return (
    <Card className="quick-actions">
      <CardHeader>
        <CardTitle className="quick-actions-title">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="quick-actions-list">
          {actions.map((action) => (
            <Button key={action.label} variant="outline" size="sm">
              <action.icon className="quick-action-icon" />
              {action.label}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
