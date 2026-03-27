import { Package, Plus, Search, Filter, Download } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

// Mock data for demonstration
const assets = [
  {
    id: "AST-001",
    name: "Hikvision 4MP Turret Camera",
    serialNumber: "HK-2024-0847",
    category: "Cameras",
    location: "Warehouse A",
    status: "Available",
    warrantyExpires: "2026-03-15",
  },
  {
    id: "AST-002",
    name: "Flir C3-X Thermal Camera",
    serialNumber: "FLIR-2023-1204",
    category: "Test Equipment",
    location: "Van #3",
    status: "Checked Out",
    warrantyExpires: "2025-08-20",
  },
  {
    id: "AST-003",
    name: "Ubiquiti UniFi Dream Machine",
    serialNumber: "UB-2024-0156",
    category: "Networking",
    location: "Site: Metro Office",
    status: "Deployed",
    warrantyExpires: "2027-01-10",
  },
  {
    id: "AST-004",
    name: "Bosch GLL 3-80 Laser Level",
    serialNumber: "BOSCH-2022-8891",
    category: "Tools",
    location: "Warehouse A",
    status: "Available",
    warrantyExpires: "2024-12-01",
  },
  {
    id: "AST-005",
    name: "Fluke 179 Digital Multimeter",
    serialNumber: "FLUKE-2023-4472",
    category: "Test Equipment",
    location: "Van #1",
    status: "Checked Out",
    warrantyExpires: "2025-06-15",
  },
]

const statusColors: Record<string, string> = {
  Available: "bg-success/20 text-success border-success/30",
  "Checked Out": "bg-warning/20 text-warning border-warning/30",
  Deployed: "bg-primary/20 text-primary border-primary/30",
  "Under Repair": "bg-destructive/20 text-destructive border-destructive/30",
}

export default function AssetsPage() {
  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">Assets</h1>
          <p className="text-muted-foreground">
            Manage serialized assets with chain of custody tracking
          </p>
        </div>
        <Button className="w-fit">
          <Plus className="mr-2 h-4 w-4" />
          Add Asset
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
                placeholder="Search by name, serial number, or ID..."
                className="pl-10 bg-input"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filters
              </Button>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assets Table */}
      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            All Assets
            <Badge variant="secondary" className="ml-2 font-mono">
              {assets.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-left text-sm text-muted-foreground">
                  <th className="pb-3 pr-4 font-medium">Asset ID</th>
                  <th className="pb-3 pr-4 font-medium">Name</th>
                  <th className="pb-3 pr-4 font-medium">Serial Number</th>
                  <th className="pb-3 pr-4 font-medium">Category</th>
                  <th className="pb-3 pr-4 font-medium">Location</th>
                  <th className="pb-3 pr-4 font-medium">Status</th>
                  <th className="pb-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {assets.map((asset) => (
                  <tr
                    key={asset.id}
                    className="border-b border-border/50 hover:bg-secondary/30 transition-colors"
                  >
                    <td className="py-4 pr-4">
                      <span className="font-mono text-sm text-primary">
                        {asset.id}
                      </span>
                    </td>
                    <td className="py-4 pr-4">
                      <span className="font-medium">{asset.name}</span>
                    </td>
                    <td className="py-4 pr-4">
                      <span className="font-mono text-sm text-muted-foreground">
                        {asset.serialNumber}
                      </span>
                    </td>
                    <td className="py-4 pr-4">
                      <Badge variant="outline">{asset.category}</Badge>
                    </td>
                    <td className="py-4 pr-4 text-sm text-muted-foreground">
                      {asset.location}
                    </td>
                    <td className="py-4 pr-4">
                      <Badge
                        variant="outline"
                        className={statusColors[asset.status]}
                      >
                        {asset.status}
                      </Badge>
                    </td>
                    <td className="py-4">
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
