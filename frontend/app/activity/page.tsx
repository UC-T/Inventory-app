import { Activity, Search, Filter, Download, ArrowRight, CheckCircle2, Package, Boxes, User } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

// Mock data for demonstration
const activityLog = [
  {
    id: "LOG-001",
    action: "checkout",
    item: "Flir C3-X Thermal Camera",
    itemType: "asset",
    serialNumber: "FLIR-2023-1204",
    user: "Mike Thompson",
    fromLocation: "Warehouse A",
    toLocation: "Van #3",
    timestamp: "2024-03-27T10:45:00Z",
    notes: "Job: Metro Office installation",
  },
  {
    id: "LOG-002",
    action: "return",
    item: "Bosch GLL 3-80 Laser Level",
    itemType: "asset",
    serialNumber: "BOSCH-2022-8891",
    user: "Sarah Chen",
    fromLocation: "Van #1",
    toLocation: "Warehouse A",
    timestamp: "2024-03-27T10:00:00Z",
    notes: null,
  },
  {
    id: "LOG-003",
    action: "consume",
    item: "RG6 Coax Cable (50ft)",
    itemType: "consumable",
    quantity: 3,
    user: "James Wilson",
    location: "Site: Metro Office",
    timestamp: "2024-03-27T09:30:00Z",
    notes: "Camera installation",
  },
  {
    id: "LOG-004",
    action: "add",
    item: "Ubiquiti UniFi AP U6+",
    itemType: "asset",
    serialNumber: "UB-2024-0892",
    user: "Admin",
    location: "Warehouse A",
    timestamp: "2024-03-27T08:15:00Z",
    notes: "New purchase - PO #4521",
  },
  {
    id: "LOG-005",
    action: "transfer",
    item: "Hikvision 4MP Turret Camera",
    itemType: "asset",
    serialNumber: "HK-2024-0847",
    user: "Admin",
    fromLocation: "Warehouse A",
    toLocation: "Site: Johnson Residence",
    timestamp: "2024-03-26T16:30:00Z",
    notes: "Installation scheduled",
  },
  {
    id: "LOG-006",
    action: "restock",
    item: "CAT6 Cable Spool (1000ft)",
    itemType: "consumable",
    quantity: 10,
    user: "Admin",
    location: "Warehouse A",
    timestamp: "2024-03-26T14:00:00Z",
    notes: "PO #4518 received",
  },
]

const actionLabels: Record<string, { label: string; color: string }> = {
  checkout: { label: "Checked Out", color: "bg-primary/20 text-primary border-primary/30" },
  return: { label: "Returned", color: "bg-success/20 text-success border-success/30" },
  consume: { label: "Consumed", color: "bg-warning/20 text-warning border-warning/30" },
  add: { label: "Added", color: "bg-info/20 text-info border-info/30" },
  transfer: { label: "Transferred", color: "bg-chart-4/20 text-chart-4 border-chart-4/30" },
  restock: { label: "Restocked", color: "bg-success/20 text-success border-success/30" },
}

function formatTimestamp(timestamp: string) {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 60) return `${diffMins} min ago`
  if (diffHours < 24) return `${diffHours} hours ago`
  if (diffDays < 7) return `${diffDays} days ago`

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export default function ActivityPage() {
  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">Activity Log</h1>
          <p className="text-muted-foreground">
            Complete audit trail of all inventory movements
          </p>
        </div>
        <Button variant="outline" className="w-fit">
          <Download className="mr-2 h-4 w-4" />
          Export Log
        </Button>
      </div>

      {/* Filters & Search */}
      <Card className="bg-card">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by item, user, or location..."
                className="pl-10 bg-input"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity List */}
      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col">
            {activityLog.map((entry, index) => {
              const actionInfo = actionLabels[entry.action]
              return (
                <div
                  key={entry.id}
                  className={`flex gap-4 py-4 ${
                    index !== activityLog.length - 1
                      ? "border-b border-border"
                      : ""
                  }`}
                >
                  {/* Icon */}
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary">
                    {entry.action === "checkout" ? (
                      <ArrowRight className="h-5 w-5 text-primary" />
                    ) : entry.action === "return" ? (
                      <CheckCircle2 className="h-5 w-5 text-success" />
                    ) : entry.itemType === "asset" ? (
                      <Package className="h-5 w-5 text-info" />
                    ) : (
                      <Boxes className="h-5 w-5 text-warning" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex flex-1 flex-col gap-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">{entry.item}</span>
                      <Badge variant="outline" className={actionInfo.color}>
                        {actionInfo.label}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                      {"serialNumber" in entry && entry.serialNumber && (
                        <span className="font-mono text-xs">
                          {entry.serialNumber}
                        </span>
                      )}
                      {"quantity" in entry && entry.quantity && (
                        <span>Qty: {entry.quantity}</span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                      <User className="h-3 w-3" />
                      <span>{entry.user}</span>
                      <span className="text-muted-foreground/50">|</span>
                      {"fromLocation" in entry && entry.fromLocation && entry.toLocation ? (
                        <span>
                          {entry.fromLocation} → {entry.toLocation}
                        </span>
                      ) : (
                        <span>{"location" in entry && entry.location}</span>
                      )}
                    </div>

                    {entry.notes && (
                      <p className="text-sm text-muted-foreground/80 mt-1">
                        Note: {entry.notes}
                      </p>
                    )}
                  </div>

                  {/* Timestamp */}
                  <div className="text-right text-sm text-muted-foreground shrink-0">
                    <span>{formatTimestamp(entry.timestamp)}</span>
                    <p className="text-xs font-mono text-muted-foreground/60">
                      {entry.id}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Load More */}
          <div className="flex justify-center pt-4 border-t border-border mt-4">
            <Button variant="outline">Load More</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
