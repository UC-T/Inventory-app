import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, QrCode, Edit, Trash2, Eye, X, Download, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
// Added suppliersAPI to the imports
import { assetsAPI, categoriesAPI, locationsAPI, suppliersAPI } from '../services/api';
import '../styling/AssetsPage.css';

const STATUS_CONFIG = {
  'available':   { label: 'Available',   className: 'status--available' },
  'checked-out': { label: 'Checked Out', className: 'status--checked-out' },
  'maintenance': { label: 'Maintenance', className: 'status--maintenance' },
  'retired':     { label: 'Retired',     className: 'status--retired' },
};

// Updated EMPTY_FORM to include supplier_name
const EMPTY_FORM = {
  name: '', asset_id: '', serial: '', category_id: '',
  location_id: '', supplier_name: '', status: 'available', 
  assigned_to: '', ip_address: '', mac_address: '', warranty_date: '',
};

// ─── Sub-components ───────────────────────────────────────────────

function AssetModal({ asset, onClose, onSave, categories, locations, suppliers }) {
  const isEdit = !!asset;
  const [form, setForm] = useState(asset ? {
    ...asset,
    category_id: asset.category_id || '',
    location_id: asset.location_id || '',
    supplier_name: asset.supplier_name || ''
  } : { ...EMPTY_FORM });
  
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  function validate() {
    const e = {};
    if (!form.name.trim())      e.name = 'Name is required';
    if (!form.category_id)    e.category_id = 'Category is required';
    if (!form.location_id)    e.location_id = 'Location is required';
    if (!form.supplier_name)  e.supplier_name = 'Supplier is required'; // Mandatory Check
    if (!form.warranty_date)  e.warranty_date = 'Warranty date is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;
    setSaving(true);
    try {
      const result = isEdit
        ? await assetsAPI.update(asset.id, form)
        : await assetsAPI.create(form);
      onSave(result);
    } catch (err) {
      console.error('Asset save failed:', err);
      setErrors({ server: 'Failed to save asset to Supabase' });
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
            <label className="form-label">Warranty Date *</label>
            <input type="date" className={`form-input ${errors.warranty_date ? 'form-input--error' : ''}`} 
              value={form.warranty_date}
              onChange={e => set('warranty_date', e.target.value)} />
            {errors.warranty_date && <span className="form-error">{errors.warranty_date}</span>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Category *</label>
            <select className={`form-select ${errors.category_id ? 'form-input--error' : ''}`}
              value={form.category_id} onChange={e => set('category_id', e.target.value)}>
              <option value="">Select category…</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            {errors.category_id && <span className="form-error">{errors.category_id}</span>}
          </div>
          <div className="form-group">
            <label className="form-label">Location *</label>
            <select className={`form-select ${errors.location_id ? 'form-input--error' : ''}`}
              value={form.location_id} onChange={e => set('location_id', e.target.value)}>
              <option value="">Select location…</option>
              {locations.map(l => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>
            {errors.location_id && <span className="form-error">{errors.location_id}</span>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Supplier *</label>
            <select className={`form-select ${errors.supplier_name ? 'form-input--error' : ''}`}
              value={form.supplier_name} onChange={e => set('supplier_name', e.target.value)}>
              <option value="">Select supplier…</option>
              {(suppliers || []).map(s => (
                <option key={s.name} value={s.name}>{s.name}</option>
              ))}
            </select>
            {errors.supplier_name && <span className="form-error">{errors.supplier_name}</span>}
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

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Assigned To</label>
            <input className="form-input" placeholder="Person name"
              value={form.assigned_to || ''} onChange={e => set('assigned_to', e.target.value)} />
          </div>
          <div className="form-group" /> {/* Spacer */}
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

// DeleteConfirm and ViewModal remain unchanged...
function DeleteConfirm({ asset, onClose, onConfirm }) {
  const [deleting, setDeleting] = useState(false);
  async function handleDelete() {
    setDeleting(true);
    try {
      await assetsAPI.delete(asset.id);
      onConfirm(asset.id);
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setDeleting(false);
    }
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
            ['Supplier',    asset.supplier_name],
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
  const [suppliers,  setSuppliers]  = useState([]); // Added Supplier state
  const [loading,    setLoading]    = useState(false);

  const [search,       setSearch]       = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCat,    setFilterCat]    = useState('all');
  const [showFilter,   setShowFilter]   = useState(false);

  const [addModal,    setAddModal]    = useState(false);
  const [editAsset,   setEditAsset]   = useState(null);
  const [viewAsset,   setViewAsset]   = useState(null);
  const [deleteAsset, setDeleteAsset] = useState(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [a, c, l, s] = await Promise.all([
          assetsAPI.getAll(),
          categoriesAPI.getAll(),
          locationsAPI.getAll(),
          suppliersAPI.getAll(), // Added Supplier fetch
        ]);
        setAssets(a || []);
        setCategories(c || []);
        setLocations(l || []);
        setSuppliers(s || []);  
      } catch (err){
        console.error("Failed to fetch data:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = assets.filter(a => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      a.name?.toLowerCase().includes(q) ||
      a.serial?.toLowerCase().includes(q) ||
      a.asset_id?.toLowerCase().includes(q) ||
      a.supplier_name?.toLowerCase().includes(q) || // Search by supplier
      a.category?.toLowerCase().includes(q) ||
      a.location?.toLowerCase().includes(q) ||
      a.assigned_to?.toLowerCase().includes(q);

    const matchStatus = filterStatus === 'all' || a.status === filterStatus;
    const matchCat    = filterCat    === 'all' || a.category === filterCat;

    return matchSearch && matchStatus && matchCat;
  });

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
      alert('Error generating Gate Pass.');
    }
  }

  return (
    <div className="assets-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Assets</h1>
          <p className="page-subtitle">Manage serialized equipment and track chain of custody</p>
        </div>
        {can('asset_create') && (
          <button className="btn btn--primary" onClick={() => setAddModal(true)}>
            <Plus size={18} /> Add Asset
          </button>
        )}
      </div>

      <div className="toolbar">
        <div className="search-box">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search by name, serial, ID, or supplier…"
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

        <span className="results-count">{filtered.length} of {assets.length}</span>
      </div>

      <div className="data-table-container">
        {loading ? (
          <div className="table-loading">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="skeleton skeleton-row" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <Search size={32} style={{ opacity: 0.2 }} />
            <p>{search ? "No assets match your search criteria" : "No assets found in the system."}</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Asset ID</th>
                <th>Name</th>
                <th>Category</th>
                <th>Supplier</th>
                <th>Status</th>
                <th>Location</th>
                <th>Assigned To</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(asset => (
                <tr key={asset.id}>
                  <td><span className="font-mono asset-id">{asset.asset_id}</span></td>
                  <td><span className="asset-name">{asset.name}</span></td>
                  <td>{asset.category}</td>
                  <td>{asset.supplier?.name || 'N/A'}</td>
                  <td>
                    <span className={`status-badge ${STATUS_CONFIG[asset.status]?.className || ''}`}>
                      {STATUS_CONFIG[asset.status]?.label || asset.status}
                    </span>
                  </td>
                  <td style={{ color: 'var(--color-text-secondary)' }}>{asset.location}</td>
                  <td style={{ color: 'var(--color-text-secondary)' }}>{asset.assigned_to || '—'}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="icon-btn" title="View details" onClick={() => setViewAsset(asset)}>
                        <Eye size={15} />
                      </button>
                      {can('asset_qr') && (
                        <button className="icon-btn" title="Download QR" onClick={() => handleQR(asset)}>
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

      {addModal && (
        <AssetModal
          onClose={() => setAddModal(false)}
          onSave={handleSaved}
          categories={categories}
          locations={locations}
          suppliers={suppliers}
        />
      )}
      {editAsset && (
        <AssetModal
          asset={editAsset}
          onClose={() => setEditAsset(null)}
          onSave={handleSaved}
          categories={categories}
          locations={locations}
          suppliers={suppliers}
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