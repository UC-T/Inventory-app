import React from 'react';
import { Plus, Camera, HardDrive, Monitor, Cable, Cpu, Wrench, Box, Shield } from 'lucide-react';
import '../styling/CategoriesPage.css';

const categories = [
  { id: 1, name: 'Cameras', icon: Camera, assetCount: 156, consumableCount: 0, color: 'primary' },
  { id: 2, name: 'Recording', icon: HardDrive, assetCount: 48, consumableCount: 24, color: 'info' },
  { id: 3, name: 'Displays', icon: Monitor, assetCount: 32, consumableCount: 0, color: 'success' },
  { id: 4, name: 'Cables', icon: Cable, assetCount: 0, consumableCount: 890, color: 'warning' },
  { id: 5, name: 'Network', icon: Cpu, assetCount: 67, consumableCount: 156, color: 'primary' },
  { id: 6, name: 'Tools', icon: Wrench, assetCount: 45, consumableCount: 234, color: 'info' },
  { id: 7, name: 'Enclosures', icon: Box, assetCount: 0, consumableCount: 312, color: 'success' },
  { id: 8, name: 'Access Control', icon: Shield, assetCount: 89, consumableCount: 67, color: 'warning' },
];

function CategoriesPage() {
  return (
    <div className="categories-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Categories</h1>
          <p className="page-subtitle">Organize assets and consumables by type</p>
        </div>
        <button className="btn btn--primary">
          <Plus size={18} />
          Add Category
        </button>
      </div>

      <div className="categories-grid">
        {categories.map((category) => {
          const Icon = category.icon;
          const totalItems = category.assetCount + category.consumableCount;

          return (
            <div key={category.id} className="category-card">
              <div className={`category-icon category-icon--${category.color}`}>
                <Icon size={24} />
              </div>
              
              <h3 className="category-name">{category.name}</h3>
              
              <div className="category-count">
                <span className="count-value">{totalItems}</span>
                <span className="count-label">Total Items</span>
              </div>
              
              <div className="category-breakdown">
                <div className="breakdown-item">
                  <span className="breakdown-value">{category.assetCount}</span>
                  <span className="breakdown-label">Assets</span>
                </div>
                <div className="breakdown-divider" />
                <div className="breakdown-item">
                  <span className="breakdown-value">{category.consumableCount}</span>
                  <span className="breakdown-label">Consumables</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default CategoriesPage;
