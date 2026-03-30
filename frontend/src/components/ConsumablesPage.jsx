import React, { useState } from 'react';
import { Plus, Search, Filter, AlertTriangle, Package } from 'lucide-react';
import '../styling/ConsumablesPage.css';

const mockConsumables = [
  { id: 1, name: 'RG-6 Coax Cable (1000ft)', sku: 'CBL-RG6-1K', quantity: 2, minStock: 5, category: 'Cables', location: 'Warehouse A' },
  { id: 2, name: 'BNC Connectors (100pk)', sku: 'CON-BNC-100', quantity: 45, minStock: 20, category: 'Connectors', location: 'Warehouse A' },
  { id: 3, name: 'Cat6 Cable (500ft)', sku: 'CBL-CAT6-500', quantity: 8, minStock: 10, category: 'Cables', location: 'Warehouse B' },
  { id: 4, name: 'Power Supply 12V 2A', sku: 'PWR-12V-2A', quantity: 32, minStock: 15, category: 'Power', location: 'Warehouse A' },
  { id: 5, name: 'Mounting Brackets', sku: 'MNT-BRK-UNI', quantity: 78, minStock: 25, category: 'Hardware', location: 'Warehouse A' },
  { id: 6, name: 'Weatherproof Junction Box', sku: 'BOX-WP-SM', quantity: 12, minStock: 20, category: 'Enclosures', location: 'Warehouse B' },
];

function ConsumablesPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const getStockStatus = (quantity, minStock) => {
    if (quantity <= 0) return { label: 'Out of Stock', className: 'stock--out' };
    if (quantity < minStock) return { label: 'Low Stock', className: 'stock--low' };
    return { label: 'In Stock', className: 'stock--ok' };
  };

  const getStockPercentage = (quantity, minStock) => {
    const target = minStock * 2;
    return Math.min((quantity / target) * 100, 100);
  };

  return (
    <div className="consumables-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Consumables</h1>
          <p className="page-subtitle">Track quantity-based inventory items and stock levels</p>
        </div>
        <button className="btn btn--primary">
          <Plus size={18} />
          Add Item
        </button>
      </div>

      <div className="toolbar">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search consumables..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button className="btn btn--secondary">
          <Filter size={18} />
          Filters
        </button>
      </div>

      <div className="consumables-grid">
        {mockConsumables.map((item) => {
          const status = getStockStatus(item.quantity, item.minStock);
          const percentage = getStockPercentage(item.quantity, item.minStock);
          const isLow = item.quantity < item.minStock;

          return (
            <div key={item.id} className={`consumable-card ${isLow ? 'consumable-card--warning' : ''}`}>
              <div className="consumable-header">
                <div className="consumable-icon">
                  <Package size={20} />
                </div>
                {isLow && (
                  <div className="consumable-alert">
                    <AlertTriangle size={16} />
                  </div>
                )}
              </div>
              
              <h3 className="consumable-name">{item.name}</h3>
              <span className="consumable-sku">{item.sku}</span>
              
              <div className="consumable-quantity">
                <span className="quantity-value">{item.quantity}</span>
                <span className="quantity-label">units</span>
              </div>
              
              <div className="stock-bar-container">
                <div 
                  className={`stock-bar ${status.className}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
              
              <div className="consumable-footer">
                <span className={`stock-status ${status.className}`}>
                  {status.label}
                </span>
                <span className="min-stock">Min: {item.minStock}</span>
              </div>
              
              <div className="consumable-meta">
                <span>{item.category}</span>
                <span>{item.location}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ConsumablesPage;
