'use client'

import { usePathname } from 'next/navigation'
import { Bell, Search } from 'lucide-react'

import { SidebarTrigger } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import './app-header.css'

// Map paths to page titles
const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/assets': 'Assets',
  '/consumables': 'Consumables',
  '/locations': 'Locations',
  '/categories': 'Categories',
  '/activity': 'Activity Log',
  '/settings': 'Settings',
}

export function AppHeader() {
  const pathname = usePathname()
  const pageTitle = pageTitles[pathname] || 'Dashboard'

  return (
    <header className="app-header">
      <div className="app-header-left">
        <SidebarTrigger className="app-header-trigger" />
        <Separator orientation="vertical" className="app-header-separator" />
        <span className="app-header-title">{pageTitle}</span>
      </div>

      <div className="app-header-center">
        <div className="app-search">
          <Search className="app-search-icon" />
          <Input
            type="search"
            placeholder="Search assets, consumables..."
            className="app-search-input"
          />
          <kbd className="app-search-kbd">
            <span>Ctrl</span>K
          </kbd>
        </div>
      </div>

      <div className="app-header-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="app-header-action">
              <Bell className="h-4 w-4" />
              <span className="sr-only">Notifications</span>
              <span className="notification-indicator" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="notification-empty">
              <Bell className="notification-empty-icon" />
              <span>No new notifications</span>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
