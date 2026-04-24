import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit, Trash2, Eye, X, ChevronDown, QrCode, Download } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { assetsAPI, categoriesAPI, locationsAPI, suppliersAPI } from '../services/api';
import '../styling/AssetsPage.css';

const STATUS_CONFIG = {
  'available':   { label: 'Available',   className: 'status--available' },
  'checked-out': { label: 'Checked Out', className: 'status--checked-out' },
  'maintenance': { label: 'Maintenance', className: 'status--maintenance' },
  'retired':     { label: 'Retired',     className: 'status--retired' },
};

const EMPTY_FORM = {
  name: '', 
  asset_id: '', 
  serial: '', 
  category_id: '',
  location_id: '', 
  supplier_name: '', 
  status: 'available', 
  assigned_to: '', 
  ip_address: '', 
  mac_address: '', 
  warranty_date: '',
  quantity: 1, 
  price: 0,
};

// ─── Sub-components ───────────────────────────────────────────────

function AssetModal({ asset, onClose, onSave, categories, locations, suppliers }) {
  const isEdit = !!asset;
  const [form, setForm] = useState(asset ? {
    ...asset,
    category_id: String(asset.category_id || asset.category?.id || ''),
    location_id: String(asset.location_id || asset.location?.id || ''),
    supplier_name: asset.supplier_name || '',
    quantity: asset.quantity || 1,
    price: asset.price || 0,
    serial: asset.serial || '',
    assigned_to: asset.assigned_to || '',
    ip_address: asset.ip_address || '',
    mac_address: asset.mac_address || '',
    warranty_date: asset.warranty_date || '',
  } : { ...EMPTY_FORM });
  
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.category_id) e.category_id = 'Category required';
    if (!form.location_id) e.location_id = 'Location required';
    if (!form.supplier_name) e.supplier_name = 'Supplier required';
    // if (!form.serial.trim()) e.serial = 'Serial Number is required'; 
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;
    setSaving(true);
    try {
      const result = isEdit ? await assetsAPI.update(asset.id, form) : await assetsAPI.create(form);
      onSave(result);
    } catch (err) {
      setErrors({ server: 'Failed to save to database' });
    } finally { setSaving(false); }
  }

  const set = (field, value) => {
    setForm(p => ({ ...p, [field]: value }));
    if (errors[field]) setErrors(p => ({ ...p, [field]: undefined }));
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{isEdit ? 'Edit Asset' : 'Add New Asset'}</h3>
          <button className="modal-close" onClick={onClose}><X size={16} /></button>
        </div>

        {errors.server && <div className="form-error-banner">{errors.server}</div>}

        <div className="modal-section-label">Basic Information</div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Asset Name *</label>
            <input className={`form-input ${errors.name ? 'form-input--error' : ''}`} 
              value={form.name} onChange={e => set('name', e.target.value)} />
            {errors.name && <span className="form-error">{errors.name}</span>}
          </div>
          <div className="form-group">
            <label className="form-label">Asset ID</label>
            <input className="form-input" value={form.asset_id} onChange={e => set('asset_id', e.target.value)} />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Serial Number </label>
            <input className={`form-input ${errors.serial ? 'form-input--error' : ''}`}
              placeholder="Hardware Serial" value={form.serial} onChange={e => set('serial', e.target.value)} />
            {errors.serial && <span className="form-error">{errors.serial}</span>}
          </div>
          <div className="form-group">
            <label className="form-label">Warranty Expiry</label>
            <input type="date" className="form-input" value={form.warranty_date} onChange={e => set('warranty_date', e.target.value)} />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Quantity *</label>
            <input type="number" className="form-input" value={form.quantity} 
              onChange={e => set('quantity', parseInt(e.target.value) || 1)} />
          </div>
          <div className="form-group">
            <label className="form-label">Price (₹)</label>
            <input type="number" className="form-input" value={form.price} 
              onChange={e => set('price', parseFloat(e.target.value) || 0)} />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Category *</label>
            <select className={`form-select ${errors.category_id ? 'form-input--error' : ''}`} 
              value={form.category_id} onChange={e => set('category_id', e.target.value)}>
              <option value="">Select category...</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Location *</label>
            <select className={`form-select ${errors.location_id ? 'form-input--error' : ''}`} 
              value={form.location_id} onChange={e => set('location_id', e.target.value)}>
              <option value="">Select location...</option>
              {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Supplier *</label>
            <select className={`form-select ${errors.supplier_name ? 'form-input--error' : ''}`} 
              value={form.supplier_name} onChange={e => set('supplier_name', e.target.value)}>
              <option value="">Select supplier...</option>
              {suppliers.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Status</label>
            <select className="form-select" value={form.status} onChange={e => set('status', e.target.value)}>
              {Object.entries(STATUS_CONFIG).map(([v, { label }]) => (
                <option key={v} value={v}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="modal-section-label">Technical & Assignment</div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Assigned To</label>
            <input className="form-input" placeholder="User Name"
              value={form.assigned_to} onChange={e => set('assigned_to', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">IP Address</label>
            <input className="form-input font-mono" placeholder="0.0.0.0"
              value={form.ip_address} onChange={e => set('ip_address', e.target.value)} />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">MAC Address</label>
            <input className="form-input font-mono" placeholder="00:00:00:00:00:00"
              value={form.mac_address} onChange={e => set('mac_address', e.target.value)} />
          </div>
          <div className="form-group" />
        </div>

        <div className="modal-actions">
          <button className="btn btn--secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn--primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Asset'}
          </button>
        </div>
      </div>
    </div>
  );
}

function DeleteConfirm({ asset, onClose, onConfirm }) {
  const [deleting, setDeleting] = useState(false);
  const handleDelete = async () => {
    setDeleting(true);
    try {
      await assetsAPI.delete(asset.id);
      onConfirm(asset.id);
    } catch (err) { console.error(err); }
    finally { setDeleting(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal--sm" onClick={e => e.stopPropagation()}>
        <div className="modal-header"><h3>Delete Asset</h3></div>
        <p className="modal-body-text">Are you sure you want to delete <strong>{asset.name}</strong>? This action is permanent.</p>
        <div className="modal-actions">
          <button className="btn btn--secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn--danger-solid" onClick={handleDelete} disabled={deleting}>Delete</button>
        </div>
      </div>
    </div>
  );
}

function ViewModal({ asset, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{asset.name}</h3>
          <button className="modal-close" onClick={onClose}><X size={16}/></button>
        </div>
        <div className="view-grid">
          {[
            ['Asset ID',    asset.asset_id],
            ['Serial',      asset.serial || '—'],
            ['Category',    asset.category],
            ['Location',    asset.location],
            ['Supplier',    asset.supplier_name],
            ['Quantity',    asset.quantity],
            ['Unit Price',  `₹${asset.price?.toLocaleString()}`],
            ['Total Value', `₹${(asset.quantity * asset.price).toLocaleString()}`],
            ['Status',      asset.status],
            ['Assigned To', asset.assigned_to || '—'],
            ['IP Address',  asset.ip_address || '—'],
            ['MAC Address', asset.mac_address || '—'],
            ['Warranty',    asset.warranty_date || '—'],
          ].map(([label, value]) => (
            <div key={label} className="view-row">
              <span className="view-label">{label}</span>
              <span className="view-value">{value}</span>
            </div>
          ))}
        </div>
        <div className="modal-actions">
          <button className="btn btn--secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

function AssetsPage() {
  const { can } = useAuth();
  const [assets, setAssets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCat, setFilterCat] = useState('all');
  const [showFilter, setShowFilter] = useState(false);

  const [addModal, setAddModal] = useState(false);
  const [editAsset, setEditAsset] = useState(null);
  const [viewAsset, setViewAsset] = useState(null);
  const [deleteAsset, setDeleteAsset] = useState(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [a, c, l, s] = await Promise.all([
          assetsAPI.getAll(), categoriesAPI.getAll(), locationsAPI.getAll(), suppliersAPI.getAll()
        ]);
        setAssets(a || []); setCategories(c || []); setLocations(l || []); setSuppliers(s || []);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    }
    load();
  }, []);

  const filtered = assets.filter(a => {
    const q = search.toLowerCase();
    const matchSearch = !q || 
      a.name?.toLowerCase().includes(q) || 
      a.asset_id?.toLowerCase().includes(q) ||
      a.supplier_name?.toLowerCase().includes(q) ||
      a.category?.toLowerCase().includes(q) ||
      a.assigned_to?.toLowerCase().includes(q);

    const matchStatus = filterStatus === 'all' || a.status === filterStatus;
    const matchCat = filterCat === 'all' || a.category === filterCat;
    return matchSearch && matchStatus && matchCat;
  });

  const handleSaved = (saved) => {
    setAssets(prev => {
      const exists = prev.find(a => a.id === saved.id);
      return exists ? prev.map(a => a.id === saved.id ? saved : a) : [saved, ...prev];
    });
    setAddModal(false); setEditAsset(null);
  };

  return (
    <div className="assets-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Assets</h1>
          <p className="page-subtitle">Manage serialized equipment and track procurement</p>
        </div>
        {can('asset_create') && <button className="btn btn--primary" onClick={() => setAddModal(true)}><Plus size={18}/> Add Asset</button>}
      </div>

      <div className="toolbar">
        <div className="search-box">
          <Search size={16} className="search-icon" />
          <input type="text" placeholder="Search assets, ID, or supplier..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        
        <div className="dropdown-wrap">
          <button className="btn btn--secondary" onClick={() => setShowFilter(!showFilter)}>
            <Filter size={16} /> {filterCat === 'all' ? 'Category' : filterCat} <ChevronDown size={14} />
          </button>
          {showFilter && (
            <div className="dropdown-menu">
              <button className="dropdown-item" onClick={() => { setFilterCat('all'); setShowFilter(false); }}>All Categories</button>
              {categories.map(c => (
                <button key={c.id} className="dropdown-item" onClick={() => { setFilterCat(c.name); setShowFilter(false); }}>{c.name}</button>
              ))}
            </div>
          )}
        </div>

        <div className="filter-group">
          {['all', 'available', 'checked-out', 'maintenance'].map(s => (
            <button key={s} className={`filter-pill ${filterStatus === s ? 'filter-pill--active' : ''}`} onClick={() => setFilterStatus(s)}>
              {s.toUpperCase()}
            </button>
          ))}
        </div>
        <span className="results-count">{filtered.length} of {assets.length}</span>
      </div>

      <div className="data-table-container">
        {loading ? <div className="table-loading">
          {[...Array(5)].map((_, i) => <div key={i} className="skeleton skeleton-row" />)}
        </div> : (
          <table className="data-table">
            <thead>
              <tr>
                <th>ASSET ID</th>
                <th>NAME</th>
                <th>CATEGORY</th>
                <th>SUPPLIER</th>
                <th>QTY</th>
                <th>PRICE</th>
                <th>STATUS</th>
                <th>LOCATION</th>
                <th>ASSIGNED TO</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(asset => (
                <tr key={asset.id}>
                  <td><span className="font-mono asset-id">{asset.asset_id}</span></td>
                  <td><span className="asset-name">{asset.name}</span></td>
                  <td>{asset.category}</td>
                  <td>{asset.supplier_name || 'N/A'}</td>
                  <td>{asset.quantity}</td>
                  <td>₹{asset.price?.toLocaleString()}</td>
                  <td>
                    <span className={`status-badge ${STATUS_CONFIG[asset.status]?.className || ''}`}>
                      {STATUS_CONFIG[asset.status]?.label || asset.status}
                    </span>
                  </td>
                  <td style={{ color: 'var(--color-text-secondary)' }}>{asset.location}</td>
                  <td style={{ color: 'var(--color-text-secondary)' }}>{asset.assigned_to || '—'}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="icon-btn" title="View" onClick={() => setViewAsset(asset)}><Eye size={15}/></button>
                      <button className="icon-btn" title="Edit" onClick={() => setEditAsset(asset)}><Edit size={15}/></button>
                      <button className="icon-btn btn--danger" title="Delete" onClick={() => setDeleteAsset(asset)}><Trash2 size={15}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {addModal && <AssetModal onClose={() => setAddModal(false)} onSave={handleSaved} categories={categories} locations={locations} suppliers={suppliers} />}
      {editAsset && <AssetModal asset={editAsset} onClose={() => setEditAsset(null)} onSave={handleSaved} categories={categories} locations={locations} suppliers={suppliers} />}
      {viewAsset && <ViewModal asset={viewAsset} onClose={() => setViewAsset(null)} />}
      {deleteAsset && <DeleteConfirm asset={deleteAsset} onClose={() => setDeleteAsset(null)} onConfirm={(id) => setAssets(prev => prev.filter(a => a.id !== id))} />}
    </div>
  );
}

export default AssetsPage;