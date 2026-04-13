import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, QrCode, Edit, Trash2, Eye, X, Download, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { assetsAPI, categoriesAPI, locationsAPI } from '../services/api';
import '../styling/AssetsPage.css';

// ─── Static fallback data (used until backend is ready) ───────────
// const MOCK_ASSETS = [
//   { id: 1, asset_id: 'CAM-0042', name: 'PTZ Camera',          category: 'Cameras',   status: 'checked-out', location: 'Site #12',    assigned_to: 'John Davidson', serial: 'PTZ-2024-0042', ip_address: '192.168.1.42', mac_address: '00:1A:2B:3C:4D:5E', warranty_date: '2026-06-01' },
//   { id: 2, asset_id: 'CAM-0043', name: 'Dome Camera',          category: 'Cameras',   status: 'available',   location: 'Warehouse A',  assigned_to: null,            serial: 'DOM-2024-0043', ip_address: '—',            mac_address: '—',                 warranty_date: '2027-01-15' },
//   { id: 3, asset_id: 'DVR-0015', name: 'Network DVR 16CH',     category: 'Recording', status: 'available',   location: 'Warehouse A',  assigned_to: null,            serial: 'DVR-2024-0015', ip_address: '192.168.1.10', mac_address: 'AA:BB:CC:DD:EE:FF', warranty_date: '2025-11-01' },
//   { id: 4, asset_id: 'MON-0028', name: '27" Security Monitor', category: 'Displays',  status: 'maintenance', location: 'Service Center',assigned_to: null,            serial: 'MON-2024-0028', ip_address: '—',            mac_address: '—',                 warranty_date: '2025-06-30' },
//   { id: 5, asset_id: 'CAM-0044', name: 'Thermal Camera',       category: 'Cameras',   status: 'checked-out', location: 'Site #8',      assigned_to: 'Sarah Miller',  serial: 'THM-2024-0044', ip_address: '192.168.1.75', mac_address: '11:22:33:44:55:66', warranty_date: '2027-03-20' },
// ];

const STATUS_CONFIG = {
  'available':   { label: 'Available',   className: 'status--available' },
  'checked-out': { label: 'Checked Out', className: 'status--checked-out' },
  'maintenance': { label: 'Maintenance', className: 'status--maintenance' },
  'retired':     { label: 'Retired',     className: 'status--retired' },
};

const EMPTY_FORM = {
  name: '', asset_id: '', serial: '', category: '',
  location: '', status: 'available', assigned_to: '',
  ip_address: '', mac_address: '', warranty_date: '',
};

// ─── Sub-components ───────────────────────────────────────────────

