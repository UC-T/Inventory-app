import { Boxes, Plus, Search, Filter, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

// Mock data for demonstration
const consumables = [
  {
    id: "CON-001",
    name: "CAT6 Cable Spool (1000ft)",
    sku: "CAT6-1000-BLU",
    category: "Cabling",
    location: "Warehouse A",
    quantity: 2,
    minStock: 5,
    unit: "spools",
  },
  {
    id: "CON-002",
    name: "RG6 Coax Cable (500ft)",
    sku: "RG6-500-BLK",
    category: "Cabling",
    location: "Warehouse A",
    quantity: 12,
    minStock: 8,
    unit: "spools",
  },
  {
    id: "CON-003",
    name: "RJ45 Connectors (100pk)",
    sku: "RJ45-CAT6-100",
    category: "Connectors",
    location: "Warehouse A",
    quantity: 45,
    minStock: 20,
    unit: "packs",
  },
  {
    id: "CON-004",
    name: "Cable Ties 8\" (1000pk)",
    sku: "CT-8IN-BLK-1K",
    category: "Accessories",
    location: "Warehouse A",
    quantity: 8,
    minStock: 10,
    unit: "packs",
  },
  {
    id: "CON-005",
    name: "Mounting Screws Kit",
    sku: "SCRW-KIT-100",
    category: "Hardware",
    location: "Van #1",
    quantity: 25,
    minStock: 15,
    unit: "kits",
  },
]

function getStockStatus(quantity: number, minStock: number) {
  const ratio = quantity / minStock
  if (ratio <= 0.4) return { status: "critical", color: "bg-destructive" }
  if (ratio <= 0.8) return { status: "low", color: "bg-warning" }
  return { status: "ok", color: "bg-success" }
}

export default function ConsumablesPage() {
  const lowStockCount = consumables.filter(
    (c) => c.quantity <= c.minStock
  ).length

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">Consumables</h1>
          <p className="text-muted-foreground">
            Track quantity-based inventory with reorder alerts
          </p>
        </div>
        <Button className="w-fit">
          <Plus className="mr-2 h-4 w-4" />
          Add Consumable
        </Button>
      </div>

      {/* Low Stock Warning */}
      {lowStockCount > 0 && (
        <Card className="border-warning/50 bg-warning/10">
          <CardContent className="flex items-center gap-4 pt-6">
            <AlertTriangle className="h-5 w-5 text-warning" />
            <div className="flex-1">
              <span className="font-medium text-warning">
                {lowStockCount} items at or below minimum stock level
              </span>
              <p className="text-sm text-muted-foreground">
                Review and reorder to avoid stockouts
              </p>
            </div>
            <Button variant="outline" size="sm">
              View Low Stock
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Filters & Search */}
      <Card className="bg-card">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by name, SKU, or category..."
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

      {/* Consumables Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {consumables.map((item) => {
          const stock = getStockStatus(item.quantity, item.minStock)
          const stockPercent = Math.min(
            (item.quantity / (item.minStock * 2)) * 100,
            100
          )

          return (
            <Card key={item.id} className="bg-card">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{item.name}</CardTitle>
                    <p className="text-xs font-mono text-muted-foreground mt-1">
                      {item.sku}
                    </p>
                  </div>
                  <Badge variant="outline">{item.category}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4">
                  <div className="flex items-end justify-between">
                    <div>
                      <span className="text-3xl font-bold font-mono">
                        {item.quantity}
                      </span>
                      <span className="text-muted-foreground ml-1">
                        {item.unit}
                      </span>
                    </div>
                    {item.quantity <= item.minStock && (
                      <Badge
                        variant="outline"
                        className="bg-warning/20 text-warning border-warning/30"
                      >
                        Low Stock
                      </Badge>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Stock Level</span>
                      <span>Min: {item.minStock}</span>
                    </div>
                    <Progress value={stockPercent} className={`h-2 ${stock.color}`} />
                  </div>

                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{item.location}</span>
                    <Button variant="ghost" size="sm">
                      Adjust
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
