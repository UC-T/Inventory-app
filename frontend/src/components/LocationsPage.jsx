import React, { useState } from 'react';
import { Plus, Search, MapPin, Building2, Truck, Briefcase, Package, Boxes } from 'lucide-react';
import '../styling/LocationsPage.css';

const mockLocations = [
  { id: 1, name: 'Warehouse A', type: 'warehouse', address: '1234 Industrial Blvd, Suite 100', assetCount: 342, consumableCount: 1250 },
  { id: 2, name: 'Warehouse B', type: 'warehouse', address: '5678 Commerce Dr', assetCount: 128, consumableCount: 890 },
  { id: 3, name: 'Service Vehicle #1', type: 'vehicle', address: 'Mobile - GPS Tracked', assetCount: 45, consumableCount: 120 },
  { id: 4, name: 'Service Vehicle #2', type: 'vehicle', address: 'Mobile - GPS Tracked', assetCount: 38, consumableCount: 95 },
  { id: 5, name: 'Site #8 - Downtown Office', type: 'jobsite', address: '789 Main Street, Floor 3', assetCount: 24, consumableCount: 0 },
  { id: 6, name: 'Site #12 - Tech Campus', type: 'jobsite', address: '321 Innovation Way', assetCount: 67, consumableCount: 45 },
];

const typeConfig = {
  warehouse: { label: 'Warehouse', icon: Building2, className: 'type--warehouse' },
  vehicle: { label: 'Vehicle', icon: Truck, className: 'type--vehicle' },
  jobsite: { label: 'Job Site', icon: Briefcase, className: 'type--jobsite' },
};

function LocationsPage() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="locations-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Locations</h1>
          <p className="page-subtitle">Manage warehouses, vehicles, and job sites</p>
        </div>
        <button className="btn btn--primary">
          <Plus size={18} />
          Add Location
        </button>
      </div>

      <div className="toolbar">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search locations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="locations-grid">
        {mockLocations.map((location) => {
          const config = typeConfig[location.type];
          const TypeIcon = config.icon;

          return (
            <div key={location.id} className="location-card">
              <div className="location-header">
                <div className={`location-type-icon ${config.className}`}>
                  <TypeIcon size={20} />
                </div>
                <span className={`location-type-badge ${config.className}`}>
                  {config.label}
                </span>
              </div>

              <h3 className="location-name">{location.name}</h3>
              <p className="location-address">
                <MapPin size={14} />
                {location.address}
              </p>

              <div className="location-stats">
                <div className="location-stat">
                  <Package size={16} />
                  <span className="stat-value">{location.assetCount}</span>
                  <span className="stat-label">Assets</span>
                </div>
                <div className="location-stat">
                  <Boxes size={16} />
                  <span className="stat-value">{location.consumableCount}</span>
                  <span className="stat-label">Consumables</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default LocationsPage;
