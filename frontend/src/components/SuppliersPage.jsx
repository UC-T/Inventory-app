import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, X, Users, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { suppliersAPI } from '../services/api';
import '../styling/AssetsPage.css';

// ─── Sub-components ───────────────────────────────────────────────

function SupplierModal({ supplier, onClose, onSave }) {
  const isEdit = !!supplier;
  const [form, setForm] = useState(supplier || { 
    name: '', 
    contact_person: '', 
    email: '', 
    phone: '' 
  });
  
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = 'Supplier name is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;
    setSaving(true);
    try {
      const result = isEdit 
        ? await suppliersAPI.update(supplier.name, form) 
        : await suppliersAPI.create(form);
      onSave(result);
    } catch (err) {
      console.error('Supplier save failed:', err);
      setErrors({ server: 'Failed to sync with Supabase. Check connection.' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal--sm" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{isEdit ? 'Edit Supplier' : 'Add New Supplier'}</h3>
          <button className="modal-close" onClick={onClose}><X size={16} /></button>
        </div>

        {errors.server && (
          <div className="error-banner">
            <AlertCircle size={16} /> {errors.server}
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Supplier Name *</label>
          <input 
            className={`form-input ${errors.name ? 'form-input--error' : ''}`}
            placeholder="e.g. Dell Technologies" 
            value={form.name} 
            disabled={isEdit}
            onChange={e => setForm({...form, name: e.target.value})} 
          />
          {errors.name && <span className="form-error">{errors.name}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">Contact Person</label>
          <input className="form-input" placeholder="e.g. Michael Scott"
            value={form.contact_person} onChange={e => setForm({...form, contact_person: e.target.value})} />
        </div>

        <div className="form-group">
          <label className="form-label">Email Address</label>
          <input className="form-input" placeholder="vendor@example.com"
            value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
        </div>

        <div className="form-group">
          <label className="form-label">Phone Number</label>
          <input className="form-input" placeholder="+1 (555) 000-0000"
            value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
        </div>

        <div className="modal-actions">
          <button className="btn btn--secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn--primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Supplier'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────

function SuppliersPage() {
  const { can } = useAuth(); // can used for permissions
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false); // loading used for skeleton
  const [search, setSearch] = useState('');
  const [fetchError, setFetchError] = useState(null); // error used for UI state

  const [modal, setModal] = useState(null);

  useEffect(() => {
    loadSuppliers();
  }, []);

  async function loadSuppliers() {
    setLoading(true);
    setFetchError(null);
    try {
      const data = await suppliersAPI.getAll();
      console.log("Setting state with:", data);
        // If data is undefined, the table stays blank. 
        // This ensures we always have an array.
      setSuppliers(data || []);
    } catch (err) {
      console.error("DEBUG: Fetch error:", err);
      setFetchError("Failed to load suppliers from database.");
    } finally {
      setLoading(false);
    }
  }

  const filtered = suppliers.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.contact_person?.toLowerCase().includes(search.toLowerCase()) ||
    s.email?.toLowerCase().includes(search.toLowerCase())
  );

  async function handleDelete(name) {
    if(!window.confirm(`Are you sure you want to delete ${name}?`)) return;
    try {
      await suppliersAPI.delete(name);
      setSuppliers(prev => prev.filter(s => s.name !== name));
    } catch (err) {
      alert("Cannot delete: Supplier might be linked to existing assets.");
    }
  }

  return (
    <div className="assets-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Suppliers</h1>
          <p className="page-subtitle">Vendor directory and procurement contact points</p>
        </div>
        {can('supplier_create') && (
          <button className="btn btn--primary" onClick={() => setModal({type: 'add'})}>
            <Plus size={18} /> Add Supplier
          </button>
        )}
      </div>

      <div className="toolbar">
        <div className="search-box">
          <Search size={16} className="search-icon" />
          <input 
            type="text"
            placeholder="Search vendors or contacts..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
          />
          {search && (
            <button className="search-clear" onClick={() => setSearch('')}><X size={14} /></button>
          )}
        </div>
        <span className="results-count">{filtered.length} of {suppliers.length}</span>
      </div>

      <div className="data-table-container">
        {loading ? (
          <div className="table-loading">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="skeleton skeleton-row" />
            ))}
          </div>
        ) : fetchError ? (
          <div className="empty-state">
            <AlertCircle size={32} color="var(--color-danger)" />
            <p>{fetchError}</p>
            <button className="btn btn--secondary" onClick={loadSuppliers}>Retry</button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <Users size={32} style={{ opacity: 0.2 }} />
            <p>No suppliers found in the registry.</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Vendor Name</th>
                <th>Contact Person</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.name}>
                  <td><strong>{s.name}</strong></td>
                  <td>{s.contact_person}</td>
                  <td>{s.email}</td>
                  <td>{s.phone}</td>
                  <td>
                    <div className="action-buttons">
                      {can('supplier_edit') && (
                        <button className="icon-btn" onClick={() => setModal({type: 'edit', data: s})}>
                          <Edit size={15}/>
                        </button>
                      )}
                      {can('supplier_delete') && (
                        <button className="icon-btn icon-btn--danger" onClick={() => handleDelete(s.name)}>
                          <Trash2 size={15}/>
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

      {modal && (
        <SupplierModal 
          supplier={modal.data} 
          onClose={() => setModal(null)} 
          onSave={() => {
            loadSuppliers();
            setModal(null);
          }} 
        />
      )}
    </div>
  );
}

export default SuppliersPage;