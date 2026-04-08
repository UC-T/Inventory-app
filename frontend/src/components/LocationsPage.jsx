import React, { useState, useEffect } from 'react';
import { Plus, Search, MapPin, Building2, Truck, Briefcase, Package, Boxes, Edit, Trash2, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { locationsAPI } from '../services/api';
import '../styling/LocationsPage.css';

const MOCK_LOCATIONS = [
  { id: 1, name: 'Warehouse A',              type: 'warehouse', address: '1234 Industrial Blvd, Suite 100', assetCount: 342, consumableCount: 1250 },
  { id: 2, name: 'Warehouse B',              type: 'warehouse', address: '5678 Commerce Dr',                assetCount: 128, consumableCount: 890  },
  { id: 3, name: 'Service Vehicle #1',       type: 'vehicle',   address: 'Mobile — GPS Tracked',           assetCount: 45,  consumableCount: 120  },
  { id: 4, name: 'Service Vehicle #2',       type: 'vehicle',   address: 'Mobile — GPS Tracked',           assetCount: 38,  consumableCount: 95   },
  { id: 5, name: 'Site #8 — Downtown Office',type: 'jobsite',   address: '789 Main Street, Floor 3',       assetCount: 24,  consumableCount: 0    },
  { id: 6, name: 'Site #12 — Tech Campus',   type: 'jobsite',   address: '321 Innovation Way',             assetCount: 67,  consumableCount: 45   },
];

const TYPE_CONFIG = {
  warehouse: { label: 'Warehouse', icon: Building2, className: 'type--warehouse' },
  vehicle:   { label: 'Vehicle',   icon: Truck,     className: 'type--vehicle'   },
  jobsite:   { label: 'Job Site',  icon: Briefcase, className: 'type--jobsite'   },
};

const EMPTY_FORM = { name: '', type: 'warehouse', address: '' };

// ─── Add / Edit Modal ─────────────────────────────────────────────
function LocationModal({ location, onClose, onSave }) {
  const isEdit = !!location;
  const [form, setForm]     = useState(location || EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  function validate() {
    const e = {};
    if (!form.name.trim())    e.name    = 'Name is required';
    if (!form.address.trim()) e.address = 'Address is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;
    setSaving(true);
    try {
      const result = isEdit
        ? await locationsAPI.update(location.id, form)
        : await locationsAPI.create(form);
      onSave(result);
    } catch {
      onSave({ ...form, id: Date.now(), assetCount: 0, consumableCount: 0 });
    } finally {
      setSaving(false);
    }
  }

  function set(field, value) {
    setForm(p => ({ ...p, [field]: value }));
    setErrors(p => ({ ...p, [field]: undefined }));
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal--sm" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{isEdit ? 'Edit Location' : 'Add Location'}</h3>
          <button className="modal-close" onClick={onClose}><X size={16} /></button>
        </div>

        <div className="form-group">
          <label className="form-label">Location Name *</label>
          <input className={`form-input ${errors.name ? 'form-input--error' : ''}`}
            placeholder="e.g. Warehouse A" value={form.name}
            onChange={e => set('name', e.target.value)} />
          {errors.name && <span className="form-error">{errors.name}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">Type</label>
          <div className="type-selector">
            {Object.entries(TYPE_CONFIG).map(([value, cfg]) => {
              const Icon = cfg.icon;
              return (
                <button key={value} type="button"
                  className={`type-option ${form.type === value ? 'type-option--active' : ''}`}
                  onClick={() => set('type', value)}>
                  <Icon size={18} />
                  <span>{cfg.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Address / Description *</label>
          <input className={`form-input ${errors.address ? 'form-input--error' : ''}`}
            placeholder="e.g. 1234 Industrial Blvd or Mobile — GPS Tracked"
            value={form.address} onChange={e => set('address', e.target.value)} />
          {errors.address && <span className="form-error">{errors.address}</span>}
        </div>

        <div className="modal-actions">
          <button className="btn btn--secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn--primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Location'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Delete Confirm ───────────────────────────────────────────────
function DeleteConfirm({ location, onClose, onConfirm }) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null); // New: Track specific backend errors

  async function handleDelete() {
    setDeleting(true);
    setError(null);
    
    try {
      // 1. Wait for the API to confirm deletion
      await locationsAPI.delete(location.id);
      
      // 2. ONLY if successful, update the UI state
      onConfirm(location.id); 
      onClose(); // Close the modal
    } catch (err) {
      // 3. Capture the 409 Conflict or 500 error message from Flask
      setError(err.message); 
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal--sm" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Delete {location.name}?</h3>
      
      {/* USE CASE: Error Display */}
      {error && (
        <div className="alert-danger" style={{ color: 'red', marginBottom: '10px' }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      <p>Are you sure? This action cannot be undone.</p>
      
      <button onClick={onClose} disabled={deleting}>Cancel</button>
      <button 
        onClick={handleDelete} 
        disabled={deleting}
        style={{ backgroundColor: deleting ? '#ccc' : 'red' }}
      >
        {deleting ? 'Deleting...' : 'Confirm Delete'}
      </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────
function LocationsPage() {
  const { can } = useAuth();
  const [locations,  setLocations]  = useState(MOCK_LOCATIONS);
  const [search,     setSearch]     = useState('');
  const [filterType, setFilterType] = useState('all');
  const [addModal,   setAddModal]   = useState(false);
  const [editItem,   setEditItem]   = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);

  useEffect(() => {
    locationsAPI.getAll()
      .then(setLocations)
      .catch(() => {});
  }, []);

  const filtered = locations.filter(l => {
    const q = search.toLowerCase();
    const matchSearch = !q || l.name.toLowerCase().includes(q) || l.address.toLowerCase().includes(q);
    const matchType   = filterType === 'all' || l.type === filterType;
    return matchSearch && matchType;
  });

  function handleSaved(saved) {
    setLocations(prev => {
      const exists = prev.find(l => l.id === saved.id);
      return exists ? prev.map(l => l.id === saved.id ? saved : l) : [saved, ...prev];
    });
    setAddModal(false);
    setEditItem(null);
  }

  function handleDeleted(id) {
    setLocations(prev => prev.filter(l => l.id !== id));
    setDeleteItem(null);
  }

  return (
    <div className="locations-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Locations</h1>
          <p className="page-subtitle">Manage warehouses, vehicles, and job sites</p>
        </div>
        {can('location_manage') && (
          <button className="btn btn--primary" onClick={() => setAddModal(true)}>
            <Plus size={18} /> Add Location
          </button>
        )}
      </div>

      <div className="toolbar">
        <div className="search-box">
          <Search size={16} className="search-icon" />
          <input type="text" placeholder="Search locations…"
            value={search} onChange={e => setSearch(e.target.value)} />
          {search && (
            <button className="search-clear" onClick={() => setSearch('')}><X size={14} /></button>
          )}
        </div>
        <div className="filter-group">
          {[['all','All'],['warehouse','Warehouses'],['vehicle','Vehicles'],['jobsite','Job Sites']].map(([v,l]) => (
            <button key={v}
              className={`filter-pill ${filterType === v ? 'filter-pill--active' : ''}`}
              onClick={() => setFilterType(v)}>{l}
            </button>
          ))}
        </div>
        <span className="results-count">{filtered.length} of {locations.length}</span>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <MapPin size={32} style={{ opacity: 0.2 }} />
          <p>No locations match your search</p>
        </div>
      ) : (
        <div className="locations-grid">
          {filtered.map(location => {
            const config  = TYPE_CONFIG[location.type];
            const TypeIcon = config.icon;
            return (
              <div key={location.id} className="location-card">
                <div className="location-header">
                  <div className={`location-type-icon ${config.className}`}>
                    <TypeIcon size={20} />
                  </div>
                  <span className={`location-type-badge ${config.className}`}>{config.label}</span>
                  {can('location_manage') && (
                    <div className="location-actions">
                      <button className="icon-btn" title="Edit" onClick={() => setEditItem(location)}>
                        <Edit size={14} />
                      </button>
                      <button className="icon-btn icon-btn--danger" title="Delete" onClick={() => setDeleteItem(location)}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>

                <h3 className="location-name">{location.name}</h3>
                <p className="location-address">
                  <MapPin size={13} />{location.address}
                </p>

                <div className="location-stats">
                  <div className="location-stat">
                    <Package size={15} />
                    <span className="stat-value">{location.assetCount}</span>
                    <span className="stat-label">Assets</span>
                  </div>
                  <div className="location-stat">
                    <Boxes size={15} />
                    <span className="stat-value">{location.consumableCount}</span>
                    <span className="stat-label">Consumables</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {addModal    && <LocationModal onClose={() => setAddModal(false)} onSave={handleSaved} />}
      {editItem    && <LocationModal location={editItem} onClose={() => setEditItem(null)} onSave={handleSaved} />}
      {deleteItem  && <DeleteConfirm location={deleteItem} onClose={() => setDeleteItem(null)} onConfirm={handleDeleted} />}
    </div>
  );
}

export default LocationsPage;