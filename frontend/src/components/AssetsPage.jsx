import React, { useState } from 'react';
import { Plus, Search, Filter, MoreVertical, QrCode, Edit, Trash2, Eye } from 'lucide-react';
import '../styling/AssetsPage.css';

const mockAssets = [
  { id: 'CAM-0042', name: 'PTZ Camera', category: 'Cameras', status: 'checked-out', location: 'Site #12', assignedTo: 'John Davidson', serial: 'PTZ-2024-0042' },
  { id: 'CAM-0043', name: 'Dome Camera', category: 'Cameras', status: 'available', location: 'Warehouse A', assignedTo: null, serial: 'DOM-2024-0043' },
  { id: 'DVR-0015', name: 'Network DVR 16CH', category: 'Recording', status: 'available', location: 'Warehouse A', assignedTo: null, serial: 'DVR-2024-0015' },
  { id: 'MON-0028', name: '27" Security Monitor', category: 'Displays', status: 'maintenance', location: 'Service Center', assignedTo: null, serial: 'MON-2024-0028' },
  { id: 'CAM-0044', name: 'Thermal Camera', category: 'Cameras', status: 'checked-out', location: 'Site #8', assignedTo: 'Sarah Miller', serial: 'THM-2024-0044' },
];

const statusConfig = {
  'available': { label: 'Available', className: 'status--available' },
  'checked-out': { label: 'Checked Out', className: 'status--checked-out' },
  'maintenance': { label: 'Maintenance', className: 'status--maintenance' },
};

function AssetsPage() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="assets-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Assets</h1>
          <p className="page-subtitle">Manage serialized equipment and track chain of custody</p>
        </div>
        <button className="btn btn--primary">
          <Plus size={18} />
          Add Asset
        </button>
      </div>

      <div className="toolbar">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search by name, serial, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button className="btn btn--secondary">
          <Filter size={18} />
          Filters
        </button>
      </div>

      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Asset ID</th>
              <th>Name</th>
              <th>Category</th>
              <th>Serial Number</th>
              <th>Status</th>
              <th>Location</th>
              <th>Assigned To</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {mockAssets.map((asset) => (
              <tr key={asset.id}>
                <td className="font-mono">{asset.id}</td>
                <td>{asset.name}</td>
                <td>{asset.category}</td>
                <td className="font-mono">{asset.serial}</td>
                <td>
                  <span className={`status-badge ${statusConfig[asset.status].className}`}>
                    {statusConfig[asset.status].label}
                  </span>
                </td>
                <td>{asset.location}</td>
                <td>{asset.assignedTo || '-'}</td>
                <td>
                  <div className="action-buttons">
                    <button className="icon-btn" title="View">
                      <Eye size={16} />
                    </button>
                    <button className="icon-btn" title="QR Code">
                      <QrCode size={16} />
                    </button>
                    <button className="icon-btn" title="Edit">
                      <Edit size={16} />
                    </button>
                    <button className="icon-btn icon-btn--danger" title="Delete">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AssetsPage;
