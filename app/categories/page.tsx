import { Tags, Plus, Search, Camera, Wrench, Wifi, Cable, Settings2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

// Mock data for demonstration
const categories = [
  {
    id: "CAT-001",
    name: "Cameras",
    description: "IP cameras, PTZ cameras, thermal cameras",
    icon: Camera,
    assetCount: 156,
    consumableCount: 0,
    color: "bg-primary/20 text-primary",
  },
  {
    id: "CAT-002",
    name: "Test Equipment",
    description: "Multimeters, oscilloscopes, thermal imagers",
    icon: Settings2,
    assetCount: 48,
    consumableCount: 0,
    color: "bg-warning/20 text-warning",
  },
  {
    id: "CAT-003",
    name: "Networking",
    description: "Routers, switches, access points, NVRs",
    icon: Wifi,
    assetCount: 89,
    consumableCount: 0,
    color: "bg-success/20 text-success",
  },
  {
    id: "CAT-004",
    name: "Tools",
    description: "Power tools, hand tools, installation equipment",
    icon: Wrench,
    assetCount: 234,
    consumableCount: 156,
    color: "bg-chart-4/20 text-chart-4",
  },
  {
    id: "CAT-005",
    name: "Cabling",
    description: "CAT6, coax, fiber optic, power cables",
    icon: Cable,
    assetCount: 0,
    consumableCount: 892,
    color: "bg-chart-5/20 text-chart-5",
  },
]

export default function CategoriesPage() {
  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">Categories</h1>
          <p className="text-muted-foreground">
            Organize assets and consumables by type
          </p>
        </div>
        <Button className="w-fit">
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </div>

      {/* Search */}
      <Card className="bg-card">
        <CardContent className="pt-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search categories..."
              className="pl-10 bg-input"
            />
          </div>
        </CardContent>
      </Card>

      {/* Categories Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <Card key={category.id} className="bg-card hover:bg-card/80 transition-colors cursor-pointer">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${category.color}`}>
                    <category.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{category.name}</CardTitle>
                    <p className="text-xs font-mono text-muted-foreground">
                      {category.id}
                    </p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                <p className="text-sm text-muted-foreground">
                  {category.description}
                </p>

                <div className="flex items-center gap-4 pt-2 border-t border-border">
                  {category.assetCount > 0 && (
                    <Badge variant="secondary" className="font-mono">
                      {category.assetCount} assets
                    </Badge>
                  )}
                  {category.consumableCount > 0 && (
                    <Badge variant="secondary" className="font-mono">
                      {category.consumableCount} consumables
                    </Badge>
                  )}
                </div>

                <Button variant="outline" size="sm" className="w-full">
                  <Tags className="mr-2 h-4 w-4" />
                  Manage Category
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