function AssetModal({ asset, onClose, onSave, categories, locations }) {
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const isEdit = !!asset;

  function validate() {
    const e = {};
    if (!form.name.trim())   e.name   = 'Name is required';
    // if (!form.serial.trim()) e.serial = 'Serial number is required';
    if (!form.category)      e.category = 'Category is required';
    if (!form.location)      e.location = 'Location is required';
    if (!form.warranty_date)   e.warranty_date = 'Warranty date is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSave() {
    alert('function called');
    if (!validate()) return;
    setSaving(true);
    try {
      const result = isEdit
        ? await assetsAPI.update(asset.id, form)
        : await assetsAPI.create(form);
      onSave(result);
    } catch {
      console.log('some error occurred');// mock save
      // onSave({ ...form, id: Date.now() });
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
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{isEdit ? 'Edit Asset' : 'Add New Asset'}</h3>
          <button className="modal-close" onClick={onClose}><X size={16} /></button>
        </div>

        <div className="modal-section-label">Basic Information</div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Asset Name *</label>
            <input className={`form-input ${errors.name ? 'form-input--error' : ''}`}
              placeholder="e.g. PTZ Camera" value={form.name}
              onChange={e => set('name', e.target.value)} />
            {errors.name && <span className="form-error">{errors.name}</span>}
          </div>
          <div className="form-group">
            <label className="form-label">Asset ID</label>
            <input className="form-input" placeholder="e.g. CAM-0042"
              value={form.asset_id} onChange={e => set('asset_id', e.target.value)} />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Serial Number *</label>
            <input className={`form-input ${errors.serial ? 'form-input--error' : ''}`}
              placeholder="e.g. PTZ-2024-0042" value={form.serial}
              onChange={e => set('serial', e.target.value)} />
            {errors.serial && <span className="form-error">{errors.serial}</span>}
          </div>
          <div className="form-group">
            <label className="form-label">Warranty Date</label>
            <input type="date" className="form-input" value={form.warranty_date}
              onChange={e => set('warranty_date', e.target.value)} />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Category *</label>
            <select className={`form-select ${errors.category ? 'form-input--error' : ''}`}
              value={form.category} onChange={e => set('category', e.target.value)}>
              <option value="">Select category…</option>
              {/* {(categories.length ? categories : ['Cameras','Recording','Displays','Network','Tools']).map(c => (
                <option key={c} value={typeof c === 'string' ? c : c.name}>{typeof c === 'string' ? c : c.name}</option>
              ))} */}
            </select>
            {errors.category && <span className="form-error">{errors.category}</span>}
          </div>
          <div className="form-group">
            <label className="form-label">Location *</label>
            <select className={`form-select ${errors.location ? 'form-input--error' : ''}`}
              value={form.location} onChange={e => set('location', e.target.value)}>
              <option value="">Select location…</option>
              {(locations.length ? locations : ['Warehouse A','Warehouse B','Site #8','Site #12','Service Center']).map(l => (
                <option key={l} value={typeof l === 'string' ? l : l.name}>{typeof l === 'string' ? l : l.name}</option>
              ))}
            </select>
            {errors.location && <span className="form-error">{errors.location}</span>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Status</label>
            <select className="form-select" value={form.status} onChange={e => set('status', e.target.value)}>
              {Object.entries(STATUS_CONFIG).map(([v, { label }]) => (
                <option key={v} value={v}>{label}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Assigned To</label>
            <input className="form-input" placeholder="Person name"
              value={form.assigned_to || ''} onChange={e => set('assigned_to', e.target.value)} />
          </div>
        </div>

        <div className="modal-section-label">Technical Metadata</div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">IP Address</label>
            <input className="form-input font-mono" placeholder="192.168.1.x"
              value={form.ip_address || ''} onChange={e => set('ip_address', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">MAC Address</label>
            <input className="form-input font-mono" placeholder="00:00:00:00:00:00"
              value={form.mac_address || ''} onChange={e => set('mac_address', e.target.value)} />
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn btn--secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn--primary" onClick={handleSave} disabled={saving} >
            {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Asset'}
          </button>
        </div>
      </div>
    </div>
  );
}

function DeleteConfirm({ asset, onClose, onConfirm }) {
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      await assetsAPI.delete(asset.id);
    } catch { /* mock */ }
    onConfirm(asset.id);
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal--sm" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Delete Asset</h3>
          <button className="modal-close" onClick={onClose}><X size={16} /></button>
        </div>
        <p className="modal-body-text">
          Are you sure you want to delete <strong>{asset.name}</strong> ({asset.asset_id})?
          This action cannot be undone.
        </p>
        <div className="modal-actions">
          <button className="btn btn--secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn--danger-solid" onClick={handleDelete} disabled={deleting}>
            {deleting ? 'Deleting…' : 'Delete Asset'}
          </button>
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
          <button className="modal-close" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="view-grid">
          {[
            ['Asset ID',    asset.asset_id],
            ['Serial',      asset.serial],
            ['Category',    asset.category],
            ['Location',    asset.location],
            ['Status',      asset.status],
            ['Assigned To', asset.assigned_to || '—'],
            ['IP Address',  asset.ip_address  || '—'],
            ['MAC Address', asset.mac_address  || '—'],
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

// ─── Main component ───────────────────────────────────────────────
function AssetsPage() {
  const { can } = useAuth();

  const [assets,     setAssets]     = useState([]);
  const [categories, setCategories] = useState([]);
  const [locations,  setLocations]  = useState([]);
  const [loading,    setLoading]    = useState(false);

  // UI state
  const [search,       setSearch]       = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCat,    setFilterCat]    = useState('all');
  const [showFilter,   setShowFilter]   = useState(false);

  // Modal state
  const [addModal,    setAddModal]    = useState(false);
  const [editAsset,   setEditAsset]   = useState(null);
  const [viewAsset,   setViewAsset]   = useState(null);
  const [deleteAsset, setDeleteAsset] = useState(null);

  // Load data
  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [a, c, l] = await Promise.all([
          assetsAPI.getAll(),
          categoriesAPI.getAll(),
          locationsAPI.getAll(),
        ]);
        setAssets(a);
        setCategories(c);
        setLocations(l);
      } catch (err){
        console.error("Failed to fetch data:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Filter logic
  // const filtered = assets.filter(a => {
  //   const q = search.toLowerCase();
  //   const matchSearch = !q ||
  //     a.name?.toLowerCase().includes(q) ||
  //     a.serial?.toLowerCase().includes(q) ||
  //     a.asset_id?.toLowerCase().includes(q) ||
  //     a.assigned_to?.toLowerCase().includes(q);
  //   const matchStatus = filterStatus === 'all' || a.status === filterStatus;
  //   const matchCat    = filterCat    === 'all' || a.category === filterCat;
  //   return matchSearch && matchStatus && matchCat;
  // });

  // const allCategories = [...new Set(assets.map(a => a.category).filter(Boolean))];

  // Handlers
  function handleSaved(saved) {
    
    setAssets(prev => {
      
      const exists = prev.find(a => a.id === saved.id);
      return exists ? prev.map(a => a.id === saved.id ? saved : a) : [saved, ...prev];
    });
    setAddModal(false);
    setEditAsset(null);
  }

  function handleDeleted(id) {
    setAssets(prev => prev.filter(a => a.id !== id));
    setDeleteAsset(null);
  }

  function handleQR(asset) {
    const url = assetsAPI.getQR(asset.id);
    window.open(url, '_blank');
  }

  async function handleGatePass(asset) {
    try {
      const blob = await assetsAPI.getGatePass(asset.id);
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href = url; a.download = `gate-pass-${asset.asset_id}.pdf`; a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert('Gate pass generation requires the backend to be running.');
    }
  }

  // function isWarrantyNear(date) {
  //   if (!date) return false;
  //   const diff = (new Date(date) - new Date()) / 86400000;
  //   return diff >= 0 && diff <= 30;
  // }

  // 3. Scalable Filter (We map 'assets' directly now)
  // Later, we will move 'search' to a backend query for 1000+ items
  const displayAssets = assets.filter(a => 
    a.name?.toLowerCase().includes(search.toLowerCase()) ||
    a.asset_id?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="assets-page">
      {/* ── Page header ──────────────────────────────────────────── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Assets</h1>
          <p className="page-subtitle">Manage serialized equipment and track chain of custody</p>
        </div>
        {can('asset_create') && (
          <button className="btn btn--primary" onClick={() => {
            alert('Add asset function called');
            setAddModal(true)}}>
            <Plus size={18} /> Add Asset
          </button>
        )}
      </div>

      {/* ── Toolbar ──────────────────────────────────────────────── */}
      <div className="toolbar">
        <div className="search-box">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search by name, serial, ID, or person…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button className="search-clear" onClick={() => setSearch('')}>
              <X size={14} />
            </button>
          )}
        </div>

        <div className="filter-group">
          {['all', 'available', 'checked-out', 'maintenance'].map(s => (
            <button key={s}
              className={`filter-pill ${filterStatus === s ? 'filter-pill--active' : ''}`}
              onClick={() => setFilterStatus(s)}>
              {s === 'all' ? 'All' : STATUS_CONFIG[s]?.label}
            </button>
          ))}
        </div>

        <div className="dropdown-wrap">
          <button className="btn btn--secondary" onClick={() => setShowFilter(p => !p)}>
            <Filter size={16} />
            {filterCat === 'all' ? 'Category' : filterCat}
            <ChevronDown size={14} />
          </button>
          {showFilter && (
            <div className="dropdown-menu">
              <button className={`dropdown-item ${filterCat === 'all' ? 'active' : ''}`}
                onClick={() => { setFilterCat('all'); setShowFilter(false); }}>
                All categories
              </button>
              {/* Live Data mapping inside the original UI structure */}
              {categories.map(c => (
                <button key={c.id}
                  className={`dropdown-item ${filterCat === c.name ? 'active' : ''}`}
                  onClick={() => { setFilterCat(c.name); setShowFilter(false); }}>
                  {c.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <span className="results-count">{displayAssets.length} of {assets.length}</span>
      </div>

      <div className="data-table-container">
        {loading ? (
          <div className="table-loading">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="skeleton skeleton-row" />
            ))}
          </div>
        ) : displayAssets.length === 0 ? (
          <div className="empty-state">
            <Search size={32} style={{ opacity: 0.2 }} />
            <p>{search ? "No assets match your search" : "No real assets found in Supabase. Add your first one!"}</p>
            {search && <button className="btn btn--secondary" onClick={() => setSearch('')}>Clear search</button>}
          </div>
        ) : (
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
                <th>Warranty</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayAssets.map(asset => (
                <tr key={asset.id}>
                  <td><span className="font-mono asset-id">{asset.asset_id}</span></td>
                  <td><span className="asset-name">{asset.name}</span></td>
                  <td>{asset.category}</td>
                  <td><span className="font-mono" style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{asset.serial}</span></td>
                  <td>
                    <span className={`status-badge ${STATUS_CONFIG[asset.status]?.className || ''}`}>
                      {STATUS_CONFIG[asset.status]?.label || asset.status}
                    </span>
                  </td>
                  <td style={{ color: 'var(--color-text-secondary)' }}>{asset.location}</td>
                  <td style={{ color: 'var(--color-text-secondary)' }}>{asset.assigned_to || '—'}</td>
                  <td>
                    <span className="warranty-ok">
                      {asset.warranty_date || '—'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="icon-btn" title="View details" onClick={() => setViewAsset(asset)}>
                        <Eye size={15} />
                      </button>
                      {can('asset_qr') && (
                        <button className="icon-btn" title="Download QR code" onClick={() => handleQR(asset)}>
                          <QrCode size={15} />
                        </button>
                      )}
                      {can('asset_gatepass') && (
                        <button className="icon-btn" title="Download Gate Pass" onClick={() => handleGatePass(asset)}>
                          <Download size={15} />
                        </button>
                      )}
                      {can('asset_edit') && (
                        <button className="icon-btn" title="Edit" onClick={() => setEditAsset(asset)}>
                          <Edit size={15} />
                        </button>
                      )}
                      {can('asset_delete') && (
                        <button className="icon-btn icon-btn--danger" title="Delete" onClick={() => setDeleteAsset(asset)}>
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Modals ───────────────────────────────────────────────── */}
      {addModal && (
        <AssetModal
          onClose={() => setAddModal(false)}
          // onSave={handleSaved}
          categories={categories}
          locations={locations}
        />
      )}
      {editAsset && (
        <AssetModal
          asset={editAsset}
          onClose={() => setEditAsset(null)}
          onSave={handleSaved}
          categories={categories}
          locations={locations}
        />
      )}
      {viewAsset && (
        <ViewModal asset={viewAsset} onClose={() => setViewAsset(null)} />
      )}
      {deleteAsset && (
        <DeleteConfirm
          asset={deleteAsset}
          onClose={() => setDeleteAsset(null)}
          onConfirm={handleDeleted}
        />
      )}
    </div>
  );
}

export default AssetsPage;