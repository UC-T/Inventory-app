import { Settings, User, Bell, Shield, Database, Palette } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const settingsSections = [
  {
    title: "Account",
    description: "Manage your account settings and preferences",
    icon: User,
    href: "/settings/account",
  },
  {
    title: "Notifications",
    description: "Configure alert preferences and notification channels",
    icon: Bell,
    href: "/settings/notifications",
  },
  {
    title: "Security",
    description: "Password, two-factor authentication, and session management",
    icon: Shield,
    href: "/settings/security",
  },
  {
    title: "Data & Backup",
    description: "Export data, manage backups, and database settings",
    icon: Database,
    href: "/settings/data",
  },
  {
    title: "Appearance",
    description: "Customize the look and feel of the application",
    icon: Palette,
    href: "/settings/appearance",
  },
]

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your application settings and preferences
        </p>
      </div>

      {/* Settings Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {settingsSections.map((section) => (
          <Card key={section.title} className="bg-card hover:bg-card/80 transition-colors cursor-pointer">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary">
                  <section.icon className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <CardTitle className="text-lg">{section.title}</CardTitle>
                  <CardDescription>{section.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                <Settings className="mr-2 h-4 w-4" />
                Configure
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* System Info */}
      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="text-base">System Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 text-sm md:grid-cols-3">
            <div>
              <span className="text-muted-foreground">Version</span>
              <p className="font-mono">1.0.0-beta</p>
            </div>
            <div>
              <span className="text-muted-foreground">Environment</span>
              <p className="font-mono">Development</p>
            </div>
            <div>
              <span className="text-muted-foreground">Last Sync</span>
              <p className="font-mono">2024-03-27 10:45 AM</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
