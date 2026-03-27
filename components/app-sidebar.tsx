'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Package,
  Boxes,
  MapPin,
  FolderTree,
  History,
  Settings,
  ChevronDown,
  LogOut,
  User,
  Radio,
} from 'lucide-react'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'

import './app-sidebar.css'

// Navigation items configuration
const mainNavItems = [
  {
    title: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
    description: 'Overview & Alerts',
  },
  {
    title: 'Assets',
    href: '/assets',
    icon: Package,
    description: 'Serialized Items',
    badge: '1,284',
  },
  {
    title: 'Consumables',
    href: '/consumables',
    icon: Boxes,
    description: 'Quantity Items',
    badge: '847',
  },
  {
    title: 'Locations',
    href: '/locations',
    icon: MapPin,
    description: 'Sites & Vehicles',
  },
  {
    title: 'Categories',
    href: '/categories',
    icon: FolderTree,
    description: 'Asset Types',
  },
]

const systemNavItems = [
  {
    title: 'Activity Log',
    href: '/activity',
    icon: History,
    description: 'Audit Trail',
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
    description: 'Configuration',
  },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar variant="sidebar" collapsible="icon">
      {/* Sidebar Header - Logo */}
      <SidebarHeader className="sidebar-header">
        <Link href="/" className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <Radio className="h-5 w-5" />
          </div>
          <div className="sidebar-logo-text">
            <span className="sidebar-logo-title">AssetTrack</span>
            <span className="sidebar-logo-subtitle">Inventory Control</span>
          </div>
        </Link>
      </SidebarHeader>

      {/* Main Navigation */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    tooltip={item.title}
                  >
                    <Link href={item.href} className="sidebar-nav-link">
                      <item.icon className="sidebar-nav-icon" />
                      <div className="sidebar-nav-content">
                        <span className="sidebar-nav-title">{item.title}</span>
                        <span className="sidebar-nav-description">{item.description}</span>
                      </div>
                      {item.badge && (
                        <Badge 
                          variant="secondary" 
                          className="sidebar-nav-badge"
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>System</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {systemNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    tooltip={item.title}
                  >
                    <Link href={item.href} className="sidebar-nav-link">
                      <item.icon className="sidebar-nav-icon" />
                      <div className="sidebar-nav-content">
                        <span className="sidebar-nav-title">{item.title}</span>
                        <span className="sidebar-nav-description">{item.description}</span>
                      </div>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Sidebar Footer - User Menu */}
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="sidebar-user-button">
                  <div className="sidebar-user-avatar">
                    <User className="h-4 w-4" />
                  </div>
                  <div className="sidebar-user-info">
                    <span className="sidebar-user-name">John Technician</span>
                    <span className="sidebar-user-role">Field Tech</span>
                  </div>
                  <ChevronDown className="ml-auto h-4 w-4 opacity-50" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                align="start"
                className="w-56"
              >
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Preferences
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
