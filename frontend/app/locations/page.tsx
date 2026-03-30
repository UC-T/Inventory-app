import { MapPin, Plus, Search, Building2, Truck, Briefcase, Package } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

// Mock data for demonstration
const locations = [
  {
    id: "LOC-001",
    name: "Warehouse A",
    type: "warehouse",
    address: "1234 Industrial Blvd, Suite 100",
    assetCount: 847,
    consumableCount: 2341,
    status: "active",
  },
  {
    id: "LOC-002",
    name: "Van #1",
    type: "vehicle",
    assignedTo: "Mike Thompson",
    assetCount: 32,
    consumableCount: 156,
    status: "active",
  },
  {
    id: "LOC-003",
    name: "Van #3",
    type: "vehicle",
    assignedTo: "Sarah Chen",
    assetCount: 28,
    consumableCount: 142,
    status: "active",
  },
  {
    id: "LOC-004",
    name: "Site: Metro Office",
    type: "jobsite",
    address: "5678 Commerce Dr",
    assetCount: 156,
    consumableCount: 0,
    status: "active",
  },
  {
    id: "LOC-005",
    name: "Site: Johnson Residence",
    type: "jobsite",
    address: "789 Oak Lane",
    assetCount: 24,
    consumableCount: 0,
    status: "active",
  },
  {
    id: "LOC-006",
    name: "Van #2",
    type: "vehicle",
    assignedTo: "James Wilson",
    assetCount: 0,
    consumableCount: 0,
    status: "inactive",
  },
]

const typeIcons: Record<string, React.ElementType> = {
  warehouse: Building2,
  vehicle: Truck,
  jobsite: Briefcase,
}

const typeLabels: Record<string, string> = {
  warehouse: "Warehouse",
  vehicle: "Vehicle",
  jobsite: "Job Site",
}

export default function LocationsPage() {
  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">Locations</h1>
          <p className="text-muted-foreground">
            Manage warehouses, vehicles, and job sites
          </p>
        </div>
        <Button className="w-fit">
          <Plus className="mr-2 h-4 w-4" />
          Add Location
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-card">
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/20">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold font-mono">
                {locations.filter((l) => l.type === "warehouse").length}
              </p>
              <p className="text-sm text-muted-foreground">Warehouses</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-success/20">
              <Truck className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold font-mono">
                {locations.filter((l) => l.type === "vehicle").length}
              </p>
              <p className="text-sm text-muted-foreground">Vehicles</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-warning/20">
              <Briefcase className="h-6 w-6 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold font-mono">
                {locations.filter((l) => l.type === "jobsite").length}
              </p>
              <p className="text-sm text-muted-foreground">Job Sites</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="bg-card">
        <CardContent className="pt-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search locations..."
              className="pl-10 bg-input"
            />
          </div>
        </CardContent>
      </Card>

      {/* Locations Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {locations.map((location) => {
          const Icon = typeIcons[location.type]
          return (
            <Card
              key={location.id}
              className={`bg-card ${location.status === "inactive" ? "opacity-60" : ""}`}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{location.name}</CardTitle>
                      <p className="text-xs text-muted-foreground">
                        {typeLabels[location.type]}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      location.status === "active"
                        ? "bg-success/20 text-success border-success/30"
                        : "bg-muted text-muted-foreground"
                    }
                  >
                    {location.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-3">
                  {location.address && (
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <MapPin className="h-3 w-3" />
                      {location.address}
                    </p>
                  )}
                  {location.assignedTo && (
                    <p className="text-sm text-muted-foreground">
                      Assigned to: {location.assignedTo}
                    </p>
                  )}

                  <div className="flex items-center gap-4 pt-2 border-t border-border">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-mono">
                        {location.assetCount}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        assets
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono">
                        {location.consumableCount}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        consumables
                      </span>
                    </div>
                  </div>

                  <Button variant="ghost" size="sm" className="w-full mt-2">
                    View Inventory
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
